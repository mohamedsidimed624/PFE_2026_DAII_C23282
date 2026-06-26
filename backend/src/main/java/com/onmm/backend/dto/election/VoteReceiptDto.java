package com.onmm.backend.dto.election;

import java.time.LocalDateTime;

public class VoteReceiptDto {

    private LocalDateTime votedAt;
    private String message;

    public VoteReceiptDto(LocalDateTime votedAt, String message) {
        this.votedAt = votedAt;
        this.message = message;
    }

    public LocalDateTime getVotedAt() { return votedAt; }
    public String getMessage() { return message; }
}
