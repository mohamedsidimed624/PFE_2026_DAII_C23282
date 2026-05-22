package com.onmm.backend.controller;

import com.onmm.backend.dto.election.*;
import com.onmm.backend.entity.UserPrincipal;
import com.onmm.backend.entity.enums.TypeDocumentCandidature;
import com.onmm.backend.service.Admin.ElectionService;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/medecin/elections")
@CrossOrigin(origins = "http://localhost:5173")
public class MedecinElectionController {

    private final ElectionService electionService;

    public MedecinElectionController(ElectionService electionService) {
        this.electionService = electionService;
    }

    private String currentEmail(Authentication auth) {
        return ((UserPrincipal) auth.getPrincipal()).getUser().getEmail();
    }

    @GetMapping
    public Page<MedecinElectionDto> getElections(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication auth
    ) {
        return electionService.getElectionsForMedecin(currentEmail(auth), page, size);
    }

    @GetMapping("/{id}")
    public MedecinElectionDto getElectionDetail(@PathVariable Long id, Authentication auth) {
        return electionService.getElectionDetailForMedecin(id, currentEmail(auth));
    }

    @PostMapping("/{id}/candidater")
    public ResponseEntity<CandidatureDto> candidater(
            @PathVariable Long id,
            @RequestBody CandidatureCreateRequest req,
            Authentication auth
    ) {
        CandidatureDto dto = electionService.soumettreCandidature(id, req, currentEmail(auth));
        return ResponseEntity.status(HttpStatus.CREATED).body(dto);
    }

    @DeleteMapping("/{id}/candidature")
    public ResponseEntity<Void> retirerCandidature(@PathVariable Long id, Authentication auth) {
        electionService.retirerCandidature(id, currentEmail(auth));
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/voter")
    public ResponseEntity<Void> voter(
            @PathVariable Long id,
            @RequestBody VoteRequest req,
            Authentication auth
    ) {
        electionService.voter(id, req, currentEmail(auth));
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/candidatures/{candidatureId}/documents")
    public ResponseEntity<CandidatureDocumentDto> uploadDocument(
            @PathVariable Long candidatureId,
            @RequestParam("file") MultipartFile file,
            @RequestParam("type") TypeDocumentCandidature type,
            Authentication auth
    ) {
        CandidatureDocumentDto dto = electionService.ajouterDocument(candidatureId, file, type, currentEmail(auth));
        return ResponseEntity.status(HttpStatus.CREATED).body(dto);
    }

    @GetMapping("/mes-candidatures")
    public List<CandidatureDto> getMesCandidatures(Authentication auth) {
        return electionService.getMesCandidatures(currentEmail(auth));
    }
}
