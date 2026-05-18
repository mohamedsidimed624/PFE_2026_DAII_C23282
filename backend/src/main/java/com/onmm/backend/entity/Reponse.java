package com.onmm.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(
        name = "sondage_reponses",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_reponse_participation_question",
                columnNames = {"participation_id", "question_ordre"}
        )
)
public class Reponse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "participation_id", nullable = false)
    private Participation participation;

    @Column(name = "question_ordre", nullable = false)
    private Integer questionOrdre;


    @Column(columnDefinition = "TEXT")
    private String valeur;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Participation getParticipation() { return participation; }
    public void setParticipation(Participation participation) { this.participation = participation; }

    public Integer getQuestionOrdre() { return questionOrdre; }
    public void setQuestionOrdre(Integer questionOrdre) { this.questionOrdre = questionOrdre; }

    public String getValeur() { return valeur; }
    public void setValeur(String valeur) { this.valeur = valeur; }
}
