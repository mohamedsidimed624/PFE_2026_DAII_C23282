package com.onmm.backend.dto.sondage;

import java.util.List;

public class ReponseSubmitRequest {

    private Long participationId;
    private List<ReponseItemRequest> reponses;

    public Long getParticipationId() { return participationId; }
    public void setParticipationId(Long participationId) { this.participationId = participationId; }

    public List<ReponseItemRequest> getReponses() { return reponses; }
    public void setReponses(List<ReponseItemRequest> reponses) { this.reponses = reponses; }
}
