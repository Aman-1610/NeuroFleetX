package com.neurofleetx.backend.controller.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UpdateProfileRequest {
    private String name;
    private String email;
    private String preferences;
    private String locations; // JSON string or comma-separated
    private String mobileNumber;
    private String address;
    private String aadhaarNumber;
    private String panNumber;
    private String drivingLicenseNumber;
    private String vehicleInformation;
    private String memberDetails;
}
