package com.onmm.backend.repository;

import com.onmm.backend.entity.BulletinVote;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BulletinVoteRepository extends JpaRepository<BulletinVote, Long> {

    long countByParticipationId(Long participationId);

    boolean existsByParticipationIdAndCandidatureId(Long participationId, Long candidatureId);

    long countByElectionIdAndCandidatureId(Long electionId, Long candidatureId);

    long countByElectionId(Long electionId);

    long countByElectionIdAndPositionElectoraleId(Long electionId, Long positionId);
}
