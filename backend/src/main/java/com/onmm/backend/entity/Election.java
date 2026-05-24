package com.onmm.backend.entity;

import com.onmm.backend.entity.enums.CorpsElectoral;
import com.onmm.backend.entity.enums.ElectionNiveau;
import com.onmm.backend.entity.enums.ElectionStatut;
import com.onmm.backend.entity.enums.ElectionType;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "elections")
public class Election {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String titre;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ElectionType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ElectionStatut statut = ElectionStatut.BROUILLON;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ElectionNiveau niveau;

    /**
     * Pour l’instant on garde String pour éviter de casser ton projet.
     * Mais professionnellement, il faudrait une enum Wilaya ou un champ wilayaExercice dans Medecin.
     */
    @Column(length = 100)
    private String region;

    @Column(nullable = false)
    private int seatsCount = 1;

    @Column(nullable = false)
    private int maxVotesParElecteur = 1;

    private LocalDateTime candidatureStartDate;
    private LocalDateTime candidatureEndDate;
    private LocalDateTime voteStartDate;
    private LocalDateTime voteEndDate;

    @Column(nullable = false, updatable = false)
    private LocalDateTime dateCreation = LocalDateTime.now();

    @Column(nullable = false)
    private boolean resultatsPublies = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "corps_electoral", nullable = false, length = 50)
    private CorpsElectoral corpsElectoral = CorpsElectoral.TOUS_MEDECINS_ACTIFS;

    @Column(name = "quorum_pourcentage")
    private Double quorumPourcentage;

    @Column(columnDefinition = "TEXT")
    private String raisonAnnulation;

    @Column(name = "preset_code", length = 50)
    private String presetCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cree_par_id")
    private Admin creePar;

    @OneToMany(mappedBy = "election", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Candidature> candidatures = new ArrayList<>();

    @OneToMany(mappedBy = "election", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("ordre ASC")
    private List<PositionElectorale> positions = new ArrayList<>();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitre() { return titre; }
    public void setTitre(String titre) { this.titre = titre; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public ElectionType getType() { return type; }
    public void setType(ElectionType type) { this.type = type; }

    public ElectionStatut getStatut() { return statut; }
    public void setStatut(ElectionStatut statut) { this.statut = statut; }

    public ElectionNiveau getNiveau() { return niveau; }
    public void setNiveau(ElectionNiveau niveau) { this.niveau = niveau; }

    public String getRegion() { return region; }
    public void setRegion(String region) { this.region = region; }

    public int getSeatsCount() { return seatsCount; }
    public void setSeatsCount(int seatsCount) { this.seatsCount = seatsCount; }

    public int getMaxVotesParElecteur() { return maxVotesParElecteur; }
    public void setMaxVotesParElecteur(int maxVotesParElecteur) { this.maxVotesParElecteur = maxVotesParElecteur; }

    public LocalDateTime getCandidatureStartDate() { return candidatureStartDate; }
    public void setCandidatureStartDate(LocalDateTime candidatureStartDate) { this.candidatureStartDate = candidatureStartDate; }

    public LocalDateTime getCandidatureEndDate() { return candidatureEndDate; }
    public void setCandidatureEndDate(LocalDateTime candidatureEndDate) { this.candidatureEndDate = candidatureEndDate; }

    public LocalDateTime getVoteStartDate() { return voteStartDate; }
    public void setVoteStartDate(LocalDateTime voteStartDate) { this.voteStartDate = voteStartDate; }

    public LocalDateTime getVoteEndDate() { return voteEndDate; }
    public void setVoteEndDate(LocalDateTime voteEndDate) { this.voteEndDate = voteEndDate; }

    public LocalDateTime getDateCreation() { return dateCreation; }
    public void setDateCreation(LocalDateTime dateCreation) { this.dateCreation = dateCreation; }

    public boolean isResultatsPublies() { return resultatsPublies; }
    public void setResultatsPublies(boolean resultatsPublies) { this.resultatsPublies = resultatsPublies; }

    public CorpsElectoral getCorpsElectoral() { return corpsElectoral; }
    public void setCorpsElectoral(CorpsElectoral corpsElectoral) { this.corpsElectoral = corpsElectoral; }

    public Double getQuorumPourcentage() { return quorumPourcentage; }
    public void setQuorumPourcentage(Double quorumPourcentage) { this.quorumPourcentage = quorumPourcentage; }

    public String getRaisonAnnulation() { return raisonAnnulation; }
    public void setRaisonAnnulation(String raisonAnnulation) { this.raisonAnnulation = raisonAnnulation; }

    public Admin getCreePar() { return creePar; }
    public void setCreePar(Admin creePar) { this.creePar = creePar; }

    public List<Candidature> getCandidatures() { return candidatures; }
    public void setCandidatures(List<Candidature> candidatures) { this.candidatures = candidatures; }

    public List<PositionElectorale> getPositions() { return positions; }
    public void setPositions(List<PositionElectorale> positions) { this.positions = positions; }

    public String getPresetCode() { return presetCode; }
    public void setPresetCode(String presetCode) { this.presetCode = presetCode; }
}