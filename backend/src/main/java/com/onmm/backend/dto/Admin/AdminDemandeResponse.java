package com.onmm.backend.dto.Admin;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AdminDemandeResponse {

    private Long id;

    private String nom;

    private String prenom;

    private String email;

    private String statut;

    private LocalDateTime submissionDate;
}
