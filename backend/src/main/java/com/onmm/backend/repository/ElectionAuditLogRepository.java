package com.onmm.backend.repository;

import com.onmm.backend.entity.ElectionAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ElectionAuditLogRepository extends JpaRepository<ElectionAuditLog, Long> {
    List<ElectionAuditLog> findByElectionIdOrderByDateActionDesc(Long electionId);
}
