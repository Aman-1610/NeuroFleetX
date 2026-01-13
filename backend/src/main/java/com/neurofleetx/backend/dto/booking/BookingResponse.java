package com.neurofleetx.backend.dto.booking;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class BookingResponse {
    private Long id;
    private String startLocation;
    private String dropLocation;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Double price;
    private String status;
    private Double distance; // might be null if not stored
}
