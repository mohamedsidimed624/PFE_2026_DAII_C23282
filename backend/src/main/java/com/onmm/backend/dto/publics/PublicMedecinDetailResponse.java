package com.onmm.backend.dto.publics;

import java.util.List;

public class PublicMedecinDetailResponse {

    private Long id;
    private String nom;
    private String prenom;
    private String specialite;
    private String numeroInscription;
    private String ville;
    private String photoProfilPath;
    private String statut;
    private String sexe;
    private String adresse;
    private String nationalite;
    private List<PublicEducationDto> educations;
    private List<PublicExperienceDto> experiences;

    public String getPhotoProfilPath() {
        return photoProfilPath;
    }

    public void setPhotoProfilPath(String photoProfilPath) {
        this.photoProfilPath = photoProfilPath;
    }

    public String getVille() {
        return ville;
    }

    public void setVille(String ville) {
        this.ville = ville;
    }

    public String getNumeroInscription() {
        return numeroInscription;
    }

    public void setNumeroInscription(String numeroInscription) {
        this.numeroInscription = numeroInscription;
    }

    public String getSpecialite() {
        return specialite;
    }

    public void setSpecialite(String specialite) {
        this.specialite = specialite;
    }

    public String getSexe() {
        return sexe;
    }

    public void setSexe(String sexe) {
        this.sexe = sexe;
    }

    public String getPrenom() {
        return prenom;
    }

    public void setPrenom(String prenom) {
        this.prenom = prenom;
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getStatut() {
        return statut;
    }

    public void setStatut(String statut) {
        this.statut = statut;
    }

    public String getNationalite() {
        return nationalite;
    }

    public String getAdresse() {
        return adresse;
    }

    public void setAdresse(String adresse) {
        this.adresse = adresse;
    }

    public void setNationalite(String nationalite) {
        this.nationalite = nationalite;
    }

    public List<PublicEducationDto> getEducations() {
        return educations;
    }

    public void setEducations(List<PublicEducationDto> educations) {
        this.educations = educations;
    }

    public List<PublicExperienceDto> getExperiences() {
        return experiences;
    }

    public void setExperiences(List<PublicExperienceDto> experiences) {
        this.experiences = experiences;
    }
}