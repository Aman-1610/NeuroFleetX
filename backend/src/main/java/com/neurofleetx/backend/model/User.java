package com.neurofleetx.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "users")
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(unique = true)
    private String email;

    private String password;

    @Enumerated(EnumType.STRING)
    private Role role;

    // Role specific fields
    private String companyName; // For Fleet Manager
    private String licenseNumber; // For Driver

    // Profile fields
    private String preferences;
    @Column(length = 1000)
    private String locations; // Stored as JSON or comma-separated string

    // New Profile Fields
    private String mobileNumber;
    private String address; // Could be JSON or simple string
    private String aadhaarNumber;
    private String panNumber;
    private String drivingLicenseNumber; // Separate from licenseNumber if needed, or reuse

    @Column(length = 2000)
    private String vehicleInformation; // JSON string: { model, plate, etc. }

    @Column(length = 2000)
    private String memberDetails; // JSON string for other membership info

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(role.name()));
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
