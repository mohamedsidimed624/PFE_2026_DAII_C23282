package com.onmm.backend.dto.sondage;

public class ReponseItemRequest {

    private Integer questionOrdre;
    private String valeur;

    public Integer getQuestionOrdre() { return questionOrdre; }
    public void setQuestionOrdre(Integer questionOrdre) { this.questionOrdre = questionOrdre; }

    public String getValeur() { return valeur; }
    public void setValeur(String valeur) { this.valeur = valeur; }
}
