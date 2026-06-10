package com.onmm.backend.service.Admin;

import com.onmm.backend.dto.election.*;
import com.onmm.backend.entity.enums.TypeDocumentCandidature;
import org.springframework.data.domain.Page;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ElectionService {

    // Admin
    Page<ElectionListDto> getAllElections(String statut, String type, int page, int size);
    ElectionDetailDto getElectionById(Long id);
    ElectionDetailDto createElection(ElectionCreateRequest req, String adminEmail);
    ElectionDetailDto updateElection(Long id, ElectionCreateRequest req);

    ResultatElectionDto getResultats(Long id);

    Page<CandidatureDto> getAllCandidatures(String statut, Long positionId, int page, int size);

    List<PositionElectoraleDto> getPositions(Long electionId);
    PositionElectoraleDto addPosition(Long electionId, PositionElectoraleRequest req);
    void deletePosition(Long electionId, Long positionId);
    List<ElectionAuditLogDto> getAuditLog(Long electionId);

    // Médecin
    Page<MedecinElectionDto> getElectionsForMedecin(String email, int page, int size);
    MedecinElectionDto getElectionDetailForMedecin(Long id, String email);
    CandidatureDto soumettreCandidature(Long electionId, CandidatureCreateRequest req, String email);
    void retirerCandidature(Long electionId, String email);
    CandidatureDto finaliserCandidature(Long candidatureId, String email);
    void voter(Long electionId, VoteRequest req, String email);
    List<CandidatureDto> getMesCandidatures(String email);
    List<CandidatureDto> getCandidaturesForElection(Long electionId);
    CandidatureDocumentDto ajouterDocument(Long candidatureId, MultipartFile file, TypeDocumentCandidature type, String email);
    void supprimerDocument(Long candidatureId, Long documentId, String email);


    void ouvrirCandidatures(Long id, String adminEmail);
    void cloturerCandidatures(Long id, String adminEmail);
    void validerCandidature(Long electionId, Long candidatureId, String adminEmail);
    void rejeterCandidature(Long electionId, Long candidatureId, String commentaire, String adminEmail);
    void ouvrirVotes(Long id, String adminEmail);
    void cloturerVotes(Long id, String adminEmail);
    void publierResultats(Long id, String adminEmail);
    void archiver(Long id, String adminEmail);
    void annuler(Long id, String raison, String adminEmail);

    VoteIntegrityReportDto verifyVoteIntegrity(Long electionId);
}
