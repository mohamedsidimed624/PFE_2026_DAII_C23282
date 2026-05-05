package com.onmm.backend.dto.demande;

import com.onmm.backend.entity.SousSpecialite;
import com.onmm.backend.entity.Specialite;

import java.time.LocalDate;
import java.util.List;

public class RepriseDemandeResponse {

    private PersonalData personal;
    private List<EducationData> education;
    private List<ExperienceData> experience;

    public PersonalData getPersonal() {
        return personal;
    }

    public void setPersonal(PersonalData personal) {
        this.personal = personal;
    }

    public List<EducationData> getEducation() {
        return education;
    }

    public void setEducation(List<EducationData> education) {
        this.education = education;
    }

    public List<ExperienceData> getExperience() {
        return experience;
    }

    public void setExperience(List<ExperienceData> experience) {
        this.experience = experience;
    }

    public static class PersonalData {
        private String nom;
        private String prenom;
        private String email;
        private String telephone;
        private String nni;
        private String sexe;
        private String nationalite;
        private LocalDate dateNaissance;
        private String adresse;

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

        public LocalDate getDateNaissance() {
            return dateNaissance;
        }

        public void setDateNaissance(LocalDate dateNaissance) {
            this.dateNaissance = dateNaissance;
        }

        public String getAdresse() {
            return adresse;
        }

        public void setAdresse(String adresse) {
            this.adresse = adresse;
        }
    }

    public static class EducationData {
        private Long specialiteId;
        private String specialiteLibelle;
        private Long sousSpecialiteId;
        private String sousSpecialiteLibelle;
        private String diplome;
        private Integer anneeObtention;
        private String pays;
        private String ville;
        private String universite;

        public Long getSpecialiteId() {
            return specialiteId;
        }

        public void setSpecialiteId(Long specialiteId) {
            this.specialiteId = specialiteId;
        }

        public Long getSousSpecialiteId() {
            return sousSpecialiteId;
        }

        public void setSousSpecialiteId(Long sousSpecialiteId) {
            this.sousSpecialiteId = sousSpecialiteId;
        }

        public String getSpecialiteLibelle() {
            return specialiteLibelle;
        }

        public void setSpecialiteLibelle(String specialiteLibelle) {
            this.specialiteLibelle = specialiteLibelle;
        }

        public String getSousSpecialiteLibelle() {
            return sousSpecialiteLibelle;
        }

        public void setSousSpecialiteLibelle(String sousSpecialiteLibelle) {
            this.sousSpecialiteLibelle = sousSpecialiteLibelle;
        }

        public String getDiplome() {
            return diplome;
        }

        public void setDiplome(String diplome) {
            this.diplome = diplome;
        }

        public Integer getAnneeObtention() {
            return anneeObtention;
        }

        public void setAnneeObtention(Integer anneeObtention) {
            this.anneeObtention = anneeObtention;
        }

        public String getPays() {
            return pays;
        }

        public void setPays(String pays) {
            this.pays = pays;
        }

        public String getVille() {
            return ville;
        }

        public void setVille(String ville) {
            this.ville = ville;
        }

        public String getUniversite() {
            return universite;
        }

        public void setUniversite(String universite) {
            this.universite = universite;
        }
    }

    public static class ExperienceData {
        private String poste;
        private String etablissement;
        private String ville;
        private String pays;
        private LocalDate dateDebut;
        private LocalDate dateFin;
        private String description;

        public String getPoste() {
            return poste;
        }

        public void setPoste(String poste) {
            this.poste = poste;
        }

        public String getEtablissement() {
            return etablissement;
        }

        public void setEtablissement(String etablissement) {
            this.etablissement = etablissement;
        }

        public String getVille() {
            return ville;
        }

        public void setVille(String ville) {
            this.ville = ville;
        }

        public String getPays() {
            return pays;
        }

        public void setPays(String pays) {
            this.pays = pays;
        }

        public LocalDate getDateDebut() {
            return dateDebut;
        }

        public void setDateDebut(LocalDate dateDebut) {
            this.dateDebut = dateDebut;
        }

        public LocalDate getDateFin() {
            return dateFin;
        }

        public void setDateFin(LocalDate dateFin) {
            this.dateFin = dateFin;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }
    }
}