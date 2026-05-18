package com.onmm.backend.service.Admin;

import com.onmm.backend.dto.sondage.*;
import org.springframework.data.domain.Page;

import java.time.LocalDateTime;
import java.util.List;

public interface SondageService {

    // ── Admin operations ─────────────────────────────────────────────────────
    SondageDetailDto getSondageById(Long id);
    SondageDetailDto createSondage(SondageCreateRequest req, String adminEmail);
    SondageDetailDto updateSondage(Long id, SondageCreateRequest req);
    void publishSondage(Long id, LocalDateTime dateDebut, LocalDateTime dateFin);
    void publishResultats(Long id);
    void closeSondage(Long id);
    void archiveSondage(Long id);
    void deleteSondage(Long id);
    SondageStatsDto getSondageStats(Long id);
    SondageStatsDto getResultatsForMedecin(Long id, String email);

    Page<SondageListDto> getAllSondages(String type, String statut, int page, int size);

    List<MedecinSondageDto> getSondagesForMedecin(String email);

    // ── Médecin operations ────────────────────────────────────────────────────
    MedecinSondageDto getSondageForMedecin(Long id, String email);
    ParticipationStartResponse startParticipation(Long sondageId, String email);
    void submitReponses(ReponseSubmitRequest req, String email);
    List<ParticipationStatusDto> getMesParticipations(String email);
}
