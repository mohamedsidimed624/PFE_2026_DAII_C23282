package com.onmm.backend.dto.election;

public class CandidatureCreateRequest {

    private Long positionId;
    private String declarationCandidature;
    private String programmeElectoral;
    private boolean soumettre = true;

    public Long getPositionId() {
        return positionId;
    }

    public void setPositionId(Long positionId) {
        this.positionId = positionId;
    }

    public String getDeclarationCandidature() {
        return declarationCandidature;
    }

    public void setDeclarationCandidature(String declarationCandidature) {
        this.declarationCandidature = declarationCandidature;
    }

    public String getProgrammeElectoral() {
        return programmeElectoral;
    }

    public void setProgrammeElectoral(String programmeElectoral) {
        this.programmeElectoral = programmeElectoral;
    }

    public boolean isSoumettre() {
        return soumettre;
    }

    public void setSoumettre(boolean soumettre) {
        this.soumettre = soumettre;
    }
}