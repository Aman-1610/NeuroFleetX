package com.neurofleetx.backend.dto.dashboard;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminMetricsResponse {
    private String totalUsers;
    private String totalFleets;
    private String totalBookings;
    private String activeUsers;
    private String completedTrips;
    private String totalRevenue;
    private java.util.List<Integer> hourlyActivity;
    private java.util.List<String> heatMapPoints;
}
