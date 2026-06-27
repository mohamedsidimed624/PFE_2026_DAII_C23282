package com.onmm.backend.dto;

import java.time.LocalDate;

public class DemandeExperienceResponse {

    private Long id;

    private String poste;

    private String nomEtablissement;

    private String pays;

    private String ville;

    private LocalDate dateDebut;

    private LocalDate dateFin;

    private String description;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getPoste() { return poste; }
    public void setPoste(String poste) { this.poste = poste; }

    public String getNomEtablissement() { return nomEtablissement; }
    public void setNomEtablissement(String nomEtablissement) { this.nomEtablissement = nomEtablissement; }

    public String getPays() { return pays; }
    public void setPays(String pays) { this.pays = pays; }

    public String getVille() { return ville; }
    public void setVille(String ville) { this.ville = ville; }

    public LocalDate getDateDebut() { return dateDebut; }
    public void setDateDebut(LocalDate dateDebut) { this.dateDebut = dateDebut; }

    public LocalDate getDateFin() { return dateFin; }
    public void setDateFin(LocalDate dateFin) { this.dateFin = dateFin; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
