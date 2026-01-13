package com.neurofleetx.backend.controller;

import com.neurofleetx.backend.dto.dashboard.*;
import com.neurofleetx.backend.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/admin/metrics")
    public ResponseEntity<AdminMetricsResponse> getAdminMetrics() {
        return ResponseEntity.ok(dashboardService.getAdminMetrics());
    }

    @GetMapping("/fleet-manager/metrics")
    public ResponseEntity<FleetManagerMetricsResponse> getFleetManagerMetrics() {
        return ResponseEntity.ok(dashboardService.getFleetManagerMetrics());
    }

    @GetMapping("/driver/metrics")
    public ResponseEntity<DriverMetricsResponse> getDriverMetrics() {
        return ResponseEntity.ok(dashboardService.getDriverMetrics());
    }

    @GetMapping("/customer/metrics")
    public ResponseEntity<CustomerMetricsResponse> getCustomerMetrics() {
        return ResponseEntity.ok(dashboardService.getCustomerMetrics());
    }

    @GetMapping("/driver/trips")
    public ResponseEntity<java.util.List<com.neurofleetx.backend.dto.booking.BookingResponse>> getDriverTrips() {
        return ResponseEntity.ok(dashboardService.getDriverTrips());
    }

    @GetMapping("/admin/users")
    public ResponseEntity<java.util.List<com.neurofleetx.backend.dto.UserResponseDto>> getAdminUsers() {
        return ResponseEntity.ok(dashboardService.getAdminUsers());
    }

    @GetMapping("/admin/bookings")
    public ResponseEntity<java.util.List<com.neurofleetx.backend.dto.booking.BookingResponse>> getAdminBookings() {
        return ResponseEntity.ok(dashboardService.getAdminBookings());
    }

    @org.springframework.web.bind.annotation.DeleteMapping("/admin/reset")
    public ResponseEntity<String> resetDatabase() {
        dashboardService.resetDatabase();
        return ResponseEntity.ok("Database cleared successfully");
    }
}
