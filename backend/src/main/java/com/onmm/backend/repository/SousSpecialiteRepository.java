package com.onmm.backend.repository;

import com.onmm.backend.entity.SousSpecialite;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SousSpecialiteRepository extends JpaRepository<SousSpecialite, Long> {

    long countBySpecialiteId(Long specialiteId);



    boolean existsByCodeIgnoreCase(String code);
    boolean existsByCodeIgnoreCaseAndIdNot(String code, Long id);

    boolean existsByLibelleIgnoreCaseAndSpecialiteId(String libelle, Long specialiteId);
    boolean existsByLibelleIgnoreCaseAndSpecialiteIdAndIdNot(String libelle, Long specialiteId, Long id);

    List<SousSpecialite> findBySpecialiteIdOrderByOrdreAffichageAscLibelleAsc(Long specialiteId);

    List<SousSpecialite> findBySpecialiteIdAndActiveTrueOrderByOrdreAffichageAscLibelleAsc(Long specialiteId);

    Optional<SousSpecialite> findByIdAndActiveTrue(Long id);

    Optional<SousSpecialite> findByIdAndSpecialiteId(Long id, Long specialiteId);

    Optional<SousSpecialite> findByIdAndSpecialiteIdAndActiveTrue(Long id, Long specialiteId);

    Page<SousSpecialite> findByLibelleContainingIgnoreCase(String libelle, Pageable pageable);

    Page<SousSpecialite> findBySpecialiteId(Long specialiteId, Pageable pageable);

    Page<SousSpecialite> findByActive(boolean active, Pageable pageable);

    Page<SousSpecialite> findBySpecialiteIdAndActive(Long specialiteId, boolean active, Pageable pageable);

    Page<SousSpecialite> findByLibelleContainingIgnoreCaseAndActive(String libelle, boolean active, Pageable pageable);

    Page<SousSpecialite> findByLibelleContainingIgnoreCaseAndSpecialiteId(String libelle, Long specialiteId, Pageable pageable);

    Page<SousSpecialite> findByLibelleContainingIgnoreCaseAndSpecialiteIdAndActive(
            String libelle,
            Long specialiteId,
            boolean active,
            Pageable pageable
    );

    List<SousSpecialite> findBySpecialiteId(Long specialiteId);
}