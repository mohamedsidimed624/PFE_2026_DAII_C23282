package com.onmm.backend.dto.publics;

import lombok.Data;

@Data
public class PublicMedecinSearchRequest {

    private String nom;
    private String prenom;
    private String numeroInscription;
    private String specialite;
    private String wilaya;
}
