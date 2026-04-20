package com.onmm.backend.repository;

import com.onmm.backend.entity.DemandeEducation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DemandeEducationRepository extends JpaRepository<DemandeEducation, Long> {

    List<DemandeEducation> findByDemandeAdhesionId(Long demandeId);

    boolean existsBySpecialiteId(Long specialiteId);

    boolean existsBySousSpecialiteId(Long sousSpecialiteId);

    long countBySpecialiteId(Long specialiteId);

    long countBySousSpecialiteId(Long sousSpecialiteId);

}
