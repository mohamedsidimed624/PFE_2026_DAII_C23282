package com.onmm.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Table(
        name = "specialites",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_specialite_code", columnNames = "code"),
                @UniqueConstraint(name = "uk_specialite_libelle", columnNames = "libelle")
        }
)
public class Specialite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50, unique = true)
    private String code;

    @Column(nullable = false, length = 150, unique = true)
    private String libelle;

    @Column(length = 500)
    private String description;

    @Column(name = "ordre_affichage")
    private Integer ordreAffichage;

    @Column(nullable = false)
    private boolean active = true;

    @OneToMany(mappedBy = "specialite", fetch = FetchType.LAZY)
    private List<SousSpecialite> sousSpecialites = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Specialite() {
    }

}