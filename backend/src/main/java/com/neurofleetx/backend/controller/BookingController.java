package com.neurofleetx.backend.controller;

import com.neurofleetx.backend.dto.booking.BookingRequest;
import com.neurofleetx.backend.dto.booking.VehicleSearchRequest;
import com.neurofleetx.backend.model.Booking;
import com.neurofleetx.backend.model.Vehicle;
import com.neurofleetx.backend.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestMethod;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173", allowedHeaders = "*", methods = { RequestMethod.GET, RequestMethod.POST,
        RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS }, allowCredentials = "true")
public class BookingController {

    private final BookingService bookingService;

    @PostMapping("/recommend")
    public ResponseEntity<List<Vehicle>> getRecommendations(@RequestBody VehicleSearchRequest request) {
        return ResponseEntity.ok(bookingService.getRecommendations(request));
    }

    @PostMapping
    public ResponseEntity<Booking> createBooking(@RequestBody BookingRequest request) {
        return ResponseEntity.ok(bookingService.createBooking(request));
    }

    @GetMapping("/my")
    public ResponseEntity<List<Booking>> getMyBookings() {
        return ResponseEntity.ok(bookingService.getMyBookings());
    }

    @DeleteMapping("/{id}/cancel")
    public ResponseEntity<Void> cancelBooking(@PathVariable Long id) {
        bookingService.cancelBooking(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<Void> completeBooking(@PathVariable Long id) {
        bookingService.completeBooking(id);
        return ResponseEntity.ok().build();
    }
}
