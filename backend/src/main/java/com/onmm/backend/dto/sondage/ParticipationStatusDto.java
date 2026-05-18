package com.onmm.backend.dto.sondage;

import com.onmm.backend.entity.enums.StatutParticipation;

import java.time.LocalDateTime;

public class ParticipationStatusDto {

    private Long id;
    private StatutParticipation statut;
    private LocalDateTime dateDebut;
    private LocalDateTime dateSoumission;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public StatutParticipation getStatut() { return statut; }
    public void setStatut(StatutParticipation statut) { this.statut = statut; }

    public LocalDateTime getDateDebut() { return dateDebut; }
    public void setDateDebut(LocalDateTime dateDebut) { this.dateDebut = dateDebut; }

    public LocalDateTime getDateSoumission() { return dateSoumission; }
    public void setDateSoumission(LocalDateTime dateSoumission) { this.dateSoumission = dateSoumission; }
}
