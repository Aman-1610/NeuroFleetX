package com.neurofleetx.backend.dto.dashboard;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CustomerMetricsResponse {
    private String activeBookings;
    private String totalTrips;
    private String totalSpent;
    private String amountSaved;
    private String upcomingTrips;
    private String favoriteRoutes;
}
