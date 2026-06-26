package com.onmm.backend.repository;

import com.onmm.backend.entity.ServerKeyPair;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ServerKeyPairRepository extends JpaRepository<ServerKeyPair, Long> {
}
