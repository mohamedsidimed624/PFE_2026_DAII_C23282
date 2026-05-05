package com.onmm.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@Entity
@Table(name = "medecin_experience")
public class MedecinExperience {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Chaque expérience appartient à un seul médecin
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medecin_id", nullable = false)
    private Medecin medecin;

    @Column(name = "nom_etablissement", nullable = false)
    private String nomEtablissement;

    @Column(nullable = false)
    private String poste;

    @Column(nullable = false)
    private String pays;

    @Column(nullable = false)
    private String ville;

    @Column(name = "date_debut", nullable = false)
    private LocalDate dateDebut;

    @Column(name = "date_fin")
    private LocalDate dateFin;

    @Column(nullable = false)
    private String description;
}