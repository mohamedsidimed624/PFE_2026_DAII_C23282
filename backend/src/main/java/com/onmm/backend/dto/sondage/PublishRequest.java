package com.onmm.backend.dto.sondage;

import java.time.LocalDateTime;

public class PublishRequest {
    private LocalDateTime dateDebut;
    private LocalDateTime dateFin;

    public LocalDateTime getDateDebut() { return dateDebut; }
    public void setDateDebut(LocalDateTime dateDebut) { this.dateDebut = dateDebut; }

    public LocalDateTime getDateFin() { return dateFin; }
    public void setDateFin(LocalDateTime dateFin) { this.dateFin = dateFin; }
}
