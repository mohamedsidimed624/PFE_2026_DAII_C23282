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

    @Query("""
        select distinct m
        from Medecin m
        left join fetch m.educations edu
        left join fetch edu.specialite
        left join fetch edu.sousSpecialite
        where m.id = :userId
    """)
    Optional<Medecin> findProfileByUserId(Long userId);

    @Query("""
        select distinct m
        from Medecin m
        left join fetch m.educations edu
        left join fetch edu.specialite
        left join fetch edu.sousSpecialite
        where m.id = :id
    """)
    Optional<Medecin> findPublicDetailById(Long id);

    Optional<Medecin> findByDemandeOrigine(DemandeAdhesion demande);

    Optional<Medecin> findByEmail(String email);

    long countByStatut(StatutMedecin statut);

    long countBySexe(String sexe);

    long countByNationaliteIgnoreCase(String nationalite);

    List<Medecin> findAllByStatut(StatutMedecin statut);
}