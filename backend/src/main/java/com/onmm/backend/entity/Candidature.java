package com.onmm.backend.entity;

import com.onmm.backend.entity.enums.StatutCandidature;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "candidatures_election",
       uniqueConstraints = @UniqueConstraint(columnNames = {"election_id", "medecin_id"}))
public class Candidature {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "election_id", nullable = false)
    private Election election;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medecin_id", nullable = false)
    private Medecin medecin;

    @Column(columnDefinition = "TEXT")
    private String declarationCandidature;

    @Column(columnDefinition = "TEXT")
    private String programmeElectoral;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutCandidature statut = StatutCandidature.SOUMISE;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "position_id")
    private PositionElectorale position;

    @Column(columnDefinition = "TEXT")
    private String commentaireValidation;

    @Column(nullable = false, updatable = false)
    private LocalDateTime dateDepot = LocalDateTime.now();

    private LocalDateTime dateValidation;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Election getElection() { return election; }
    public void setElection(Election election) { this.election = election; }

    public Medecin getMedecin() { return medecin; }
    public void setMedecin(Medecin medecin) { this.medecin = medecin; }

    public String getDeclarationCandidature() { return declarationCandidature; }
    public void setDeclarationCandidature(String declarationCandidature) { this.declarationCandidature = declarationCandidature; }

    public String getProgrammeElectoral() { return programmeElectoral; }
    public void setProgrammeElectoral(String programmeElectoral) { this.programmeElectoral = programmeElectoral; }

    public StatutCandidature getStatut() { return statut; }
    public void setStatut(StatutCandidature statut) { this.statut = statut; }

    public String getCommentaireValidation() { return commentaireValidation; }
    public void setCommentaireValidation(String commentaireValidation) { this.commentaireValidation = commentaireValidation; }

    public LocalDateTime getDateDepot() { return dateDepot; }
    public void setDateDepot(LocalDateTime dateDepot) { this.dateDepot = dateDepot; }

    public LocalDateTime getDateValidation() { return dateValidation; }
    public void setDateValidation(LocalDateTime dateValidation) { this.dateValidation = dateValidation; }

    public PositionElectorale getPosition() { return position; }
    public void setPosition(PositionElectorale position) { this.position = position; }
}
