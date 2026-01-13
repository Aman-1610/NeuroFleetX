package com.neurofleetx.backend.dto.route;

import java.util.List;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RouteOption {
    private String id;
    private String type; // "Fastest", "Shortest", "Eco-Friendly"
    private String eta;
    private String distance;
    private String trafficCondition; // "Low", "Moderate", "Heavy"
    private Double energyUsage; // kWh or Liters
    private List<List<Double>> path; // List of [lat, lng] points
    private String color; // Hex color for UI
}
