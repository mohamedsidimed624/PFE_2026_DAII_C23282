package com.onmm.backend.entity;

import com.onmm.backend.entity.enums.ApplicationStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Entity
@Getter
@Setter
@Table(name = "demande_adhesion")
public class DemandeAdhesion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String NNI;

    @Column(nullable = false)
    private String nom;

    @Column(nullable = false)
    private String prenom;

    @Column(nullable = false)
    private String sexe;

    @Column(nullable = false)
    private String nationalite;

    @Column(nullable = false)
    private LocalDate dateNaissance;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String telephone;

    @Column(nullable = false)
    private String adresse;

    @Column(name = "wilaya_exercice", length = 100)
    private String wilayaExercice;

    @Column(name = "est_enseignant_chercheur", nullable = false, columnDefinition = "BOOLEAN NOT NULL DEFAULT FALSE")
    private boolean estEnseignantChercheur = false;

    private String numeroDossier;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApplicationStatus statut;

    @Column(nullable = false)
    private LocalDateTime submissionDate;

    @Column(nullable = true)
    private LocalDateTime decisionDate;

    @Column(length = 1000)
    private String adminComment;


    @OneToMany(mappedBy = "demandeAdhesion", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private Set<DemandeEducation> educations;

    @OneToMany(mappedBy = "demandeAdhesion", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private Set<DemandeExperience> experiences;

    @OneToMany(mappedBy = "demandeAdhesion", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private Set<DemandeDocument> documents;



    public DemandeAdhesion() {
    }

    public boolean isPending() {
        return this.statut == ApplicationStatus.PENDING;
    }

    public boolean isApproved() {
        return this.statut == ApplicationStatus.APPROUVED;
    }

    public boolean isRejected() {
        return this.statut == ApplicationStatus.REJECTED;
    }

}
