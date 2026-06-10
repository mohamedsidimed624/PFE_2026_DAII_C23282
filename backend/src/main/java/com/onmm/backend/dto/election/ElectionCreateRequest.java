package com.onmm.backend.dto.election;

import com.onmm.backend.entity.enums.CorpsElectoral;
import com.onmm.backend.entity.enums.ElectionNiveau;
import com.onmm.backend.entity.enums.ElectionType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public class ElectionCreateRequest {

    @NotBlank(message = "Le titre est obligatoire")
    @Size(max = 255, message = "Le titre ne peut pas dépasser 255 caractères")
    private String titre;

    private String description;

    @NotNull(message = "Le type d'élection est obligatoire")
    private ElectionType type;

    @NotNull(message = "Le niveau est obligatoire")
    private ElectionNiveau niveau;

    private String region;

    @Min(value = 1, message = "Le nombre de sièges doit être au moins 1")
    private int seatsCount = 1;

    @Min(value = 1, message = "Le nombre max de votes par électeur doit être au moins 1")
    private int maxVotesParElecteur = 1;

    private LocalDateTime candidatureStartDate;
    private LocalDateTime candidatureEndDate;
    private LocalDateTime voteStartDate;
    private LocalDateTime voteEndDate;

    private CorpsElectoral corpsElectoral = CorpsElectoral.TOUS_MEDECINS_ACTIFS;
    private Double quorumPourcentage;
    private String presetCode;

    public String getTitre() { return titre; }
    public void setTitre(String titre) { this.titre = titre; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public ElectionType getType() { return type; }
    public void setType(ElectionType type) { this.type = type; }

    public ElectionNiveau getNiveau() { return niveau; }
    public void setNiveau(ElectionNiveau niveau) { this.niveau = niveau; }

    public String getRegion() { return region; }
    public void setRegion(String region) { this.region = region; }

    public int getSeatsCount() { return seatsCount; }
    public void setSeatsCount(int seatsCount) { this.seatsCount = seatsCount; }

    public int getMaxVotesParElecteur() { return maxVotesParElecteur; }
    public void setMaxVotesParElecteur(int maxVotesParElecteur) { this.maxVotesParElecteur = maxVotesParElecteur; }

    public LocalDateTime getCandidatureStartDate() { return candidatureStartDate; }
    public void setCandidatureStartDate(LocalDateTime candidatureStartDate) { this.candidatureStartDate = candidatureStartDate; }

    public LocalDateTime getCandidatureEndDate() { return candidatureEndDate; }
    public void setCandidatureEndDate(LocalDateTime candidatureEndDate) { this.candidatureEndDate = candidatureEndDate; }

    public LocalDateTime getVoteStartDate() { return voteStartDate; }
    public void setVoteStartDate(LocalDateTime voteStartDate) { this.voteStartDate = voteStartDate; }

    public LocalDateTime getVoteEndDate() { return voteEndDate; }
    public void setVoteEndDate(LocalDateTime voteEndDate) { this.voteEndDate = voteEndDate; }

    public CorpsElectoral getCorpsElectoral() { return corpsElectoral; }
    public void setCorpsElectoral(CorpsElectoral corpsElectoral) { this.corpsElectoral = corpsElectoral; }

    public Double getQuorumPourcentage() { return quorumPourcentage; }
    public void setQuorumPourcentage(Double quorumPourcentage) { this.quorumPourcentage = quorumPourcentage; }

    public String getPresetCode() { return presetCode; }
    public void setPresetCode(String presetCode) { this.presetCode = presetCode; }
}