package com.onmm.backend.dto.medecin;

import com.onmm.backend.entity.Specialite;
import lombok.Data;

@Data
public class MedecinProfileResponse {

    private Long id;
    private String nom;
    private String prenom;
    private String email;
    private String telephone;
    private String nni;
    private String sexe;
    private String nationalite;
    private String adresse;
    private String numeroInscription;
    private String statut;
    private Long specialiteId;
    private String specialiteLibelle;
    private Long sousSpecialiteId;
    private String sousSpecialiteLibelle;
    private String photoProfilPath;

}
