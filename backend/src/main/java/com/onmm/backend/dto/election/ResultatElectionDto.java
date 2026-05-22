package com.onmm.backend.dto.election;

import java.util.List;

public class ResultatElectionDto {

    private Long electionId;
    private String titre;
    private long nbVotants;
    private double tauxParticipation;

    private Double quorumPourcentage;
    private boolean quorumAtteint;

    private boolean contientExAequo;
    private String messageExAequo;

    private boolean resultatsValidables;
    private String messageResultat;

    private List<CandidatureDto> gagnants;
    private List<CandidatureDto> tousLesCandidats;
    private List<ResultatParPositionDto> resultatsParPosition;

    public Long getElectionId() { return electionId; }
    public void setElectionId(Long electionId) { this.electionId = electionId; }

    public String getTitre() { return titre; }
    public void setTitre(String titre) { this.titre = titre; }

    public long getNbVotants() { return nbVotants; }
    public void setNbVotants(long nbVotants) { this.nbVotants = nbVotants; }

    public double getTauxParticipation() { return tauxParticipation; }
    public void setTauxParticipation(double tauxParticipation) { this.tauxParticipation = tauxParticipation; }

    public Double getQuorumPourcentage() { return quorumPourcentage; }
    public void setQuorumPourcentage(Double quorumPourcentage) { this.quorumPourcentage = quorumPourcentage; }

    public boolean isQuorumAtteint() { return quorumAtteint; }
    public void setQuorumAtteint(boolean quorumAtteint) { this.quorumAtteint = quorumAtteint; }

    public boolean isContientExAequo() { return contientExAequo; }
    public void setContientExAequo(boolean contientExAequo) { this.contientExAequo = contientExAequo; }

    public String getMessageExAequo() { return messageExAequo; }
    public void setMessageExAequo(String messageExAequo) { this.messageExAequo = messageExAequo; }

    public List<CandidatureDto> getGagnants() { return gagnants; }
    public void setGagnants(List<CandidatureDto> gagnants) { this.gagnants = gagnants; }

    public List<CandidatureDto> getTousLesCandidats() { return tousLesCandidats; }
    public void setTousLesCandidats(List<CandidatureDto> tousLesCandidats) { this.tousLesCandidats = tousLesCandidats; }

    public List<ResultatParPositionDto> getResultatsParPosition() { return resultatsParPosition; }
    public void setResultatsParPosition(List<ResultatParPositionDto> resultatsParPosition) { this.resultatsParPosition = resultatsParPosition; }

    public boolean isResultatsValidables() {
        return resultatsValidables;
    }

    public void setResultatsValidables(boolean resultatsValidables) {
        this.resultatsValidables = resultatsValidables;
    }

    public String getMessageResultat() {
        return messageResultat;
    }

    public void setMessageResultat(String messageResultat) {
        this.messageResultat = messageResultat;
    }
}