package com.onmm.backend.repository;

import com.onmm.backend.entity.SousSpecialite;
import com.onmm.backend.entity.Specialite;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SpecialiteRepository extends JpaRepository<Specialite, Long> {

}
