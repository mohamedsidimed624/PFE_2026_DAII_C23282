package com.onmm.backend.dto.sondage;

import com.onmm.backend.entity.enums.SondageStatut;
import com.onmm.backend.entity.enums.SondageType;

import java.time.LocalDateTime;
import java.util.List;

public class MedecinSondageDto {

    private Long id;
    private String titre;
    private String description;
    private SondageType type;
    private SondageStatut statut;
    private boolean anonyme;
    private LocalDateTime dateDebut;
    private LocalDateTime dateFin;
    private int nbQuestions;
    private List<QuestionDto> questions;
    private ParticipationStatusDto participation;
    private boolean resultatsPublies;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitre() { return titre; }
    public void setTitre(String titre) { this.titre = titre; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public SondageType getType() { return type; }
    public void setType(SondageType type) { this.type = type; }

    public SondageStatut getStatut() { return statut; }
    public void setStatut(SondageStatut statut) { this.statut = statut; }

    public boolean isAnonyme() { return anonyme; }
    public void setAnonyme(boolean anonyme) { this.anonyme = anonyme; }

    public LocalDateTime getDateDebut() { return dateDebut; }
    public void setDateDebut(LocalDateTime dateDebut) { this.dateDebut = dateDebut; }

    public LocalDateTime getDateFin() { return dateFin; }
    public void setDateFin(LocalDateTime dateFin) { this.dateFin = dateFin; }

    public int getNbQuestions() { return nbQuestions; }
    public void setNbQuestions(int nbQuestions) { this.nbQuestions = nbQuestions; }

    public List<QuestionDto> getQuestions() { return questions; }
    public void setQuestions(List<QuestionDto> questions) { this.questions = questions; }

    public ParticipationStatusDto getParticipation() { return participation; }
    public void setParticipation(ParticipationStatusDto participation) { this.participation = participation; }

    public boolean isResultatsPublies() { return resultatsPublies; }
    public void setResultatsPublies(boolean resultatsPublies) { this.resultatsPublies = resultatsPublies; }
}
