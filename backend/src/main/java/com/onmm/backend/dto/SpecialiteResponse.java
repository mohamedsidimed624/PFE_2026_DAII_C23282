package com.onmm.backend.dto;

public class SpecialiteResponse {

    private Long id;
    private String code;
    private String libelle;

    public SpecialiteResponse(Long id, String code, String libelle) {
        this.id = id;
        this.code = code;
        this.libelle = libelle;
    }

    public Long getId() {
        return id;
    }

    public String getCode() {
        return code;
    }

    public String getLibelle() {
        return libelle;
    }
}