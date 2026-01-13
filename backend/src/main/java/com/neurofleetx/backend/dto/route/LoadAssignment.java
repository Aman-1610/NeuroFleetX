package com.neurofleetx.backend.dto.route;

import java.util.List;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoadAssignment {
    private Long vehicleId;
    private String vehicleName;
    private List<String> assignedTaskIds;
    private Double totalLoad;
    private String status; // "Balanced", "Underloaded", "Overloaded"
}
