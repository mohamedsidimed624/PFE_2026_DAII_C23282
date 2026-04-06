package com.onmm.backend.repository;

import com.onmm.backend.entity.Medecin;
import com.onmm.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;

public interface MedecinRepository extends JpaRepository<Medecin, Long>, JpaSpecificationExecutor<Medecin> {

    Optional<Medecin> findByUser(User user);

    List<Medecin> findByStatut(String statut);

    List<Medecin> findByStatutAndNomContainingIgnoreCaseOrStatutAndPrenomContainingIgnoreCase(String statut1, String nom, String statut2, String prenom);
}
