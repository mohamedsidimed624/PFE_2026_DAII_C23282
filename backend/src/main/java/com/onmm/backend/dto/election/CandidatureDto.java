package com.onmm.backend.dto.election;

import com.onmm.backend.entity.enums.StatutCandidature;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class CandidatureDto {
    private Long id;
    private Long electionId;
    private String electionTitre;
    private PositionElectoraleDto position;
    private Long medecinId;
    private String medecinNom;
    private String medecinPrenom;
    private String medecinPhotoUrl;
    private String medecinNumeroInscription;
    private String specialite;
    private String region;
    private String declarationCandidature;
    private String programmeElectoral;
    private StatutCandidature statut;
    private String commentaireValidation;
    private LocalDateTime dateDepot;
    private long nbVotes;
    private boolean exAequo;
    private List<CandidatureDocumentDto> documents = new ArrayList<>();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getElectionId() { return electionId; }
    public void setElectionId(Long electionId) { this.electionId = electionId; }

    public String getElectionTitre() { return electionTitre; }
    public void setElectionTitre(String electionTitre) { this.electionTitre = electionTitre; }

    public PositionElectoraleDto getPosition() { return position; }
    public void setPosition(PositionElectoraleDto position) { this.position = position; }

    public Long getMedecinId() { return medecinId; }
    public void setMedecinId(Long medecinId) { this.medecinId = medecinId; }

    public String getMedecinNom() { return medecinNom; }
    public void setMedecinNom(String medecinNom) { this.medecinNom = medecinNom; }

    public String getMedecinPrenom() { return medecinPrenom; }
    public void setMedecinPrenom(String medecinPrenom) { this.medecinPrenom = medecinPrenom; }

    public String getMedecinPhotoUrl() { return medecinPhotoUrl; }
    public void setMedecinPhotoUrl(String medecinPhotoUrl) { this.medecinPhotoUrl = medecinPhotoUrl; }

    public String getMedecinNumeroInscription() { return medecinNumeroInscription; }
    public void setMedecinNumeroInscription(String medecinNumeroInscription) { this.medecinNumeroInscription = medecinNumeroInscription; }

    public String getSpecialite() { return specialite; }
    public void setSpecialite(String specialite) { this.specialite = specialite; }

    public String getRegion() { return region; }
    public void setRegion(String region) { this.region = region; }

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

    public long getNbVotes() { return nbVotes; }
    public void setNbVotes(long nbVotes) { this.nbVotes = nbVotes; }

    public boolean isExAequo() { return exAequo; }
    public void setExAequo(boolean exAequo) { this.exAequo = exAequo; }

    public List<CandidatureDocumentDto> getDocuments() { return documents; }
    public void setDocuments(List<CandidatureDocumentDto> documents) { this.documents = documents; }
}
