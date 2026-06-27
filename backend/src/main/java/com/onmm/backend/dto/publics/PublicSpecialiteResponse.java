package com.onmm.backend.dto.publics;

public class PublicSpecialiteResponse {
    Long id;
    String libelle;

    public PublicSpecialiteResponse() {
    }

    public PublicSpecialiteResponse(Long id, String libelle) {
        this.id = id;
        this.libelle = libelle;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getLibelle() { return libelle; }
    public void setLibelle(String libelle) { this.libelle = libelle; }
}
