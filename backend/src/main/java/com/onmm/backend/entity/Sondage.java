package com.onmm.backend.entity;

import com.onmm.backend.entity.enums.SondageStatut;
import com.onmm.backend.entity.enums.SondageType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "sondages")
@Getter
@Setter
public class Sondage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String titre;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SondageType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SondageStatut statut = SondageStatut.BROUILLON;

    @Column(nullable = false)
    private boolean anonyme = true;

    private LocalDateTime dateDebut;
    private LocalDateTime dateFin;

    @Column(nullable = false, updatable = false)
    private LocalDateTime dateCreation = LocalDateTime.now();

    private LocalDateTime datePublication;

    @Column(columnDefinition = "TEXT")
    private String commentaireValidation;

    // JSON array of question objects
    @Column(columnDefinition = "TEXT")
    private String questionsJson;

    // Audience filters (null = tous)
    private String filtreSpecialite;
    private String filtreWilaya;
    private String filtreStatut;
    private String filtreGenre;

    @Column(nullable = false)
    private boolean resultatsPublies = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cree_par_id")
    private Admin creePar;

    @OneToMany(mappedBy = "sondage", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Participation> participations = new ArrayList<>();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitre() { return titre; }
    public void setTitre(String titre) { this.titre = titre; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public SondageType getType() { return type; }
    public void setType(SondageType type) { this.type = type; }

    public SondageStatut getStatut() { return statut; }
    public void setStatut(SondageStatut statut) { this.statut = statut; }

    public boolean isAnonyme() { return anonyme; }
    public void setAnonyme(boolean anonyme) { this.anonyme = anonyme; }

    public LocalDateTime getDateDebut() { return dateDebut; }
    public void setDateDebut(LocalDateTime dateDebut) { this.dateDebut = dateDebut; }

    public LocalDateTime getDateFin() { return dateFin; }
    public void setDateFin(LocalDateTime dateFin) { this.dateFin = dateFin; }

    public LocalDateTime getDateCreation() { return dateCreation; }
    public void setDateCreation(LocalDateTime dateCreation) { this.dateCreation = dateCreation; }

    public LocalDateTime getDatePublication() { return datePublication; }
    public void setDatePublication(LocalDateTime datePublication) { this.datePublication = datePublication; }

    public String getCommentaireValidation() { return commentaireValidation; }
    public void setCommentaireValidation(String commentaireValidation) { this.commentaireValidation = commentaireValidation; }

    public String getQuestionsJson() { return questionsJson; }
    public void setQuestionsJson(String questionsJson) { this.questionsJson = questionsJson; }

    public String getFiltreSpecialite() { return filtreSpecialite; }
    public void setFiltreSpecialite(String filtreSpecialite) { this.filtreSpecialite = filtreSpecialite; }

    public String getFiltreWilaya() { return filtreWilaya; }
    public void setFiltreWilaya(String filtreWilaya) { this.filtreWilaya = filtreWilaya; }

    public String getFiltreStatut() { return filtreStatut; }
    public void setFiltreStatut(String filtreStatut) { this.filtreStatut = filtreStatut; }

    public String getFiltreGenre() { return filtreGenre; }
    public void setFiltreGenre(String filtreGenre) { this.filtreGenre = filtreGenre; }

    public boolean isResultatsPublies() { return resultatsPublies; }
    public void setResultatsPublies(boolean resultatsPublies) { this.resultatsPublies = resultatsPublies; }

    public Admin getCreePar() { return creePar; }
    public void setCreePar(Admin creePar) { this.creePar = creePar; }

    public List<Participation> getParticipations() { return participations; }
    public void setParticipations(List<Participation> participations) { this.participations = participations; }
}
