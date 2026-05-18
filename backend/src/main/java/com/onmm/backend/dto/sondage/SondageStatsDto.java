package com.onmm.backend.dto.sondage;

import java.util.List;

public class SondageStatsDto {

    private Long sondageId;
    private String titre;
    private long nbParticipants;
    private long nbCompletes;
    private double tauxCompletion;
    private List<QuestionStatDto> questionStats;
    private long nbParticipationsDemarrees;

    public long getNbParticipationsDemarrees() {
        return nbParticipationsDemarrees;
    }

    public void setNbParticipationsDemarrees(long nbParticipationsDemarrees) {
        this.nbParticipationsDemarrees = nbParticipationsDemarrees;
    }

    public Long getSondageId() { return sondageId; }
    public void setSondageId(Long sondageId) { this.sondageId = sondageId; }

    public String getTitre() { return titre; }
    public void setTitre(String titre) { this.titre = titre; }

    public long getNbParticipants() { return nbParticipants; }
    public void setNbParticipants(long nbParticipants) { this.nbParticipants = nbParticipants; }

    public long getNbCompletes() { return nbCompletes; }
    public void setNbCompletes(long nbCompletes) { this.nbCompletes = nbCompletes; }

    public double getTauxCompletion() { return tauxCompletion; }
    public void setTauxCompletion(double tauxCompletion) { this.tauxCompletion = tauxCompletion; }

    public List<QuestionStatDto> getQuestionStats() { return questionStats; }
    public void setQuestionStats(List<QuestionStatDto> questionStats) { this.questionStats = questionStats; }
}
