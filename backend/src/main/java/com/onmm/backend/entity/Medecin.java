package com.onmm.backend.entity;

import com.onmm.backend.entity.enums.SectionOrdre;
import com.onmm.backend.entity.enums.StatutMedecin;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Entity
@Table(
        name = "medecins",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_medecin_telephone", columnNames = "telephone"),
                @UniqueConstraint(name = "uk_medecin_nni", columnNames = "nni"),
                @UniqueConstraint(name = "uk_medecin_numero_inscription", columnNames = "numero_inscription")
        }
)
@PrimaryKeyJoinColumn(name = "user_id")
public class Medecin extends User {

    @Column(nullable = false, length = 100)
    private String nom;

    @Column(nullable = false, length = 100)
    private String prenom;

    @Column(nullable = false, unique = true, length = 30)
    private String telephone;

    @Column(nullable = false, unique = true, length = 30)
    private String nni;

    @Column(name = "photo_profil_path", length = 500)
    private String photoProfilPath;

    @Column(length = 20)
    private String sexe;

    @Column(length = 100)
    private String nationalite;

    @Column(length = 255)
    private String adresse;

    @Column(name = "numero_inscription", unique = true, length = 100)
    private String numeroInscription;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private StatutMedecin statut;

    @Enumerated(EnumType.STRING)
    @Column(name = "section_ordre", nullable = false, length = 50)
    private SectionOrdre sectionOrdre;

    @Column(name = "date_naissance")
    private LocalDate dateNaissance;

    @Column(name = "date_approuvement")
    private LocalDate dateApprouvement;

    @Column(name = "ville_exercice", length = 100)
    private String villeExercice;

    @Column(name = "structure_exercice", length = 100)
    private String structureExercice;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "demande_id")
    private DemandeAdhesion demandeOrigine;

    @OneToMany(mappedBy = "medecin", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MedecinEducation> educations = new ArrayList<>();

    @OneToMany(mappedBy = "medecin", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MedecinExperience> experiences = new ArrayList<>();

    @OneToMany(mappedBy = "medecin", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MedecinDocument> documents = new ArrayList<>();
}