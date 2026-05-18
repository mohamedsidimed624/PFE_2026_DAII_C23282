package com.onmm.backend.dto.sondage;

import com.onmm.backend.entity.enums.TypeQuestion;

import java.util.List;

public class QuestionDto {

    private Integer ordre;
    private TypeQuestion typeQuestion;
    private String titre;
    private String description;
    private boolean obligatoire;
    private Integer echelleMin;
    private Integer echelleMax;
    private List<String> choix;

    public Integer getOrdre() { return ordre; }
    public void setOrdre(Integer ordre) { this.ordre = ordre; }

    public TypeQuestion getTypeQuestion() { return typeQuestion; }
    public void setTypeQuestion(TypeQuestion typeQuestion) { this.typeQuestion = typeQuestion; }

    public String getTitre() { return titre; }
    public void setTitre(String titre) { this.titre = titre; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public boolean isObligatoire() { return obligatoire; }
    public void setObligatoire(boolean obligatoire) { this.obligatoire = obligatoire; }

    public Integer getEchelleMin() { return echelleMin; }
    public void setEchelleMin(Integer echelleMin) { this.echelleMin = echelleMin; }

    public Integer getEchelleMax() { return echelleMax; }
    public void setEchelleMax(Integer echelleMax) { this.echelleMax = echelleMax; }

    public List<String> getChoix() { return choix; }
    public void setChoix(List<String> choix) { this.choix = choix; }
}
