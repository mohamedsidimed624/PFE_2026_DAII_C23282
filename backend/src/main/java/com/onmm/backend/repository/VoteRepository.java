package com.onmm.backend.repository;

import com.onmm.backend.entity.Vote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface VoteRepository extends JpaRepository<Vote, Long> {

    boolean existsByElectionIdAndPositionElectoraleIdAndVoterToken(
            Long electionId, Long positionId, String voterToken);

    boolean existsByElectionIdAndVoterToken(Long electionId, String voterToken);

    @Query("SELECT COUNT(DISTINCT v.voterToken) FROM Vote v WHERE v.election.id = :electionId")
    long countDistinctVotersByElectionId(@Param("electionId") Long electionId);

    List<Vote> findByElectionId(Long electionId);

    List<Vote> findByElectionIdAndPositionElectoraleId(Long electionId, Long positionId);
}
