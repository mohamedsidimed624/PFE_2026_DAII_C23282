package com.onmm.backend.dto.Admin;

import com.onmm.backend.entity.Specialite;
import com.onmm.backend.entity.enums.StatutMedecin;
import lombok.Data;

import java.time.LocalDate;

@Data
public class AdminMedecinListResponse {

    private Long id;
    private String numeroInscription;
    private String nom;
    private String prenom;
    private String email;
    private String telephone;
    private Long specialiteId;
    private String specialiteLibelle;
    private Long sousSpecialiteId;
    private String sousSpecialiteLibelle;
    private StatutMedecin statut;
    private LocalDate dateNaissance;
    private String sexe;
    private String nni;
    private String adresse;

}
