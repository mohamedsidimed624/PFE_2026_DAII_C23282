package com.onmm.backend.dto.reclamation;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CreateMedecinReclamationRequest {

    @NotBlank(message = "La catégorie est obligatoire")
    private String categorie;

    @NotBlank(message = "L'objet est obligatoire")
    @Size(max = 255, message = "L'objet ne peut pas dépasser 255 caractères")
    private String objet;

    @NotBlank(message = "Le message est obligatoire")
    @Size(max = 5000, message = "Le message ne peut pas dépasser 5000 caractères")
    private String message;

    public String getCategorie() { return categorie; }
    public void setCategorie(String categorie) { this.categorie = categorie; }

    public String getObjet() { return objet; }
    public void setObjet(String objet) { this.objet = objet; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
