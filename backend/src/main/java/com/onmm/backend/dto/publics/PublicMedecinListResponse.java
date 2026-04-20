package com.onmm.backend.dto.publics;

import lombok.Data;

@Data
public class PublicMedecinListResponse {

    private Long id;
    private String nom;
    private String prenom;
    private String specialiteLibelle;
    private String numeroInscription;
    private String ville;
    private String photoProfilPath;
}