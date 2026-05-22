package com.onmm.backend.dto.election;

import com.onmm.backend.entity.enums.CorpsElectoral;
import com.onmm.backend.entity.enums.ElectionNiveau;
import com.onmm.backend.entity.enums.ElectionStatut;
import com.onmm.backend.entity.enums.ElectionType;

import java.time.LocalDateTime;

public class ElectionListDto {

    private Long id;
    private String titre;
    private ElectionType type;
    private ElectionStatut statut;
    private ElectionNiveau niveau;
    private String region;

    private CorpsElectoral corpsElectoral;
    private Double quorumPourcentage;

    private int seatsCount;
    private long nbCandidatsValides;
    private long nbVotants;
    private long nbElecteursEligibles;
    private double tauxParticipation;

    private LocalDateTime candidatureStartDate;
    private LocalDateTime candidatureEndDate;
    private LocalDateTime voteStartDate;
    private LocalDateTime voteEndDate;
    private LocalDateTime dateCreation;

    private boolean resultatsPublies;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitre() { return titre; }
    public void setTitre(String titre) { this.titre = titre; }

    public ElectionType getType() { return type; }
    public void setType(ElectionType type) { this.type = type; }

    public ElectionStatut getStatut() { return statut; }
    public void setStatut(ElectionStatut statut) { this.statut = statut; }

    public ElectionNiveau getNiveau() { return niveau; }
    public void setNiveau(ElectionNiveau niveau) { this.niveau = niveau; }

    public String getRegion() { return region; }
    public void setRegion(String region) { this.region = region; }

    public CorpsElectoral getCorpsElectoral() { return corpsElectoral; }
    public void setCorpsElectoral(CorpsElectoral corpsElectoral) { this.corpsElectoral = corpsElectoral; }

    public Double getQuorumPourcentage() { return quorumPourcentage; }
    public void setQuorumPourcentage(Double quorumPourcentage) { this.quorumPourcentage = quorumPourcentage; }

    public int getSeatsCount() { return seatsCount; }
    public void setSeatsCount(int seatsCount) { this.seatsCount = seatsCount; }

    public long getNbCandidatsValides() { return nbCandidatsValides; }
    public void setNbCandidatsValides(long nbCandidatsValides) { this.nbCandidatsValides = nbCandidatsValides; }

    public long getNbVotants() { return nbVotants; }
    public void setNbVotants(long nbVotants) { this.nbVotants = nbVotants; }

    public long getNbElecteursEligibles() { return nbElecteursEligibles; }
    public void setNbElecteursEligibles(long nbElecteursEligibles) { this.nbElecteursEligibles = nbElecteursEligibles; }

    public double getTauxParticipation() { return tauxParticipation; }
    public void setTauxParticipation(double tauxParticipation) { this.tauxParticipation = tauxParticipation; }

    public LocalDateTime getCandidatureStartDate() { return candidatureStartDate; }
    public void setCandidatureStartDate(LocalDateTime candidatureStartDate) { this.candidatureStartDate = candidatureStartDate; }

    public LocalDateTime getCandidatureEndDate() { return candidatureEndDate; }
    public void setCandidatureEndDate(LocalDateTime candidatureEndDate) { this.candidatureEndDate = candidatureEndDate; }

    public LocalDateTime getVoteStartDate() { return voteStartDate; }
    public void setVoteStartDate(LocalDateTime voteStartDate) { this.voteStartDate = voteStartDate; }

    public LocalDateTime getVoteEndDate() { return voteEndDate; }
    public void setVoteEndDate(LocalDateTime voteEndDate) { this.voteEndDate = voteEndDate; }

    public LocalDateTime getDateCreation() { return dateCreation; }
    public void setDateCreation(LocalDateTime dateCreation) { this.dateCreation = dateCreation; }

    public boolean isResultatsPublies() { return resultatsPublies; }
    public void setResultatsPublies(boolean resultatsPublies) { this.resultatsPublies = resultatsPublies; }
}