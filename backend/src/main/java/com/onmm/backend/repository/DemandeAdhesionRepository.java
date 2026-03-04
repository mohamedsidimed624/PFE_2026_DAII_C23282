package com.onmm.backend.repository;

import com.onmm.backend.entity.DemandeAdhesion;
import com.onmm.backend.entity.enums.ApplicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DemandeAdhesionRepository extends JpaRepository<DemandeAdhesion, Long> {
    boolean existByNniAndStatut(String nni, ApplicationStatus statut);
}
