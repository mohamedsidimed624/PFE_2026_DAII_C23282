package com.onmm.backend.repository;

import com.onmm.backend.entity.MedecinExperience;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MedecinExperienceRepository extends JpaRepository<MedecinExperience, Long> {
}
