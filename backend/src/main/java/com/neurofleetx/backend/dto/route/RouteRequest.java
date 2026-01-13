package com.neurofleetx.backend.dto.route;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RouteRequest {
    private Double startLat;
    private Double startLng;
    private Double endLat;
    private Double endLng;
    private String preference; // "TIME", "DISTANCE", "ENERGY"
    private String vehicleType; // "CAR", "TRUCK", "BIKE"
}
