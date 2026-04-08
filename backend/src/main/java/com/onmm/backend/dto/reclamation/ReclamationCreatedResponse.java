package com.onmm.backend.dto.reclamation;

public class ReclamationCreatedResponse {

    private Long id;
    private String numeroReclamation;
    private String statut;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNumeroReclamation() {
        return numeroReclamation;
    }

    public void setNumeroReclamation(String numeroReclamation) {
        this.numeroReclamation = numeroReclamation;
    }

    public String getStatut() {
        return statut;
    }

    public void setStatut(String statut) {
        this.statut = statut;
    }
}