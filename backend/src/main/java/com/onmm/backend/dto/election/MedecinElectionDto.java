package com.onmm.backend.dto.election;

import java.util.List;

public class MedecinElectionDto extends ElectionDetailDto {
    private boolean aVote;
    private CandidatureDto maCandidature;
    private List<PositionElectoraleDto> positionsEligibles;
    private List<CandidatureDto> candidaturesEligibles;
    private boolean peutCandidater;
    private String raisonIneligibilite;
    private boolean peutVoter;
    private String prochaineEtapeCandidature;

    public boolean isAVote() { return aVote; }
    public void setAVote(boolean aVote) { this.aVote = aVote; }

    public CandidatureDto getMaCandidature() { return maCandidature; }
    public void setMaCandidature(CandidatureDto maCandidature) { this.maCandidature = maCandidature; }

    public List<PositionElectoraleDto> getPositionsEligibles() { return positionsEligibles; }
    public void setPositionsEligibles(List<PositionElectoraleDto> positionsEligibles) { this.positionsEligibles = positionsEligibles; }

    public List<CandidatureDto> getCandidaturesEligibles() { return candidaturesEligibles; }
    public void setCandidaturesEligibles(List<CandidatureDto> candidaturesEligibles) { this.candidaturesEligibles = candidaturesEligibles; }

    public boolean isPeutCandidater() { return peutCandidater; }
    public void setPeutCandidater(boolean peutCandidater) { this.peutCandidater = peutCandidater; }

    public String getRaisonIneligibilite() { return raisonIneligibilite; }
    public void setRaisonIneligibilite(String raisonIneligibilite) { this.raisonIneligibilite = raisonIneligibilite; }

    public boolean isPeutVoter() { return peutVoter; }
    public void setPeutVoter(boolean peutVoter) { this.peutVoter = peutVoter; }

    public String getProchaineEtapeCandidature() { return prochaineEtapeCandidature; }
    public void setProchaineEtapeCandidature(String prochaineEtapeCandidature) { this.prochaineEtapeCandidature = prochaineEtapeCandidature; }
}
