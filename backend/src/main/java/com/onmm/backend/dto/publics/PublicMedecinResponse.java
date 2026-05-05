package com.onmm.backend.dto.publics;

import com.onmm.backend.entity.Specialite;
import lombok.Data;

import java.util.List;

@Data
public class PublicMedecinResponse {

    private Long id;
    private String nom;
    private String prenom;
    private String numeroInscription;
    private String villeExercice;
    private String structureExercice;
    private String photoProfilPath;

    private List<PublicEducationDto> educations;

}