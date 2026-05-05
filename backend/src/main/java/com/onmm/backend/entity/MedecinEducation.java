package com.onmm.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "medecin_education")
public class MedecinEducation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Chaque formation appartient à un seul médecin
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medecin_id", nullable = false)
    private Medecin medecin;

    @Column(nullable = false, length = 150)
    private String diplome;

    @Column(nullable = false, length = 150)
    private String universite;

    @Column(nullable = false, length = 100)
    private String pays;

    @Column(nullable = false, length = 100)
    private String ville;

    @Column(name = "annee_obtention", nullable = false)
    private Integer anneeObtention;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "specialite_id")
    private Specialite specialite;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sous_specialite_id")
    private SousSpecialite sousSpecialite;
}