package com.onmm.backend.repository;

import com.onmm.backend.entity.ElectionKeyPair;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ElectionKeyPairRepository extends JpaRepository<ElectionKeyPair, Long> {
}
