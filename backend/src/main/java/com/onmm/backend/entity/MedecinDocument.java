package com.onmm.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "medecin_document")
public class MedecinDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Chaque document appartient à un seul médecin
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medecin_id", nullable = false)
    private Medecin medecin;

    @Column(name = "file_name", nullable = false)
    private String fileName;

    @Column(name = "file_path", nullable = false)
    private String filePath;

    @Column(name = "type_document", nullable = false)
    private String typeDocument;

    @Column(nullable = false)
    private String categorie;

    @Column(nullable = false)
    private Long size;

    @Column(name = "upload_date", nullable = false)
    private LocalDateTime uploadDate;
}