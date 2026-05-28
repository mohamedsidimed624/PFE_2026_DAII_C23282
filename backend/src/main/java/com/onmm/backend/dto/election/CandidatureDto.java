package com.onmm.backend.dto.election;

import com.onmm.backend.entity.enums.CorpsElectoral;
import com.onmm.backend.entity.enums.ElectionStatut;
import com.onmm.backend.entity.enums.ElectionType;
import com.onmm.backend.entity.enums.StatutCandidature;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class CandidatureDto {
    private Long id;
    private Long electionId;
    private String electionTitre;
    private ElectionType electionType;
    private ElectionStatut electionStatut;
    private String electionRegion;
    private CorpsElectoral electionCorpsElectoral;
    private PositionElectoraleDto position;
    private Long medecinId;
    private String medecinNom;
    private String medecinPrenom;
    private String medecinPhotoUrl;
    private String photoCandidatureUrl;
    private String medecinNumeroInscription;
    private String specialite;
    private String region;
    private String declarationCandidature;
    private String programmeElectoral;
    private StatutCandidature statut;
    private String commentaireValidation;
    private LocalDateTime dateDepot;
    private LocalDateTime dateValidation;
    private long nbVotes;
    private boolean exAequo;
    private List<CandidatureDocumentDto> documents = new ArrayList<>();

    // Flags d'état calculés côté backend
    private boolean peutModifier;
    private boolean peutUploaderDocuments;
    private boolean peutFinaliser;
    private boolean peutRetirer;

    // Pour la page de vote : indique que c'est la propre candidature du votant
    private boolean estMaCandidature;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getElectionId() { return electionId; }
    public void setElectionId(Long electionId) { this.electionId = electionId; }

    public String getElectionTitre() { return electionTitre; }
    public void setElectionTitre(String electionTitre) { this.electionTitre = electionTitre; }

    public ElectionType getElectionType() { return electionType; }
    public void setElectionType(ElectionType electionType) { this.electionType = electionType; }

    public ElectionStatut getElectionStatut() { return electionStatut; }
    public void setElectionStatut(ElectionStatut electionStatut) { this.electionStatut = electionStatut; }

    public String getElectionRegion() { return electionRegion; }
    public void setElectionRegion(String electionRegion) { this.electionRegion = electionRegion; }

    public CorpsElectoral getElectionCorpsElectoral() { return electionCorpsElectoral; }
    public void setElectionCorpsElectoral(CorpsElectoral electionCorpsElectoral) { this.electionCorpsElectoral = electionCorpsElectoral; }

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

    public String getPhotoCandidatureUrl() { return photoCandidatureUrl; }
    public void setPhotoCandidatureUrl(String photoCandidatureUrl) { this.photoCandidatureUrl = photoCandidatureUrl; }

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

    public LocalDateTime getDateValidation() { return dateValidation; }
    public void setDateValidation(LocalDateTime dateValidation) { this.dateValidation = dateValidation; }

    public long getNbVotes() { return nbVotes; }
    public void setNbVotes(long nbVotes) { this.nbVotes = nbVotes; }

    public boolean isExAequo() { return exAequo; }
    public void setExAequo(boolean exAequo) { this.exAequo = exAequo; }

    public List<CandidatureDocumentDto> getDocuments() { return documents; }
    public void setDocuments(List<CandidatureDocumentDto> documents) { this.documents = documents; }

    public boolean isPeutModifier() { return peutModifier; }
    public void setPeutModifier(boolean peutModifier) { this.peutModifier = peutModifier; }

    public boolean isPeutUploaderDocuments() { return peutUploaderDocuments; }
    public void setPeutUploaderDocuments(boolean peutUploaderDocuments) { this.peutUploaderDocuments = peutUploaderDocuments; }

    public boolean isPeutFinaliser() { return peutFinaliser; }
    public void setPeutFinaliser(boolean peutFinaliser) { this.peutFinaliser = peutFinaliser; }

    public boolean isPeutRetirer() { return peutRetirer; }
    public void setPeutRetirer(boolean peutRetirer) { this.peutRetirer = peutRetirer; }

    public boolean isEstMaCandidature() { return estMaCandidature; }
    public void setEstMaCandidature(boolean estMaCandidature) { this.estMaCandidature = estMaCandidature; }
}
