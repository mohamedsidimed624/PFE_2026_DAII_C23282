package com.onmm.backend.dto.reference;

public class ReferenceSousSpecialiteResponse {

    private Long id;

    private String code;

    private String libelle;

    private Long specialiteId;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getLibelle() { return libelle; }
    public void setLibelle(String libelle) { this.libelle = libelle; }

    public Long getSpecialiteId() { return specialiteId; }
    public void setSpecialiteId(Long specialiteId) { this.specialiteId = specialiteId; }
}
