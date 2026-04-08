package com.onmm.backend.entity;

import com.onmm.backend.entity.enums.ReclamationAuteurType;
import com.onmm.backend.entity.enums.ReclamationStatus;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "reclamations")
public class Reclamation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "numero_reclamation", nullable = false, unique = true)
    private String numeroReclamation;

    @Enumerated(EnumType.STRING)
    @Column(name = "type_auteur", nullable = false)
    private ReclamationAuteurType typeAuteur;

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

    public Long getId() {
        return id;
    }

    public String getNumeroReclamation() {
        return numeroReclamation;
    }

    public void setNumeroReclamation(String numeroReclamation) {
        this.numeroReclamation = numeroReclamation;
    }

    public ReclamationAuteurType getTypeAuteur() {
        return typeAuteur;
    }

    public void setTypeAuteur(ReclamationAuteurType typeAuteur) {
        this.typeAuteur = typeAuteur;
    }

    public String getObjet() {
        return objet;
    }

    public void setObjet(String objet) {
        this.objet = objet;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getPieceJointePath() {
        return pieceJointePath;
    }

    public void setPieceJointePath(String pieceJointePath) {
        this.pieceJointePath = pieceJointePath;
    }

    public ReclamationStatus getStatut() {
        return statut;
    }

    public void setStatut(ReclamationStatus statut) {
        this.statut = statut;
    }

    public LocalDateTime getDateCreation() {
        return dateCreation;
    }

    public void setDateCreation(LocalDateTime dateCreation) {
        this.dateCreation = dateCreation;
    }

    public LocalDateTime getDatePriseEnCharge() {
        return datePriseEnCharge;
    }

    public void setDatePriseEnCharge(LocalDateTime datePriseEnCharge) {
        this.datePriseEnCharge = datePriseEnCharge;
    }

    public LocalDateTime getDateCloture() {
        return dateCloture;
    }

    public void setDateCloture(LocalDateTime dateCloture) {
        this.dateCloture = dateCloture;
    }

    public Medecin getMedecin() {
        return medecin;
    }

    public void setMedecin(Medecin medecin) {
        this.medecin = medecin;
    }

    public String getNomCitoyen() {
        return nomCitoyen;
    }

    public void setNomCitoyen(String nomCitoyen) {
        this.nomCitoyen = nomCitoyen;
    }

    public String getPrenomCitoyen() {
        return prenomCitoyen;
    }

    public void setPrenomCitoyen(String prenomCitoyen) {
        this.prenomCitoyen = prenomCitoyen;
    }

    public String getVilleCitoyen() {
        return villeCitoyen;
    }

    public void setVilleCitoyen(String villeCitoyen) {
        this.villeCitoyen = villeCitoyen;
    }

    public String getAdresseCitoyen() {
        return adresseCitoyen;
    }

    public void setAdresseCitoyen(String adresseCitoyen) {
        this.adresseCitoyen = adresseCitoyen;
    }

    public String getTelephoneCitoyen() {
        return telephoneCitoyen;
    }

    public void setTelephoneCitoyen(String telephoneCitoyen) {
        this.telephoneCitoyen = telephoneCitoyen;
    }

    public String getEmailCitoyen() {
        return emailCitoyen;
    }

    public void setEmailCitoyen(String emailCitoyen) {
        this.emailCitoyen = emailCitoyen;
    }

    public String getAdminResponse() {
        return adminResponse;
    }

    public void setAdminResponse(String adminResponse) {
        this.adminResponse = adminResponse;
    }

    public User getAdminTraiteur() {
        return adminTraiteur;
    }

    public void setAdminTraiteur(User adminTraiteur) {
        this.adminTraiteur = adminTraiteur;
    }

    public void setId(Long id) {
        this.id = id;
    }
}