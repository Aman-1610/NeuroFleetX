package com.neurofleetx.backend.service;

import com.neurofleetx.backend.model.Alert;
import com.neurofleetx.backend.model.Vehicle;
import com.neurofleetx.backend.repository.AlertRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AlertService {

    @Autowired
    private AlertRepository alertRepository;

    public Alert createAlert(Vehicle vehicle, String type, String message, String severity) {
        Alert alert = new Alert(vehicle, type, message, severity);
        return alertRepository.save(alert);
    }

    public List<Alert> getAlertsByVehicle(Long vehicleId) {
        return alertRepository.findByVehicleId(vehicleId);
    }

    public List<Alert> getAllAlerts() {
        return alertRepository.findAll();
    }
}
