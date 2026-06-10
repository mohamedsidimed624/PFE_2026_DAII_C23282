package com.onmm.backend.entity;

import com.onmm.backend.entity.enums.ReclamationAuteurType;
import com.onmm.backend.entity.enums.ReclamationCategory;
import com.onmm.backend.entity.enums.ReclamationModule;
import com.onmm.backend.entity.enums.ReclamationPriorite;
import com.onmm.backend.entity.enums.ReclamationStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "reclamations")
@Getter
@Setter
public class Reclamation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "numero_reclamation", nullable = false, unique = true)
    private String numeroReclamation;

    @Enumerated(EnumType.STRING)
    @Column(name = "type_auteur", nullable = false)
    private ReclamationAuteurType typeAuteur;

    @Enumerated(EnumType.STRING)
    @Column(name = "categorie", nullable = false)
    private ReclamationCategory categorie;

    @Enumerated(EnumType.STRING)
    @Column(name = "priorite", nullable = false)
    private ReclamationPriorite priorite;

    @Enumerated(EnumType.STRING)
    @Column(name = "module_concerne", nullable = false)
    private ReclamationModule moduleConcerne;

    @Column(nullable = false)
    private String objet;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(name = "piece_jointe_path")
    private String pieceJointePath;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReclamationStatus statut;

    @Column(name = "date_creation", nullable = false)
    private LocalDateTime dateCreation;

    @Column(name = "date_prise_en_charge")
    private LocalDateTime datePriseEnCharge;

    @Column(name = "date_cloture")
    private LocalDateTime dateCloture;

    @Column(name = "date_derniere_mise_a_jour")
    private LocalDateTime dateDerniereMiseAJour;

    // Cas médecin
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medecin_id")
    private Medecin medecin;

    // Cas citoyen
    @Column(name = "nom_citoyen")
    private String nomCitoyen;

    @Column(name = "prenom_citoyen")
    private String prenomCitoyen;

    @Column(name = "ville_citoyen")
    private String villeCitoyen;

    @Column(name = "adresse_citoyen")
    private String adresseCitoyen;

    @Column(name = "telephone_citoyen")
    private String telephoneCitoyen;

    @Column(name = "email_citoyen")
    private String emailCitoyen;

    // Traitement admin
    @Column(name = "admin_response", columnDefinition = "TEXT")
    private String adminResponse;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_id")
    private User adminTraiteur;

    public Reclamation() {
    }


}