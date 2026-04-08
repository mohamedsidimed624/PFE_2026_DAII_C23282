package com.onmm.backend.dto.reclamation;

public class ReclamationDetailResponse {

    private Long id;
    private String numeroReclamation;
    private String typeAuteur;
    private String objet;
    private String message;
    private String pieceJointePath;
    private String statut;
    private String dateCreation;
    private String datePriseEnCharge;
    private String dateCloture;

    private String nomAuteur;
    private String prenomAuteur;
    private String emailAuteur;
    private String telephoneAuteur;
    private String villeAuteur;
    private String adresseAuteur;

    private String adminResponse;

    public Long getId() {
        return id;
    }

    public String getNumeroReclamation() {
        return numeroReclamation;
    }

    public void setNumeroReclamation(String numeroReclamation) {
        this.numeroReclamation = numeroReclamation;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTypeAuteur() {
        return typeAuteur;
    }

    public void setTypeAuteur(String typeAuteur) {
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

    public String getStatut() {
        return statut;
    }

    public void setStatut(String statut) {
        this.statut = statut;
    }

    public String getDateCreation() {
        return dateCreation;
    }

    public void setDateCreation(String dateCreation) {
        this.dateCreation = dateCreation;
    }

    public String getDatePriseEnCharge() {
        return datePriseEnCharge;
    }

    public void setDatePriseEnCharge(String datePriseEnCharge) {
        this.datePriseEnCharge = datePriseEnCharge;
    }

    public String getDateCloture() {
        return dateCloture;
    }

    public void setDateCloture(String dateCloture) {
        this.dateCloture = dateCloture;
    }

    public String getNomAuteur() {
        return nomAuteur;
    }

    public void setNomAuteur(String nomAuteur) {
        this.nomAuteur = nomAuteur;
    }

    public String getPrenomAuteur() {
        return prenomAuteur;
    }

    public void setPrenomAuteur(String prenomAuteur) {
        this.prenomAuteur = prenomAuteur;
    }

    public String getEmailAuteur() {
        return emailAuteur;
    }

    public void setEmailAuteur(String emailAuteur) {
        this.emailAuteur = emailAuteur;
    }

    public String getTelephoneAuteur() {
        return telephoneAuteur;
    }

    public void setTelephoneAuteur(String telephoneAuteur) {
        this.telephoneAuteur = telephoneAuteur;
    }

    public String getVilleAuteur() {
        return villeAuteur;
    }

    public void setVilleAuteur(String villeAuteur) {
        this.villeAuteur = villeAuteur;
    }

    public String getAdresseAuteur() {
        return adresseAuteur;
    }

    public void setAdresseAuteur(String adresseAuteur) {
        this.adresseAuteur = adresseAuteur;
    }

    public String getAdminResponse() {
        return adminResponse;
    }

    public void setAdminResponse(String adminResponse) {
        this.adminResponse = adminResponse;
    }
}