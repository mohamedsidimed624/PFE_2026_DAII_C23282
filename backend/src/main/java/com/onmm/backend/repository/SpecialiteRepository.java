package com.onmm.backend.repository;

import com.onmm.backend.entity.Specialite;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface SpecialiteRepository extends JpaRepository<Specialite, Long> {

    boolean existsByCodeIgnoreCase(String code);
    boolean existsByLibelleIgnoreCase(String libelle);
    boolean existsByCodeIgnoreCaseAndIdNot(String code, Long id);
    boolean existsByLibelleIgnoreCaseAndIdNot(String libelle, Long id);


    List<Specialite> findByActiveTrueOrderByOrdreAffichageAscLibelleAsc();

    Optional<Specialite> findByIdAndActiveTrue(Long id);

    Page<Specialite> findByLibelleContainingIgnoreCase(String libelle, Pageable pageable);

    Page<Specialite> findByActive(boolean active, Pageable pageable);

    Page<Specialite> findByLibelleContainingIgnoreCaseAndActive(String libelle, boolean active, Pageable pageable);


    List<Specialite> findByActiveTrueOrderByLibelleAsc();
}