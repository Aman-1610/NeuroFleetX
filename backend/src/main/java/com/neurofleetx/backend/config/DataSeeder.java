package com.neurofleetx.backend.config;

import com.neurofleetx.backend.model.Vehicle;
import com.neurofleetx.backend.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Arrays;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final VehicleRepository vehicleRepository;

    @Override
    public void run(String... args) throws Exception {
        // 1. Seed if empty
        if (vehicleRepository.count() == 0) {
            System.out.println("No vehicles found. Seeding database with demo fleet...");
            seedDemoFleet();
        }

        // 2. Fix Data Integrity (Migration for existing vehicles)
        // Ensure all vehicles have seats, fuel type, and are reset to Idle for demo
        System.out.println("Checking data integrity...");
        vehicleRepository.findAll().forEach(v -> {
            boolean changed = false;

            if (v.getSeats() == null) {
                v.setSeats(v.getType().equalsIgnoreCase("Scooter") || v.getType().equalsIgnoreCase("Bike") ? 2 : 4);
                changed = true;
            }
            if (v.getFuelType() == null) {
                v.setFuelType("Petrol");
                changed = true;
            }
            // Force reset status for demo so user can book
            if ("In Use".equalsIgnoreCase(v.getStatus())) {
                v.setStatus("Idle");
                changed = true;
            }
            // Ensure demo vehicles are properly named if generic
            if (v.getName() == null) {
                v.setName("Vehicle-" + v.getId());
                changed = true;
            }

            if (changed) {
                vehicleRepository.save(v);
            }
        });
        System.out.println("Vehicle integrity check completed.");
    }

    private void seedDemoFleet() {
        Vehicle v1 = new Vehicle();
        v1.setName("Tesla Model 3 - Alpha");
        v1.setType("Car");
        v1.setFuelType("Electric");
        v1.setSeats(5);
        v1.setStatus("Idle");
        v1.setBattery(85.0);
        v1.setSpeed(0.0);
        v1.setLatitude(22.7196);
        v1.setLongitude(75.8577);
        v1.setLastUpdate(LocalDateTime.now());
        v1.setDistanceSinceService(1500.0);

        Vehicle v2 = new Vehicle();
        v2.setName("Tata Ace - Logistics");
        v2.setType("Truck");
        v2.setFuelType("Diesel");
        v2.setSeats(2);
        v2.setStatus("Idle");
        v2.setBattery(100.0);
        v2.setSpeed(0.0);
        v2.setLatitude(22.7200);
        v2.setLongitude(75.8600);
        v2.setLastUpdate(LocalDateTime.now());
        v2.setDistanceSinceService(5000.0);

        Vehicle v3 = new Vehicle();
        v3.setName("Honda City - Prime");
        v3.setType("Car");
        v3.setFuelType("Petrol");
        v3.setSeats(5);
        v3.setStatus("Idle");
        v3.setBattery(100.0);
        v3.setSpeed(0.0);
        v3.setLatitude(22.7100);
        v3.setLongitude(75.8500);
        v3.setLastUpdate(LocalDateTime.now());
        v3.setDistanceSinceService(200.0);

        Vehicle v4 = new Vehicle();
        v4.setName("Ola S1 Pro");
        v4.setType("Scooter");
        v4.setFuelType("Electric");
        v4.setSeats(2);
        v4.setStatus("Idle");
        v4.setBattery(92.0);
        v4.setSpeed(0.0);
        v4.setLatitude(22.7150);
        v4.setLongitude(75.8550);
        v4.setLastUpdate(LocalDateTime.now());
        v4.setDistanceSinceService(100.0);

        vehicleRepository.saveAll(Arrays.asList(v1, v2, v3, v4));
        System.out.println("Database seeded with 4 vehicles.");
    }
}
