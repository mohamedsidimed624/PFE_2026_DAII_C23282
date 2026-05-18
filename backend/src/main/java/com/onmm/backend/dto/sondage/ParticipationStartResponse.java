package com.onmm.backend.dto.sondage;

public class ParticipationStartResponse {

    private Long participationId;
    private SondageDetailDto sondage;

    public Long getParticipationId() { return participationId; }
    public void setParticipationId(Long participationId) { this.participationId = participationId; }

    public SondageDetailDto getSondage() { return sondage; }
    public void setSondage(SondageDetailDto sondage) { this.sondage = sondage; }
}
