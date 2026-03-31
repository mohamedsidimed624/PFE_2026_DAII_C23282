package com.onmm.backend.dto.demande;

import java.time.LocalDateTime;

public class SuiviDossierResponse {

    // === Identification ===
    private String numeroDossier;
    private String nom;
    private String prenom;
    private String email;

    // === Etat du dossier ===
    private String statut; // PENDING / APPROVED / REJECTED

    private LocalDateTime dateSoumission;
    private LocalDateTime dateDecision;

    // === Info admin (si rejet) ===
    private String commentaireAdmin;

    // === Etat compte ===
    private boolean compteCree;
    private boolean compteActive;

    // === Actions possibles
    private boolean peutActiverCompte;
    private boolean peutCompleterDossier;

    // === Lien activation
    private String activationLink;

    // ===== GETTERS / SETTERS

    public String getNumeroDossier() {
        return numeroDossier;
    }

    public void setNumeroDossier(String numeroDossier) {
        this.numeroDossier = numeroDossier;
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public String getPrenom() {
        return prenom;
    }

    public void setPrenom(String prenom) {
        this.prenom = prenom;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getStatut() {
        return statut;
    }

    public void setStatut(String statut) {
        this.statut = statut;
    }

    public LocalDateTime getDateSoumission() {
        return dateSoumission;
    }

    public void setDateSoumission(LocalDateTime dateSoumission) {
        this.dateSoumission = dateSoumission;
    }

    public LocalDateTime getDateDecision() {
        return dateDecision;
    }

    public void setDateDecision(LocalDateTime dateDecision) {
        this.dateDecision = dateDecision;
    }

    public String getCommentaireAdmin() {
        return commentaireAdmin;
    }

    public void setCommentaireAdmin(String commentaireAdmin) {
        this.commentaireAdmin = commentaireAdmin;
    }

    public boolean isCompteCree() {
        return compteCree;
    }

    public void setCompteCree(boolean compteCree) {
        this.compteCree = compteCree;
    }

    public boolean isCompteActive() {
        return compteActive;
    }

    public void setCompteActive(boolean compteActive) {
        this.compteActive = compteActive;
    }

    public boolean isPeutActiverCompte() {
        return peutActiverCompte;
    }

    public void setPeutActiverCompte(boolean peutActiverCompte) {
        this.peutActiverCompte = peutActiverCompte;
    }

    public boolean isPeutCompleterDossier() {
        return peutCompleterDossier;
    }

    public void setPeutCompleterDossier(boolean peutCompleterDossier) {
        this.peutCompleterDossier = peutCompleterDossier;
    }

    public String getActivationLink() {
        return activationLink;
    }

    public void setActivationLink(String activationLink) {
        this.activationLink = activationLink;
    }
}