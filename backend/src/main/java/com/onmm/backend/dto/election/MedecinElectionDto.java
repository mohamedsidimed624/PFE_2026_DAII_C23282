package com.onmm.backend.dto.election;

public class MedecinElectionDto extends ElectionDetailDto {
    private boolean aVote;
    private CandidatureDto maCandidature;

    public boolean isAVote() { return aVote; }
    public void setAVote(boolean aVote) { this.aVote = aVote; }

    public CandidatureDto getMaCandidature() { return maCandidature; }
    public void setMaCandidature(CandidatureDto maCandidature) { this.maCandidature = maCandidature; }
}
