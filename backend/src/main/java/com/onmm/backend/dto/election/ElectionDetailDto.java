package com.onmm.backend.dto.election;

import java.util.List;

public class ElectionDetailDto extends ElectionListDto {
    private String description;
    private int maxVotesParElecteur;
    private List<CandidatureDto> candidatures;
    private List<PositionElectoraleDto> positions;

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public int getMaxVotesParElecteur() { return maxVotesParElecteur; }
    public void setMaxVotesParElecteur(int maxVotesParElecteur) { this.maxVotesParElecteur = maxVotesParElecteur; }

    public List<CandidatureDto> getCandidatures() { return candidatures; }
    public void setCandidatures(List<CandidatureDto> candidatures) { this.candidatures = candidatures; }

    public List<PositionElectoraleDto> getPositions() { return positions; }
    public void setPositions(List<PositionElectoraleDto> positions) { this.positions = positions; }
}
