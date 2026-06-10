package com.onmm.backend.dto.sondage;

import com.onmm.backend.entity.enums.SondageType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;
import java.util.List;

public class SondageCreateRequest {

    @NotBlank(message = "Le titre est obligatoire")
    @Size(max = 255, message = "Le titre ne peut pas dépasser 255 caractères")
    private String titre;

    private String description;

    @NotNull(message = "Le type de sondage est obligatoire")
    private SondageType type;

    private boolean anonyme = true;
    private LocalDateTime dateDebut;
    private LocalDateTime dateFin;
    private String filtreSpecialite;
    private String filtreWilaya;
    private String filtreStatut;
    private String filtreGenre;

    @NotEmpty(message = "Le sondage doit contenir au moins une question")
    private List<QuestionDto> questions;

    public String getTitre() { return titre; }
    public void setTitre(String titre) { this.titre = titre; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public SondageType getType() { return type; }
    public void setType(SondageType type) { this.type = type; }

    public boolean isAnonyme() { return anonyme; }
    public void setAnonyme(boolean anonyme) { this.anonyme = anonyme; }

    public LocalDateTime getDateDebut() { return dateDebut; }
    public void setDateDebut(LocalDateTime dateDebut) { this.dateDebut = dateDebut; }

    public LocalDateTime getDateFin() { return dateFin; }
    public void setDateFin(LocalDateTime dateFin) { this.dateFin = dateFin; }

    public String getFiltreSpecialite() { return filtreSpecialite; }
    public void setFiltreSpecialite(String filtreSpecialite) { this.filtreSpecialite = filtreSpecialite; }

    public String getFiltreWilaya() { return filtreWilaya; }
    public void setFiltreWilaya(String filtreWilaya) { this.filtreWilaya = filtreWilaya; }

    public String getFiltreStatut() { return filtreStatut; }
    public void setFiltreStatut(String filtreStatut) { this.filtreStatut = filtreStatut; }

    public String getFiltreGenre() { return filtreGenre; }
    public void setFiltreGenre(String filtreGenre) { this.filtreGenre = filtreGenre; }

    public List<QuestionDto> getQuestions() { return questions; }
    public void setQuestions(List<QuestionDto> questions) { this.questions = questions; }
}
