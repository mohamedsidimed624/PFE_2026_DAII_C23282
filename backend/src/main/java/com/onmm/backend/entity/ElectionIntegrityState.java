package com.onmm.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "election_integrity_state")
public class ElectionIntegrityState {

    @Id
    @Column(name = "election_id")
    private Long electionId;

    @Column(name = "last_hash", nullable = false, length = 128)
    private String lastHash;

    @Column(name = "vote_count", nullable = false)
    private Long voteCount;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public Long getElectionId() { return electionId; }
    public void setElectionId(Long electionId) { this.electionId = electionId; }

    public String getLastHash() { return lastHash; }
    public void setLastHash(String lastHash) { this.lastHash = lastHash; }

    public Long getVoteCount() { return voteCount; }
    public void setVoteCount(Long voteCount) { this.voteCount = voteCount; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
