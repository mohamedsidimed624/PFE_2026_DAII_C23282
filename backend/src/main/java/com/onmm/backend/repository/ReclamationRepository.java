package com.onmm.backend.repository;

import com.onmm.backend.entity.Medecin;
import com.onmm.backend.entity.Reclamation;
import com.onmm.backend.entity.enums.ReclamationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ReclamationRepository extends JpaRepository<Reclamation, Long> {

    List<Reclamation> findByMedecinOrderByDateCreationDesc(Medecin medecin);

    List<Reclamation> findAllByOrderByDateCreationDesc();

    Optional<Reclamation> findByIdAndMedecin(Long id, Medecin medecin);

    long countByStatut(ReclamationStatus statut);

    long countByStatutIn(java.util.List<ReclamationStatus> statuts);
}