package com.onmm.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Data
@Entity
@Table(
        name = "sous_specialites",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_sous_specialite_libelle_specialite",
                        columnNames = {"libelle", "specialite_id"}
                ),
                @UniqueConstraint(
                        name = "uk_sous_specialite_code",
                        columnNames = "code"
                )
        }
)
public class SousSpecialite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50, unique = true)
    private String code;

    @Column(nullable = false, length = 150)
    private String libelle;

    @Column(length = 500)
    private String description;

    @Column(name = "ordre_affichage")
    private Integer ordreAffichage;

    @Column(nullable = false)
    private boolean active = true;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "specialite_id", nullable = false)
    private Specialite specialite;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public SousSpecialite() {
    }

}