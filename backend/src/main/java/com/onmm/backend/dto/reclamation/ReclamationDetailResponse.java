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
    private String dateDerniereMiseAJour;

    private String nomAuteur;
    private String prenomAuteur;
    private String emailAuteur;
    private String telephoneAuteur;
    private String villeAuteur;
    private String adresseAuteur;

    private String categorie;
    private String priorite;
    private String moduleConcerne;

    private String adminResponse;
    private String adminTraiteurNom;
    private Long adminTraiteurId;


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

    public String getAdminTraiteurNom() {
        return adminTraiteurNom;
    }

    public void setAdminTraiteurNom(String adminTraiteurNom) {
        this.adminTraiteurNom = adminTraiteurNom;
    }

    public String getDateDerniereMiseAJour() {
        return dateDerniereMiseAJour;
    }

    public void setDateDerniereMiseAJour(String dateDerniereMiseAJour) {
        this.dateDerniereMiseAJour = dateDerniereMiseAJour;
    }

    public Long getAdminTraiteurId() {
        return adminTraiteurId;
    }

    public void setAdminTraiteurId(Long adminTraiteurId) {
        this.adminTraiteurId = adminTraiteurId;
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

    public String getCategorie() {
        return categorie;
    }

    public void setCategorie(String categorie) {
        this.categorie = categorie;
    }

    public String getPriorite() {
        return priorite;
    }

    public void setPriorite(String priorite) {
        this.priorite = priorite;
    }

    public String getModuleConcerne() {
        return moduleConcerne;
    }

    public void setModuleConcerne(String moduleConcerne) {
        this.moduleConcerne = moduleConcerne;
    }
}