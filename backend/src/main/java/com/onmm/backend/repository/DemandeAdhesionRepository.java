package com.onmm.backend.repository;

import com.onmm.backend.entity.DemandeAdhesion;
import com.onmm.backend.entity.enums.ApplicationStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DemandeAdhesionRepository extends JpaRepository<DemandeAdhesion, Long> {
    boolean existsByNNIAndStatut(String NNI, ApplicationStatus statut);
    boolean existsByEmailAndStatut(String email, ApplicationStatus statut);
    boolean existsByTelephoneAndStatut(String telephone, ApplicationStatus statut);

    @EntityGraph(attributePaths = {
            "educations",
            "experiences",
            "documents"
    })
    Optional<DemandeAdhesion> findWithDetailsById(Long id);
}
