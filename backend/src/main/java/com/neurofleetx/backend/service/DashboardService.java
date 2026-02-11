package com.neurofleetx.backend.service;

import com.neurofleetx.backend.dto.dashboard.*;
import org.springframework.stereotype.Service;

import com.neurofleetx.backend.repository.VehicleRepository;
import com.neurofleetx.backend.repository.AlertRepository;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;

@Service
public class DashboardService {

        @Autowired
        private VehicleRepository vehicleRepository;

        @Autowired
        private AlertRepository alertRepository;

        @Autowired
        private com.neurofleetx.backend.repository.BookingRepository bookingRepository;

        @Autowired
        private com.neurofleetx.backend.repository.UserRepository userRepository;

        public AdminMetricsResponse getAdminMetrics() {
                long totalUsers = userRepository.count();
                long totalFleets = vehicleRepository.count();
                long totalBookings = bookingRepository.count();

                // Advanced metrics via streams (MVP optimization)
                List<com.neurofleetx.backend.model.Booking> allBookings = bookingRepository.findAll();
                long completedTrips = allBookings.stream()
                                .filter(b -> b.getStatus() == com.neurofleetx.backend.model.BookingStatus.COMPLETED)
                                .count();
                double revenue = allBookings.stream()
                                .filter(b -> b.getStatus() == com.neurofleetx.backend.model.BookingStatus.COMPLETED)
                                .mapToDouble(b -> b.getPrice() != null ? b.getPrice() : 0.0)
                                .sum();

                // Calculate Hourly Activity (Buckets: 10, 12, 14, 16, 18, 20, 22)
                int[] hourlyCounts = new int[7];
                allBookings.forEach(b -> {
                        if (b.getStartTime() != null) {
                                int hour = b.getStartTime().getHour(); // 0-23
                                // Map hour to bucket: 10->0, 12->1, ...
                                // Simplify: (hour - 10) / 2. Only if >= 10 and <= 22 and result in 0-6.
                                if (hour >= 10 && hour <= 23) {
                                        int idx = (hour - 10) / 2;
                                        if (idx >= 0 && idx < 7) {
                                                hourlyCounts[idx]++;
                                        }
                                }
                        }
                });
                // Convert int[] to List<Integer>
                List<Integer> hourlyList = new java.util.ArrayList<>();
                for (int c : hourlyCounts)
                        hourlyList.add(c);

                // Calculate HeatMap Points
                List<String> heatPoints = allBookings.stream()
                                .filter(b -> b.getStartLat() != null && b.getStartLng() != null)
                                .limit(50)
                                .map(b -> b.getStartLat() + "," + b.getStartLng() + ",0.6")
                                .collect(java.util.stream.Collectors.toList());

                return AdminMetricsResponse.builder()
                                .totalUsers(String.valueOf(totalUsers))
                                .totalFleets(String.valueOf(totalFleets))
                                .totalBookings(String.valueOf(totalBookings))
                                .activeUsers(String.valueOf(totalUsers))
                                .completedTrips(String.valueOf(completedTrips))
                                .totalRevenue("₹" + String.format("%.0f", revenue))
                                .hourlyActivity(hourlyList)
                                .heatMapPoints(heatPoints)
                                .build();
        }

        public FleetManagerMetricsResponse getFleetManagerMetrics() {
                long totalVehicles = vehicleRepository.count();
                long activeVehicles = vehicleRepository.countByStatus("In Use");
                long maintenanceVehicles = vehicleRepository.countByStatus("Maintenance");

                return FleetManagerMetricsResponse.builder()
                                .activeVehicles(String.valueOf(activeVehicles))
                                .totalFleetSize(String.valueOf(totalVehicles))
                                .activeTrips(String.valueOf(activeVehicles))
                                .completedTrips("0")
                                .activeDrivers(String.valueOf(activeVehicles))
                                .weeklyRevenue("₹0")
                                .build();
        }

        public List<com.neurofleetx.backend.dto.UserResponseDto> getAdminUsers() {
                return userRepository.findAll().stream()
                                .map(u -> com.neurofleetx.backend.dto.UserResponseDto.builder()
                                                .id(u.getId())
                                                .name(u.getName())
                                                .email(u.getEmail())
                                                .role(u.getRole().name())
                                                .build())
                                .collect(java.util.stream.Collectors.toList());
        }

        public List<com.neurofleetx.backend.dto.booking.BookingResponse> getAdminBookings() {
                return bookingRepository.findAll().stream()
                                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                                .map(b -> com.neurofleetx.backend.dto.booking.BookingResponse.builder()
                                                .id(b.getId())
                                                .startLocation(b.getStartLocation())
                                                .dropLocation(b.getDropLocation())
                                                .startTime(b.getStartTime())
                                                .endTime(b.getEndTime())
                                                .price(b.getPrice())
                                                .status(b.getStatus().name())
                                                .distance(0.0)
                                                .build())
                                .collect(java.util.stream.Collectors.toList());
        }

        public void resetDatabase() {
                bookingRepository.deleteAll();
                vehicleRepository.deleteAll();
                userRepository.deleteAll();
        }

        public DriverMetricsResponse getDriverMetrics() {
                String email = org.springframework.security.core.context.SecurityContextHolder.getContext()
                                .getAuthentication()
                                .getName();
                if (email == null || email.equals("anonymousUser"))
                        return DriverMetricsResponse.builder().build();

                var user = userRepository.findByEmail(email).orElse(null);
                if (user == null)
                        return DriverMetricsResponse.builder().build();

                // Find vehicle assigned to this driver
                com.neurofleetx.backend.model.Vehicle vehicle = vehicleRepository.findAll().stream()
                                .filter(v -> v.getDriver() != null && v.getDriver().getId().equals(user.getId()))
                                .findFirst()
                                .orElse(null);

                if (vehicle == null) {
                        // No vehicle assigned
                        return DriverMetricsResponse.builder()
                                        .todaysTrips("0")
                                        .todaysEarnings("₹0")
                                        .distanceCovered("0 km")
                                        .driverRating("N/A")
                                        .completedTrips("0")
                                        .acceptanceRate("0%")
                                        .build();
                }

                List<com.neurofleetx.backend.model.Booking> vehicleBookings = bookingRepository
                                .findByVehicleId(vehicle.getId());

                // Simple logic: Trips today = Bookings today (mock logic as we don't strictly
                // track 'Today' in DB query here yet)
                long todaysTrips = vehicleBookings.stream()
                                .filter(b -> b.getStartTime().toLocalDate().isEqual(java.time.LocalDate.now())).count();
                double earnings = vehicleBookings.stream()
                                .filter(b -> b.getStartTime().toLocalDate().isEqual(java.time.LocalDate.now()))
                                .mapToDouble(b -> b.getPrice() != null ? b.getPrice() : 0.0).sum();

                return DriverMetricsResponse.builder()
                                .todaysTrips(String.valueOf(todaysTrips))
                                .todaysEarnings("₹" + earnings)
                                .distanceCovered(String.format("%.1f km", vehicle.getDistanceSinceService())) // Proxy
                                                                                                              // for
                                                                                                              // daily/recent
                                                                                                              // distance
                                .driverRating("4.9") // Hardcoded for now as we don't have Rating entity
                                .completedTrips(String.valueOf(vehicleBookings.size()))
                                .acceptanceRate("98%") // Mock
                                .build();
        }

        public List<com.neurofleetx.backend.dto.booking.BookingResponse> getDriverTrips() {
                String email = org.springframework.security.core.context.SecurityContextHolder.getContext()
                                .getAuthentication()
                                .getName();
                var user = userRepository.findByEmail(email).orElse(null);
                if (user == null)
                        return java.util.Collections.emptyList();

                com.neurofleetx.backend.model.Vehicle vehicle = vehicleRepository.findAll().stream()
                                .filter(v -> v.getDriver() != null && v.getDriver().getId().equals(user.getId()))
                                .findFirst()
                                .orElse(null);

                if (vehicle == null)
                        return java.util.Collections.emptyList();

                return bookingRepository.findByVehicleId(vehicle.getId()).stream()
                                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                                .map(b -> com.neurofleetx.backend.dto.booking.BookingResponse.builder()
                                                .id(b.getId())
                                                .startLocation(b.getStartLocation())
                                                .dropLocation(b.getDropLocation())
                                                .startTime(b.getStartTime())
                                                .endTime(b.getEndTime())
                                                .price(b.getPrice())
                                                .status(b.getStatus().name())
                                                .distance(0.0) // We don't have distance in booking model yet properly
                                                .build())
                                .collect(java.util.stream.Collectors.toList());
        }

        public CustomerMetricsResponse getCustomerMetrics() {
                String email = org.springframework.security.core.context.SecurityContextHolder.getContext()
                                .getAuthentication()
                                .getName();
                // Fallback for safety if context is empty (e.g. testing)
                if (email == null || email.equals("anonymousUser"))
                        return CustomerMetricsResponse.builder().build();

                var user = userRepository.findByEmail(email).orElse(null);
                if (user == null)
                        return CustomerMetricsResponse.builder().build();

                List<com.neurofleetx.backend.model.Booking> bookings = bookingRepository.findByUserId(user.getId());

                long active = bookings.stream()
                                .filter(b -> b.getStatus() == com.neurofleetx.backend.model.BookingStatus.CONFIRMED
                                                || b.getStatus() == com.neurofleetx.backend.model.BookingStatus.PENDING)
                                .count();
                int totalTrips = bookings.size();
                double totalSpent = bookings.stream()
                                .mapToDouble(b -> b.getPrice() != null ? b.getPrice() : 0.0)
                                .sum();

                return CustomerMetricsResponse.builder()
                                .activeBookings(String.valueOf(active))
                                .totalTrips(String.valueOf(totalTrips))
                                .totalSpent("₹" + totalSpent)
                                .amountSaved("₹0") // Logic for savings can be added later
                                .upcomingTrips(String.valueOf(active))
                                .favoriteRoutes("0")
                                .build();
        }

        public void writeAnalyticsToCsv(java.io.PrintWriter writer) {
                writer.println("Booking ID, Start Location, Drop Location, Price, Status, Date");
                List<com.neurofleetx.backend.model.Booking> bookings = bookingRepository.findAll();

                for (com.neurofleetx.backend.model.Booking b : bookings) {
                        writer.printf("%s, %s, %s, %.2f, %s, %s\n",
                                        b.getId(),
                                        b.getStartLocation().replace(",", " "),
                                        b.getDropLocation().replace(",", " "),
                                        b.getPrice() != null ? b.getPrice() : 0.0,
                                        b.getStatus(),
                                        b.getCreatedAt());
                }
        }
}
