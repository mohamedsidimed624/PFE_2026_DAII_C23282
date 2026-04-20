package com.onmm.backend.dto.publics;

import com.onmm.backend.entity.Specialite;
import lombok.Data;

import java.util.List;

@Data
public class PublicMedecinDetailResponse {

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
    private String statut;
    private String sexe;
    private String adresse;
    private String nationalite;
    private List<PublicEducationDto> educations;
    private List<PublicExperienceDto> experiences;

    }