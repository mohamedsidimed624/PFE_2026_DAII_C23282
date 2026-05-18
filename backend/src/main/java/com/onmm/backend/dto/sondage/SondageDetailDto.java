package com.onmm.backend.dto.sondage;

import com.onmm.backend.entity.enums.SondageStatut;
import com.onmm.backend.entity.enums.SondageType;

import java.time.LocalDateTime;
import java.util.List;

public class SondageDetailDto {

    private Long id;
    private String titre;
    private String description;
    private SondageType type;
    private SondageStatut statut;
    private boolean anonyme;
    private LocalDateTime dateDebut;
    private LocalDateTime dateFin;
    private LocalDateTime dateCreation;
    private LocalDateTime datePublication;
    private String commentaireValidation;
    private String filtreSpecialite;
    private String filtreWilaya;
    private String filtreStatut;
    private String filtreGenre;
    private int nbQuestions;
    private long nbParticipants;
    private long nbCompletes;
    private double tauxCompletion;

    private List<QuestionDto> questions;
    private boolean resultatsPublies;

    private long nbParticipationsDemarrees;

    public long getNbParticipationsDemarrees() {
        return nbParticipationsDemarrees;
    }

    public void setNbParticipationsDemarrees(long nbParticipationsDemarrees) {
        this.nbParticipationsDemarrees = nbParticipationsDemarrees;
    }

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

    public LocalDateTime getDateCreation() { return dateCreation; }
    public void setDateCreation(LocalDateTime dateCreation) { this.dateCreation = dateCreation; }

    public LocalDateTime getDatePublication() { return datePublication; }
    public void setDatePublication(LocalDateTime datePublication) { this.datePublication = datePublication; }

    public String getCommentaireValidation() { return commentaireValidation; }
    public void setCommentaireValidation(String commentaireValidation) { this.commentaireValidation = commentaireValidation; }

    public String getFiltreSpecialite() { return filtreSpecialite; }
    public void setFiltreSpecialite(String filtreSpecialite) { this.filtreSpecialite = filtreSpecialite; }

    public String getFiltreWilaya() { return filtreWilaya; }
    public void setFiltreWilaya(String filtreWilaya) { this.filtreWilaya = filtreWilaya; }

    public String getFiltreStatut() { return filtreStatut; }
    public void setFiltreStatut(String filtreStatut) { this.filtreStatut = filtreStatut; }

    public String getFiltreGenre() { return filtreGenre; }
    public void setFiltreGenre(String filtreGenre) { this.filtreGenre = filtreGenre; }

    public int getNbQuestions() { return nbQuestions; }
    public void setNbQuestions(int nbQuestions) { this.nbQuestions = nbQuestions; }

    public long getNbParticipants() { return nbParticipants; }
    public void setNbParticipants(long nbParticipants) { this.nbParticipants = nbParticipants; }

    public long getNbCompletes() { return nbCompletes; }
    public void setNbCompletes(long nbCompletes) { this.nbCompletes = nbCompletes; }

    public double getTauxCompletion() { return tauxCompletion; }
    public void setTauxCompletion(double tauxCompletion) { this.tauxCompletion = tauxCompletion; }

    public List<QuestionDto> getQuestions() { return questions; }
    public void setQuestions(List<QuestionDto> questions) { this.questions = questions; }

    public boolean isResultatsPublies() { return resultatsPublies; }
    public void setResultatsPublies(boolean resultatsPublies) { this.resultatsPublies = resultatsPublies; }
}
