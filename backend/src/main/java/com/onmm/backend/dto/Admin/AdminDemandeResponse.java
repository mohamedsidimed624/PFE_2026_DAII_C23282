package com.onmm.backend.dto.Admin;

import com.onmm.backend.dto.DemandeDocumentResponse;
import com.onmm.backend.dto.DemandeEducationResponse;
import com.onmm.backend.dto.DemandeExperienceResponse;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class AdminDemandeResponse {

    private Long id;

    private String nom;

    private String prenom;

    private String email;

    private String statut;

    private LocalDateTime submissionDate;

    private List<DemandeEducationResponse> educations;

    private List<DemandeExperienceResponse> experiences;

    private List<DemandeDocumentResponse> documents;
}
