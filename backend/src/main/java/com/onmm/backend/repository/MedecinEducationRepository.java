package com.onmm.backend.repository;

import com.onmm.backend.entity.MedecinEducation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MedecinEducationRepository extends JpaRepository<MedecinEducation, Long> {

    boolean existsBySpecialiteId(Long specialiteId);

    boolean existsBySousSpecialiteId(Long sousSpecialiteId);

    long countBySpecialiteId(Long specialiteId);

    long countBySousSpecialiteId(Long sousSpecialiteId);
}
