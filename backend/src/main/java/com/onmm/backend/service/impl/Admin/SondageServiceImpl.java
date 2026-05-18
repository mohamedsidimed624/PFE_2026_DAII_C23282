package com.onmm.backend.service.impl.Admin;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.onmm.backend.dto.sondage.*;
import com.onmm.backend.entity.*;
import com.onmm.backend.entity.enums.*;
import com.onmm.backend.repository.*;
import com.onmm.backend.service.Admin.SondageService;
import com.onmm.backend.service.NotificationService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class SondageServiceImpl implements SondageService {

    private final SondageRepository sondageRepo;
    private final ParticipationRepository participationRepo;
    private final ReponseRepository reponseRepo;
    private final AdminRepository adminRepo;
    private final MedecinRepository medecinRepo;
    private final NotificationService notificationService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${app.sondage.hash-secret:dev-sondage-secret}")
    private String sondageHashSecret;

    public SondageServiceImpl(
            SondageRepository sondageRepo,
            ParticipationRepository participationRepo,
            ReponseRepository reponseRepo,
            AdminRepository adminRepo,
            MedecinRepository medecinRepo,
            NotificationService notificationService
    ) {
        this.sondageRepo = sondageRepo;
        this.participationRepo = participationRepo;
        this.reponseRepo = reponseRepo;
        this.adminRepo = adminRepo;
        this.medecinRepo = medecinRepo;
        this.notificationService = notificationService;
    }

    // ── Admin: list ──────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public Page<SondageListDto> getAllSondages(String type, String statut, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);

        SondageStatut statutEnum = parseSondageStatut(statut);
        SondageType typeEnum = parseSondageType(type);

        Page<Sondage> result;

        if (typeEnum != null && statutEnum != null) {
            result = sondageRepo.findByStatutAndTypeOrderByDateCreationDesc(statutEnum, typeEnum, pageable);
        } else if (typeEnum != null) {
            result = sondageRepo.findByTypeOrderByDateCreationDesc(typeEnum, pageable);
        } else if (statutEnum != null) {
            result = sondageRepo.findByStatutOrderByDateCreationDesc(statutEnum, pageable);
        } else {
            result = sondageRepo.findAllByOrderByDateCreationDesc(pageable);
        }

        return result.map(this::toListDto);
    }

    // ── Admin: detail ────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public SondageDetailDto getSondageById(Long id) {
        return toDetailDto(findSondage(id));
    }

    // ── Admin: create / update ───────────────────────────────────────────────

    @Override
    public SondageDetailDto createSondage(SondageCreateRequest req, String adminEmail) {
        Admin admin = adminRepo.findByEmail(adminEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
        Sondage s = new Sondage();
        applyRequest(s, req);
        s.setCreePar(admin);
        s = sondageRepo.save(s);
        notificationService.createNotification(
                "SONDAGE_CREE",
                "Nouveau sondage créé",
                "Le sondage \"" + s.getTitre() + "\" a été créé et est en brouillon.",
                "/admin/sondages/" + s.getId(),
                false
        );
        return toDetailDto(s);
    }

    @Override
    public SondageDetailDto updateSondage(Long id, SondageCreateRequest req) {
        Sondage s = findSondage(id);
        if (s.getStatut() != SondageStatut.BROUILLON) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Seul un brouillon peut être modifié");
        }
        applyRequest(s, req);
        return toDetailDto(sondageRepo.save(s));
    }

    private void applyRequest(Sondage s, SondageCreateRequest req) {
        validateDateRange(req);

        s.setTitre(req.getTitre());
        s.setDescription(req.getDescription());
        s.setType(req.getType());
        s.setAnonyme(req.isAnonyme());
        s.setDateDebut(req.getDateDebut());
        s.setDateFin(req.getDateFin());
        s.setFiltreSpecialite(req.getFiltreSpecialite());
        s.setFiltreWilaya(req.getFiltreWilaya());
        s.setFiltreStatut(req.getFiltreStatut());
        s.setFiltreGenre(req.getFiltreGenre());
        s.setQuestionsJson(serializeQuestions(req.getQuestions()));
    }

    // ── Admin: lifecycle ─────────────────────────────────────────────────────

    @Override
    public void publishSondage(Long id, LocalDateTime dateDebut, LocalDateTime dateFin) {
        Sondage s = findSondage(id);

        if (s.getStatut() != SondageStatut.BROUILLON
                && s.getStatut() != SondageStatut.PLANIFIE) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Seul un brouillon ou un sondage planifié peut être publié"
            );
        }

        // Apply dates from publish request if provided
        if (dateDebut != null) s.setDateDebut(dateDebut);
        if (dateFin != null) s.setDateFin(dateFin);

        if (s.getDateFin() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La date de clôture est obligatoire pour publier un sondage"
            );
        }

        LocalDateTime now = LocalDateTime.now();

        if (s.getDateFin().isBefore(now)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Impossible de publier un sondage dont la date de clôture est dépassée"
            );
        }

        LocalDateTime dateDebutEffective = s.getDateDebut() != null ? s.getDateDebut() : now;

        if (s.getDateFin().isBefore(dateDebutEffective)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La date de clôture doit être postérieure à la date d'ouverture"
            );
        }

        if (dateDebutEffective.isAfter(now)) {
            s.setStatut(SondageStatut.PLANIFIE);
        } else {
            s.setStatut(SondageStatut.ACTIF);
            s.setDateDebut(now);
            s.setDatePublication(now);

            List<Medecin> targets = getTargetedMedecins(s);
            for (Medecin m : targets) {
                notificationService.createMedecinNotification(
                        m.getEmail(),
                        "NOUVEAU_SONDAGE",
                        "Nouvelle consultation disponible",
                        "L'ONMM vous invite à participer à : " + s.getTitre(),
                        "/medecin/sondages/" + s.getId(),
                        false
                );
            }
        }

        sondageRepo.save(s);
    }

    @Override
    public void closeSondage(Long id) {
        Sondage s = findSondage(id);
        if (s.getStatut() != SondageStatut.ACTIF) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Seul un sondage actif peut être clôturé");
        }
        s.setStatut(SondageStatut.CLOS);
        sondageRepo.save(s);

        // Notify medecins who participated (skip anonymized participations)
        participationRepo.findBySondageId(id).stream()
                .filter(p -> p.getMedecin() != null)
                .forEach(p -> notificationService.createMedecinNotification(
                        p.getMedecin().getEmail(),
                        "SONDAGE_CLOS",
                        "Sondage clôturé",
                        "Le sondage \"" + s.getTitre() + "\" auquel vous avez participé est maintenant clôturé.",
                        "/medecin/sondages",
                        false
                ));
    }

    @Override
    public void publishResultats(Long id) {
        Sondage s = findSondage(id);
        if (s.getStatut() != SondageStatut.ACTIF && s.getStatut() != SondageStatut.CLOS) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Les résultats ne peuvent être publiés que pour un sondage actif ou clôturé"
            );
        }
        s.setResultatsPublies(true);
        sondageRepo.save(s);

        participationRepo.findBySondageId(id).stream()
                .filter(p -> p.getStatut() == StatutParticipation.COMPLETE && p.getMedecin() != null)
                .forEach(p -> notificationService.createMedecinNotification(
                        p.getMedecin().getEmail(),
                        "RESULTATS_PUBLIES",
                        "Résultats disponibles",
                        "Les résultats du sondage \"" + s.getTitre() + "\" sont maintenant disponibles.",
                        "/medecin/sondages/" + s.getId() + "/resultats",
                        false
                ));
    }

    @Override
    @Transactional(readOnly = true)
    public SondageStatsDto getResultatsForMedecin(Long id, String email) {
        Sondage s = findSondage(id);
        if (!s.isResultatsPublies()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Les résultats de ce sondage ne sont pas encore disponibles");
        }
        Medecin medecin = findMedecin(email);
        String hash = buildRepondantHash(id, medecin);
        boolean completed = participationRepo.findBySondageIdAndRepondantHash(id, hash)
                .map(p -> p.getStatut() == StatutParticipation.COMPLETE)
                .orElse(false);
        if (!completed) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Vous n'avez pas complété ce sondage");
        }
        return getSondageStats(id);
    }

    @Override
    public void archiveSondage(Long id) {
        Sondage s = findSondage(id);
        if (s.getStatut() != SondageStatut.CLOS) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Seul un sondage clôturé peut être archivé");
        }
        s.setStatut(SondageStatut.ARCHIVE);
        sondageRepo.save(s);
    }

    @Override
    public void deleteSondage(Long id) {
        Sondage s = findSondage(id);
        if (s.getStatut() != SondageStatut.BROUILLON) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Seul un brouillon peut être supprimé");
        }
        sondageRepo.delete(s);
    }

    // ── Admin: stats ─────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public SondageStatsDto getSondageStats(Long id) {
        Sondage s = findSondage(id);
        List<QuestionDto> questions = deserializeQuestions(s.getQuestionsJson());

        long nbParticipationsDemarrees = participationRepo.countBySondageId(id);
        long nbCompletes = participationRepo.countBySondageIdAndStatut(id, StatutParticipation.COMPLETE);

        double taux = nbParticipationsDemarrees > 0
                ? (double) nbCompletes / nbParticipationsDemarrees * 100
                : 0;

        List<QuestionStatDto> questionStats = questions.stream().map(q -> {
            List<Reponse> reponses = reponseRepo.findByParticipation_SondageIdAndQuestionOrdre(id, q.getOrdre());
            QuestionStatDto stat = new QuestionStatDto();
            stat.setQuestionOrdre(q.getOrdre());
            stat.setTitre(q.getTitre());
            stat.setTypeQuestion(q.getTypeQuestion());
            stat.setTotalReponses(reponses.size());

            Map<String, Long> repartition = new LinkedHashMap<>();
            for (Reponse r : reponses) {
                if (r.getValeur() == null) continue;
                if (q.getTypeQuestion() == TypeQuestion.CHOIX_MULTIPLE) {
                    for (String choice : r.getValeur().split(",")) {
                        repartition.merge(choice.trim(), 1L, Long::sum);
                    }
                } else {
                    repartition.merge(r.getValeur(), 1L, Long::sum);
                }
            }
            stat.setRepartition(repartition);

            if (q.getTypeQuestion() == TypeQuestion.ECHELLE || q.getTypeQuestion() == TypeQuestion.NUMERIQUE) {
                OptionalDouble avg = reponses.stream()
                        .map(Reponse::getValeur)
                        .filter(Objects::nonNull)
                        .map(String::trim)
                        .filter(v -> !v.isBlank())
                        .map(this::tryParseDouble)
                        .filter(OptionalDouble::isPresent)
                        .mapToDouble(OptionalDouble::getAsDouble)
                        .average();

                stat.setMoyenne(avg.isPresent() ? avg.getAsDouble() : null);
            }
            return stat;
        }).collect(Collectors.toList());

        SondageStatsDto dto = new SondageStatsDto();
        dto.setSondageId(id);
        dto.setTitre(s.getTitre());
        dto.setNbParticipationsDemarrees(nbParticipationsDemarrees);
        dto.setNbParticipants(nbCompletes);
        dto.setNbCompletes(nbCompletes);
        dto.setTauxCompletion(taux);
        dto.setQuestionStats(questionStats);
        return dto;
    }

    // ── Médecin operations ────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public List<MedecinSondageDto> getSondagesForMedecin(String email) {
        Medecin medecin = findMedecin(email);

        // Active surveys matching this medecin's audience
        List<MedecinSondageDto> actifs = sondageRepo.findByStatut(SondageStatut.ACTIF).stream()
                .filter(this::isSondageAccessibleNow)
                .filter(s -> medecinMatchesAudience(medecin, s))
                .map(s -> toMedecinSondageDto(s, email))
                .collect(Collectors.toList());

        // Closed surveys where this medecin participated (for the "Fermés" tab)
        List<MedecinSondageDto> clos = sondageRepo.findByStatut(SondageStatut.CLOS).stream()
                .filter(s -> participationRepo
                        .findBySondageIdAndRepondantHash(s.getId(), buildRepondantHash(s.getId(), medecin))
                        .isPresent())
                .map(s -> toMedecinSondageDto(s, email))
                .collect(Collectors.toList());

        List<MedecinSondageDto> result = new ArrayList<>(actifs);
        result.addAll(clos);
        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public MedecinSondageDto getSondageForMedecin(Long id, String email) {
        Medecin medecin = findMedecin(email);
        Sondage s = findSondage(id);

        if (s.getStatut() == SondageStatut.ACTIF) {
            if (!isSondageAccessibleNow(s)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ce sondage n'est pas disponible actuellement");
            }
            if (!medecinMatchesAudience(medecin, s)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Vous n'êtes pas concerné par ce sondage");
            }
        } else if (s.getStatut() == SondageStatut.CLOS) {
            // Allow access if the medecin participated
            String sHash = buildRepondantHash(id, medecin);
            if (participationRepo.findBySondageIdAndRepondantHash(id, sHash).isEmpty()) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Vous n'avez pas participé à ce sondage");
            }
        } else {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Sondage indisponible");
        }

        return toMedecinSondageDto(s, email);
    }

    @Override
    public ParticipationStartResponse startParticipation(Long sondageId, String email) {
        Sondage sondage = findSondage(sondageId);

        if (sondage.getStatut() != SondageStatut.ACTIF) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ce sondage n'est plus disponible");
        }

        if (!isSondageAccessibleNow(sondage)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Ce sondage n'est pas disponible actuellement"
            );
        }

        Medecin medecin = findMedecin(email);

        if (!medecinMatchesAudience(medecin, sondage)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Vous n'êtes pas concerné par ce sondage"
            );
        }

        String repondantHash = buildRepondantHash(sondageId, medecin);

        Optional<Participation> existing =
                participationRepo.findBySondageIdAndRepondantHash(sondageId, repondantHash);

        if (existing.isPresent()) {
            Participation p = existing.get();

            if (p.getStatut() == StatutParticipation.COMPLETE) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Vous avez déjà complété ce sondage");
            }

            ParticipationStartResponse resp = new ParticipationStartResponse();
            resp.setParticipationId(p.getId());
            resp.setSondage(toDetailDto(sondage));
            return resp;
        }

        Participation p = new Participation();
        p.setSondage(sondage);
        p.setMedecin(medecin);
        p.setRepondantHash(repondantHash);

        p = participationRepo.save(p);

        ParticipationStartResponse resp = new ParticipationStartResponse();
        resp.setParticipationId(p.getId());
        resp.setSondage(toDetailDto(sondage));
        return resp;
    }

    @Override
    public void submitReponses(ReponseSubmitRequest req, String email) {
        Participation p = participationRepo.findByIdForUpdate(req.getParticipationId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Participation introuvable"));

        Sondage sondage = p.getSondage();

        if (sondage.getStatut() != SondageStatut.ACTIF) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Ce sondage n'accepte plus de réponses"
            );
        }

        if (!isSondageAccessibleNow(sondage)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Ce sondage n'est pas disponible actuellement"
            );
        }

        Medecin medecin = findMedecin(email);

        if (!medecinMatchesAudience(medecin, sondage)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Vous n'êtes pas concerné par ce sondage"
            );
        }

        String expectedHash = buildRepondantHash(sondage.getId(), medecin);

        if (!expectedHash.equals(p.getRepondantHash())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }

        if (p.getStatut() == StatutParticipation.COMPLETE) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Vous avez déjà complété ce sondage");
        }

        List<QuestionDto> questions = deserializeQuestions(sondage.getQuestionsJson());
        validateSubmittedResponses(questions, req.getReponses());

        for (ReponseItemRequest item : req.getReponses()) {
            Reponse r = new Reponse();
            r.setParticipation(p);
            r.setQuestionOrdre(item.getQuestionOrdre());
            r.setValeur(item.getValeur() != null ? item.getValeur().trim() : null);
            reponseRepo.save(r);
        }

        p.setStatut(StatutParticipation.COMPLETE);
        p.setDateSoumission(LocalDateTime.now());

        notificationService.createNotification(
                "NOUVELLE_PARTICIPATION",
                "Nouvelle participation",
                "Un médecin a complété le sondage \"" + sondage.getTitre() + "\".",
                "/admin/sondages/" + sondage.getId(),
                false
        );

        if (sondage.isAnonyme()) {
            p.setMedecin(null);
        }

        participationRepo.save(p);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ParticipationStatusDto> getMesParticipations(String email) {
        Medecin medecin = findMedecin(email);

        return sondageRepo.findAll().stream()
                .map(s -> buildRepondantHash(s.getId(), medecin))
                .flatMap(hash -> participationRepo.findByRepondantHashOrderByDateDebutDesc(hash).stream())
                .sorted(Comparator.comparing(Participation::getDateDebut).reversed())
                .map(this::toParticipationStatusDto)
                .collect(Collectors.toList());
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private SondageStatut parseSondageStatut(String value) {
        if (value == null || value.isBlank()) return null;

        try {
            return SondageStatut.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Statut de sondage invalide : " + value
            );
        }
    }

    private SondageType parseSondageType(String value) {
        if (value == null || value.isBlank()) return null;

        try {
            return SondageType.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Type de sondage invalide : " + value
            );
        }
    }

    private OptionalDouble tryParseDouble(String value) {
        try {
            return OptionalDouble.of(Double.parseDouble(value));
        } catch (NumberFormatException e) {
            return OptionalDouble.empty();
        }
    }

    private void validateSubmittedResponses(List<QuestionDto> questions, List<ReponseItemRequest> reponses) {
        if (questions == null || questions.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ce sondage ne contient aucune question");
        }

        if (reponses == null) {
            reponses = Collections.emptyList();
        }

        Map<Integer, QuestionDto> questionMap = questions.stream()
                .filter(q -> q.getOrdre() != null)
                .collect(Collectors.toMap(
                        QuestionDto::getOrdre,
                        q -> q,
                        (a, b) -> a
                ));

        Set<Integer> seen = new HashSet<>();

        for (ReponseItemRequest item : reponses) {
            if (item.getQuestionOrdre() == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Une réponse ne référence aucune question");
            }

            if (!seen.add(item.getQuestionOrdre())) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Réponse dupliquée pour la question " + item.getQuestionOrdre()
                );
            }

            QuestionDto question = questionMap.get(item.getQuestionOrdre());

            if (question == null) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Question inexistante : " + item.getQuestionOrdre()
                );
            }

            validateOneAnswer(question, item.getValeur());
        }

        for (QuestionDto question : questions) {
            if (!question.isObligatoire()) continue;

            boolean answered = reponses.stream()
                    .anyMatch(r ->
                            Objects.equals(r.getQuestionOrdre(), question.getOrdre())
                                    && r.getValeur() != null
                                    && !r.getValeur().trim().isBlank()
                    );

            if (!answered) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "La question obligatoire \"" + question.getTitre() + "\" doit être renseignée"
                );
            }
        }
    }

    private void validateOneAnswer(QuestionDto question, String rawValue) {
        String value = rawValue != null ? rawValue.trim() : "";

        if (value.isBlank()) {
            if (question.isObligatoire()) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "La question obligatoire \"" + question.getTitre() + "\" doit être renseignée"
                );
            }
            return;
        }

        if (question.getTypeQuestion() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Type de question manquant pour : " + question.getTitre()
            );
        }

        switch (question.getTypeQuestion()) {
            case TEXTE:
                if (value.length() > 5000) {
                    throw new ResponseStatusException(
                            HttpStatus.BAD_REQUEST,
                            "La réponse texte est trop longue pour la question : " + question.getTitre()
                    );
                }
                break;

            case OUI_NON:
                if (!value.equalsIgnoreCase("OUI") && !value.equalsIgnoreCase("NON")) {
                    throw new ResponseStatusException(
                            HttpStatus.BAD_REQUEST,
                            "La réponse doit être OUI ou NON pour : " + question.getTitre()
                    );
                }
                break;

            case NUMERIQUE:
                try {
                    Double.parseDouble(value);
                } catch (NumberFormatException e) {
                    throw new ResponseStatusException(
                            HttpStatus.BAD_REQUEST,
                            "La réponse doit être numérique pour : " + question.getTitre()
                    );
                }
                break;

            case ECHELLE:
                validateScaleAnswer(question, value);
                break;

            case DATE:
                validateDateAnswer(question, value);
                break;

            case CHOIX_UNIQUE:
                validateSingleChoiceAnswer(question, value);
                break;

            case CHOIX_MULTIPLE:
                validateMultipleChoiceAnswer(question, value);
                break;

            default:
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Type de question non supporté : " + question.getTypeQuestion()
                );
        }
    }

    private void validateScaleAnswer(QuestionDto question, String value) {
        int score;

        try {
            score = Integer.parseInt(value);
        } catch (NumberFormatException e) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La réponse doit être un entier pour l'échelle : " + question.getTitre()
            );
        }

        int min = question.getEchelleMin() != null ? question.getEchelleMin() : 1;
        int max = question.getEchelleMax() != null ? question.getEchelleMax() : 5;

        if (score < min || score > max) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La réponse doit être comprise entre " + min + " et " + max
            );
        }
    }

    private void validateDateAnswer(QuestionDto question, String value) {
        try {
            LocalDate.parse(value);
        } catch (Exception e) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La réponse doit être une date valide au format yyyy-MM-dd pour : " + question.getTitre()
            );
        }
    }

    private void validateSingleChoiceAnswer(QuestionDto question, String value) {
        List<String> choix = question.getChoix();

        if (choix == null || choix.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Aucun choix n'est défini pour : " + question.getTitre()
            );
        }

        boolean valid = choix.stream().anyMatch(c -> c.equalsIgnoreCase(value));

        if (!valid) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Choix invalide pour : " + question.getTitre()
            );
        }
    }

    private void validateMultipleChoiceAnswer(QuestionDto question, String value) {
        List<String> choix = question.getChoix();

        if (choix == null || choix.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Aucun choix n'est défini pour : " + question.getTitre()
            );
        }

        List<String> selected = Arrays.stream(value.split(","))
                .map(String::trim)
                .filter(v -> !v.isBlank())
                .collect(Collectors.toList());

        if (selected.isEmpty()) {
            if (question.isObligatoire()) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Veuillez sélectionner au moins un choix pour : " + question.getTitre()
                );
            }
            return;
        }

        for (String selectedValue : selected) {
            boolean valid = choix.stream().anyMatch(c -> c.equalsIgnoreCase(selectedValue));

            if (!valid) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Choix invalide \"" + selectedValue + "\" pour : " + question.getTitre()
                );
            }
        }
    }

    private boolean isSondageAccessibleNow(Sondage s) {
        LocalDateTime now = LocalDateTime.now();
        if (s.getDateDebut() != null && now.isBefore(s.getDateDebut())) return false;
        if (s.getDateFin() != null && now.isAfter(s.getDateFin())) return false;
        return true;
    }

    private void validateDateRange(SondageCreateRequest req) {
        if (req.getDateDebut() != null && req.getDateFin() != null) {
            if (req.getDateFin().isBefore(req.getDateDebut())) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "La date de fin ne peut pas être antérieure à la date de début"
                );
            }
        }
    }

    private Sondage findSondage(Long id) {
        return sondageRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Sondage introuvable"));
    }

    private Medecin findMedecin(String email) {
        return medecinRepo.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Médecin introuvable"));
    }

    private boolean medecinMatchesAudience(Medecin m, Sondage s) {

        if (s.getFiltreStatut() != null && !s.getFiltreStatut().isBlank()) {
            if (m.getStatut() == null || !s.getFiltreStatut().equals(m.getStatut().name())) {
                return false;
            }
        }

        if (s.getFiltreGenre() != null && !s.getFiltreGenre().isBlank()) {
            if (m.getSexe() == null || !s.getFiltreGenre().equalsIgnoreCase(m.getSexe())) {
                return false;
            }
        }

        if (s.getFiltreWilaya() != null && !s.getFiltreWilaya().isBlank()) {
            if (m.getVilleExercice() == null ||
                    !s.getFiltreWilaya().equalsIgnoreCase(m.getVilleExercice())) {
                return false;
            }
        }

        if (s.getFiltreSpecialite() != null && !s.getFiltreSpecialite().isBlank()) {
            boolean matchSpecialite = m.getEducations() != null &&
                    m.getEducations().stream()
                            .filter(e -> e.getSpecialite() != null)
                            .anyMatch(e -> String.valueOf(e.getSpecialite().getId())
                                    .equals(s.getFiltreSpecialite()));

            if (!matchSpecialite) {
                return false;
            }
        }

        return true;
    }

    private List<Medecin> getTargetedMedecins(Sondage s) {
        return medecinRepo.findAll().stream()
                .filter(m -> medecinMatchesAudience(m, s))
                .collect(Collectors.toList());
    }

    private String serializeQuestions(List<QuestionDto> questions) {
        if (questions == null) return "[]";
        try {
            return objectMapper.writeValueAsString(questions);
        } catch (JsonProcessingException e) {
            return "[]";
        }
    }

    private List<QuestionDto> deserializeQuestions(String json) {
        if (json == null || json.isBlank()) return Collections.emptyList();
        try {
            return objectMapper.readValue(json, new TypeReference<List<QuestionDto>>() {});
        } catch (JsonProcessingException e) {
            return Collections.emptyList();
        }
    }

    private SondageListDto toListDto(Sondage s) {
        List<QuestionDto> questions = deserializeQuestions(s.getQuestionsJson());
        long nbParticipants = participationRepo.countBySondageId(s.getId());
        long nbCompletes = participationRepo.countBySondageIdAndStatut(s.getId(), StatutParticipation.COMPLETE);
        double taux = nbParticipants > 0 ? (double) nbCompletes / nbParticipants * 100 : 0;

        SondageListDto dto = new SondageListDto();
        dto.setId(s.getId());
        dto.setTitre(s.getTitre());
        dto.setType(s.getType());
        dto.setStatut(s.getStatut());
        dto.setAnonyme(s.isAnonyme());
        dto.setDateDebut(s.getDateDebut());
        dto.setDateFin(s.getDateFin());
        dto.setDateCreation(s.getDateCreation());
        dto.setNbQuestions(questions.size());
        dto.setNbParticipants(nbParticipants);
        dto.setNbCompletes(nbCompletes);
        dto.setTauxCompletion(taux);
        dto.setResultatsPublies(s.isResultatsPublies());
        return dto;
    }

    private SondageDetailDto toDetailDto(Sondage s) {
        List<QuestionDto> questions = deserializeQuestions(s.getQuestionsJson());

        long nbParticipationsDemarrees = participationRepo.countBySondageId(s.getId());
        long nbCompletes = participationRepo.countBySondageIdAndStatut(s.getId(), StatutParticipation.COMPLETE);

        double taux = nbParticipationsDemarrees > 0
                ? (double) nbCompletes / nbParticipationsDemarrees * 100
                : 0;

        SondageDetailDto dto = new SondageDetailDto();
        dto.setId(s.getId());
        dto.setTitre(s.getTitre());
        dto.setDescription(s.getDescription());
        dto.setType(s.getType());
        dto.setStatut(s.getStatut());
        dto.setAnonyme(s.isAnonyme());
        dto.setDateDebut(s.getDateDebut());
        dto.setDateFin(s.getDateFin());
        dto.setDateCreation(s.getDateCreation());
        dto.setDatePublication(s.getDatePublication());
        dto.setCommentaireValidation(s.getCommentaireValidation());
        dto.setFiltreSpecialite(s.getFiltreSpecialite());
        dto.setFiltreWilaya(s.getFiltreWilaya());
        dto.setFiltreStatut(s.getFiltreStatut());
        dto.setFiltreGenre(s.getFiltreGenre());

        dto.setNbQuestions(questions.size());
        dto.setQuestions(questions);

        dto.setNbParticipationsDemarrees(nbParticipationsDemarrees);
        dto.setNbParticipants(nbCompletes);
        dto.setNbCompletes(nbCompletes);
        dto.setTauxCompletion(taux);
        dto.setResultatsPublies(s.isResultatsPublies());

        return dto;
    }

    private MedecinSondageDto toMedecinSondageDto(Sondage s, String email) {
        Medecin medecin = findMedecin(email);

        List<QuestionDto> questions = deserializeQuestions(s.getQuestionsJson());
        String repondantHash = buildRepondantHash(s.getId(), medecin);

        Optional<Participation> participation =
                participationRepo.findBySondageIdAndRepondantHash(s.getId(), repondantHash);

        MedecinSondageDto dto = new MedecinSondageDto();
        dto.setId(s.getId());
        dto.setTitre(s.getTitre());
        dto.setDescription(s.getDescription());
        dto.setType(s.getType());
        dto.setStatut(s.getStatut());
        dto.setAnonyme(s.isAnonyme());
        dto.setDateDebut(s.getDateDebut());
        dto.setDateFin(s.getDateFin());
        dto.setNbQuestions(questions.size());
        dto.setQuestions(questions);
        dto.setResultatsPublies(s.isResultatsPublies());
        participation.ifPresent(p -> dto.setParticipation(toParticipationStatusDto(p)));

        return dto;
    }

    private ParticipationStatusDto toParticipationStatusDto(Participation p) {
        ParticipationStatusDto dto = new ParticipationStatusDto();
        dto.setId(p.getId());
        dto.setStatut(p.getStatut());
        dto.setDateDebut(p.getDateDebut());
        dto.setDateSoumission(p.getDateSoumission());
        return dto;
    }

    private String buildRepondantHash(Long sondageId, Medecin medecin) {
        String raw = sondageId + ":" + medecin.getId() + ":" + medecin.getEmail() + ":" + sondageHashSecret;

        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] encoded = digest.digest(raw.getBytes(StandardCharsets.UTF_8));

            StringBuilder hex = new StringBuilder();
            for (byte b : encoded) {
                hex.append(String.format("%02x", b));
            }

            return hex.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erreur de génération du hash répondant");
        }
    }

    private Optional<Participation> findExistingParticipation(Sondage sondage, Medecin medecin) {
        String hash = buildRepondantHash(sondage.getId(), medecin);
        return participationRepo.findBySondageIdAndRepondantHash(sondage.getId(), hash);
    }
}
