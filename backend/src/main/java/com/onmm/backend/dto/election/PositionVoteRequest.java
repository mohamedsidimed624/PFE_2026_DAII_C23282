package com.onmm.backend.dto.election;

import java.util.List;

public class PositionVoteRequest {
    private Long positionId;
    private List<Long> candidatureIds;

    public Long getPositionId() { return positionId; }
    public void setPositionId(Long positionId) { this.positionId = positionId; }

    public List<Long> getCandidatureIds() { return candidatureIds; }
    public void setCandidatureIds(List<Long> candidatureIds) { this.candidatureIds = candidatureIds; }
}
