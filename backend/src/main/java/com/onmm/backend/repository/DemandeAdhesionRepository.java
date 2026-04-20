package com.onmm.backend.repository;

import com.onmm.backend.entity.DemandeAdhesion;
import com.onmm.backend.entity.enums.ApplicationStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface DemandeAdhesionRepository extends JpaRepository<DemandeAdhesion, Long> {
    boolean existsByNNIAndStatutIn(String NNI, List<ApplicationStatus> statut);
    boolean existsByEmailAndStatutIn(String email, List<ApplicationStatus> statut);
    boolean existsByTelephoneAndStatutIn(String telephone, List<ApplicationStatus> statut);

    @Query("""
    SELECT DISTINCT d FROM DemandeAdhesion d
    LEFT JOIN FETCH d.educations e
    LEFT JOIN FETCH e.specialite
    LEFT JOIN FETCH e.sousSpecialite        
    LEFT JOIN FETCH d.experiences
    LEFT JOIN FETCH d.documents
    WHERE d.id = :id
    """)
    Optional<DemandeAdhesion> findWithDetailsById(Long id);

    Optional<DemandeAdhesion> findByNumeroDossier(String numeroDossier);

    @Query("""
        select distinct d
        from DemandeAdhesion d
        left join fetch d.educations
        where d.id = :id
    """)
    Optional<DemandeAdhesion> findByIdWithEducations(@Param("id") Long id);
}
