package com.onmm.backend.dto.election;

public class VoteIntegrityReportDto {

    private Long electionId;
    private long expectedVotes;   // d'après election_integrity_state.vote_count
    private long totalVotes;      // count(*) réel en base
    private long validVotes;      // hash recalculé = hash stocké
    private long tamperedVotes;   // hash mismatch → modification détectée
    private boolean deletionDetected;  // expectedVotes != totalVotes
    private boolean integrityOk;       // tout est cohérent

    public VoteIntegrityReportDto(Long electionId, long expectedVotes, long totalVotes,
                                   long validVotes, long tamperedVotes,
                                   boolean deletionDetected, boolean integrityOk) {
        this.electionId = electionId;
        this.expectedVotes = expectedVotes;
        this.totalVotes = totalVotes;
        this.validVotes = validVotes;
        this.tamperedVotes = tamperedVotes;
        this.deletionDetected = deletionDetected;
        this.integrityOk = integrityOk;
    }

    public Long getElectionId() { return electionId; }
    public long getExpectedVotes() { return expectedVotes; }
    public long getTotalVotes() { return totalVotes; }
    public long getValidVotes() { return validVotes; }
    public long getTamperedVotes() { return tamperedVotes; }
    public boolean isDeletionDetected() { return deletionDetected; }
    public boolean isIntegrityOk() { return integrityOk; }
}
