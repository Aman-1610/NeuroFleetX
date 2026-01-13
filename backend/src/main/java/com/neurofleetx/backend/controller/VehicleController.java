package com.neurofleetx.backend.controller;

import com.neurofleetx.backend.model.Vehicle;
import com.neurofleetx.backend.service.VehicleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vehicles")
@CrossOrigin(origins = "*") // Allow frontend access
public class VehicleController {

    @Autowired
    private VehicleService vehicleService;

    @GetMapping
    public List<Vehicle> getAllVehicles() {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication();

        boolean isAdminOrManager = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ADMIN") || a.getAuthority().equals("ROLE_ADMIN") ||
                        a.getAuthority().equals("FLEET_MANAGER") || a.getAuthority().equals("ROLE_FLEET_MANAGER"));

        if (isAdminOrManager) {
            return vehicleService.getAllVehicles();
        } else {
            // Assume Customer or Driver wanting to seeing "their" relevant vehicles
            // For Customer: only what they booked
            return vehicleService.getVehiclesBookedByUser(auth.getName());
        }
    }

    @PostMapping
    public ResponseEntity<Vehicle> createVehicle(@RequestBody Vehicle vehicle) {
        return ResponseEntity.ok(vehicleService.addVehicle(vehicle));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Vehicle> getVehicleById(@PathVariable Long id) {
        Vehicle vehicle = vehicleService.getVehicleById(id);
        if (vehicle != null) {
            return ResponseEntity.ok(vehicle);
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Vehicle> updateVehicle(@PathVariable Long id, @RequestBody Vehicle vehicleDetails) {
        Vehicle updatedVehicle = vehicleService.updateVehicle(id, vehicleDetails);
        if (updatedVehicle != null) {
            return ResponseEntity.ok(updatedVehicle);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVehicle(@PathVariable Long id) {
        vehicleService.deleteVehicle(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/assign/{driverId}")
    public ResponseEntity<Vehicle> assignDriver(@PathVariable Long id, @PathVariable Long driverId) {
        Vehicle vehicle = vehicleService.assignDriver(id, driverId);
        if (vehicle != null)
            return ResponseEntity.ok(vehicle);
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/my-vehicle")
    public ResponseEntity<?> getMyVehicle() {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication();
        String email = auth.getName();

        Vehicle vehicle = vehicleService.getVehicleByDriverEmail(email);
        if (vehicle != null)
            return ResponseEntity.ok(vehicle);
        return ResponseEntity.notFound().build();
    }
}
