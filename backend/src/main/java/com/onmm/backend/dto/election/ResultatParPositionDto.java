package com.onmm.backend.dto.election;

import java.util.List;

public class ResultatParPositionDto {
    private PositionElectoraleDto position;
    private List<CandidatureDto> candidats;
    private List<CandidatureDto> gagnants;

    public PositionElectoraleDto getPosition() { return position; }
    public void setPosition(PositionElectoraleDto position) { this.position = position; }

    public List<CandidatureDto> getCandidats() { return candidats; }
    public void setCandidats(List<CandidatureDto> candidats) { this.candidats = candidats; }

    public List<CandidatureDto> getGagnants() { return gagnants; }
    public void setGagnants(List<CandidatureDto> gagnants) { this.gagnants = gagnants; }
}
