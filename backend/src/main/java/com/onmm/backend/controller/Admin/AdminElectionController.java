package com.onmm.backend.controller.Admin;

import com.onmm.backend.dto.election.*;
import com.onmm.backend.dto.election.VoteIntegrityReportDto;
import com.onmm.backend.entity.UserPrincipal;
import com.onmm.backend.service.Admin.ElectionService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/elections")
public class AdminElectionController {

    private final ElectionService electionService;

    public AdminElectionController(ElectionService electionService) {
        this.electionService = electionService;
    }

    private String currentEmail(Authentication auth) {
        return ((UserPrincipal) auth.getPrincipal()).getUser().getEmail();
    }

    // ─────────────────────────────────────────────
    // Elections
    // ─────────────────────────────────────────────

    @GetMapping
    public Page<ElectionListDto> getAllElections(
            @RequestParam(required = false) String statut,
            @RequestParam(required = false) String type,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return electionService.getAllElections(statut, type, page, size);
    }

    @GetMapping("/{id}")
    public ElectionDetailDto getElectionById(@PathVariable Long id) {
        return electionService.getElectionById(id);
    }

    @PostMapping
    public ResponseEntity<ElectionDetailDto> createElection(
            @Valid @RequestBody ElectionCreateRequest req,
            Authentication auth
    ) {
        ElectionDetailDto dto = electionService.createElection(req, currentEmail(auth));
        return ResponseEntity.status(HttpStatus.CREATED).body(dto);
    }

    @PutMapping("/{id}")
    public ElectionDetailDto updateElection(
            @PathVariable Long id,
            @Valid @RequestBody ElectionCreateRequest req
    ) {
        return electionService.updateElection(id, req);
    }

    // ─────────────────────────────────────────────
    // Cycle de vie électoral
    // ─────────────────────────────────────────────

    @PutMapping("/{id}/ouvrir-candidatures")
    public ResponseEntity<Void> ouvrirCandidatures(
            @PathVariable Long id,
            Authentication auth
    ) {
        electionService.ouvrirCandidatures(id, currentEmail(auth));
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/cloturer-candidatures")
    public ResponseEntity<Void> cloturerCandidatures(
            @PathVariable Long id,
            Authentication auth
    ) {
        electionService.cloturerCandidatures(id, currentEmail(auth));
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/ouvrir-votes")
    public ResponseEntity<Void> ouvrirVotes(
            @PathVariable Long id,
            Authentication auth
    ) {
        electionService.ouvrirVotes(id, currentEmail(auth));
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/cloturer-votes")
    public ResponseEntity<Void> cloturerVotes(
            @PathVariable Long id,
            Authentication auth
    ) {
        electionService.cloturerVotes(id, currentEmail(auth));
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/publier-resultats")
    public ResponseEntity<Void> publierResultats(
            @PathVariable Long id,
            Authentication auth
    ) {
        electionService.publierResultats(id, currentEmail(auth));
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/archiver")
    public ResponseEntity<Void> archiver(
            @PathVariable Long id,
            Authentication auth
    ) {
        electionService.archiver(id, currentEmail(auth));
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/annuler")
    public ResponseEntity<Void> annuler(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            Authentication auth
    ) {
        electionService.annuler(id, body.get("raison"), currentEmail(auth));
        return ResponseEntity.noContent().build();
    }

    // ─────────────────────────────────────────────
    // Candidatures
    // ─────────────────────────────────────────────

    @GetMapping("/candidatures")
    public Page<CandidatureDto> getAllCandidatures(
            @RequestParam(required = false) String statut,
            @RequestParam(required = false) Long positionId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return electionService.getAllCandidatures(statut, positionId, page, size);
    }

    @GetMapping("/{id}/candidatures")
    public List<CandidatureDto> getCandidaturesForElection(@PathVariable Long id) {
        return electionService.getCandidaturesForElection(id);
    }

    @PutMapping("/{id}/candidatures/{cid}/valider")
    public ResponseEntity<Void> validerCandidature(
            @PathVariable Long id,
            @PathVariable Long cid,
            Authentication auth
    ) {
        electionService.validerCandidature(id, cid, currentEmail(auth));
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/candidatures/{cid}/rejeter")
    public ResponseEntity<Void> rejeterCandidature(
            @PathVariable Long id,
            @PathVariable Long cid,
            @Valid @RequestBody CandidatureRejectionRequest req,
            Authentication auth
    ) {
        electionService.rejeterCandidature(
                id,
                cid,
                req != null ? req.getCommentaire() : null,
                currentEmail(auth)
        );
        return ResponseEntity.noContent().build();
    }

    // ─────────────────────────────────────────────
    // Positions électorales
    // ─────────────────────────────────────────────

    @GetMapping("/{id}/positions")
    public List<PositionElectoraleDto> getPositions(@PathVariable Long id) {
        return electionService.getPositions(id);
    }

    @PostMapping("/{id}/positions")
    public ResponseEntity<PositionElectoraleDto> addPosition(
            @PathVariable Long id,
            @Valid @RequestBody PositionElectoraleRequest req
    ) {
        PositionElectoraleDto dto = electionService.addPosition(id, req);
        return ResponseEntity.status(HttpStatus.CREATED).body(dto);
    }

    @DeleteMapping("/{id}/positions/{pid}")
    public ResponseEntity<Void> deletePosition(
            @PathVariable Long id,
            @PathVariable Long pid
    ) {
        electionService.deletePosition(id, pid);
        return ResponseEntity.noContent().build();
    }

    // ─────────────────────────────────────────────
    // Résultats et audit
    // ─────────────────────────────────────────────

    @GetMapping("/{id}/resultats")
    public ResultatElectionDto getResultats(@PathVariable Long id) {
        return electionService.getResultats(id);
    }

    @GetMapping("/{id}/audit")
    public List<ElectionAuditLogDto> getAuditLog(@PathVariable Long id) {
        return electionService.getAuditLog(id);
    }

    @GetMapping("/{id}/verify-integrity")
    public VoteIntegrityReportDto verifyIntegrity(@PathVariable Long id) {
        return electionService.verifyVoteIntegrity(id);
    }
}