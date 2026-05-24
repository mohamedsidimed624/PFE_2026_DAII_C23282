package com.onmm.backend.dto.Admin;

import com.onmm.backend.dto.DemandeDocumentResponse;
import com.onmm.backend.dto.DemandeEducationResponse;
import com.onmm.backend.dto.DemandeExperienceResponse;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class AdminDemandeDetailResponse {

    private Long id;

    private String nom;

    private String prenom;

    private String email;

    private String telephone;

    private String nationalite;

    private LocalDate dateNaissance;

    private String statut;

    private String sectionProposee;

    private boolean estEnseignantChercheur;

    private LocalDateTime submissionDate;

    private List<DemandeEducationResponse> educations;

    private List<DemandeExperienceResponse> experiences;

    private List<DemandeDocumentResponse> documents;

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

    public String getTelephone() {
        return telephone;
    }

    public void setTelephone(String telephone) {
        this.telephone = telephone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getNationalite() {
        return nationalite;
    }

    public void setNationalite(String nationalite) {
        this.nationalite = nationalite;
    }

    public LocalDate getDateNaissance() {
        return dateNaissance;
    }

    public void setDateNaissance(LocalDate dateNaissance) {
        this.dateNaissance = dateNaissance;
    }

    public String getStatut() {
        return statut;
    }

    public void setStatut(String statut) {
        this.statut = statut;
    }

    public LocalDateTime getSubmissionDate() {
        return submissionDate;
    }

    public void setSubmissionDate(LocalDateTime submissionDate) {
        this.submissionDate = submissionDate;
    }

    public List<DemandeExperienceResponse> getExperiences() {
        return experiences;
    }

    public void setExperiences(List<DemandeExperienceResponse> experiences) {
        this.experiences = experiences;
    }

    public List<DemandeEducationResponse> getEducations() {
        return educations;
    }

    public void setEducations(List<DemandeEducationResponse> educations) {
        this.educations = educations;
    }

    public List<DemandeDocumentResponse> getDocuments() {
        return documents;
    }

    public void setDocuments(List<DemandeDocumentResponse> documents) {
        this.documents = documents;
    }

    public String getSectionProposee() { return sectionProposee; }
    public void setSectionProposee(String sectionProposee) { this.sectionProposee = sectionProposee; }

    public boolean isEstEnseignantChercheur() { return estEnseignantChercheur; }
    public void setEstEnseignantChercheur(boolean estEnseignantChercheur) { this.estEnseignantChercheur = estEnseignantChercheur; }

    private String wilayaExercice;
    public String getWilayaExercice() { return wilayaExercice; }
    public void setWilayaExercice(String w) { this.wilayaExercice = w; }
}