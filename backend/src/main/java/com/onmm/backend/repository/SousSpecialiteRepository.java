package com.onmm.backend.repository;

import com.onmm.backend.entity.SousSpecialite;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SousSpecialiteRepository extends JpaRepository<SousSpecialite, Long> {

    List<SousSpecialite> findBySpecialiteId(Long specialiteId);
}
