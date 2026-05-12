package com.onmm.backend.repository;

import com.onmm.backend.entity.Cotisation;
import com.onmm.backend.entity.enums.StatutCotisation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface CotisationRepository extends JpaRepository<Cotisation, Long> {

    List<Cotisation> findByMedecinEmailOrderByAnneeDesc(String email);

    Optional<Cotisation> findByMedecinEmailAndAnnee(String email, Integer annee);

    boolean existsByMedecinEmailAndAnnee(String email, Integer annee);

    List<Cotisation> findByStatutAndDateEcheance(StatutCotisation statut, LocalDate dateEcheance);
}
