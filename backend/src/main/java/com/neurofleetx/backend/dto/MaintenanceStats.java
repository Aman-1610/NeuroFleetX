package com.neurofleetx.backend.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class MaintenanceStats {
    private double fleetHealthScore;
    private int vehiclesCritical;
    private int vehiclesDueSoon;
    private int vehiclesHealthy;
    private List<PredictedFault> predictedFaults;
    private List<HealthMetric> trendData;

    @Data
    @Builder
    public static class PredictedFault {
        private Long vehicleId;
        private String vehicleName;
        private String component; // Engine, Battery, Tires
        private String predictedDate;
        private double probability;
    }

    @Data
    @Builder
    public static class HealthMetric {
        private String month;
        private double averageHealth;
    }
}
