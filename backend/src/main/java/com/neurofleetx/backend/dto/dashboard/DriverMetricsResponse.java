package com.neurofleetx.backend.dto.dashboard;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DriverMetricsResponse {
    private String todaysTrips;
    private String todaysEarnings;
    private String distanceCovered;
    private String driverRating;
    private String completedTrips;
    private String acceptanceRate;
}
