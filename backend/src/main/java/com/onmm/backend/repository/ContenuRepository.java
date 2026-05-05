package com.onmm.backend.repository;

import com.onmm.backend.entity.Contenu;
import com.onmm.backend.entity.enums.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

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
}