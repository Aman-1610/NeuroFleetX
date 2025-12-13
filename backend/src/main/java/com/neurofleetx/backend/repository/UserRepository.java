package com.neurofleetx.backend.repository;

import com.neurofleetx.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    java.util.List<User> findByRole(com.neurofleetx.backend.model.Role role);
}
