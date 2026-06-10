package com.onmm.backend.repository;

import com.onmm.backend.entity.ElectionIntegrityState;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ElectionIntegrityStateRepository extends JpaRepository<ElectionIntegrityState, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM ElectionIntegrityState s WHERE s.electionId = :id")
    Optional<ElectionIntegrityState> findByIdForUpdate(@Param("id") Long id);
}
