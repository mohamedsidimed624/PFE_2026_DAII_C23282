package com.onmm.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "demande_education")
public class DemandeEducation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "specialite_id")
    private Specialite specialite;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sous_specialite_id")
    private SousSpecialite sousSpecialite;

    @Column(nullable = false, length = 150)
    private String diplome;

    @Column(name = "annee_obtention", nullable = false)
    private Integer anneeObtention;

    @Column(nullable = false, length = 100)
    private String pays;

    @Column(nullable = false, length = 100)
    private String ville;

    @Column(nullable = false, length = 150)
    private String universite;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "demande_id", nullable = false)
    private DemandeAdhesion demandeAdhesion;

    public DemandeEducation() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Specialite getSpecialite() {
        return specialite;
    }

    public void setSpecialite(Specialite specialite) {
        this.specialite = specialite;
    }

    public SousSpecialite getSousSpecialite() {
        return sousSpecialite;
    }

    public void setSousSpecialite(SousSpecialite sousSpecialite) {
        this.sousSpecialite = sousSpecialite;
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

    public DemandeAdhesion getDemandeAdhesion() {
        return demandeAdhesion;
    }

    public void setDemandeAdhesion(DemandeAdhesion demandeAdhesion) {
        this.demandeAdhesion = demandeAdhesion;
    }


}