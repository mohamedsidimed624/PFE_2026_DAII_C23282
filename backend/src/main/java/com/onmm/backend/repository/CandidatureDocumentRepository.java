package com.onmm.backend.repository;

import com.onmm.backend.entity.CandidatureDocument;
import com.onmm.backend.entity.enums.TypeDocumentCandidature;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CandidatureDocumentRepository extends JpaRepository<CandidatureDocument, Long> {

    List<CandidatureDocument> findByCandidatureId(Long candidatureId);

    void deleteByCandidatureId(Long candidatureId);

    boolean existsByCandidatureIdAndTypeDocument(
            Long candidatureId,
            TypeDocumentCandidature typeDocument
    );

    long countByCandidatureId(Long candidatureId);

    Optional<CandidatureDocument> findByCandidatureIdAndTypeDocument(
            Long candidatureId,
            TypeDocumentCandidature typeDocument
    );
}