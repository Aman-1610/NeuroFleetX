package com.neurofleetx.backend.service;

import com.neurofleetx.backend.dto.dashboard.*;
import org.springframework.stereotype.Service;

@Service
public class DashboardService {

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
        return FleetManagerMetricsResponse.builder()
                .activeVehicles("45")
                .totalFleetSize("50")
                .activeTrips("12")
                .completedTrips("1,200")
                .activeDrivers("38")
                .weeklyRevenue("₹15,000")
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
