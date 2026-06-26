package com.onmm.backend.controller;

import com.onmm.backend.dto.election.ElectionAuditLogDto;
import com.onmm.backend.dto.election.VoteIntegrityReportDto;
import com.onmm.backend.service.Admin.ElectionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Contrôleur en lecture seule pour les observateurs accrédités.
 * Accessible uniquement aux comptes avec le rôle OBSERVATEUR.
 *
 * <p>Endpoints :
 * <ul>
 *   <li>GET /api/observateur/elections/{id}/audit-log — journal d'audit chronologique
 *   <li>GET /api/observateur/elections/{id}/integrity-report — rapport d'intégrité des votes
 * </ul>
 */
@RestController
@RequestMapping("/api/observateur/elections")
public class ObservateurElectionController {

    private final ElectionService electionService;

    public ObservateurElectionController(ElectionService electionService) {
        this.electionService = electionService;
    }

    @GetMapping("/{id}/audit-log")
    public ResponseEntity<List<ElectionAuditLogDto>> getAuditLog(@PathVariable Long id) {
        return ResponseEntity.ok(electionService.getAuditLog(id));
    }

    @GetMapping("/{id}/integrity-report")
    public ResponseEntity<VoteIntegrityReportDto> getIntegrityReport(@PathVariable Long id) {
        return ResponseEntity.ok(electionService.verifyVoteIntegrity(id));
    }
}
