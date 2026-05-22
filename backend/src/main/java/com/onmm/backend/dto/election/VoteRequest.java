package com.onmm.backend.dto.election;

import java.util.List;

public class VoteRequest {
    private List<PositionVoteRequest> votes;
    private List<Long> candidatureIds;

    public List<PositionVoteRequest> getVotes() { return votes; }
    public void setVotes(List<PositionVoteRequest> votes) { this.votes = votes; }

    public List<Long> getCandidatureIds() { return candidatureIds; }
    public void setCandidatureIds(List<Long> candidatureIds) { this.candidatureIds = candidatureIds; }
}
