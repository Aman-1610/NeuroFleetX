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
}
