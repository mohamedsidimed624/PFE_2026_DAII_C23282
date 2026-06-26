package com.onmm.backend.dto.election;

public class VoteIntegrityReportDto {

    private Long electionId;
    private long totalVotes;      // count(*) réel en base
    private long validVotes;      // hash recalculé = hash stocké
    private long tamperedVotes;   // hash mismatch → modification détectée
    private boolean integrityOk;  // tamperedVotes == 0

    public VoteIntegrityReportDto(Long electionId, long totalVotes,
                                   long validVotes, long tamperedVotes,
                                   boolean integrityOk) {
        this.electionId = electionId;
        this.totalVotes = totalVotes;
        this.validVotes = validVotes;
        this.tamperedVotes = tamperedVotes;
        this.integrityOk = integrityOk;
    }

    public Long getElectionId() { return electionId; }
    public long getTotalVotes() { return totalVotes; }
    public long getValidVotes() { return validVotes; }
    public long getTamperedVotes() { return tamperedVotes; }
    public boolean isIntegrityOk() { return integrityOk; }
}
