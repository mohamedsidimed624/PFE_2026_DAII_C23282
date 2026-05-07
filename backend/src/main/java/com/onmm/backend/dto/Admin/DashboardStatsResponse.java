package com.onmm.backend.dto.Admin;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DashboardStatsResponse {

    private long totalDemandes;
    private long demandesEnAttente;
    private long demandesAcceptees;
    private long demandesRejetees;

    private long totalMedecins;
    private long medecinsActifs;
    private long medecinsSuspendus;
    private long medecinsHommes;
    private long medecinsFemmes;

    private long totalSpecialites;

    private List<RecentDemandeDto> recentDemandes;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class RecentDemandeDto {
        private Long id;
        private String nom;
        private String prenom;
        private String numeroDossier;
        private String statut;
        private LocalDateTime submissionDate;
    }
}
