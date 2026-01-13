package com.neurofleetx.backend.dto.booking;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class VehicleSearchRequest {
    private String type; // Car, Truck, Scooter
    private Integer seats;
    private Boolean isEv;
    private String startLocation;
    private String dropLocation;
    private LocalDateTime startTime;
}
