package com.onmm.backend.repository;

import com.onmm.backend.entity.Contenu;
import com.onmm.backend.entity.enums.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ContenuRepository extends JpaRepository<Contenu, Long>, JpaSpecificationExecutor<Contenu> {

    Page<Contenu> findByStatutAndVisibilite(
            ContenuStatut statut,
            ContenuVisibilite visibilite,
            Pageable pageable
    );

    Page<Contenu> findAllByOrderByDateCreationDesc(Pageable pageable);



    Page<Contenu> findByStatutAndVisibiliteAndCategorie_Id(
            ContenuStatut statut,
            ContenuVisibilite visibilite,
            Long categorieId,
            Pageable pageable
    );

    Page<Contenu> findByStatutAndVisibiliteAndType(
            ContenuStatut statut,
            ContenuVisibilite visibilite,
            ContenuType type,
            Pageable pageable
    );

    Page<Contenu> findByStatutAndVisibiliteAndTitreContainingIgnoreCase(
            ContenuStatut statut,
            ContenuVisibilite visibilite,
            String search,
            Pageable pageable
    );

    Optional<Contenu> findByIdAndStatutAndVisibilite(
            Long id,
            ContenuStatut statut,
            ContenuVisibilite visibilite
    );

    @Query("""
        SELECT c FROM Contenu c
        WHERE c.statut = com.onmm.backend.entity.enums.ContenuStatut.PUBLISHED
        AND c.visibilite = com.onmm.backend.entity.enums.ContenuVisibilite.PRIVEE
        AND (c.specialiteCible IS NULL OR c.specialiteCible.id IN :specialiteIds)
        ORDER BY c.datePublication DESC
    """)
    Page<Contenu> findMedecinContenus(@Param("specialiteIds") List<Long> specialiteIds, Pageable pageable);

    @Modifying
    @Query("""
        UPDATE Contenu c SET c.statut = com.onmm.backend.entity.enums.ContenuStatut.EXPIRED
        WHERE c.dateExpiration < :now
          AND c.statut = com.onmm.backend.entity.enums.ContenuStatut.PUBLISHED
    """)
    int expireContenusBefore(@Param("now") LocalDateTime now);
}