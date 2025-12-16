package com.neurofleetx.backend.repository;

import com.neurofleetx.backend.model.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    long countByStatus(String status);
}
