package com.onmm.backend.dto.reclamation;

public class CreateMedecinReclamationRequest {

    private String objet;
    private String message;

    public String getObjet() {
        return objet;
    }

    public void setObjet(String objet) {
        this.objet = objet;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}