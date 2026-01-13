package com.neurofleetx.backend.dto.route;

import java.util.List;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoadOptimizationRequest {
    private List<DeliveryTask> tasks;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DeliveryTask {
        private String id;
        private Double lat;
        private Double lng;
        private Double weight; // kg
        private String priority; // "HIGH", "NORMAL"
    }
}
