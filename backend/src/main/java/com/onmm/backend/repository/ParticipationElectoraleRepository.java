package com.onmm.backend.repository;

import com.onmm.backend.entity.ParticipationElectorale;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;

import java.util.Optional;

public interface ParticipationElectoraleRepository extends JpaRepository<ParticipationElectorale, Long> {

    boolean existsByElectionIdAndVotantHash(Long electionId, String votantHash);

    long countByElectionId(Long electionId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<ParticipationElectorale> findByElectionIdAndVotantHash(Long electionId, String votantHash);
}