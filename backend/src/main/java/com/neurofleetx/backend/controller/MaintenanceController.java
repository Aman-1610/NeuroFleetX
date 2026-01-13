package com.neurofleetx.backend.controller;

import com.neurofleetx.backend.dto.MaintenanceStats;
import com.neurofleetx.backend.service.MaintenanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/maintenance")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MaintenanceController {

    private final MaintenanceService maintenanceService;

    @GetMapping("/stats")
    public ResponseEntity<MaintenanceStats> getStats() {
        return ResponseEntity.ok(maintenanceService.getMaintenanceStats());
    }
}
