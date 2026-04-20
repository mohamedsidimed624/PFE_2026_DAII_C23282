package com.onmm.backend.dto.publics;

import com.onmm.backend.entity.Specialite;
import lombok.Data;

@Data
public class PublicMedecinResponse {

    private Long id;
    private String nom;
    private String prenom;
    private Long specialiteId;
    private String specialiteLibelle;
    private Long sousSpecialiteId;
    private String sousSpecialiteLibelle;
    private String numeroInscription;
    private String ville;
    private String photoProfilPath;

}