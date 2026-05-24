package com.onmm.backend.dto.medecin;

import lombok.Data;

import java.util.List;

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
    private String photoProfilPath;
    private String sectionOrdre;
    private String villeExercice;
    private String wilayaExercice;

    private List<MedecinEducationDto> educations;

}
