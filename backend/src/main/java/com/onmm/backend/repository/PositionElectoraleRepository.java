package com.onmm.backend.repository;

import com.onmm.backend.entity.PositionElectorale;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PositionElectoraleRepository extends JpaRepository<PositionElectorale, Long> {
    List<PositionElectorale> findByElectionIdOrderByOrdreAsc(Long electionId);
}
