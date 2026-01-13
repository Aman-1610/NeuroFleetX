package com.neurofleetx.backend.service;

import com.neurofleetx.backend.dto.MaintenanceStats;
import com.neurofleetx.backend.model.Vehicle;
import com.neurofleetx.backend.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class MaintenanceService {

    private final VehicleRepository vehicleRepository;

    public MaintenanceStats getMaintenanceStats() {
        List<Vehicle> vehicles = vehicleRepository.findAll();
        int critical = 0;
        int due = 0;
        int healthy = 0;
        List<MaintenanceStats.PredictedFault> faults = new ArrayList<>();

        Random rand = new Random();

        for (Vehicle v : vehicles) {
            // Mock Prediction Logic (Random Forest Simulation)
            double health = (v.getBattery() != null ? v.getBattery() : 100) * 0.4
                    + (100 - (v.getDistanceSinceService() != null ? v.getDistanceSinceService() / 100 : 0)) * 0.6;

            if (health < 40) {
                critical++;
                faults.add(MaintenanceStats.PredictedFault.builder()
                        .vehicleId(v.getId())
                        .vehicleName(v.getName())
                        .component(rand.nextBoolean() ? "Battery Cells" : "Brake Pads")
                        .predictedDate(LocalDate.now().plusDays(rand.nextInt(7)).toString())
                        .probability(85 + rand.nextInt(14))
                        .build());
            } else if (health < 70) {
                due++;
            } else {
                healthy++;
            }
        }

        // Mock Trend Data
        List<MaintenanceStats.HealthMetric> trends = new ArrayList<>();
        trends.add(MaintenanceStats.HealthMetric.builder().month("Jan").averageHealth(92).build());
        trends.add(MaintenanceStats.HealthMetric.builder().month("Feb").averageHealth(88).build());
        trends.add(MaintenanceStats.HealthMetric.builder().month("Mar").averageHealth(85).build());
        trends.add(MaintenanceStats.HealthMetric.builder().month("Apr").averageHealth(89).build());
        trends.add(MaintenanceStats.HealthMetric.builder().month("May").averageHealth(82).build());

        return MaintenanceStats.builder()
                .fleetHealthScore(82.5) // Aggregate
                .vehiclesCritical(critical)
                .vehiclesDueSoon(due)
                .vehiclesHealthy(healthy)
                .predictedFaults(faults)
                .trendData(trends)
                .build();
    }
}
