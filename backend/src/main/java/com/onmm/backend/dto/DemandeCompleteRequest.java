package com.onmm.backend.dto;
import lombok.Data;
import java.util.List;

@Data
public class DemandeCompleteRequest {

    private DemandeAdhesionRequest personal;

    private List<DemandeEducationRequest> education;

    private List<DemandeExperienceRequest> experience;

    private DemandeDocumentRequest documents;

}