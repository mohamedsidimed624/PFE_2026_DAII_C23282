package com.onmm.backend.repository;

import com.onmm.backend.entity.DemandeAdhesion;
import com.onmm.backend.entity.Medecin;
import com.onmm.backend.entity.enums.StatutMedecin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MedecinRepository extends JpaRepository<Medecin, Long>, JpaSpecificationExecutor<Medecin> {

    long countByStatut(StatutMedecin statut);

    Optional<Medecin> findByEmail(String email);



    long countBySexe(String sexe);

    long countByNationaliteIgnoreCase(String nationalite);

    List<Medecin> findAllByStatut(StatutMedecin statut);


    @Query("""
    select count(m)
    from Medecin m
    where m.statut = :statut
      and m.numeroInscription is not null
      and trim(m.numeroInscription) <> ''
""")
    long countElecteursEligiblesTous(StatutMedecin statut);

    @Query("""
    select count(m)
    from Medecin m
    where m.statut = :statut
      and lower(m.villeExercice) = lower(:region)
      and m.numeroInscription is not null
      and trim(m.numeroInscription) <> ''
""")
    long countElecteursEligiblesRegion(StatutMedecin statut, String region);

    @Query("""
    select m
    from Medecin m
    where m.statut = :statut
      and m.numeroInscription is not null
      and trim(m.numeroInscription) <> ''
""")
    List<Medecin> findElecteursEligiblesTous(StatutMedecin statut);

    @Query("""
    select m
    from Medecin m
    where m.statut = :statut
      and lower(m.villeExercice) = lower(:region)
      and m.numeroInscription is not null
      and trim(m.numeroInscription) <> ''
""")
    List<Medecin> findElecteursEligiblesRegion(StatutMedecin statut, String region);

    Optional<Medecin> findPublicDetailById(Long id);

    Optional<Medecin> findByDemandeOrigine(DemandeAdhesion demande);


    long countByStatutAndVilleExerciceIgnoreCase(StatutMedecin statut, String villeExercice);
}