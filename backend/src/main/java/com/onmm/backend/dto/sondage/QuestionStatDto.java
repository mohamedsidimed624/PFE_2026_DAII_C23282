package com.onmm.backend.dto.sondage;

import com.onmm.backend.entity.enums.TypeQuestion;

import java.util.Map;

public class QuestionStatDto {

    private Integer questionOrdre;
    private String titre;
    private TypeQuestion typeQuestion;
    private long totalReponses;
    private Map<String, Long> repartition;
    private Double moyenne;

    public Integer getQuestionOrdre() { return questionOrdre; }
    public void setQuestionOrdre(Integer questionOrdre) { this.questionOrdre = questionOrdre; }

    public String getTitre() { return titre; }
    public void setTitre(String titre) { this.titre = titre; }

    public TypeQuestion getTypeQuestion() { return typeQuestion; }
    public void setTypeQuestion(TypeQuestion typeQuestion) { this.typeQuestion = typeQuestion; }

    public long getTotalReponses() { return totalReponses; }
    public void setTotalReponses(long totalReponses) { this.totalReponses = totalReponses; }

    public Map<String, Long> getRepartition() { return repartition; }
    public void setRepartition(Map<String, Long> repartition) { this.repartition = repartition; }

    public Double getMoyenne() { return moyenne; }
    public void setMoyenne(Double moyenne) { this.moyenne = moyenne; }
}
