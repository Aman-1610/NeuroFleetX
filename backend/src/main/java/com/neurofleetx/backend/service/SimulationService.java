package com.neurofleetx.backend.service;

import com.neurofleetx.backend.model.Vehicle;
import com.neurofleetx.backend.repository.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

@Service
@EnableScheduling
public class SimulationService {

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private AlertService alertService;

    private final Random random = new Random();

    // Run every 5 seconds
    @Scheduled(fixedRate = 5000)
    public void runSimulation() {
        List<Vehicle> vehicles = vehicleRepository.findAll();

        for (Vehicle vehicle : vehicles) {
            updateVehicleStatusAndBattery(vehicle);
            simulateMovement(vehicle);
            vehicle.setLastUpdate(LocalDateTime.now());
            vehicleRepository.save(vehicle);
        }
    }

    private void updateVehicleStatusAndBattery(Vehicle vehicle) {
        String status = vehicle.getStatus();
        Double currentBattery = vehicle.getBattery();
        if (currentBattery == null)
            currentBattery = 100.0;

        if ("In Use".equalsIgnoreCase(status)) {
            // Decrease by 1-2%
            double drain = 1.0 + (random.nextDouble() * 1.0); // 1.0 to 2.0
            currentBattery -= drain;

            if (currentBattery <= 0) {
                currentBattery = 0.0;
                vehicle.setStatus("Maintenance");
                alertService.createAlert(vehicle, "Low Battery", "Battery Depleted. Vehicle moved to Maintenance.",
                        "Critical");
            }
        } else if ("Idle".equalsIgnoreCase(status)) {
            // Drain very slowly (0.1%)
            currentBattery -= 0.1;
            if (currentBattery < 0)
                currentBattery = 0.0;
        }

        vehicle.setBattery(Math.round(currentBattery * 100.0) / 100.0); // Round to 2 decimals
    }

    private void simulateMovement(Vehicle vehicle) {
        // Only generate speed and distance if "In Use"
        if ("In Use".equalsIgnoreCase(vehicle.getStatus())) {
            // Generate random speed 0 - 120 km/h
            double speed = random.nextDouble() * 120;
            vehicle.setSpeed(Math.round(speed * 100.0) / 100.0);

            // Trigger Alert if > 100 km/h
            if (speed > 100) {
                alertService.createAlert(vehicle, "Overspeeding",
                        "Vehicle exceeded 100 km/h (Speed: " + String.format("%.2f", speed) + " km/h)", "High");
            }

            // Simulate Distance (assuming 5 seconds per cycle)
            // Distance = Speed (km/h) * Time (h)
            // 5 seconds = 5 / 3600 hours
            double distanceCovered = speed * (5.0 / 3600.0);

            Double totalDist = vehicle.getTotalDistance();
            if (totalDist == null)
                totalDist = 0.0;

            Double sinceService = vehicle.getDistanceSinceService();
            if (sinceService == null)
                sinceService = 0.0;

            vehicle.setTotalDistance(totalDist + distanceCovered);
            vehicle.setDistanceSinceService(sinceService + distanceCovered);

            // Engine Health / Service Check
            if (vehicle.getDistanceSinceService() > 1000) {
                // Trigger 'Needs Service'
                if (!"Needs Service".equalsIgnoreCase(vehicle.getStatus())
                        && !"Maintenance".equalsIgnoreCase(vehicle.getStatus())) {
                    vehicle.setStatus("Needs Service");
                    alertService.createAlert(vehicle, "Maintenance Required",
                            "Vehicle has covered 1000km since last service.", "Medium");
                }
            }
        } else {
            vehicle.setSpeed(0.0);
        }
    }
}
