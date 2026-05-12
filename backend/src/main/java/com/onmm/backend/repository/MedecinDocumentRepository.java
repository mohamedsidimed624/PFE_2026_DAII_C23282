package com.onmm.backend.repository;

import com.onmm.backend.entity.MedecinDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MedecinDocumentRepository extends JpaRepository<MedecinDocument, Long> {
}
