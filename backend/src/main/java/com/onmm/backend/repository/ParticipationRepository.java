package com.onmm.backend.repository;

import com.onmm.backend.entity.Participation;
import com.onmm.backend.entity.enums.StatutParticipation;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ParticipationRepository extends JpaRepository<Participation, Long> {

    Optional<Participation> findBySondageIdAndMedecinEmail(Long sondageId, String email);

    Optional<Participation> findBySondageIdAndRepondantHash(Long sondageId, String repondantHash);

    long countBySondageIdAndStatut(Long sondageId, StatutParticipation statut);

    long countBySondageId(Long sondageId);

    List<Participation> findByMedecinEmailOrderByDateDebutDesc(String email);

    List<Participation> findByRepondantHashOrderByDateDebutDesc(String repondantHash);

    List<Participation> findBySondageId(Long sondageId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from Participation p where p.id = :id")
    Optional<Participation> findByIdForUpdate(@Param("id") Long id);
}