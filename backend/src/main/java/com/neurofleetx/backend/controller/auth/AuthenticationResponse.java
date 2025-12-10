package com.neurofleetx.backend.controller.auth;

import com.neurofleetx.backend.model.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthenticationResponse {
    private String token;
    private String name;
    private String email;
    private Role role;
    private String mobileNumber;
    private String address;
    private String aadhaarNumber;
    private String panNumber;
    private String drivingLicenseNumber;
    private String vehicleInformation;
    private String memberDetails;
}
