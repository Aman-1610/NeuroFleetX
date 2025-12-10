package com.neurofleetx.backend.dto.dashboard;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class FleetManagerMetricsResponse {
    private String activeVehicles;
    private String totalFleetSize;
    private String activeTrips;
    private String completedTrips;
    private String activeDrivers;
    private String weeklyRevenue;
}
