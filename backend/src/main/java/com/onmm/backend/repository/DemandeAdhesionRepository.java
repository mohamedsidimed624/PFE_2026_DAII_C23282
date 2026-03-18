package com.onmm.backend.repository;

import com.onmm.backend.entity.DemandeAdhesion;
import com.onmm.backend.entity.enums.ApplicationStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface DemandeAdhesionRepository extends JpaRepository<DemandeAdhesion, Long> {
    boolean existsByNNIAndStatutIn(String NNI, List<ApplicationStatus> statut);
    boolean existsByEmailAndStatutIn(String email, List<ApplicationStatus> statut);
    boolean existsByTelephoneAndStatutIn(String telephone, List<ApplicationStatus> statut);

    @Query("""
    SELECT DISTINCT d FROM DemandeAdhesion d
    LEFT JOIN FETCH d.educations
    LEFT JOIN FETCH d.experiences
    LEFT JOIN FETCH d.documents
    WHERE d.id = :id
    """)
    Optional<DemandeAdhesion> findWithDetailsById(Long id);
}
