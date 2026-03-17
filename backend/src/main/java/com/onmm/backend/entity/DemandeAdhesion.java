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

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNNI() {
        return NNI;
    }

    public void setNNI(String NNI) {
        this.NNI = NNI;
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

    public LocalDate getDateNaissance() {
        return dateNaissance;
    }

    public void setDateNaissance(LocalDate dateNaissance) {
        this.dateNaissance = dateNaissance;
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

    public String getAdresse() {
        return adresse;
    }

    public void setAdresse(String adresse) {
        this.adresse = adresse;
    }

    public ApplicationStatus getStatut() {
        return statut;
    }

    public void setStatut(ApplicationStatus statut) {
        this.statut = statut;
    }

    public LocalDateTime getSubmissionDate() {
        return submissionDate;
    }

    public void setSubmissionDate(LocalDateTime submissionDate) {
        this.submissionDate = submissionDate;
    }

    public LocalDateTime getDecisionDate() {
        return decisionDate;
    }

    public void setDecisionDate(LocalDateTime decisionDate) {
        this.decisionDate = decisionDate;
    }

    public String getAdminComment() {
        return adminComment;
    }

    public void setAdminComment(String adminComment) {
        this.adminComment = adminComment;
    }

    public Set<DemandeEducation> getEducations() {
        return educations;
    }

    public void setEducations(Set<DemandeEducation> educations) {
        this.educations = educations;
    }

    public Set<DemandeExperience> getExperiences() {
        return experiences;
    }

    public void setExperiences(Set<DemandeExperience> experiences) {
        this.experiences = experiences;
    }

    public Set<DemandeDocument> getDocuments() {
        return documents;
    }

    public void setDocuments(Set<DemandeDocument> documents) {
        this.documents = documents;
    }
}
