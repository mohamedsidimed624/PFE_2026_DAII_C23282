package com.onmm.backend.repository;

import com.onmm.backend.entity.Vote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface VoteRepository extends JpaRepository<Vote, Long> {

    boolean existsByElectionIdAndPositionElectoraleIdAndVoterKeyHash(
            Long electionId, Long positionId, String voterKeyHash);

    boolean existsByElectionIdAndVoterKeyHash(Long electionId, String voterKeyHash);

    long countByElectionIdAndCandidatureId(Long electionId, Long candidatureId);

    long countByCandidatureId(Long candidatureId);

    @Query("SELECT COUNT(DISTINCT v.voterKeyHash) FROM Vote v WHERE v.election.id = :electionId")
    long countDistinctVotersByElectionId(@Param("electionId") Long electionId);

    @Query("SELECT v.candidature.id, COUNT(v) FROM Vote v WHERE v.election.id = :electionId GROUP BY v.candidature.id")
    List<Object[]> countVotesByCandidatureForElection(@Param("electionId") Long electionId);

    List<Vote> findByElectionId(Long electionId);

    List<Vote> findByElectionIdOrderBySequenceNumAsc(Long electionId);

    List<Vote> findByElectionIdAndPositionElectoraleId(Long electionId, Long positionId);
}
