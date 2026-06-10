package com.onmm.backend.repository;

import com.onmm.backend.entity.Candidature;
import com.onmm.backend.entity.enums.StatutCandidature;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CandidatureRepository extends JpaRepository<Candidature, Long> {



    List<Candidature> findByMedecinEmail(String email);

    boolean existsByElectionIdAndMedecinEmailAndPositionId(
            Long electionId,
            String email,
            Long positionId
    );

    long countByElectionIdAndPositionIdAndStatut(
            Long electionId,
            Long positionId,
            StatutCandidature statut
    );

    List<Candidature> findByElectionId(Long electionId);

    @Query("SELECT COUNT(c) FROM Candidature c WHERE c.election.id = :electionId AND c.statut IN :statuts")
    long countByElectionIdAndStatutIn(@Param("electionId") Long electionId,
                                      @Param("statuts") List<StatutCandidature> statuts);
    List<Candidature> findByElectionIdAndStatut(Long electionId, StatutCandidature statut);
    Optional<Candidature> findByElectionIdAndMedecinEmail(Long electionId, String email);
    long countByElectionIdAndStatut(Long electionId, StatutCandidature statut);

    List<Candidature> findByMedecinEmailOrderByDateDepotDesc(String email);
    boolean existsByElectionIdAndMedecinEmail(Long electionId, String email);

    Page<Candidature> findAllByOrderByDateDepotDesc(Pageable pageable);
    Page<Candidature> findByStatutOrderByDateDepotDesc(StatutCandidature statut, Pageable pageable);
    Page<Candidature> findByPosition_IdOrderByDateDepotDesc(Long positionId, Pageable pageable);
    Page<Candidature> findByStatutAndPosition_IdOrderByDateDepotDesc(StatutCandidature statut, Long positionId, Pageable pageable);
}