package com.neurofleetx.backend.service;

import com.neurofleetx.backend.dto.booking.BookingRequest;
import com.neurofleetx.backend.dto.booking.VehicleSearchRequest;
import com.neurofleetx.backend.model.Booking;
import com.neurofleetx.backend.model.BookingStatus;
import com.neurofleetx.backend.model.User;
import com.neurofleetx.backend.model.Vehicle;
import com.neurofleetx.backend.repository.BookingRepository;
import com.neurofleetx.backend.repository.UserRepository;
import com.neurofleetx.backend.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;

    public List<Vehicle> getRecommendations(VehicleSearchRequest request) {
        List<Vehicle> allVehicles = vehicleRepository.findAll();

        return allVehicles.stream()
                .filter(v -> "Idle".equalsIgnoreCase(v.getStatus())) // Only idle vehicles
                .filter(v -> matchesCriteria(v, request))
                .sorted((v1, v2) -> Double.compare(calculateScore(v2), calculateScore(v1))) // Descending score
                .limit(5)
                .collect(Collectors.toList());
    }

    private boolean matchesCriteria(Vehicle v, VehicleSearchRequest req) {
        if (req.getType() != null && !req.getType().isEmpty() && !req.getType().equalsIgnoreCase(v.getType())) {
            return false;
        }
        if (req.getSeats() != null && (v.getSeats() == null || v.getSeats() < req.getSeats())) {
            return false;
        }
        if (req.getIsEv() != null) {
            boolean isElectric = "Electric".equalsIgnoreCase(v.getFuelType());
            if (req.getIsEv() && !isElectric)
                return false;
            // If req.getIsEv() is false, we allow both or only ICE? Let's allow all if
            // false/null, but filter if true.
            // Requirement says "EV / Non-EV" filter.
            // If user explicitly asks for Non-EV (false), we should exclude Electric?
            if (!req.getIsEv() && isElectric)
                return false;
        }
        return true;
    }

    // AI-based Scoring Logic (Simple Heuristic)
    private double calculateScore(Vehicle v) {
        double score = 100.0;

        // 1. High Battery is better
        if (v.getBattery() != null) {
            score += v.getBattery() * 0.5; // +0 to +50
        }

        // 2. Low Mileage since service is better
        if (v.getDistanceSinceService() != null) {
            score -= (v.getDistanceSinceService() / 1000.0) * 10; // Penalty
        }

        // 3. Newer vehicles (using ID as proxy or random factor for 'AI')
        // In real ML, this would call a Python model.
        // Here we simulate "Smart Recommendation" by prioritizing balanced health.

        return score;
    }

    public Booking createBooking(BookingRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));

        if (!"Idle".equalsIgnoreCase(vehicle.getStatus())) {
            throw new RuntimeException("Vehicle is not available");
        }

        Booking booking = Booking.builder()
                .user(user)
                .vehicle(vehicle)
                .startLocation(request.getStartLocation())
                .startLat(request.getStartLat())
                .startLng(request.getStartLng())
                .dropLocation(request.getDropLocation())
                .dropLat(request.getDropLat())
                .dropLng(request.getDropLng())
                .startTime(request.getStartTime() != null ? request.getStartTime() : LocalDateTime.now())
                .endTime(request.getEndTime()) // Can be null if open ended
                .price(request.getEstimatedPrice())
                .status(BookingStatus.CONFIRMED)
                .build();

        // Update Vehicle Status
        vehicle.setStatus("In Use");
        vehicleRepository.save(vehicle);

        return bookingRepository.save(booking);
    }

    public List<Booking> getMyBookings() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        return bookingRepository.findByUserId(user.getId());
    }

    public void cancelBooking(Long id) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Booking booking = bookingRepository.findById(id).orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!booking.getUser().getEmail().equals(email)) {
            throw new RuntimeException("Unauthorized");
        }

        if (booking.getStatus() == BookingStatus.COMPLETED || booking.getStatus() == BookingStatus.CANCELLED) {
            throw new RuntimeException("Booking cannot be cancelled");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        bookingRepository.save(booking);

        if (booking.getVehicle() != null) {
            Vehicle v = booking.getVehicle();
            v.setStatus("Idle");
            vehicleRepository.save(v);
        }
    }

    public void completeBooking(Long id) {
        Booking booking = bookingRepository.findById(id).orElseThrow(() -> new RuntimeException("Booking not found"));
        // Allow anyone to complete for simulation (or check owner if strict)
        // For demo, we might trigger this from frontend so user permission check is
        // good.
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        if (!booking.getUser().getEmail().equals(email)) {
            // In a real app driver completes, but here user is simulating.
            // We allow user to complete their own booking for demo.
        }

        booking.setStatus(BookingStatus.COMPLETED);
        booking.setEndTime(LocalDateTime.now());
        bookingRepository.save(booking);

        if (booking.getVehicle() != null) {
            Vehicle v = booking.getVehicle();
            v.setStatus("Idle");
            // Here we could update vehicle location to drop location if we want persistence
            v.setLatitude(booking.getDropLat());
            v.setLongitude(booking.getDropLng());
            vehicleRepository.save(v);
        }
    }
}
