package com.onmm.backend.entity;

import com.onmm.backend.entity.enums.StatutParticipation;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Entity
@Table(
        name = "sondage_participations",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_participation_sondage_repondant",
                        columnNames = {"sondage_id", "repondant_hash"}
                )
        }
)
public class Participation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sondage_id", nullable = false)
    private Sondage sondage;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medecin_id")
    private Medecin medecin;

    @Column(name = "repondant_hash", nullable = false, length = 128)
    private String repondantHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutParticipation statut = StatutParticipation.EN_COURS;

    @Column(nullable = false, updatable = false)
    private LocalDateTime dateDebut = LocalDateTime.now();

    private LocalDateTime dateSoumission;

    @OneToMany(mappedBy = "participation", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Reponse> reponses = new ArrayList<>();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Sondage getSondage() { return sondage; }
    public void setSondage(Sondage sondage) { this.sondage = sondage; }

    public Medecin getMedecin() { return medecin; }
    public void setMedecin(Medecin medecin) { this.medecin = medecin; }

    public String getRepondantHash() { return repondantHash; }
    public void setRepondantHash(String repondantHash) { this.repondantHash = repondantHash; }

    public StatutParticipation getStatut() { return statut; }
    public void setStatut(StatutParticipation statut) { this.statut = statut; }

    public LocalDateTime getDateDebut() { return dateDebut; }
    public void setDateDebut(LocalDateTime dateDebut) { this.dateDebut = dateDebut; }

    public LocalDateTime getDateSoumission() { return dateSoumission; }
    public void setDateSoumission(LocalDateTime dateSoumission) { this.dateSoumission = dateSoumission; }

    public List<Reponse> getReponses() { return reponses; }
    public void setReponses(List<Reponse> reponses) { this.reponses = reponses; }
}