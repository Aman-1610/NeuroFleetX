package com.neurofleetx.backend.controller;

import com.neurofleetx.backend.model.Alert;
import com.neurofleetx.backend.service.AlertService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alerts")
@CrossOrigin(origins = "*")
public class AlertController {

    @Autowired
    private AlertService alertService;

    @GetMapping
    public ResponseEntity<List<Alert>> getAllAlerts() {
        return ResponseEntity.ok(alertService.getAllAlerts());
    }

    @GetMapping("/vehicle/{vehicleId}")
    public ResponseEntity<List<Alert>> getAlertsByVehicle(@PathVariable Long vehicleId) {
        return ResponseEntity.ok(alertService.getAlertsByVehicle(vehicleId));
    }
}
