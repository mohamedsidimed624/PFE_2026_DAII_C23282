package com.onmm.backend.dto.reclamation;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class CreatePublicReclamationRequest {

    @NotBlank(message = "Le nom est obligatoire")
    @Size(max = 100, message = "Le nom ne peut pas dépasser 100 caractères")
    private String nom;

    @NotBlank(message = "Le prénom est obligatoire")
    @Size(max = 100, message = "Le prénom ne peut pas dépasser 100 caractères")
    private String prenom;

    private String ville;
    private String adresse;

    @NotBlank(message = "Le téléphone est obligatoire")
    @Pattern(regexp = "^[234]\\d{7}$", message = "Format de téléphone invalide (8 chiffres commençant par 2, 3 ou 4)")
    private String telephone;

    @NotBlank(message = "L'email est obligatoire")
    @Email(message = "Format d'email invalide")
    private String email;

    @NotBlank(message = "La catégorie est obligatoire")
    private String categorie;

    @NotBlank(message = "L'objet est obligatoire")
    @Size(max = 255, message = "L'objet ne peut pas dépasser 255 caractères")
    private String objet;

    @NotBlank(message = "Le message est obligatoire")
    @Size(max = 5000, message = "Le message ne peut pas dépasser 5000 caractères")
    private String message;

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }

    public String getPrenom() { return prenom; }
    public void setPrenom(String prenom) { this.prenom = prenom; }

    public String getVille() { return ville; }
    public void setVille(String ville) { this.ville = ville; }

    public String getAdresse() { return adresse; }
    public void setAdresse(String adresse) { this.adresse = adresse; }

    public String getTelephone() { return telephone; }
    public void setTelephone(String telephone) { this.telephone = telephone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getCategorie() { return categorie; }
    public void setCategorie(String categorie) { this.categorie = categorie; }

    public String getObjet() { return objet; }
    public void setObjet(String objet) { this.objet = objet; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
