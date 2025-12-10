package com.neurofleetx.backend.service;

import com.neurofleetx.backend.config.JwtService;
import com.neurofleetx.backend.controller.auth.AuthenticationRequest;
import com.neurofleetx.backend.controller.auth.AuthenticationResponse;
import com.neurofleetx.backend.controller.auth.RegisterRequest;
import com.neurofleetx.backend.model.Role;
import com.neurofleetx.backend.model.User;
import com.neurofleetx.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthenticationService {
        private final UserRepository repository;
        private final PasswordEncoder passwordEncoder;
        private final JwtService jwtService;
        private final AuthenticationManager authenticationManager;

        public AuthenticationResponse register(RegisterRequest request) {
                if (repository.findByEmail(request.getEmail()).isPresent()) {
                        throw new RuntimeException("Email already in use");
                }

                String roleStr = request.getRole();
                System.out.println("Received registration request for role: " + roleStr); // Debug log

                Role userRole;
                try {
                        if (roleStr == null || roleStr.trim().isEmpty()) {
                                userRole = Role.CUSTOMER; // Default if missing
                        } else {
                                userRole = Role.valueOf(roleStr.trim().toUpperCase());
                        }
                } catch (IllegalArgumentException e) {
                        throw new RuntimeException("Invalid role provided: '" + roleStr
                                        + "'. Allowed values: ADMIN, FLEET_MANAGER, DRIVER, CUSTOMER");
                }

                var user = User.builder()
                                .name(request.getName())
                                .email(request.getEmail())
                                .password(passwordEncoder.encode(request.getPassword()))
                                .role(userRole)
                                .companyName(request.getCompanyName())
                                .licenseNumber(request.getLicenseNumber())
                                .build();
                repository.save(user);
                var jwtToken = jwtService.generateToken(user);
                return AuthenticationResponse.builder()
                                .token(jwtToken)
                                .name(user.getName())
                                .email(user.getEmail())
                                .role(user.getRole())
                                .mobileNumber(user.getMobileNumber())
                                .address(user.getAddress())
                                .aadhaarNumber(user.getAadhaarNumber())
                                .panNumber(user.getPanNumber())
                                .drivingLicenseNumber(user.getDrivingLicenseNumber())
                                .vehicleInformation(user.getVehicleInformation())
                                .memberDetails(user.getMemberDetails())
                                .build();
        }

        public AuthenticationResponse authenticate(AuthenticationRequest request) {
                authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(
                                                request.getEmail(),
                                                request.getPassword()));
                var user = repository.findByEmail(request.getEmail())
                                .orElseThrow();
                var jwtToken = jwtService.generateToken(user);
                return AuthenticationResponse.builder()
                                .token(jwtToken)
                                .name(user.getName())
                                .email(user.getEmail())
                                .role(user.getRole())
                                .mobileNumber(user.getMobileNumber())
                                .address(user.getAddress())
                                .aadhaarNumber(user.getAadhaarNumber())
                                .panNumber(user.getPanNumber())
                                .drivingLicenseNumber(user.getDrivingLicenseNumber())
                                .vehicleInformation(user.getVehicleInformation())
                                .memberDetails(user.getMemberDetails())
                                .build();
        }
}
