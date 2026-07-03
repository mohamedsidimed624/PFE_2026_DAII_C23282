package com.onmm.backend.repository;

import com.onmm.backend.entity.DemandeAdhesion;
import com.onmm.backend.entity.Medecin;
import com.onmm.backend.entity.enums.SectionOrdre;
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
      and lower(m.wilayaExercice) = lower(:region)
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
      and lower(m.wilayaExercice) = lower(:region)
      and m.numeroInscription is not null
      and trim(m.numeroInscription) <> ''
""")
    List<Medecin> findElecteursEligiblesRegion(StatutMedecin statut, String region);

    Optional<Medecin> findPublicDetailById(Long id);

    Optional<Medecin> findByDemandeOrigine(DemandeAdhesion demande);


    long countByStatutAndVilleExerciceIgnoreCase(StatutMedecin statut, String villeExercice);

    long countBySectionOrdreAndStatut(SectionOrdre sectionOrdre, StatutMedecin statut);

    List<Medecin> findBySectionOrdreAndStatut(SectionOrdre sectionOrdre, StatutMedecin statut);

    interface MedecinCounts {
        Long getTotal();
        Long getActifs();
        Long getSuspendus();
        Long getHommes();
        Long getFemmes();
        Long getMauritaniens();
    }

    @Query(value = """
        SELECT COUNT(*) AS total,
               SUM(CASE WHEN statut = 'ACTIF'    THEN 1 ELSE 0 END) AS actifs,
               SUM(CASE WHEN statut = 'SUSPENDU' THEN 1 ELSE 0 END) AS suspendus,
               SUM(CASE WHEN sexe = 'Homme'      THEN 1 ELSE 0 END) AS hommes,
               SUM(CASE WHEN sexe = 'Femme'      THEN 1 ELSE 0 END) AS femmes,
               SUM(CASE WHEN LOWER(nationalite) = 'mauritanienne' THEN 1 ELSE 0 END) AS mauritaniens
        FROM medecins
        """, nativeQuery = true)
    MedecinCounts getDashboardCounts();

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"educations", "educations.specialite", "educations.sousSpecialite"})
    @Query("SELECT m FROM Medecin m")
    List<Medecin> findAllWithEducations();
}