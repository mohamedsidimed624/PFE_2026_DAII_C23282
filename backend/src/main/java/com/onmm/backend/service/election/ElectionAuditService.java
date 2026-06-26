package com.onmm.backend.service.election;

import com.onmm.backend.entity.Election;
import com.onmm.backend.entity.ElectionAuditLog;
import com.onmm.backend.repository.ElectionAuditLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Journal d'audit des actions du module Élections (transitions de statut, validations,
 * votes, publication des résultats...). Journal ordinaire — qui a fait quoi, quand —
 * sans chaînage cryptographique : l'unique usage du hachage du module reste l'empreinte
 * d'intégrité des bulletins ({@link com.onmm.backend.service.election.crypto.HashingService}).
 */
@Service
public class ElectionAuditService {

    private final ElectionAuditLogRepository auditRepo;

    public ElectionAuditService(ElectionAuditLogRepository auditRepo) {
        this.auditRepo = auditRepo;
    }

    @Transactional
    public void save(Election e, String action, String acteurEmail, String acteurRole,
                     String details, String severity, String entityType, Long entityId) {

        ElectionAuditLog log = new ElectionAuditLog();
        log.setElection(e);
        log.setAction(action);
        log.setActeurEmail(acteurEmail != null ? acteurEmail : "SYSTEME");
        log.setActeurRole(acteurRole != null ? acteurRole : "SYSTEME");
        log.setDetails(details);
        log.setSeverity(severity != null ? severity : "INFO");
        log.setEntityType(entityType != null ? entityType : "Election");
        log.setEntityId(entityId != null ? entityId : e.getId());

        auditRepo.save(log);
    }
}
