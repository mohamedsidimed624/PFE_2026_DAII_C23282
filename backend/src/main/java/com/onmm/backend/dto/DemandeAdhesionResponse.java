package com.onmm.backend.dto;

import lombok.Data;

@Data
public class DemandeAdhesionResponse {

    private Long id;
    private String numeroDossier;
    private String statut;
    private String message;
}