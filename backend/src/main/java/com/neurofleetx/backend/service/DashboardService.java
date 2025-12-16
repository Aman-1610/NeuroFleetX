package com.neurofleetx.backend.service;

import com.neurofleetx.backend.dto.dashboard.*;
import org.springframework.stereotype.Service;

import com.neurofleetx.backend.repository.VehicleRepository;
import com.neurofleetx.backend.repository.AlertRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class DashboardService {

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private AlertRepository alertRepository;

    public AdminMetricsResponse getAdminMetrics() {
        // Mock data for now
        return AdminMetricsResponse.builder()
                .totalUsers("1,234")
                .totalFleets("56")
                .totalBookings("8,901")
                .activeUsers("890")
                .completedTrips("7,500")
                .totalRevenue("₹1.2M")
                .build();
    }

    public FleetManagerMetricsResponse getFleetManagerMetrics() {
        long totalVehicles = vehicleRepository.count();
        long activeVehicles = vehicleRepository.countByStatus("In Use");
        long maintenanceVehicles = vehicleRepository.countByStatus("Maintenance");
        long alertCount = alertRepository.count();

        // For now, hardcode some fields we don't track yet
        return FleetManagerMetricsResponse.builder()
                .activeVehicles(String.valueOf(activeVehicles))
                .totalFleetSize(String.valueOf(totalVehicles))
                .activeTrips(String.valueOf(activeVehicles)) // Assuming In Use = Active Trip
                .completedTrips("0") // Use a real repository if you have a Trip entity
                .activeDrivers(String.valueOf(activeVehicles)) // Assuming 1 driver per active vehicle
                .weeklyRevenue("₹0")
                .build();
    }

    public DriverMetricsResponse getDriverMetrics() {
        return DriverMetricsResponse.builder()
                .todaysTrips("8")
                .todaysEarnings("₹120")
                .distanceCovered("150 km")
                .driverRating("4.8")
                .completedTrips("450")
                .acceptanceRate("95%")
                .build();
    }

    public CustomerMetricsResponse getCustomerMetrics() {
        return CustomerMetricsResponse.builder()
                .activeBookings("1")
                .totalTrips("24")
                .totalSpent("₹450")
                .amountSaved("₹35")
                .upcomingTrips("2")
                .favoriteRoutes("3")
                .build();
    }
}
