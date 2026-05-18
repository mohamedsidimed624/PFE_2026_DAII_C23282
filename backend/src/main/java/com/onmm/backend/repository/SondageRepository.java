package com.onmm.backend.repository;

import com.onmm.backend.entity.Sondage;
import com.onmm.backend.entity.enums.SondageStatut;
import com.onmm.backend.entity.enums.SondageType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface SondageRepository extends JpaRepository<Sondage, Long> {

    Page<Sondage> findAllByOrderByDateCreationDesc(Pageable pageable);

    Page<Sondage> findByStatutOrderByDateCreationDesc(SondageStatut statut, Pageable pageable);

    List<Sondage> findByStatut(SondageStatut statut);

    Page<Sondage> findByTypeOrderByDateCreationDesc(SondageType type, Pageable pageable);

    Page<Sondage> findByStatutAndTypeOrderByDateCreationDesc(
            SondageStatut statut,
            SondageType type,
            Pageable pageable
    );

    long countByStatut(SondageStatut statut);

    List<Sondage> findByStatutAndDateDebutLessThanEqual(
            SondageStatut statut,
            LocalDateTime date
    );

    List<Sondage> findByStatutAndDateFinLessThan(
            SondageStatut statut,
            LocalDateTime date
    );
}