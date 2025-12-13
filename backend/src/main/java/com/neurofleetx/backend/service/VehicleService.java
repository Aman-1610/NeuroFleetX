package com.neurofleetx.backend.service;

import com.neurofleetx.backend.model.Vehicle;
import com.neurofleetx.backend.repository.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class VehicleService {

    @Autowired
    private VehicleRepository vehicleRepository;

    public List<Vehicle> getAllVehicles() {
        return vehicleRepository.findAll();
    }

    public Vehicle getVehicleById(Long id) {
        return vehicleRepository.findById(id).orElse(null);
    }

    public Vehicle addVehicle(Vehicle vehicle) {
        if (vehicle.getBattery() == null)
            vehicle.setBattery(100.0);
        if (vehicle.getSpeed() == null)
            vehicle.setSpeed(0.0);
        if (vehicle.getLastUpdate() == null)
            vehicle.setLastUpdate(LocalDateTime.now());

        // Default location if missing (New Delhi center)
        if (vehicle.getLatitude() == null)
            vehicle.setLatitude(28.6139);
        if (vehicle.getLongitude() == null)
            vehicle.setLongitude(77.2090);

        return vehicleRepository.save(vehicle);
    }

    public Vehicle updateVehicle(Long id, Vehicle vehicleDetails) {
        Optional<Vehicle> vehicleOpt = vehicleRepository.findById(id);
        if (vehicleOpt.isPresent()) {
            Vehicle vehicle = vehicleOpt.get();
            vehicle.setName(vehicleDetails.getName());
            vehicle.setType(vehicleDetails.getType());
            vehicle.setStatus(vehicleDetails.getStatus());

            // Update telemetry if provided
            if (vehicleDetails.getBattery() != null)
                vehicle.setBattery(vehicleDetails.getBattery());
            if (vehicleDetails.getSpeed() != null)
                vehicle.setSpeed(vehicleDetails.getSpeed());
            if (vehicleDetails.getLatitude() != null)
                vehicle.setLatitude(vehicleDetails.getLatitude());
            if (vehicleDetails.getLongitude() != null)
                vehicle.setLongitude(vehicleDetails.getLongitude());

            vehicle.setLastUpdate(LocalDateTime.now());
            return vehicleRepository.save(vehicle);
        }
        return null; // Or throw exception
    }

    public void deleteVehicle(Long id) {
        vehicleRepository.deleteById(id);
    }
}
