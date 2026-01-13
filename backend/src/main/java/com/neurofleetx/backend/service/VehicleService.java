package com.neurofleetx.backend.service;

import com.neurofleetx.backend.model.Vehicle;
import com.neurofleetx.backend.repository.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class VehicleService {

    @Autowired
    private VehicleRepository vehicleRepository;

    public List<Vehicle> getAllVehicles() {
        return vehicleRepository.findAll();
    }

    public Vehicle getVehicleById(Long id) {
        return vehicleRepository.findById(id).orElse(null);
    }

    public Vehicle addVehicle(Vehicle vehicle) {
        if (vehicle.getBattery() == null)
            vehicle.setBattery(100.0);
        if (vehicle.getSpeed() == null)
            vehicle.setSpeed(0.0);
        if (vehicle.getLastUpdate() == null)
            vehicle.setLastUpdate(LocalDateTime.now());

        // Default location if missing (New Delhi center)
        if (vehicle.getLatitude() == null)
            vehicle.setLatitude(28.6139);
        if (vehicle.getLongitude() == null)
            vehicle.setLongitude(77.2090);

        return vehicleRepository.save(vehicle);
    }

    public Vehicle updateVehicle(Long id, Vehicle vehicleDetails) {
        Optional<Vehicle> vehicleOpt = vehicleRepository.findById(id);
        if (vehicleOpt.isPresent()) {
            Vehicle vehicle = vehicleOpt.get();
            vehicle.setName(vehicleDetails.getName());
            vehicle.setType(vehicleDetails.getType());
            vehicle.setStatus(vehicleDetails.getStatus());

            // Update telemetry if provided
            if (vehicleDetails.getBattery() != null)
                vehicle.setBattery(vehicleDetails.getBattery());
            if (vehicleDetails.getSpeed() != null)
                vehicle.setSpeed(vehicleDetails.getSpeed());
            if (vehicleDetails.getLatitude() != null)
                vehicle.setLatitude(vehicleDetails.getLatitude());
            if (vehicleDetails.getLongitude() != null)
                vehicle.setLongitude(vehicleDetails.getLongitude());

            vehicle.setLastUpdate(LocalDateTime.now());
            return vehicleRepository.save(vehicle);
        }
        return null; // Or throw exception
    }

    @Autowired
    private com.neurofleetx.backend.repository.UserRepository userRepository;

    public Vehicle assignDriver(Long vehicleId, Long driverId) {
        Vehicle vehicle = getVehicleById(vehicleId);
        if (vehicle != null) {
            com.neurofleetx.backend.model.User driver = userRepository.findById(driverId).orElse(null);
            vehicle.setDriver(driver);
            return vehicleRepository.save(vehicle);
        }
        return null;
    }

    public Vehicle getVehicleByDriverId(Long driverId) {
        return vehicleRepository.findAll().stream()
                .filter(v -> v.getDriver() != null && v.getDriver().getId().equals(driverId))
                .findFirst()
                .orElse(null); // Or implement findByDriverId in Repo
    }

    public Vehicle getVehicleByDriverEmail(String email) {
        return vehicleRepository.findAll().stream()
                .filter(v -> v.getDriver() != null && v.getDriver().getEmail().equals(email))
                .findFirst()
                .orElse(null);
    }

    @Autowired
    private com.neurofleetx.backend.repository.BookingRepository bookingRepository;

    public List<Vehicle> getVehiclesBookedByUser(String email) {
        com.neurofleetx.backend.model.User user = userRepository.findByEmail(email).orElse(null);
        if (user == null)
            return List.of();

        List<com.neurofleetx.backend.model.Booking> bookings = bookingRepository.findByUserId(user.getId());

        // Filter for active bookings (Confirmed, In Progress, etc. NOT
        // Completed/Cancelled)
        List<Long> bookedVehicleIds = bookings.stream()
                .filter(b -> b.getStatus() == com.neurofleetx.backend.model.BookingStatus.CONFIRMED
                        || b.getStatus() == com.neurofleetx.backend.model.BookingStatus.PENDING)
                .map(b -> b.getVehicle().getId())
                .distinct()
                .collect(java.util.stream.Collectors.toList());

        return vehicleRepository.findAllById(bookedVehicleIds);
    }

    public void deleteVehicle(Long id) {
        vehicleRepository.deleteById(id);
    }
}
