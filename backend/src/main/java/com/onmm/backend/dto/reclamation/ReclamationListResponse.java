package com.onmm.backend.dto.reclamation;

public class ReclamationListResponse {

    private Long id;
    private String numeroReclamation;
    private String typeAuteur;
    private String auteurNom;
    private String objet;
    private String statut;
    private String dateCreation;

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

    public String getAuteurNom() {
        return auteurNom;
    }

    public void setAuteurNom(String auteurNom) {
        this.auteurNom = auteurNom;
    }

    public String getObjet() {
        return objet;
    }

    public void setObjet(String objet) {
        this.objet = objet;
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
}