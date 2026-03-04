package com.onmm.backend.entity;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "demande_education")
public class DemandeEducation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String specialite;

    @Column(nullable = false)
    private String sousSpecialite;

    @Column(nullable = false)
    private String diplome;

    @Column(nullable = false)
    private LocalDate anneeObtension;

    @Column(nullable = false)
    private String pays;

    @Column(nullable = false)
    private String ville;

    @Column(nullable = false)
    private String universite;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "demande_id", nullable = false)
    private DemandeAdhesion demandeAdhesion;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSpecialite() {
        return specialite;
    }

    public void setSpecialite(String specialite) {
        this.specialite = specialite;
    }

    public String getSousSpecialite() {
        return sousSpecialite;
    }

    public void setSousSpecialite(String sousSpecialite) {
        this.sousSpecialite = sousSpecialite;
    }

    public String getDiplome() {
        return diplome;
    }

    public void setDiplome(String diplome) {
        this.diplome = diplome;
    }

    public LocalDate getAnneeObtension() {
        return anneeObtension;
    }

    public void setAnneeObtension(LocalDate anneeObtension) {
        this.anneeObtension = anneeObtension;
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
