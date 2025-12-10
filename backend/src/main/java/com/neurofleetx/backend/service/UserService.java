package com.neurofleetx.backend.service;

import com.neurofleetx.backend.controller.auth.UpdateProfileRequest;
import com.neurofleetx.backend.model.User;
import com.neurofleetx.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository repository;

    public User updateProfile(String email, UpdateProfileRequest request) {
        User user = repository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        if (request.getName() != null)
            user.setName(request.getName());
        if (request.getPreferences() != null)
            user.setPreferences(request.getPreferences());
        if (request.getLocations() != null)
            user.setLocations(request.getLocations());

        if (request.getMobileNumber() != null)
            user.setMobileNumber(request.getMobileNumber());
        if (request.getAddress() != null)
            user.setAddress(request.getAddress());
        if (request.getAadhaarNumber() != null)
            user.setAadhaarNumber(request.getAadhaarNumber());
        if (request.getPanNumber() != null)
            user.setPanNumber(request.getPanNumber());
        if (request.getDrivingLicenseNumber() != null)
            user.setDrivingLicenseNumber(request.getDrivingLicenseNumber());
        if (request.getVehicleInformation() != null)
            user.setVehicleInformation(request.getVehicleInformation());
        if (request.getMemberDetails() != null)
            user.setMemberDetails(request.getMemberDetails());

        // Email update might require re-authentication or verification, skipping for
        // now unless needed

        return repository.save(user);
    }

    public User getUserByEmail(String email) {
        return repository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }
}
