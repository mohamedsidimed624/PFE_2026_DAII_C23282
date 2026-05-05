package com.onmm.backend.dto;

import lombok.Data;

@Data
public class SpecialiteResponse {

    private Long id;
    private String code;
    private String libelle;

    public SpecialiteResponse(Long id, String code, String libelle) {
        this.id = id;
        this.code = code;
        this.libelle = libelle;
    }
}