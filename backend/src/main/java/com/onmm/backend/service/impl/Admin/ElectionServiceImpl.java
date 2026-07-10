package com.onmm.backend.service.impl.Admin;

import com.onmm.backend.dto.election.*;
import com.onmm.backend.entity.*;
import com.onmm.backend.entity.enums.*;
import com.onmm.backend.repository.*;
import com.onmm.backend.service.Admin.ElectionService;
import com.onmm.backend.service.NotificationService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class ElectionServiceImpl implements ElectionService {

    private final ElectionRepository electionRepo;
    private final CandidatureRepository candidatureRepo;
    private final VoteRepository voteRepo;
    private final AdminRepository adminRepo;
    private final MedecinRepository medecinRepo;
    private final NotificationService notificationService;
    private final PositionElectoraleRepository positionRepo;
    private final ElectionAuditLogRepository auditRepo;
    private final CandidatureDocumentRepository documentRepo;
    private final com.onmm.backend.service.FileStorageService fileStorageService;
    private final com.onmm.backend.service.election.crypto.BallotCryptoService ballotCryptoService;
    private final com.onmm.backend.service.election.key.KeyManagementService keyManagementService;
    private final com.onmm.backend.service.election.crypto.HashingService hashingService;
    private final com.onmm.backend.service.election.crypto.SignatureService signatureService;
    private final com.onmm.backend.service.election.ElectionAuditService electionAuditService;

    // Secret racine du module élections — validé au démarrage par KeyManagementService.
    @Value("${app.election.master-secret}")
    private String masterSecret;

    public ElectionServiceImpl(
            ElectionRepository electionRepo,
            CandidatureRepository candidatureRepo,
            VoteRepository voteRepo,
            AdminRepository adminRepo,
            MedecinRepository medecinRepo,
            NotificationService notificationService,
            PositionElectoraleRepository positionRepo,
            ElectionAuditLogRepository auditRepo,
            CandidatureDocumentRepository documentRepo,
            com.onmm.backend.service.FileStorageService fileStorageService,
            com.onmm.backend.service.election.crypto.BallotCryptoService ballotCryptoService,
            com.onmm.backend.service.election.key.KeyManagementService keyManagementService,
            com.onmm.backend.service.election.crypto.HashingService hashingService,
            com.onmm.backend.service.election.crypto.SignatureService signatureService,
            com.onmm.backend.service.election.ElectionAuditService electionAuditService
    ) {
        this.electionRepo = electionRepo;
        this.candidatureRepo = candidatureRepo;
        this.voteRepo = voteRepo;
        this.adminRepo = adminRepo;
        this.medecinRepo = medecinRepo;
        this.notificationService = notificationService;
        this.positionRepo = positionRepo;
        this.auditRepo = auditRepo;
        this.documentRepo = documentRepo;
        this.fileStorageService = fileStorageService;
        this.ballotCryptoService = ballotCryptoService;
        this.keyManagementService = keyManagementService;
        this.hashingService = hashingService;
        this.signatureService = signatureService;
        this.electionAuditService = electionAuditService;
    }

    private static final List<ElectionStatut> STATUTS_INACTIFS =
            List.of(ElectionStatut.ARCHIVEE, ElectionStatut.ANNULEE);

    // ── Admin: list ──────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public Page<ElectionListDto> getAllElections(String statut, String type, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        ElectionStatut statutEnum = parseStatut(statut);
        ElectionType typeEnum = parseType(type);

        Page<Election> result;
        if (statutEnum != null && typeEnum != null) {
            result = electionRepo.findByStatutAndTypeOrderByDateCreationDesc(statutEnum, typeEnum, pageable);
        } else if (statutEnum != null) {
            result = electionRepo.findByStatutOrderByDateCreationDesc(statutEnum, pageable);
        } else if (typeEnum != null) {
            result = electionRepo.findByTypeOrderByDateCreationDesc(typeEnum, pageable);
        } else {
            result = electionRepo.findAllByOrderByDateCreationDesc(pageable);
        }
        return result.map(this::toListDto);
    }

    // ── Admin: detail ────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public ElectionDetailDto getElectionById(Long id) {
        return toDetailDto(findElection(id));
    }

    // ── Admin: create / update ───────────────────────────────────────────────

    @Override
    public ElectionDetailDto createElection(ElectionCreateRequest req, String adminEmail) {
        Admin admin = adminRepo.findByEmail(adminEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));

        validateDates(req);
        validateElectionConfig(req);

        Election e = new Election();
        applyRequest(e, req);
        e.setCreePar(admin);

        validateNoActiveElectionSameType(e);
        validateElectionDates(e);
        e = electionRepo.save(e);

        notificationService.createNotification(
                "ELECTION_CREEE",
                "Nouvelle élection créée",
                "L'élection \"" + e.getTitre() + "\" a été créée.",
                "/admin/processus/elections/" + e.getId(),
                false
        );

        audit(e, "ELECTION_CREEE", adminEmail, "ADMIN", "Élection créée: " + e.getTitre());

        return toDetailDto(e);
    }

    @Override
    public ElectionDetailDto updateElection(Long id, ElectionCreateRequest req) {
        Election e = findElection(id);

        if (e.getStatut() != ElectionStatut.BROUILLON) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Seul un brouillon peut être modifié");
        }

        validateDates(req);
        validateElectionConfig(req);
        applyRequest(e, req);

        return toDetailDto(electionRepo.save(e));
    }

    private void applyRequest(Election e, ElectionCreateRequest req) {
        e.setTitre(req.getTitre() != null ? req.getTitre().trim() : null);
        e.setDescription(req.getDescription());
        e.setType(req.getType());
        e.setNiveau(req.getNiveau());

        e.setRegion(req.getRegion() != null && !req.getRegion().isBlank()
                ? req.getRegion().trim()
                : null);

        e.setSeatsCount(req.getSeatsCount());
        e.setMaxVotesParElecteur(req.getMaxVotesParElecteur());

        e.setCandidatureStartDate(req.getCandidatureStartDate());
        e.setCandidatureEndDate(req.getCandidatureEndDate());
        e.setVoteStartDate(req.getVoteStartDate());
        e.setVoteEndDate(req.getVoteEndDate());

        e.setCorpsElectoral(req.getCorpsElectoral() != null
                ? req.getCorpsElectoral()
                : CorpsElectoral.TOUS_MEDECINS_ACTIFS);

        e.setQuorumPourcentage(req.getQuorumPourcentage());
        e.setPresetCode(req.getPresetCode());
    }

    private void validateDates(ElectionCreateRequest req) {
        if (req.getCandidatureStartDate() == null || req.getCandidatureEndDate() == null
                || req.getVoteStartDate() == null || req.getVoteEndDate() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Toutes les dates sont requises");
        }
        if (!req.getCandidatureStartDate().isAfter(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "La date de début des candidatures doit être dans le futur, pour laisser le temps de configurer les postes électoraux avant l'ouverture automatique.");
        }
        if (!req.getCandidatureEndDate().isAfter(req.getCandidatureStartDate())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "La date de fin des candidatures doit être après la date d'ouverture");
        }
        if (req.getVoteStartDate().isBefore(req.getCandidatureEndDate())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Le vote ne peut commencer avant la clôture des candidatures");
        }
        if (!req.getVoteEndDate().isAfter(req.getVoteStartDate())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "La date de fin du vote doit être après le début du vote");
        }
    }

    private void validateElectionConfig(ElectionCreateRequest req) {
        if (req.getTitre() == null || req.getTitre().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Le titre de l'élection est obligatoire");
        }

        if (req.getType() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Le type de l'élection est obligatoire");
        }

        if (req.getNiveau() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Le niveau de l'élection est obligatoire");
        }

        if (req.getSeatsCount() < 1) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Le nombre de sièges doit être au moins 1");
        }

        if (req.getMaxVotesParElecteur() < 1) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Le nombre de votes par électeur doit être au moins 1");
        }

        if (req.getMaxVotesParElecteur() > req.getSeatsCount()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Le nombre de votes par électeur ne peut pas dépasser le nombre de sièges"
            );
        }

        CorpsElectoral corps = req.getCorpsElectoral() != null
                ? req.getCorpsElectoral()
                : CorpsElectoral.TOUS_MEDECINS_ACTIFS;

        if (corps == CorpsElectoral.MEDECINS_REGION) {
            if (req.getRegion() == null || req.getRegion().isBlank()) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "La région est obligatoire pour une élection régionale"
                );
            }
        }

        if (req.getQuorumPourcentage() != null) {
            if (req.getQuorumPourcentage() < 0 || req.getQuorumPourcentage() > 100) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Le quorum doit être compris entre 0 et 100"
                );
            }
        }
    }

    private void validateNoActiveElectionSameType(Election election) {
        boolean conflit;
        if (election.getType() == ElectionType.REPRESENTANTS_REGIONAUX) {
            String region = election.getRegion();
            if (region == null || region.isBlank()) {
                return; // déjà rejeté par validateElectionConfig
            }
            conflit = electionRepo.existsByTypeAndRegionIgnoreCaseAndStatutNotIn(
                    ElectionType.REPRESENTANTS_REGIONAUX, region, STATUTS_INACTIFS);
        } else {
            conflit = electionRepo.existsByTypeAndStatutNotIn(election.getType(), STATUTS_INACTIFS);
        }
        if (conflit) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Une élection active du même type existe déjà. " +
                    "Veuillez l'archiver ou l'annuler avant d'en créer une nouvelle.");
        }
    }

    // ── Admin: positions électorales ─────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public List<PositionElectoraleDto> getPositions(Long electionId) {
        findElection(electionId);
        return positionRepo.findByElectionIdOrderByOrdreAsc(electionId).stream()
                .map(this::toPositionDto)
                .collect(Collectors.toList());
    }

    @Override
    public PositionElectoraleDto addPosition(Long electionId, PositionElectoraleRequest req) {
        Election e = findElection(electionId);
        if (e.getStatut() != ElectionStatut.BROUILLON) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Les postes ne peuvent être configurés que sur un brouillon");
        }
        if (req.getLibelle() == null || req.getLibelle().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Le libellé du poste est requis");
        }
        if (req.getNombreSieges() < 1) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Le nombre de sièges doit être au moins 1"
            );
        }

        if (req.getMaxVotesParElecteur() < 1) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Le nombre de votes par électeur doit être au moins 1"
            );
        }

        if (req.getMaxVotesParElecteur() > req.getNombreSieges()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Le nombre de votes par électeur ne peut pas dépasser le nombre de sièges"
            );
        }

        PositionElectorale pos = new PositionElectorale();
        pos.setElection(e);
        pos.setLibelle(req.getLibelle().trim());
        pos.setOrdre(req.getOrdre());
        pos.setNombreSieges(req.getNombreSieges());
        pos.setMaxVotesParElecteur(req.getMaxVotesParElecteur());
        pos.setActif(true);

        return toPositionDto(positionRepo.save(pos));
    }

    @Override
    public void deletePosition(Long electionId, Long positionId) {
        Election e = findElection(electionId);
        if (e.getStatut() != ElectionStatut.BROUILLON) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Les postes ne peuvent être supprimés que sur un brouillon");
        }
        PositionElectorale pos = positionRepo.findById(positionId)
                .filter(p -> p.getElection().getId().equals(electionId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Poste introuvable"));
        positionRepo.delete(pos);
    }

    // ── Admin: audit log ─────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public List<ElectionAuditLogDto> getAuditLog(Long electionId) {
        findElection(electionId);
        return auditRepo.findByElectionIdOrderByDateActionDesc(electionId).stream()
                .map(this::toAuditLogDto)
                .collect(Collectors.toList());
    }

    // ── Admin: lifecycle transitions ─────────────────────────────────────────

    @Override
    public void ouvrirCandidatures(Long id, String adminEmail) {
        Election e = findElection(id);

        requireStatut(e, ElectionStatut.BROUILLON);

        validateElectionBeforeOpeningCandidatures(e);

        LocalDateTime now = LocalDateTime.now();

//        if (e.getCandidatureStartDate() != null && now.isBefore(e.getCandidatureStartDate())) {
//            throw new ResponseStatusException(
//                    HttpStatus.BAD_REQUEST,
//                    "Les candidatures ne peuvent pas être ouvertes avant le " + e.getCandidatureStartDate()
//            );
//        }
//
//        if (e.getCandidatureEndDate() != null && !now.isBefore(e.getCandidatureEndDate())) {
//            throw new ResponseStatusException(
//                    HttpStatus.BAD_REQUEST,
//                    "Impossible d'ouvrir les candidatures : la date de fin est déjà dépassée"
//            );
//        }

        e.setStatut(ElectionStatut.CANDIDATURE_OUVERTE);
        electionRepo.save(e);

        auditAdmin(
                e,
                "CANDIDATURES_OUVERTES",
                adminEmail,
                "Ouverture officielle des candidatures",
                "CRITICAL",
                "Election",
                id
        );

        notifyMedecins(
                e,
                "CANDIDATURE_OUVERTE",
                "Candidatures ouvertes",
                "Les candidatures pour l'élection \"" + e.getTitre() + "\" sont ouvertes.",
                "/medecin/elections/" + e.getId()
        );
    }

    @Override
    public void cloturerCandidatures(Long id, String adminEmail) {
        Election e = findElection(id);
        requireStatut(e, ElectionStatut.CANDIDATURE_OUVERTE);
        e.setStatut(ElectionStatut.VALIDATION_CANDIDATURES);
        electionRepo.save(e);
        auditAdmin(
                e,
                "CANDIDATURES_CLOTUREES",
                adminEmail,
                "Clôture officielle des candidatures",
                "CRITICAL",
                "Election",
                id
        );
    }

    @Override
    public void validerCandidature(Long electionId, Long candidatureId, String adminEmail) {
        Candidature c = findCandidature(electionId, candidatureId);

        if (c.getStatut() != StatutCandidature.SOUMISE
                && c.getStatut() != StatutCandidature.EN_REVUE) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Cette candidature ne peut plus être modifiée"
            );
        }

        validateCandidatureDocumentsBeforeValidation(c);

        c.setStatut(StatutCandidature.VALIDEE);
        c.setCommentaireValidation(null);
        c.setDateValidation(LocalDateTime.now());

        candidatureRepo.save(c);

        auditAdmin(
                c.getElection(),
                "CANDIDATURE_VALIDEE",
                adminEmail,
                "Candidature #" + c.getId()
                        + " validée pour Dr. "
                        + c.getMedecin().getPrenom()
                        + " "
                        + c.getMedecin().getNom(),
                "CRITICAL",
                "Candidature",
                c.getId()
        );

        notificationService.createMedecinNotification(
                c.getMedecin().getEmail(),
                "CANDIDATURE_VALIDEE",
                "Candidature validée",
                "Votre candidature pour l'élection \"" + c.getElection().getTitre() + "\" a été validée.",
                "/medecin/candidatures",
                false
        );
    }

    @Override
    public void ouvrirVotes(Long id, String adminEmail) {
        Election e = findElection(id);

        requireStatut(e, ElectionStatut.VALIDATION_CANDIDATURES);

        validateElectionBeforeOpeningVote(e);

        e.setStatut(ElectionStatut.VOTE_EN_COURS);
        electionRepo.save(e);

        // Génère la paire RSA-2048 de cette élection (clé privée inaccessible avant clôture)
        keyManagementService.generateElectionKeyPair(id);

        auditAdmin(
                e,
                "VOTE_OUVERT",
                adminEmail,
                "Vote ouvert officiellement",
                "CRITICAL",
                "Election",
                id
        );

        notifyMedecins(
                e,
                "VOTE_OUVERT",
                "Vote ouvert",
                "Le vote pour l'élection \"" + e.getTitre() + "\" est maintenant ouvert.",
                "/medecin/elections/" + e.getId() + "/voter"
        );
    }

    @Override
    public void cloturerVotes(Long id, String adminEmail) {
        Election e = findElection(id);
        requireStatut(e, ElectionStatut.VOTE_EN_COURS);
        e.setStatut(ElectionStatut.DEPOUILLEMENT);
        electionRepo.save(e);

        // Chaque bulletin est déjà signé (Ed25519) depuis sa soumission — rien à faire ici.
        // La clé privée RSA de l'élection devient accessible (statut != VOTE_EN_COURS).
        auditAdmin(
                e,
                "VOTE_CLOTURE",
                adminEmail,
                "Clôture officielle du vote.",
                "CRITICAL",
                "Election",
                id
        );
    }

    @Override
    public void publierResultats(Long id, String adminEmail) {
        Election e = findElection(id);

        requireStatut(e, ElectionStatut.DEPOUILLEMENT);

        ResultatElectionDto resultats = getResultats(id);

        if (!resultats.isResultatsValidables()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    resultats.getMessageResultat()
            );
        }

        e.setStatut(ElectionStatut.RESULTATS_PUBLIES);
        e.setResultatsPublies(true);

        electionRepo.save(e);

        auditAdmin(
                e,
                "RESULTATS_PUBLIES",
                adminEmail,
                "Résultats publiés officiellement. Taux de participation : "
                        + resultats.getTauxParticipation()
                        + "%. Quorum atteint : "
                        + resultats.isQuorumAtteint(),
                "CRITICAL",
                "Election",
                id
        );

        notifyMedecins(
                e,
                "RESULTATS_PUBLIES",
                "Résultats publiés",
                "Les résultats de l'élection \"" + e.getTitre() + "\" sont disponibles.",
                "/medecin/elections/" + e.getId()
        );
    }

    @Override
    public void archiver(Long id, String adminEmail) {
        Election e = findElection(id);
        requireStatut(e, ElectionStatut.RESULTATS_PUBLIES);
        e.setStatut(ElectionStatut.ARCHIVEE);
        electionRepo.save(e);
        auditAdmin(
                e,
                "ELECTION_ARCHIVEE",
                adminEmail,
                "Élection archivée",
                "INFO",
                "Election",
                id
        );
    }

    @Override
    public void annuler(Long id, String raison, String adminEmail) {
        Election e = findElection(id);
        if (e.getStatut() == ElectionStatut.ARCHIVEE || e.getStatut() == ElectionStatut.ANNULEE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cette élection ne peut pas être annulée");
        }
        e.setStatut(ElectionStatut.ANNULEE);
        e.setRaisonAnnulation(raison);
        electionRepo.save(e);
        auditAdmin(
                e,
                "ELECTION_ANNULEE",
                adminEmail,
                raison,
                "CRITICAL",
                "Election",
                id
        );
    }

    // ── Admin: résultats ─────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public ResultatElectionDto getResultats(Long id) {
        Election e = findElection(id);

        long nbVotants = voteRepo.countDistinctVotersByElectionId(id);
        long nbElecteursEligibles = countElecteursEligibles(e);

        double tauxParticipation = nbElecteursEligibles > 0
                ? (nbVotants * 100.0 / nbElecteursEligibles)
                : 0;

        boolean quorumAtteint = e.getQuorumPourcentage() == null
                || tauxParticipation >= e.getQuorumPourcentage();

        boolean showVotes = isResultsVisibleAdmin(e);

        ResultatElectionDto dto = new ResultatElectionDto();
        dto.setElectionId(id);
        dto.setTitre(e.getTitre());
        dto.setNbVotants(nbVotants);
        dto.setTauxParticipation(tauxParticipation);
        dto.setQuorumPourcentage(e.getQuorumPourcentage());
        dto.setQuorumAtteint(quorumAtteint);

        if (nbVotants == 0) {
            dto.setResultatsValidables(false);
            dto.setMessageResultat("Aucun vote enregistré. Aucun gagnant ne peut être proclamé.");
        } else if (!quorumAtteint) {
            dto.setResultatsValidables(false);
            dto.setMessageResultat("Le quorum n'est pas atteint. Les résultats ne peuvent pas être proclamés officiellement.");
        } else {
            dto.setResultatsValidables(true);
            dto.setMessageResultat("Les résultats peuvent être proclamés.");
        }

        List<PositionElectorale> positions = positionRepo
                .findByElectionIdOrderByOrdreAsc(id)
                .stream()
                .filter(PositionElectorale::isActif)
                .collect(Collectors.toList());

        if (positions.isEmpty()) {
            buildResultatsSansPostes(e, dto, showVotes, quorumAtteint, nbVotants);
        } else {
            buildResultatsAvecPostes(e, dto, positions, showVotes, quorumAtteint, nbVotants);
        }

        return dto;
    }

    // ── Admin: all candidatures ──────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public Page<CandidatureDto> getAllCandidatures(String statut, Long positionId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        StatutCandidature statutEnum = parseStatutCandidature(statut);

        Page<Candidature> result;
        if (statutEnum != null && positionId != null) {
            result = candidatureRepo.findByStatutAndPosition_IdOrderByDateDepotDesc(statutEnum, positionId, pageable);
        } else if (statutEnum != null) {
            result = candidatureRepo.findByStatutOrderByDateDepotDesc(statutEnum, pageable);
        } else if (positionId != null) {
            result = candidatureRepo.findByPosition_IdOrderByDateDepotDesc(positionId, pageable);
        } else {
            result = candidatureRepo.findAllByOrderByDateDepotDesc(pageable);
        }
        return result.map(c -> toCandidatureDto(c, isResultsVisibleAdmin(c.getElection())));
    }

    // ── Médecin: list ────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public Page<MedecinElectionDto> getElectionsForMedecin(String email, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Medecin medecin = findMedecin(email);

        List<Election> filtered = electionRepo.findAll().stream()
                .filter(e -> isMedecinConcerneParElection(e, medecin))
                .sorted(Comparator.comparing(Election::getDateCreation).reversed())
                .collect(Collectors.toList());

        int start = Math.min((int) pageable.getOffset(), filtered.size());
        int end = Math.min(start + pageable.getPageSize(), filtered.size());

        List<MedecinElectionDto> content = filtered.subList(start, end).stream()
                .map(e -> toMedecinDto(e, medecin, buildHashBase(medecin)))
                .collect(Collectors.toList());

        return new org.springframework.data.domain.PageImpl<>(
                content,
                pageable,
                filtered.size()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public MedecinElectionDto getElectionDetailForMedecin(Long id, String email) {
        Election e = findElection(id);
        Medecin medecin = findMedecin(email);

        if (!isMedecinConcerneParElection(e, medecin)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Vous n'êtes pas concerné par cette élection"
            );
        }

        return toMedecinDto(e, medecin, buildHashBase(medecin));
    }

    // ── Médecin: mes candidatures ────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public List<CandidatureDto> getMesCandidatures(String email) {
        return candidatureRepo.findByMedecinEmailOrderByDateDepotDesc(email).stream()
                .map(c -> toCandidatureDto(c, isResultsVisible(c.getElection())))
                .collect(Collectors.toList());
    }

    // ── Médecin: candidature ─────────────────────────────────────────────────

    @Override
    public CandidatureDto soumettreCandidature(Long electionId, CandidatureCreateRequest req, String email) {
        Election e = findElection(electionId);
        Medecin medecin = findMedecin(email);

        if (req == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Données de candidature manquantes");
        }

        if (e.getStatut() != ElectionStatut.CANDIDATURE_OUVERTE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Les candidatures ne sont pas ouvertes");
        }

        if (!isMedecinConcerneParElection(e, medecin)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Vous n'êtes pas concerné par cette élection"
            );
        }

        if (!isCandidatEligible(e, medecin)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Vous n'êtes pas éligible pour soumettre une candidature"
            );
        }

        if (req.isSoumettre()) {
            if (req.getDeclarationCandidature() == null || req.getDeclarationCandidature().isBlank()) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "La déclaration de candidature est obligatoire"
                );
            }
            if (req.getProgrammeElectoral() == null || req.getProgrammeElectoral().isBlank()) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Le programme électoral est obligatoire"
                );
            }
        }

        PositionElectorale position = resolveAndValidatePositionForCandidature(e, req);

        validateCandidatureEligibility(e, position, medecin);

        Optional<Candidature> existingOpt =
                candidatureRepo.findByElectionIdAndMedecinEmail(electionId, email);

        Candidature c;

        StatutCandidature statutCible = req.isSoumettre()
                ? StatutCandidature.SOUMISE
                : StatutCandidature.BROUILLON;

        if (existingOpt.isPresent()) {
            Candidature existing = existingOpt.get();

            if (existing.getStatut() == StatutCandidature.SOUMISE
                    || existing.getStatut() == StatutCandidature.EN_REVUE
                    || existing.getStatut() == StatutCandidature.VALIDEE) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Vous avez déjà une candidature active pour cette élection"
                );
            }

            c = existing;
            c.setPosition(position);
            if (req.getDeclarationCandidature() != null)
                c.setDeclarationCandidature(req.getDeclarationCandidature().trim());
            if (req.getProgrammeElectoral() != null)
                c.setProgrammeElectoral(req.getProgrammeElectoral().trim());
            c.setStatut(statutCible);

            if (existing.getStatut() == StatutCandidature.REJETEE
                    || existing.getStatut() == StatutCandidature.RETIREE) {
                c.setCommentaireValidation(null);
                c.setDateValidation(null);
            }
            c.setDateDepot(req.isSoumettre() ? LocalDateTime.now() : null);

        } else {
            c = new Candidature();
            c.setElection(e);
            c.setMedecin(medecin);
            c.setPosition(position);
            if (req.getDeclarationCandidature() != null)
                c.setDeclarationCandidature(req.getDeclarationCandidature().trim());
            if (req.getProgrammeElectoral() != null)
                c.setProgrammeElectoral(req.getProgrammeElectoral().trim());
            c.setStatut(statutCible);
            if (req.isSoumettre()) c.setDateDepot(LocalDateTime.now());
        }

        c = candidatureRepo.save(c);

        audit(
                e,
                existingOpt.isPresent() ? "CANDIDATURE_REDEPOSEE" : "CANDIDATURE_SOUMISE",
                email,
                "MEDECIN",
                position != null
                        ? "Candidature soumise au poste : " + position.getLibelle()
                        : "Candidature soumise",
                "INFO",
                "Candidature",
                c.getId()
        );

        return toCandidatureDto(c, false);
    }
    @Override
    public void rejeterCandidature(
            Long electionId,
            Long candidatureId,
            String commentaire,
            String adminEmail
    ) {
        Candidature c = findCandidature(electionId, candidatureId);

        if (c.getStatut() != StatutCandidature.SOUMISE
                && c.getStatut() != StatutCandidature.EN_REVUE) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Cette candidature ne peut plus être modifiée"
            );
        }

        if (commentaire == null || commentaire.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Le motif de rejet est obligatoire"
            );
        }

        c.setStatut(StatutCandidature.REJETEE);
        c.setCommentaireValidation(commentaire.trim());
        c.setDateValidation(LocalDateTime.now());

        candidatureRepo.save(c);

        auditAdmin(
                c.getElection(),
                "CANDIDATURE_REJETEE",
                adminEmail,
                "Candidature #" + c.getId()
                        + " rejetée. Motif : " + commentaire.trim(),
                "CRITICAL",
                "Candidature",
                c.getId()
        );

        notificationService.createMedecinNotification(
                c.getMedecin().getEmail(),
                "CANDIDATURE_REJETEE",
                "Candidature rejetée",
                "Votre candidature pour l'élection \"" + c.getElection().getTitre() + "\" a été rejetée. Motif : " + commentaire.trim(),
                "/medecin/candidatures",
                true
        );
    }

    @Override
    public void retirerCandidature(Long electionId, String email) {
        Election e = findElection(electionId);

        if (e.getStatut() != ElectionStatut.CANDIDATURE_OUVERTE) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Impossible de retirer une candidature à ce stade"
            );
        }

        Candidature c = candidatureRepo.findByElectionIdAndMedecinEmail(electionId, email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Candidature introuvable"
                ));

        if (c.getStatut() == StatutCandidature.VALIDEE) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Une candidature déjà validée ne peut pas être retirée directement"
            );
        }

        if (c.getStatut() == StatutCandidature.REJETEE) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Une candidature rejetée ne peut pas être retirée"
            );
        }

        c.setStatut(StatutCandidature.RETIREE);
        candidatureRepo.save(c);

        audit(e, "CANDIDATURE_RETIREE", email, "MEDECIN", null);
    }

    @Override
    public CandidatureDto finaliserCandidature(Long candidatureId, String email) {
        Candidature c = candidatureRepo.findById(candidatureId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Candidature introuvable"));

        if (!c.getMedecin().getEmail().equals(email))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Accès refusé");

        if (c.getStatut() != StatutCandidature.BROUILLON)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Seul un brouillon peut être soumis définitivement");

        Election e = c.getElection();
        if (e.getStatut() != ElectionStatut.CANDIDATURE_OUVERTE)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Les candidatures ne sont pas ouvertes pour cette élection");

        LocalDateTime now = LocalDateTime.now();
        if (e.getCandidatureEndDate() != null && now.isAfter(e.getCandidatureEndDate()))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "La période de candidature est clôturée");

        if (c.getDeclarationCandidature() == null || c.getDeclarationCandidature().isBlank())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "La déclaration de candidature est obligatoire avant la soumission");

        List<CandidatureDocument> docs = documentRepo.findByCandidatureId(candidatureId);
        Set<TypeDocumentCandidature> types = docs.stream()
                .map(CandidatureDocument::getTypeDocument)
                .collect(Collectors.toSet());

        if (!types.contains(TypeDocumentCandidature.PHOTO))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "La photo professionnelle est obligatoire");
        if (!types.contains(TypeDocumentCandidature.LETTRE_CANDIDATURE))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "La lettre de candidature est obligatoire");

        c.setStatut(StatutCandidature.SOUMISE);
        c.setDateDepot(now);
        candidatureRepo.save(c);

        audit(e, "CANDIDATURE_SOUMISE", email, "MEDECIN",
                c.getPosition() != null
                        ? "Candidature finalisée au poste : " + c.getPosition().getLibelle()
                        : "Candidature finalisée",
                "INFO", "Candidature", c.getId());

        return toCandidatureDto(c, false);
    }

    // ── Médecin: vote ────────────────────────────────────────────────────────

    @Override
    @Transactional
    public VoteReceiptDto voter(Long electionId, VoteRequest req, String email) {
        Election e = findElection(electionId);
        Medecin medecin = findMedecin(email);

        if (req == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Données de vote manquantes"
            );
        }

        if (e.getStatut() != ElectionStatut.VOTE_EN_COURS) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Le vote n'est pas ouvert"
            );
        }

        if (!isMedecinConcerneParElection(e, medecin)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Vous n'êtes pas concerné par cette élection"
            );
        }

        if (!isElecteurEligible(e, medecin)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Vous n'êtes pas éligible à voter dans cette élection"
            );
        }

        String voterToken = buildVoterToken(electionId, medecin);

        // Auto-vote check
        List<Long> allSelectedIds = new ArrayList<>();
        if (req.getCandidatureIds() != null) allSelectedIds.addAll(req.getCandidatureIds());
        if (req.getVotes() != null) {
            req.getVotes().forEach(pv -> {
                if (pv.getCandidatureIds() != null) allSelectedIds.addAll(pv.getCandidatureIds());
            });
        }
        if (!allSelectedIds.isEmpty()) {
            candidatureRepo.findByElectionIdAndMedecinEmail(electionId, email)
                    .ifPresent(maCand -> {
                        if (allSelectedIds.contains(maCand.getId())) {
                            throw new ResponseStatusException(
                                    HttpStatus.BAD_REQUEST,
                                    "Vous ne pouvez pas voter pour votre propre candidature."
                            );
                        }
                    });
        }

        // Section/région eligibility check — batch load instead of N findById() calls
        if (!allSelectedIds.isEmpty()) {
            Map<Long, Candidature> candidaturesParId = candidatureRepo.findAllById(allSelectedIds)
                    .stream().collect(Collectors.toMap(Candidature::getId, c -> c));
            for (Long cid : allSelectedIds) {
                Candidature cand = candidaturesParId.get(cid);
                if (cand != null && cand.getPosition() != null
                        && !isPositionEligiblePourMedecin(e, cand.getPosition(), medecin)) {
                    throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                            "Vous ne pouvez pas voter pour une candidature hors de votre section ou région.");
                }
            }
        }

        // Horodatage calculé une seule fois pour tout le lot, réutilisé sans recalcul pour le
        // hash ET la signature de chaque bulletin (un second appel à now() désynchroniserait les deux).
        LocalDateTime timestamp = LocalDateTime.now().truncatedTo(java.time.temporal.ChronoUnit.MICROS);

        List<Vote> votes = buildAndValidateVotes(e, req, voterToken, timestamp);

        if (votes.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Aucun vote valide fourni");
        }

        try {
            voteRepo.saveAllAndFlush(votes);
        } catch (org.springframework.dao.DataIntegrityViolationException ex) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Vous avez déjà voté pour l'un de ces postes.");
        }

        audit(
                e,
                "VOTE_ENREGISTRE",
                null,
                "SYSTEME",
                "Vote enregistré avec " + votes.size() + " bulletin(s)",
                "CRITICAL",
                "Election",
                electionId
        );

        return new VoteReceiptDto(timestamp, "Vote enregistré avec " + votes.size() + " bulletin(s).");
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private void validateElectionDates(Election election) {
        LocalDateTime now = LocalDateTime.now();

//        if (election.getCandidatureStartDate() == null ||
//                election.getCandidatureEndDate() == null ||
//                election.getVoteStartDate() == null ||
//                election.getVoteEndDate() == null) {
//            throw new IllegalArgumentException("Toutes les dates de l'élection sont obligatoires.");
//        }
//
//        if (election.getCandidatureStartDate().isBefore(now)) {
//            throw new IllegalArgumentException("L'ouverture des candidatures ne peut pas être dans le passé.");
//        }
//
//        if (!election.getCandidatureEndDate().isAfter(election.getCandidatureStartDate())) {
//            throw new IllegalArgumentException("La clôture des candidatures doit être après l'ouverture.");
//        }
//
//        if (!election.getVoteStartDate().isAfter(election.getCandidatureEndDate())) {
//            throw new IllegalArgumentException("L'ouverture du vote doit être après la clôture des candidatures.");
//        }
//
//        if (!election.getVoteEndDate().isAfter(election.getVoteStartDate())) {
//            throw new IllegalArgumentException("La clôture du vote doit être après son ouverture.");
//        }
//
//        if (Duration.between(
//                election.getCandidatureStartDate(),
//                election.getCandidatureEndDate()
//        ).toDays() < 3) {
//            throw new IllegalArgumentException("La période de candidatures doit durer au moins 3 jours.");
//        }
//
//        if (Duration.between(
//                election.getVoteStartDate(),
//                election.getVoteEndDate()
//        ).toDays() < 1) {
//            throw new IllegalArgumentException("La période de vote doit durer au moins 1 jour.");
//        }
    }

    private void audit(
            Election e,
            String action,
            String acteurEmail,
            String acteurRole,
            String details
    ) {
        audit(
                e,
                action,
                acteurEmail,
                acteurRole,
                details,
                "INFO",
                "Election",
                e.getId()
        );
    }

    private void auditAdmin(
            Election e,
            String action,
            String adminEmail,
            String details,
            String severity,
            String entityType,
            Long entityId
    ) {
        audit(
                e,
                action,
                adminEmail,
                "ADMIN",
                details,
                severity,
                entityType,
                entityId
        );
    }

    private void auditSystem(
            Election e,
            String action,
            String details,
            String severity
    ) {
        audit(
                e,
                action,
                "SYSTEME",
                "SYSTEME",
                details,
                severity,
                "Election",
                e.getId()
        );
    }

    private void buildResultatsSansPostes(
            Election e,
            ResultatElectionDto dto,
            boolean showVotes,
            boolean quorumAtteint,
            long nbVotants
    ) {
        Map<Long, Long> countMap = showVotes ? buildVoteCountMap(e.getId()) : Collections.emptyMap();
        List<CandidatureDto> candidats = candidatureRepo
                .findByElectionIdAndStatut(e.getId(), StatutCandidature.VALIDEE)
                .stream()
                .map(c -> {
                    CandidatureDto cDto = toCandidatureDto(c, false);
                    cDto.setNbVotes(showVotes ? countMap.getOrDefault(c.getId(), 0L) : 0L);
                    return cDto;
                })
                .sorted(this::compareCandidatsByVotesDesc)
                .collect(Collectors.toList());

        dto.setTousLesCandidats(candidats);
        dto.setResultatsParPosition(null);

        if (!quorumAtteint || nbVotants == 0) {
            dto.setGagnants(Collections.emptyList());
            return;
        }

        dto.setGagnants(determineGagnants(candidats, e.getSeatsCount()));
    }


    private void buildResultatsAvecPostes(
            Election e,
            ResultatElectionDto dto,
            List<PositionElectorale> positions,
            boolean showVotes,
            boolean quorumAtteint,
            long nbVotants
    ) {
        List<Candidature> candidaturesValidees = candidatureRepo
                .findByElectionIdAndStatut(e.getId(), StatutCandidature.VALIDEE);
        Map<Long, Long> countMap = showVotes ? buildVoteCountMap(e.getId()) : Collections.emptyMap();

        List<ResultatParPositionDto> resultatsParPosition = new ArrayList<>();
        List<CandidatureDto> tousLesGagnants = new ArrayList<>();

        for (PositionElectorale position : positions) {
            List<CandidatureDto> candidatsDuPoste = candidaturesValidees
                    .stream()
                    .filter(c -> c.getPosition() != null)
                    .filter(c -> c.getPosition().getId().equals(position.getId()))
                    .map(c -> {
                        CandidatureDto cDto = toCandidatureDto(c, false);
                        cDto.setNbVotes(showVotes ? countMap.getOrDefault(c.getId(), 0L) : 0L);
                        return cDto;
                    })
                    .sorted(this::compareCandidatsByVotesDesc)
                    .collect(Collectors.toList());

            List<CandidatureDto> gagnantsDuPoste;

            if (!quorumAtteint || nbVotants == 0) {
                gagnantsDuPoste = Collections.emptyList();
            } else {
                gagnantsDuPoste = determineGagnants(candidatsDuPoste, position.getNombreSieges());
                tousLesGagnants.addAll(gagnantsDuPoste);
            }

            ResultatParPositionDto r = new ResultatParPositionDto();
            r.setPosition(toPositionDto(position));
            r.setCandidats(candidatsDuPoste);
            r.setGagnants(gagnantsDuPoste);

            resultatsParPosition.add(r);
        }

        dto.setResultatsParPosition(resultatsParPosition);
        dto.setGagnants(tousLesGagnants);
        dto.setTousLesCandidats(null);
    }

    private void validateCandidatureDocumentsBeforeValidation(Candidature c) {
        List<CandidatureDocument> documents = documentRepo.findByCandidatureId(c.getId());

        Set<TypeDocumentCandidature> types = documents.stream()
                .map(CandidatureDocument::getTypeDocument)
                .collect(Collectors.toSet());

        if (!types.contains(TypeDocumentCandidature.PHOTO)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La photo du candidat est obligatoire"
            );
        }

        if (!types.contains(TypeDocumentCandidature.LETTRE_CANDIDATURE)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La lettre de candidature est obligatoire"
            );
        }

        if (c.getDeclarationCandidature() == null || c.getDeclarationCandidature().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La déclaration de candidature est obligatoire"
            );
        }
    }

    private void validateElectionBeforeOpeningVote(Election e) {
//        LocalDateTime now = LocalDateTime.now();
//
        if (e.getVoteStartDate() == null || e.getVoteEndDate() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Les dates de vote sont obligatoires"
            );
        }
//
//        if (now.isBefore(e.getVoteStartDate())) {
//            throw new ResponseStatusException(
//                    HttpStatus.BAD_REQUEST,
//                    "Le vote ne peut pas être ouvert avant le " + e.getVoteStartDate()
//            );
//        }
//
//        if (!now.isBefore(e.getVoteEndDate())) {
//            throw new ResponseStatusException(
//                    HttpStatus.BAD_REQUEST,
//                    "Impossible d'ouvrir le vote : la date de fin du vote est déjà dépassée"
//            );
//        }

        long candidaturesEnAttente = candidatureRepo
                .countByElectionIdAndStatutIn(e.getId(),
                        List.of(StatutCandidature.SOUMISE, StatutCandidature.EN_REVUE));

        if (candidaturesEnAttente > 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Toutes les candidatures doivent être validées ou rejetées avant l'ouverture du vote"
            );
        }

        List<PositionElectorale> positions = positionRepo
                .findByElectionIdOrderByOrdreAsc(e.getId())
                .stream()
                .filter(PositionElectorale::isActif)
                .collect(Collectors.toList());

        if (positions.isEmpty()) {
            validateElectionWithoutPositionsBeforeVote(e);
        } else {
            validateElectionWithPositionsBeforeVote(e, positions);
        }
    }

    private void validateElectionWithoutPositionsBeforeVote(Election e) {
        long nbValides = candidatureRepo.countByElectionIdAndStatut(
                e.getId(),
                StatutCandidature.VALIDEE
        );

        if (nbValides == 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Aucune candidature validée pour ouvrir le vote"
            );
        }

        if (e.getSeatsCount() < 1) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Le nombre de sièges doit être au moins 1"
            );
        }

        if (e.getMaxVotesParElecteur() < 1) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Le nombre de votes par électeur doit être au moins 1"
            );
        }

        if (e.getMaxVotesParElecteur() > e.getSeatsCount()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Le nombre de votes par électeur ne peut pas dépasser le nombre de sièges"
            );
        }
    }

    private void validateElectionWithPositionsBeforeVote(
            Election e,
            List<PositionElectorale> positions
    ) {
        List<Candidature> candidaturesValidees = candidatureRepo.findByElectionIdAndStatut(
                e.getId(),
                StatutCandidature.VALIDEE
        );

        if (candidaturesValidees.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Aucune candidature validée pour ouvrir le vote"
            );
        }

        long candidatsValidesSansPoste = candidaturesValidees
                .stream()
                .filter(c -> c.getPosition() == null)
                .count();

        if (candidatsValidesSansPoste > 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Certaines candidatures validées ne sont rattachées à aucun poste"
            );
        }

        Set<Long> positionIds = positions.stream()
                .map(PositionElectorale::getId)
                .collect(Collectors.toSet());

        for (Candidature c : candidaturesValidees) {
            if (!positionIds.contains(c.getPosition().getId())) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Une candidature validée est liée à un poste inactif ou invalide"
                );
            }
        }

//        for (PositionElectorale position : positions) {
//            validatePositionBeforeVote(e, position, candidaturesValidees);
//        }
    }

    private void validatePositionBeforeVote(
            Election e,
            PositionElectorale position,
            List<Candidature> candidaturesValidees
    ) {
        if (position.getLibelle() == null || position.getLibelle().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Un poste électoral possède un libellé vide"
            );
        }

        if (position.getNombreSieges() < 1) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Le poste \"" + position.getLibelle() + "\" doit avoir au moins un siège"
            );
        }

        if (position.getMaxVotesParElecteur() < 1) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Le poste \"" + position.getLibelle() + "\" doit permettre au moins un vote par électeur"
            );
        }

        if (position.getMaxVotesParElecteur() > position.getNombreSieges()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Pour le poste \"" + position.getLibelle()
                            + "\", le nombre de votes par électeur ne peut pas dépasser le nombre de sièges"
            );
        }

        long nbCandidatsValides = candidaturesValidees
                .stream()
                .filter(c -> c.getPosition() != null)
                .filter(c -> c.getPosition().getId().equals(position.getId()))
                .count();

        if (nbCandidatsValides == 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Le poste \"" + position.getLibelle()
                            + "\" ne contient aucun candidat validé"
            );
        }
    }

    private void validateElectionBeforeOpeningCandidatures(Election e) {
        if (e.getTitre() == null || e.getTitre().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Le titre de l'élection est obligatoire"
            );
        }

        if (e.getType() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Le type de l'élection est obligatoire"
            );
        }

        if (e.getNiveau() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Le niveau de l'élection est obligatoire"
            );
        }

        if (e.getCorpsElectoral() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Le corps électoral est obligatoire"
            );
        }

        if (e.getCandidatureStartDate() == null
                || e.getCandidatureEndDate() == null
                || e.getVoteStartDate() == null
                || e.getVoteEndDate() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Toutes les dates de l'élection sont obligatoires"
            );
        }

        if (!e.getCandidatureEndDate().isAfter(e.getCandidatureStartDate())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La date de fin des candidatures doit être après la date d'ouverture"
            );
        }

        if (e.getVoteStartDate().isBefore(e.getCandidatureEndDate())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Le vote ne peut pas commencer avant la fin des candidatures"
            );
        }

        if (!e.getVoteEndDate().isAfter(e.getVoteStartDate())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La date de fin du vote doit être après la date de début du vote"
            );
        }

        if (e.getSeatsCount() < 1) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Le nombre de sièges doit être au moins 1"
            );
        }

        if (e.getMaxVotesParElecteur() < 1) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Le nombre de votes par électeur doit être au moins 1"
            );
        }

        if (e.getMaxVotesParElecteur() > e.getSeatsCount()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Le nombre de votes par électeur ne peut pas dépasser le nombre de sièges"
            );
        }

        if (e.getCorpsElectoral() == CorpsElectoral.MEDECINS_REGION) {
            if (e.getRegion() == null || e.getRegion().isBlank()) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "La région est obligatoire pour une élection régionale"
                );
            }

            long nbEligibles = countElecteursEligibles(e);

            if (nbEligibles == 0) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Aucun médecin éligible trouvé pour cette région"
                );
            }
        }

        if (e.getQuorumPourcentage() != null) {
            if (e.getQuorumPourcentage() < 0 || e.getQuorumPourcentage() > 100) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Le quorum doit être compris entre 0 et 100"
                );
            }
        }

        validatePositionsBeforeOpeningCandidatures(e);
    }

    private void validatePositionsBeforeOpeningCandidatures(Election e) {
        List<PositionElectorale> positions = positionRepo
                .findByElectionIdOrderByOrdreAsc(e.getId())
                .stream()
                .filter(PositionElectorale::isActif)
                .collect(Collectors.toList());

        if (positions.isEmpty()) {
            return;
        }

        Set<String> libelles = new HashSet<>();
        Set<Integer> ordres = new HashSet<>();

        for (PositionElectorale position : positions) {
            if (position.getLibelle() == null || position.getLibelle().isBlank()) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Un poste électoral possède un libellé vide"
                );
            }

            String normalizedLibelle = position.getLibelle().trim().toLowerCase();

            if (!libelles.add(normalizedLibelle)) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Poste électoral dupliqué : " + position.getLibelle()
                );
            }

            if (!ordres.add(position.getOrdre())) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Deux postes électoraux ont le même ordre d'affichage"
                );
            }

            if (position.getNombreSieges() < 1) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Le poste \"" + position.getLibelle() + "\" doit avoir au moins un siège"
                );
            }

            if (position.getMaxVotesParElecteur() < 1) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Le poste \"" + position.getLibelle() + "\" doit permettre au moins un vote par électeur"
                );
            }

            if (position.getMaxVotesParElecteur() > position.getNombreSieges()) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Pour le poste \"" + position.getLibelle()
                                + "\", le nombre de votes par électeur ne peut pas dépasser le nombre de sièges"
                );
            }
        }
    }

    private boolean electionHasPositions(Long electionId) {
        return !positionRepo.findByElectionIdOrderByOrdreAsc(electionId).isEmpty();
    }

    private PositionElectorale resolveAndValidatePositionForCandidature(
            Election election,
            CandidatureCreateRequest req
    ) {
        List<PositionElectorale> positions =
                positionRepo.findByElectionIdOrderByOrdreAsc(election.getId())
                        .stream()
                        .filter(PositionElectorale::isActif)
                        .collect(Collectors.toList());

        boolean hasPositions = !positions.isEmpty();

        if (hasPositions && req.getPositionId() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Vous devez choisir le poste auquel vous souhaitez candidater"
            );
        }

        if (!hasPositions && req.getPositionId() != null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Cette élection ne contient pas de postes électoraux"
            );
        }

        if (!hasPositions) {
            return null;
        }

        return positions.stream()
                .filter(p -> p.getId().equals(req.getPositionId()))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Poste électoral invalide pour cette élection"
                ));
    }

    private List<Vote> buildAndValidateVotes(Election election, VoteRequest req, String voterToken,
                                              LocalDateTime timestamp) {
        List<PositionElectorale> positions = positionRepo
                .findByElectionIdOrderByOrdreAsc(election.getId())
                .stream()
                .filter(PositionElectorale::isActif)
                .collect(Collectors.toList());

        return positions.isEmpty()
                ? buildVotesSansPostes(election, req, voterToken, timestamp)
                : buildVotesAvecPostes(election, req, positions, voterToken, timestamp);
    }

    private List<Vote> buildVotesSansPostes(Election election, VoteRequest req, String voterToken,
                                             LocalDateTime timestamp) {
        if (voteRepo.existsByElectionIdAndVoterToken(election.getId(), voterToken)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Vous avez déjà voté pour cette élection.");
        }

        List<Long> cids = req.getCandidatureIds();
        if (cids == null || cids.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Sélectionnez au moins un candidat");
        }

        int max = election.getMaxVotesParElecteur() > 0 ? election.getMaxVotesParElecteur() : election.getSeatsCount();
        if (cids.size() > max) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vous ne pouvez choisir que " + max + " candidat(s)");
        }
        if (cids.stream().distinct().count() != cids.size()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vous avez sélectionné le même candidat plusieurs fois");
        }

        Map<Long, Candidature> candidaturesParId = candidatureRepo.findAllById(cids)
                .stream().collect(Collectors.toMap(Candidature::getId, c -> c));
        List<Vote> votes = new ArrayList<>();
        for (Long cid : cids) {
            Candidature cand = Optional.ofNullable(candidaturesParId.get(cid))
                    .filter(c -> c.getElection().getId().equals(election.getId()))
                    .filter(c -> c.getStatut() == StatutCandidature.VALIDEE)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Candidature invalide : " + cid));
            votes.add(buildVote(election, null, cand, voterToken, timestamp));
        }
        return votes;
    }

    private List<Vote> buildVotesAvecPostes(Election election, VoteRequest req,
                                             List<PositionElectorale> positions, String voterToken,
                                             LocalDateTime timestamp) {
        if (req.getVotes() == null || req.getVotes().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Le vote doit être organisé par poste");
        }

        // Batch load all candidatures before the loops to avoid N+1
        List<Long> allCidsToBatch = new ArrayList<>();
        req.getVotes().forEach(pv -> {
            if (pv.getCandidatureIds() != null) allCidsToBatch.addAll(pv.getCandidatureIds());
        });
        Map<Long, Candidature> candidatureCache = candidatureRepo.findAllById(allCidsToBatch)
                .stream().collect(Collectors.toMap(Candidature::getId, c -> c));

        List<Vote> votes = new ArrayList<>();
        Set<Long> positionsDejaVotees = new HashSet<>();

        for (PositionVoteRequest pv : req.getVotes()) {
            if (pv.getPositionId() == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Une position de vote est manquante");
            }
            if (!positionsDejaVotees.add(pv.getPositionId())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vous avez envoyé deux votes pour le même poste");
            }

            PositionElectorale pos = positions.stream()
                    .filter(p -> p.getId().equals(pv.getPositionId()))
                    .findFirst()
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
                            "Poste électoral invalide : " + pv.getPositionId()));

            if (voteRepo.existsByElectionIdAndPositionElectoraleIdAndVoterToken(
                    election.getId(), pos.getId(), voterToken)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "Vous avez déjà voté pour le poste : " + pos.getLibelle());
            }

            List<Long> cids = pv.getCandidatureIds();
            if (cids == null || cids.isEmpty()) continue;

            if (cids.size() > pos.getMaxVotesParElecteur()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Vous ne pouvez choisir que " + pos.getMaxVotesParElecteur()
                                + " candidat(s) pour le poste " + pos.getLibelle());
            }
            if (cids.stream().distinct().count() != cids.size()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Le même candidat est sélectionné plusieurs fois pour " + pos.getLibelle());
            }

            for (Long cid : cids) {
                final Long posId = pos.getId();
                Candidature cand = Optional.ofNullable(candidatureCache.get(cid))
                        .filter(c -> c.getElection().getId().equals(election.getId()))
                        .filter(c -> c.getStatut() == StatutCandidature.VALIDEE)
                        .filter(c -> c.getPosition() != null && c.getPosition().getId().equals(posId))
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
                                "Candidature invalide pour le poste " + pos.getLibelle()));
                votes.add(buildVote(election, pos, cand, voterToken, timestamp));
            }
        }
        return votes;
    }

    private Vote buildVote(Election election, PositionElectorale pos, Candidature cand,
                            String voterToken, LocalDateTime timestamp) {
        // Chiffrement hybride AES-256-GCM + RSA-2048-OAEP
        String encryptedChoice = ballotCryptoService.encryptChoice(cand.getId(), election.getId());
        // Empreinte d'intégrité — jamais le candidatureId en clair
        String voteHash = hashingService.buildVoteHash(election.getId(), voterToken, encryptedChoice, timestamp);
        // Preuve d'authenticité de l'origine — calculée à la soumission, pas en batch à la clôture
        String ballotSignature = signatureService.signBallot(encryptedChoice, voterToken, timestamp);

        Vote v = new Vote();
        v.setElection(election);
        v.setPositionElectorale(pos);
        v.setEncryptedChoice(encryptedChoice);
        v.setVoterToken(voterToken);
        v.setVoteHash(voteHash);
        v.setBallotSignature(ballotSignature);
        v.setDateVote(timestamp);
        return v;
    }

    private Map<Long, Long> buildVoteCountMap(Long electionId) {
        Election election = findElection(electionId);
        return voteRepo.findByElectionId(electionId).stream()
                .map(v -> {
                    try {
                        return ballotCryptoService.decryptChoice(v.getEncryptedChoice(), electionId, election.getStatut());
                    } catch (Exception ex) {
                        return null; // bulletin altéré, ou clé non encore accessible — ignoré du décompte
                    }
                })
                .filter(Objects::nonNull)
                .collect(Collectors.groupingBy(id -> id, Collectors.counting()));
    }

    @Override
    @Transactional(readOnly = true)
    public com.onmm.backend.dto.election.VoteIntegrityReportDto verifyVoteIntegrity(Long electionId) {
        findElection(electionId);
        List<Vote> votes = voteRepo.findByElectionId(electionId);
        long tampered = votes.stream()
                .filter(v -> !hashingService.verifyVoteHash(v, electionId))
                .count();
        long totalVotes = votes.size();
        return new com.onmm.backend.dto.election.VoteIntegrityReportDto(
                electionId, totalVotes, totalVotes - tampered, tampered, tampered == 0
        );
    }

    private boolean hasCriticalExAequo(List<CandidatureDto> ranked, int seats) {
        if (ranked == null || ranked.isEmpty()) return false;
        if (seats <= 0) return false;
        if (ranked.size() <= seats) return false;

        long votesAtCutoff = ranked.get(seats - 1).getNbVotes();
        long votesJustAfter = ranked.get(seats).getNbVotes();

        return votesAtCutoff > 0 && votesAtCutoff == votesJustAfter;
    }

    private void validateCandidatureDocuments(Candidature c) {
        if (c.getDeclarationCandidature() == null || c.getDeclarationCandidature().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La déclaration de candidature est obligatoire"
            );
        }

        if (c.getProgrammeElectoral() == null || c.getProgrammeElectoral().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Le programme électoral est obligatoire"
            );
        }

        validateCandidatureDocuments(c);

        c.setStatut(StatutCandidature.VALIDEE);
        c.setDateValidation(LocalDateTime.now());
        candidatureRepo.save(c);

        boolean hasPhoto = documentRepo.existsByCandidatureIdAndTypeDocument(
                c.getId(),
                TypeDocumentCandidature.PHOTO
        );

        boolean hasLettre = documentRepo.existsByCandidatureIdAndTypeDocument(
                c.getId(),
                TypeDocumentCandidature.LETTRE_CANDIDATURE
        );

        boolean hasProgramme = documentRepo.existsByCandidatureIdAndTypeDocument(
                c.getId(),
                TypeDocumentCandidature.PROGRAMME_ELECTORAL
        );

        if (!hasPhoto) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La photo du candidat est obligatoire"
            );
        }

        if (!hasLettre) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La lettre de candidature est obligatoire"
            );
        }

        if (!hasProgramme) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Le programme électoral est obligatoire"
            );
        }
    }

    private void validateCandidatureRequest(Election election, CandidatureCreateRequest req) {
        if (req == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Données de candidature manquantes");
        }

        List<PositionElectorale> positions = positionRepo.findByElectionIdOrderByOrdreAsc(election.getId())
                .stream()
                .filter(PositionElectorale::isActif)
                .collect(Collectors.toList());

        if (!positions.isEmpty() && req.getPositionId() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Le poste électoral est obligatoire pour cette élection"
            );
        }

        if (req.isSoumettre()) {
            if (req.getDeclarationCandidature() == null || req.getDeclarationCandidature().isBlank()) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "La déclaration de candidature est obligatoire"
                );
            }

            if (req.getProgrammeElectoral() == null || req.getProgrammeElectoral().isBlank()) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Le programme électoral est obligatoire"
                );
            }
        }

        if (req.getDeclarationCandidature() != null && req.getDeclarationCandidature().length() > 5000) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La déclaration de candidature est trop longue"
            );
        }

        if (req.getProgrammeElectoral() != null && req.getProgrammeElectoral().length() > 10000) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Le programme électoral est trop long"
            );
        }
    }

    private String cleanText(String value) {
        if (value == null) return null;
        String cleaned = value.trim();
        return cleaned.isBlank() ? null : cleaned;
    }


    private Election findElection(Long id) {
        return electionRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Élection introuvable"));
    }

    private Medecin findMedecin(String email) {
        return medecinRepo.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Médecin introuvable"));
    }

    private Candidature findCandidature(Long electionId, Long candidatureId) {
        Candidature c = candidatureRepo.findById(candidatureId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Candidature introuvable"));
        if (!c.getElection().getId().equals(electionId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Candidature invalide pour cette élection");
        }
        return c;
    }

    private void requireStatut(Election e, ElectionStatut required) {
        if (e.getStatut() != required) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Statut requis: " + required + ", statut actuel: " + e.getStatut());
        }
    }

    private boolean isMedecinBaseEligible(Medecin medecin) {
        return medecin != null
                && medecin.getStatut() == StatutMedecin.ACTIF
                && medecin.getNumeroInscription() != null
                && !medecin.getNumeroInscription().isBlank();
    }

    private boolean isMedecinConcerneParElection(Election e, Medecin medecin) {
        if (!isMedecinBaseEligible(medecin)) {
            return false;
        }

        ElectionType type = e.getType();
        if (type == ElectionType.BUREAU_SECTION_A && medecin.getSectionOrdre() != SectionOrdre.GENERALISTE) {
            return false;
        }
        if (type == ElectionType.BUREAU_SECTION_B && medecin.getSectionOrdre() != SectionOrdre.SPECIALISTE) {
            return false;
        }
        if (type == ElectionType.BUREAU_SECTION_C && medecin.getSectionOrdre() != SectionOrdre.ENSEIGNANT_CHERCHEUR) {
            return false;
        }
        if (type == ElectionType.REPRESENTANTS_REGIONAUX) {
            String wilaya = medecin.getWilayaExercice();
            if (wilaya == null || wilaya.isBlank() || !wilaya.equalsIgnoreCase(e.getRegion())) {
                return false;
            }
        }

        if (e.getCorpsElectoral() == null
                || e.getCorpsElectoral() == CorpsElectoral.TOUS_MEDECINS_ACTIFS) {
            return true;
        }

        if (e.getCorpsElectoral() == CorpsElectoral.MEDECINS_REGION) {
            return e.getRegion() != null
                    && medecin.getWilayaExercice() != null
                    && e.getRegion().equalsIgnoreCase(medecin.getWilayaExercice());
        }

        if (e.getCorpsElectoral() == CorpsElectoral.CONSEIL_SECTION_B) {
            return medecin.getSectionOrdre() == SectionOrdre.SPECIALISTE;
        }

        if (e.getCorpsElectoral() == CorpsElectoral.CONSEIL_SECTION_A) {
            return medecin.getSectionOrdre() == SectionOrdre.GENERALISTE;
        }

        if (e.getCorpsElectoral() == CorpsElectoral.CONSEIL_SECTION_C) {
            return medecin.getSectionOrdre() == SectionOrdre.ENSEIGNANT_CHERCHEUR;
        }

        // MEDECINS_PAR_SECTION, MEMBRES_CONSEIL_NATIONAL : tous médecins actifs
        return true;
    }

    private boolean isCandidatEligible(Election e, Medecin medecin) {
        if (e.getStatut() != ElectionStatut.CANDIDATURE_OUVERTE) {
            return false;
        }

        return isMedecinConcerneParElection(e, medecin);
    }

    private static final Set<String> WILAYAS_INTERIEUR_EXCLUES = Set.of(
            "Nouakchott Nord", "Nouakchott Ouest", "Nouakchott Sud"
    );

    private String sectionLabel(SectionOrdre s) {
        if (s == null) return "non renseignée";
        switch (s) {
            case GENERALISTE:         return "Section A – Généraliste";
            case SPECIALISTE:         return "Section B – Spécialiste";
            case ENSEIGNANT_CHERCHEUR: return "Section C – Enseignant-Chercheur";
            default:                  return s.name();
        }
    }

    private String getRaisonIneligibiliteCandidature(Election e, Medecin medecin) {
        if (medecin.getStatut() != StatutMedecin.ACTIF)
            return "Votre statut médecin n'est pas actif.";

        CorpsElectoral corps = e.getCorpsElectoral();
        ElectionType type = e.getType();
        SectionOrdre section = medecin.getSectionOrdre();
        String wilaya = medecin.getWilayaExercice();

        if (type == ElectionType.BUREAU_SECTION_A && section != SectionOrdre.GENERALISTE)
            return "Cette élection est réservée aux médecins de la Section A. Votre section : " + sectionLabel(section) + ".";
        if (type == ElectionType.BUREAU_SECTION_B && section != SectionOrdre.SPECIALISTE)
            return "Cette élection est réservée aux médecins de la Section B. Votre section : " + sectionLabel(section) + ".";
        if (type == ElectionType.BUREAU_SECTION_C && section != SectionOrdre.ENSEIGNANT_CHERCHEUR)
            return "Cette élection est réservée aux médecins de la Section C. Votre section : " + sectionLabel(section) + ".";

        if (corps == CorpsElectoral.CONSEIL_SECTION_A && section != SectionOrdre.GENERALISTE)
            return "Cette élection concerne le Conseil de la Section A. Votre section : " + sectionLabel(section) + ".";
        if (corps == CorpsElectoral.CONSEIL_SECTION_B && section != SectionOrdre.SPECIALISTE)
            return "Cette élection concerne le Conseil de la Section B. Votre section : " + sectionLabel(section) + ".";
        if (corps == CorpsElectoral.CONSEIL_SECTION_C && section != SectionOrdre.ENSEIGNANT_CHERCHEUR)
            return "Cette élection concerne le Conseil de la Section C. Votre section : " + sectionLabel(section) + ".";

        if (corps == CorpsElectoral.MEDECINS_REGION || type == ElectionType.REPRESENTANTS_REGIONAUX) {
            if (wilaya == null || wilaya.isBlank())
                return "Votre région n'est pas renseignée dans votre profil. Veuillez compléter votre profil.";
            if (e.getRegion() != null && !e.getRegion().equalsIgnoreCase(wilaya))
                return "Cette élection est réservée aux médecins de la région " + e.getRegion()
                        + ". Votre région enregistrée est « " + wilaya + " ».";
        }

        return null;
    }

    private boolean isPositionEligiblePourMedecin(Election e, PositionElectorale p, Medecin medecin) {
        if (e.getType() != ElectionType.CONSEIL_NATIONAL) return true;
        String libelle = p.getLibelle() != null ? p.getLibelle() : "";
        if (libelle.contains("Section A")) return medecin.getSectionOrdre() == SectionOrdre.GENERALISTE;
        if (libelle.contains("Section B")) return medecin.getSectionOrdre() == SectionOrdre.SPECIALISTE;
        if (libelle.contains("Section C")) return medecin.getSectionOrdre() == SectionOrdre.ENSEIGNANT_CHERCHEUR;
        if (libelle.contains("régions de l'intérieur")) {
            String w = medecin.getWilayaExercice();
            return w != null && !WILAYAS_INTERIEUR_EXCLUES.contains(w);
        }
        return true;
    }

    private void validateCandidatureEligibility(Election election, PositionElectorale position, Medecin medecin) {
        if (medecin.getStatut() != StatutMedecin.ACTIF) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Seuls les médecins actifs peuvent déposer une candidature.");
        }

        if (election.getStatut() != ElectionStatut.CANDIDATURE_OUVERTE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Les candidatures ne sont pas ouvertes pour cette élection.");
        }

        ElectionType type = election.getType();

        if (type == ElectionType.BUREAU_SECTION_A) {
            if (medecin.getSectionOrdre() != SectionOrdre.GENERALISTE) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                        "Vous ne pouvez pas candidater à un poste réservé à une autre section.");
            }
        } else if (type == ElectionType.BUREAU_SECTION_B) {
            if (medecin.getSectionOrdre() != SectionOrdre.SPECIALISTE) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                        "Vous ne pouvez pas candidater à un poste réservé à une autre section.");
            }
        } else if (type == ElectionType.BUREAU_SECTION_C) {
            if (medecin.getSectionOrdre() != SectionOrdre.ENSEIGNANT_CHERCHEUR) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                        "Vous ne pouvez pas candidater à un poste réservé à une autre section.");
            }
        } else if (type == ElectionType.REPRESENTANTS_REGIONAUX) {
            String wilaya = medecin.getWilayaExercice();
            if (wilaya == null || wilaya.isBlank()) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                        "Votre wilaya d'exercice n'est pas renseignée.");
            }
            if (WILAYAS_INTERIEUR_EXCLUES.contains(wilaya)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                        "Ce poste est réservé aux représentants des régions de l'intérieur.");
            }
            if (!wilaya.equalsIgnoreCase(election.getRegion())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                        "Vous ne pouvez candidater que dans votre wilaya d'exercice.");
            }
        } else if (type == ElectionType.CONSEIL_NATIONAL && position != null) {
            String libelle = position.getLibelle() != null ? position.getLibelle() : "";
            if (libelle.contains("Section A")) {
                if (medecin.getSectionOrdre() != SectionOrdre.GENERALISTE) {
                    throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                            "Vous ne pouvez pas candidater à un poste réservé à une autre section.");
                }
            } else if (libelle.contains("Section B")) {
                if (medecin.getSectionOrdre() != SectionOrdre.SPECIALISTE) {
                    throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                            "Vous ne pouvez pas candidater à un poste réservé à une autre section.");
                }
            } else if (libelle.contains("Section C")) {
                if (medecin.getSectionOrdre() != SectionOrdre.ENSEIGNANT_CHERCHEUR) {
                    throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                            "Vous ne pouvez pas candidater à un poste réservé à une autre section.");
                }
            } else if (libelle.contains("régions de l'intérieur")) {
                String wilaya = medecin.getWilayaExercice();
                if (wilaya == null || wilaya.isBlank()) {
                    throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                            "Votre wilaya d'exercice n'est pas renseignée.");
                }
                if (WILAYAS_INTERIEUR_EXCLUES.contains(wilaya)) {
                    throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                            "Ce poste est réservé aux représentants des régions de l'intérieur.");
                }
            }
        }
        // BUREAU_EXECUTIF : pas de vérification de section/wilaya en version PFE
    }

    private boolean isElecteurEligible(Election e, Medecin medecin) {
        if (e.getStatut() != ElectionStatut.VOTE_EN_COURS) {
            return false;
        }

        return isMedecinConcerneParElection(e, medecin);
    }

    private long countElecteursEligibles(Election e) {
        if (e.getCorpsElectoral() == CorpsElectoral.MEDECINS_REGION) {
            if (e.getRegion() == null || e.getRegion().isBlank()) {
                return 0;
            }

            return medecinRepo.countElecteursEligiblesRegion(
                    StatutMedecin.ACTIF,
                    e.getRegion()
            );
        }

        if (e.getCorpsElectoral() == CorpsElectoral.CONSEIL_SECTION_B) {
            return medecinRepo.countBySectionOrdreAndStatut(SectionOrdre.SPECIALISTE, StatutMedecin.ACTIF);
        }

        if (e.getCorpsElectoral() == CorpsElectoral.CONSEIL_SECTION_A) {
            return medecinRepo.countBySectionOrdreAndStatut(SectionOrdre.GENERALISTE, StatutMedecin.ACTIF);
        }

        if (e.getCorpsElectoral() == CorpsElectoral.CONSEIL_SECTION_C) {
            return medecinRepo.countBySectionOrdreAndStatut(SectionOrdre.ENSEIGNANT_CHERCHEUR, StatutMedecin.ACTIF);
        }

        return medecinRepo.countElecteursEligiblesTous(StatutMedecin.ACTIF);
    }



    private boolean isResultsVisible(Election e) {
        return e.getStatut() == ElectionStatut.RESULTATS_PUBLIES
                || e.getStatut() == ElectionStatut.ARCHIVEE;
    }

    private boolean isResultsVisibleAdmin(Election e) {
        return e.getStatut() == ElectionStatut.DEPOUILLEMENT
                || e.getStatut() == ElectionStatut.RESULTATS_PUBLIES
                || e.getStatut() == ElectionStatut.ARCHIVEE;
    }

    private List<CandidatureDto> determineGagnants(List<CandidatureDto> ranked, int seats) {
        if (ranked == null || ranked.isEmpty() || seats <= 0) {
            return Collections.emptyList();
        }

        List<CandidatureDto> candidatsAvecVotes = ranked.stream()
                .filter(c -> c.getNbVotes() > 0)
                .collect(Collectors.toList());

        if (candidatsAvecVotes.isEmpty()) {
            return Collections.emptyList();
        }

        if (candidatsAvecVotes.size() <= seats) {
            return new ArrayList<>(candidatsAvecVotes);
        }

        long votesSeuil = candidatsAvecVotes.get(seats - 1).getNbVotes();
        long votesApresSeuil = candidatsAvecVotes.get(seats).getNbVotes();

        List<CandidatureDto> gagnants = new ArrayList<>(
                candidatsAvecVotes.subList(0, seats)
        );

        if (votesSeuil == votesApresSeuil) {
            for (CandidatureDto c : gagnants) {
                if (c.getNbVotes() == votesSeuil) {
                    c.setExAequo(true);
                }
            }

            candidatsAvecVotes.stream()
                    .skip(seats)
                    .filter(c -> c.getNbVotes() == votesSeuil)
                    .forEach(c -> {
                        c.setExAequo(true);
                        gagnants.add(c);
                    });
        }

        return gagnants;
    }



    private int compareCandidatsByVotesDesc(CandidatureDto a, CandidatureDto b) {
        int byVotes = Long.compare(b.getNbVotes(), a.getNbVotes());

        if (byVotes != 0) {
            return byVotes;
        }

        String nomA = (a.getMedecinNom() + " " + a.getMedecinPrenom()).toLowerCase();
        String nomB = (b.getMedecinNom() + " " + b.getMedecinPrenom()).toLowerCase();

        return nomA.compareTo(nomB);
    }

    private void audit(
            Election e,
            String action,
            String acteurEmail,
            String acteurRole,
            String details,
            String severity,
            String entityType,
            Long entityId
    ) {
        electionAuditService.save(e, action, acteurEmail, acteurRole, details, severity, entityType, entityId);
    }

    private String buildHashBase(Medecin m) {
        return m.getId() + ":" + m.getEmail();
    }

    // Pseudonyme de l'électeur : HMAC-SHA256(masterSecret, electionId:medecinId) — remplace
    // l'identité du médecin par un jeton non réversible sans connaître le secret applicatif.
    private String buildVoterToken(Long electionId, Medecin m) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(masterSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            String message = electionId + ":" + m.getId();
            byte[] bytes = mac.doFinal(message.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(bytes);
        } catch (Exception ex) {
            throw new RuntimeException("HMAC-SHA256 unavailable", ex);
        }
    }

    private void notifyMedecins(Election e, String type, String titre, String message, String lien) {
        getElecteursConcernes(e).forEach(m ->
                notificationService.createMedecinNotification(
                        m.getEmail(),
                        type,
                        titre,
                        message,
                        lien,
                        false
                )
        );
    }

    // ── Mappers ──────────────────────────────────────────────────────────────

    private ElectionListDto toListDto(Election e) {
        ElectionListDto dto = new ElectionListDto();
        fillListDto(dto, e);
        return dto;
    }

    private ElectionDetailDto toDetailDto(Election e) {
        ElectionDetailDto dto = new ElectionDetailDto();
        fillListDto(dto, e);
        dto.setDescription(e.getDescription());
        dto.setMaxVotesParElecteur(e.getMaxVotesParElecteur());
        dto.setCandidatures(
                candidatureRepo.findByElectionId(e.getId()).stream()
                        .map(c -> toCandidatureDto(c, isResultsVisibleAdmin(e)))
                        .collect(Collectors.toList())
        );
        dto.setPositions(
                positionRepo.findByElectionIdOrderByOrdreAsc(e.getId()).stream()
                        .map(this::toPositionDto)
                        .collect(Collectors.toList())
        );
        return dto;
    }

    private void fillListDto(ElectionListDto dto, Election e) {
        dto.setId(e.getId());
        dto.setTitre(e.getTitre());
        dto.setType(e.getType());
        dto.setStatut(e.getStatut());
        dto.setNiveau(e.getNiveau());
        dto.setRegion(e.getRegion());
        dto.setCorpsElectoral(e.getCorpsElectoral());
        dto.setQuorumPourcentage(e.getQuorumPourcentage());

        dto.setSeatsCount(e.getSeatsCount());
        dto.setCandidatureStartDate(e.getCandidatureStartDate());
        dto.setCandidatureEndDate(e.getCandidatureEndDate());
        dto.setVoteStartDate(e.getVoteStartDate());
        dto.setVoteEndDate(e.getVoteEndDate());
        dto.setDateCreation(e.getDateCreation());
        dto.setResultatsPublies(e.isResultatsPublies());

        dto.setNbCandidatsValides(
                candidatureRepo.countByElectionIdAndStatut(e.getId(), StatutCandidature.VALIDEE)
        );

        long nbVotants = voteRepo.countDistinctVotersByElectionId(e.getId());
        long nbElecteursEligibles = countElecteursEligibles(e);

        dto.setNbVotants(nbVotants);
        dto.setNbElecteursEligibles(nbElecteursEligibles);
        dto.setTauxParticipation(
                nbElecteursEligibles > 0
                        ? (nbVotants * 100.0 / nbElecteursEligibles)
                        : 0
        );
    }

    private MedecinElectionDto toMedecinDto(Election e, Medecin medecin, String votantBase) {
        MedecinElectionDto dto = new MedecinElectionDto();
        fillListDto(dto, e);
        dto.setDescription(e.getDescription());
        dto.setMaxVotesParElecteur(e.getMaxVotesParElecteur());

        List<PositionElectorale> allPositions = positionRepo.findByElectionIdOrderByOrdreAsc(e.getId())
                .stream().filter(PositionElectorale::isActif).collect(Collectors.toList());
        dto.setPositions(allPositions.stream().map(this::toPositionDto).collect(Collectors.toList()));

        List<PositionElectoraleDto> positionsEligibles = allPositions.stream()
                .filter(p -> isPositionEligiblePourMedecin(e, p, medecin))
                .map(this::toPositionDto)
                .collect(Collectors.toList());
        dto.setPositionsEligibles(positionsEligibles);

        String voterToken = buildVoterToken(e.getId(), medecin);
        dto.setAVote(voteRepo.existsByElectionIdAndVoterToken(e.getId(), voterToken));

        Optional<Candidature> maCand = candidatureRepo.findByElectionIdAndMedecinEmail(e.getId(), medecin.getEmail());
        maCand.ifPresent(c -> dto.setMaCandidature(toCandidatureDto(c, isResultsVisible(e))));

        List<Candidature> allValidee = candidatureRepo.findByElectionIdAndStatut(e.getId(), StatutCandidature.VALIDEE);
        boolean showVotes = isResultsVisible(e);
        String viewerEmail = medecin.getEmail();

        // Pré-charger les votes en déchiffrant encrypted_choice (candidature_id n'est plus stocké en clair)
        Map<Long, Long> voteCounts = showVotes ? buildVoteCountMap(e.getId()) : Collections.emptyMap();

        // Calculer les DTOs une seule fois avec les comptages pré-chargés
        List<CandidatureDto> allDtos = allValidee.stream()
                .map(c -> {
                    CandidatureDto cDto = toCandidatureDto(c, false, viewerEmail);
                    cDto.setNbVotes(voteCounts.getOrDefault(c.getId(), 0L));
                    return cDto;
                })
                .collect(Collectors.toList());
        dto.setCandidatures(allDtos);

        // Filtrer les éligibles depuis les IDs sans recalculer les DTOs
        Set<Long> eligibleIds = allValidee.stream()
                .filter(c -> c.getPosition() == null || isPositionEligiblePourMedecin(e, c.getPosition(), medecin))
                .map(Candidature::getId)
                .collect(Collectors.toSet());
        dto.setCandidaturesEligibles(allDtos.stream()
                .filter(d -> eligibleIds.contains(d.getId()))
                .collect(Collectors.toList()));

        // peutCandidater + raisonIneligibilite
        boolean candidaturesOuvertes = e.getStatut() == ElectionStatut.CANDIDATURE_OUVERTE;
        boolean aDejaUneBlocage = maCand.isPresent() && (
                maCand.get().getStatut() == StatutCandidature.SOUMISE
                || maCand.get().getStatut() == StatutCandidature.EN_REVUE
                || maCand.get().getStatut() == StatutCandidature.VALIDEE);

        String raison = null;
        boolean peutCandidater = false;
        if (!candidaturesOuvertes) {
            raison = "Les candidatures ne sont pas ouvertes pour cette élection.";
        } else if (aDejaUneBlocage) {
            raison = "Vous avez déjà une candidature en cours pour cette élection.";
        } else {
            raison = getRaisonIneligibiliteCandidature(e, medecin);
            peutCandidater = (raison == null);
        }
        dto.setPeutCandidater(peutCandidater);
        dto.setRaisonIneligibilite(raison);

        // peutVoter — false si déjà voté
        dto.setPeutVoter(e.getStatut() == ElectionStatut.VOTE_EN_COURS
                && !dto.isAVote()
                && isMedecinConcerneParElection(e, medecin));

        // prochaineEtapeCandidature
        if (maCand.isPresent() && maCand.get().getStatut() == StatutCandidature.BROUILLON) {
            long nbDocs = documentRepo.countByCandidatureId(maCand.get().getId());
            dto.setProchaineEtapeCandidature(nbDocs == 0 ? "DOCUMENTS" : "CONFIRMATION");
        }

        return dto;
    }

    private List<Medecin> getElecteursConcernes(Election e) {
        if (e.getCorpsElectoral() == CorpsElectoral.MEDECINS_REGION) {
            if (e.getRegion() == null || e.getRegion().isBlank()) {
                return List.of();
            }

            return medecinRepo.findElecteursEligiblesRegion(
                    StatutMedecin.ACTIF,
                    e.getRegion()
            );
        }

        return medecinRepo.findElecteursEligiblesTous(StatutMedecin.ACTIF);
    }

    private CandidatureDto toCandidatureDto(Candidature c, boolean showVotes) {
        CandidatureDto dto = new CandidatureDto();
        dto.setId(c.getId());
        dto.setElectionId(c.getElection().getId());
        dto.setElectionTitre(c.getElection().getTitre());
        if (c.getPosition() != null) {
            dto.setPosition(toPositionDto(c.getPosition()));
        }
        dto.setMedecinId(c.getMedecin().getId());
        dto.setMedecinNom(c.getMedecin().getNom());
        dto.setMedecinPrenom(c.getMedecin().getPrenom());
        dto.setMedecinNumeroInscription(c.getMedecin().getNumeroInscription());
        dto.setMedecinPhotoUrl(c.getMedecin().getPhotoProfilPath());
        dto.setRegion(c.getMedecin().getVilleExercice());
        if (!c.getMedecin().getEducations().isEmpty() && c.getMedecin().getEducations().get(0).getSpecialite() != null) {
            dto.setSpecialite(c.getMedecin().getEducations().get(0).getSpecialite().getLibelle());
        }
        dto.setDeclarationCandidature(c.getDeclarationCandidature());
        dto.setProgrammeElectoral(c.getProgrammeElectoral());
        dto.setStatut(c.getStatut());
        dto.setCommentaireValidation(c.getCommentaireValidation());
        dto.setDateDepot(c.getDateDepot());
        dto.setDateValidation(c.getDateValidation());
        dto.setNbVotes(0); // vote count is set externally via buildVoteCountMap
        List<CandidatureDocument> docs = documentRepo.findByCandidatureId(c.getId());
        dto.setDocuments(docs.stream().map(this::toDocumentDto).collect(Collectors.toList()));
        docs.stream()
                .filter(d -> d.getTypeDocument() == TypeDocumentCandidature.PHOTO)
                .findFirst()
                .ifPresent(photoDoc -> {
                    String path = photoDoc.getFilePath();
                    dto.setPhotoCandidatureUrl(path.startsWith("/") ? path : "/" + path);
                });

        // Champs élection enrichis
        dto.setElectionType(c.getElection().getType());
        dto.setElectionStatut(c.getElection().getStatut());
        dto.setElectionRegion(c.getElection().getRegion());
        dto.setElectionCorpsElectoral(c.getElection().getCorpsElectoral());

        // Flags d'état
        StatutCandidature sc = c.getStatut();
        dto.setPeutModifier(sc == StatutCandidature.BROUILLON);
        dto.setPeutUploaderDocuments(sc == StatutCandidature.BROUILLON);
        dto.setPeutFinaliser(sc == StatutCandidature.BROUILLON);
        dto.setPeutRetirer(sc == StatutCandidature.BROUILLON || sc == StatutCandidature.SOUMISE);

        return dto;
    }

    private CandidatureDto toCandidatureDto(Candidature c, boolean showVotes, String viewerEmail) {
        CandidatureDto dto = toCandidatureDto(c, showVotes);
        if (viewerEmail != null) {
            dto.setEstMaCandidature(c.getMedecin().getEmail().equals(viewerEmail));
        }
        return dto;
    }

    private CandidatureDocumentDto toDocumentDto(CandidatureDocument d) {
        CandidatureDocumentDto dto = new CandidatureDocumentDto();
        dto.setId(d.getId());
        dto.setTypeDocument(d.getTypeDocument().name());
        String path = d.getFilePath();
        dto.setFileUrl(path.startsWith("/") ? path : "/" + path);
        dto.setOriginalFilename(d.getOriginalFilename());
        return dto;
    }

    private PositionElectoraleDto toPositionDto(PositionElectorale p) {
        PositionElectoraleDto dto = new PositionElectoraleDto();
        dto.setId(p.getId());
        dto.setElectionId(p.getElection().getId());
        dto.setLibelle(p.getLibelle());
        dto.setOrdre(p.getOrdre());
        dto.setNombreSieges(p.getNombreSieges());
        dto.setMaxVotesParElecteur(p.getMaxVotesParElecteur());
        dto.setActif(p.isActif());
        return dto;
    }

    private ElectionAuditLogDto toAuditLogDto(ElectionAuditLog log) {
        ElectionAuditLogDto dto = new ElectionAuditLogDto();
        dto.setId(log.getId());
        dto.setAction(log.getAction());
        dto.setActeurEmail(log.getActeurEmail());
        dto.setActeurRole(log.getActeurRole());
        dto.setDetails(log.getDetails());
        dto.setDateAction(log.getDateAction());
        dto.setSeverity(log.getSeverity());
        dto.setEntityType(log.getEntityType());
        dto.setEntityId(log.getEntityId());
        return dto;
    }

    @Override
    public List<CandidatureDto> getCandidaturesForElection(Long electionId) {
        Election e = findElection(electionId);
        return candidatureRepo.findByElectionId(electionId).stream()
                .map(c -> toCandidatureDto(c, isResultsVisibleAdmin(e)))
                .collect(Collectors.toList());
    }

    @Override
    public CandidatureDocumentDto ajouterDocument(Long candidatureId,
                                                   org.springframework.web.multipart.MultipartFile file,
                                                   com.onmm.backend.entity.enums.TypeDocumentCandidature type,
                                                   String email) {
        Candidature c = candidatureRepo.findById(candidatureId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Candidature introuvable"));
        if (!c.getMedecin().getEmail().equals(email))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Accès refusé");
        if (c.getStatut() != StatutCandidature.BROUILLON && c.getStatut() != StatutCandidature.SOUMISE) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Les documents peuvent uniquement être ajoutés sur une candidature en brouillon ou soumise"
            );
        }

        if (type == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Type de document obligatoire");
        }

        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Fichier obligatoire");
        }

        if (c.getElection().getStatut() != ElectionStatut.CANDIDATURE_OUVERTE) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Les documents ne peuvent être ajoutés que pendant la période de candidature"
            );
        }

        // Remplacer un document existant du même type
        documentRepo.findByCandidatureIdAndTypeDocument(candidatureId, type)
                .ifPresent(documentRepo::delete);

        String path = fileStorageService.storeCandidatureFile(file);
        CandidatureDocument doc = new CandidatureDocument();
        doc.setCandidature(c);
        doc.setTypeDocument(type);
        doc.setFilePath(path);
        doc.setOriginalFilename(file.getOriginalFilename());
        documentRepo.save(doc);
        return toDocumentDto(doc);
    }

    @Override
    public void supprimerDocument(Long candidatureId, Long documentId, String email) {
        Candidature c = candidatureRepo.findById(candidatureId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Candidature introuvable"));
        if (!c.getMedecin().getEmail().equals(email))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Accès refusé");
        if (c.getStatut() != StatutCandidature.BROUILLON)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Les documents ne peuvent être supprimés que sur un brouillon");
        CandidatureDocument doc = documentRepo.findById(documentId)
                .filter(d -> d.getCandidature().getId().equals(candidatureId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Document introuvable"));
        documentRepo.delete(doc);
    }

    private ElectionStatut parseStatut(String s) {
        if (s == null || s.isBlank()) return null;
        try { return ElectionStatut.valueOf(s.toUpperCase()); }
        catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Statut invalide: " + s);
        }
    }

    private ElectionType parseType(String s) {
        if (s == null || s.isBlank()) return null;
        try { return ElectionType.valueOf(s.toUpperCase()); }
        catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Type invalide: " + s);
        }
    }

    private StatutCandidature parseStatutCandidature(String s) {
        if (s == null || s.isBlank()) return null;
        try { return StatutCandidature.valueOf(s.toUpperCase()); }
        catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Statut candidature invalide: " + s);
        }
    }
}
