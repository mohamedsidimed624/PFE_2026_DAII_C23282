package com.onmm.backend.dto.Admin;

import com.onmm.backend.entity.Specialite;
import com.onmm.backend.entity.enums.StatutMedecin;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class AdminMedecinDetailResponse {

    private Long id;
    private String nom;
    private String prenom;
    private String email;
    private String telephone;
    private String nni;
    private String sexe;
    private String nationalite;
    private String wilayaExercice;
    private String numeroInscription;
    private StatutMedecin statut;
    private String adminComment;
    private Long specialiteId;
    private String specialiteLibelle;
    private Long sousSpecialiteId;
    private String sousSpecialiteLibelle;
    private String photoProfilPath;
    private LocalDate dateNaissance;

    private List<AdminMedecinEducationResponse> educations;
    private List<AdminMedecinExperienceResponse> experiences;
    private List<AdminMedecinDocumentResponse> documents;

}