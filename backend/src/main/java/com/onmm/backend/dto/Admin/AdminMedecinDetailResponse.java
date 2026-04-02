package com.onmm.backend.dto.Admin;

import java.time.LocalDate;
import java.util.List;

public class AdminMedecinDetailResponse {

    private Long id;
    private String nom;
    private String prenom;
    private String email;
    private String telephone;
    private String nni;
    private String sexe;
    private String nationalite;
    private String adresse;
    private String numeroInscription;
    private String statut;
    private String specialite;
    private String photoProfilPath;
    private LocalDate dateNaissance;

    private List<AdminMedecinEducationResponse> educations;
    private List<AdminMedecinExperienceResponse> experiences;
    private List<AdminMedecinDocumentResponse> documents;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public String getTelephone() {
        return telephone;
    }

    public void setTelephone(String telephone) {
        this.telephone = telephone;
    }

    public String getNni() {
        return nni;
    }

    public void setNni(String nni) {
        this.nni = nni;
    }

    public String getSexe() {
        return sexe;
    }

    public void setSexe(String sexe) {
        this.sexe = sexe;
    }

    public String getNationalite() {
        return nationalite;
    }

    public void setNationalite(String nationalite) {
        this.nationalite = nationalite;
    }

    public String getAdresse() {
        return adresse;
    }

    public void setAdresse(String adresse) {
        this.adresse = adresse;
    }

    public String getNumeroInscription() {
        return numeroInscription;
    }

    public void setNumeroInscription(String numeroInscription) {
        this.numeroInscription = numeroInscription;
    }

    public String getStatut() {
        return statut;
    }

    public void setStatut(String statut) {
        this.statut = statut;
    }

    public String getSpecialite() {
        return specialite;
    }

    public void setSpecialite(String specialite) {
        this.specialite = specialite;
    }

    public String getPhotoProfilPath() {
        return photoProfilPath;
    }

    public void setPhotoProfilPath(String photoProfilPath) {
        this.photoProfilPath = photoProfilPath;
    }

    public LocalDate getDateNaissance() {
        return dateNaissance;
    }

    public void setDateNaissance(LocalDate dateNaissance) {
        this.dateNaissance = dateNaissance;
    }

    public List<AdminMedecinEducationResponse> getEducations() {
        return educations;
    }

    public void setEducations(List<AdminMedecinEducationResponse> educations) {
        this.educations = educations;
    }

    public List<AdminMedecinExperienceResponse> getExperiences() {
        return experiences;
    }

    public void setExperiences(List<AdminMedecinExperienceResponse> experiences) {
        this.experiences = experiences;
    }

    public List<AdminMedecinDocumentResponse> getDocuments() {
        return documents;
    }

    public void setDocuments(List<AdminMedecinDocumentResponse> documents) {
        this.documents = documents;
    }
}