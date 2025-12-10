package com.neurofleetx.backend.controller;

import com.neurofleetx.backend.controller.auth.AuthenticationRequest;
import com.neurofleetx.backend.controller.auth.AuthenticationResponse;
import com.neurofleetx.backend.controller.auth.RegisterRequest;
import com.neurofleetx.backend.service.AuthenticationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthenticationController {

    private final AuthenticationService service;

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestBody RegisterRequest request) {
        try {
            return ResponseEntity.ok(service.register(request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticate(
            @RequestBody AuthenticationRequest request) {
        try {
            return ResponseEntity.ok(service.authenticate(request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Invalid credentials");
        }
    }
}
