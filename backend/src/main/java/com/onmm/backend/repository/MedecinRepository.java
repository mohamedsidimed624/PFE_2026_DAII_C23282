package com.onmm.backend.repository;

import com.onmm.backend.entity.Medecin;
import com.onmm.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MedecinRepository extends JpaRepository<Medecin, Long> {

    Optional<Medecin> findByUser(User user);
}
