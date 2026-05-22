//package com.onmm.backend.repository;
//
//import com.onmm.backend.entity.Vote;
//import org.springframework.data.jpa.repository.JpaRepository;
//import org.springframework.data.jpa.repository.Query;
//import org.springframework.data.repository.query.Param;
//
//import java.util.Map;
//
//public interface VoteRepository extends JpaRepository<Vote, Long> {
//
//    long countByElectionId(Long electionId);
//    long countByElectionIdAndCandidatureId(Long electionId, Long candidatureId);
//
//    boolean existsByElectionIdAndVotantHash(Long electionId, String votantHash);
//
//    // Distinct voters = distinct hashes per election
//    @Query("SELECT COUNT(DISTINCT v.votantHash) FROM Vote v WHERE v.election.id = :electionId")
//    long countDistinctVotantsByElectionId(@Param("electionId") Long electionId);
//}