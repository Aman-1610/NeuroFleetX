package com.neurofleetx.backend.dto.booking;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class BookingRequest {
    private Long vehicleId;
    private String startLocation;
    private Double startLat;
    private Double startLng;

    private String dropLocation;
    private Double dropLat;
    private Double dropLng;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Double estimatedPrice;
}
