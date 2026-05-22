package com.onmm.backend.entity;

import com.onmm.backend.entity.enums.TypeDocumentCandidature;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "candidature_documents")
public class CandidatureDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidature_id", nullable = false)
    private Candidature candidature;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TypeDocumentCandidature typeDocument;

    @Column(nullable = false)
    private String filePath;

    @Column(nullable = false)
    private String originalFilename;

    @Column(nullable = false, updatable = false)
    private LocalDateTime dateUpload = LocalDateTime.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Candidature getCandidature() { return candidature; }
    public void setCandidature(Candidature candidature) { this.candidature = candidature; }

    public TypeDocumentCandidature getTypeDocument() { return typeDocument; }
    public void setTypeDocument(TypeDocumentCandidature typeDocument) { this.typeDocument = typeDocument; }

    public String getFilePath() { return filePath; }
    public void setFilePath(String filePath) { this.filePath = filePath; }

    public String getOriginalFilename() { return originalFilename; }
    public void setOriginalFilename(String originalFilename) { this.originalFilename = originalFilename; }

    public LocalDateTime getDateUpload() { return dateUpload; }
    public void setDateUpload(LocalDateTime dateUpload) { this.dateUpload = dateUpload; }
}
