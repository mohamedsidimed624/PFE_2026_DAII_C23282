package com.onmm.backend.config;

import com.onmm.backend.entity.Candidature;
import com.onmm.backend.entity.Election;
import com.onmm.backend.entity.Medecin;
import com.onmm.backend.entity.PositionElectorale;
import com.onmm.backend.entity.Vote;
import com.onmm.backend.entity.enums.CorpsElectoral;
import com.onmm.backend.entity.enums.ElectionNiveau;
import com.onmm.backend.entity.enums.ElectionStatut;
import com.onmm.backend.entity.enums.ElectionType;
import com.onmm.backend.entity.enums.SectionOrdre;
import com.onmm.backend.entity.enums.StatutCandidature;
import com.onmm.backend.repository.CandidatureRepository;
import com.onmm.backend.repository.ElectionRepository;
import com.onmm.backend.repository.MedecinRepository;
import com.onmm.backend.repository.PositionElectoraleRepository;
import com.onmm.backend.repository.VoteRepository;
import com.onmm.backend.service.election.crypto.BallotCryptoService;
import com.onmm.backend.service.election.crypto.HashingService;
import com.onmm.backend.service.election.crypto.SignatureService;
import com.onmm.backend.service.election.key.KeyManagementService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Component
@Order(Ordered.LOWEST_PRECEDENCE)
public class ElectionTestDataSeeder implements CommandLineRunner {

    private static final String BUREAU_TITLE = "Election test - Bureau Executif 2026-2029";
    private static final String SECTION_A_TITLE = "Election test - Bureau Section A 2026-2029";
    private static final List<String> POSTES_BUREAU = List.of(
            "President",
            "Vice-President",
            "Secretaire General",
            "Secretaire General Adjoint",
            "Tresorier",
            "Tresorier Adjoint",
            "Assesseur 1",
            "Assesseur 2"
    );

    private final ElectionRepository electionRepo;
    private final PositionElectoraleRepository positionRepo;
    private final CandidatureRepository candidatureRepo;
    private final MedecinRepository medecinRepo;
    private final VoteRepository voteRepo;
    private final KeyManagementService keyManagementService;
    private final BallotCryptoService ballotCryptoService;
    private final HashingService hashingService;
    private final SignatureService signatureService;

    @Value("${app.seed.test-elections.enabled:true}")
    private boolean enabled;

    @Value("${app.election.master-secret}")
    private String masterSecret;

    public ElectionTestDataSeeder(ElectionRepository electionRepo,
                                  PositionElectoraleRepository positionRepo,
                                  CandidatureRepository candidatureRepo,
                                  MedecinRepository medecinRepo,
                                  VoteRepository voteRepo,
                                  KeyManagementService keyManagementService,
                                  BallotCryptoService ballotCryptoService,
                                  HashingService hashingService,
                                  SignatureService signatureService) {
        this.electionRepo = electionRepo;
        this.positionRepo = positionRepo;
        this.candidatureRepo = candidatureRepo;
        this.medecinRepo = medecinRepo;
        this.voteRepo = voteRepo;
        this.keyManagementService = keyManagementService;
        this.ballotCryptoService = ballotCryptoService;
        this.hashingService = hashingService;
        this.signatureService = signatureService;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (!enabled || medecinRepo.findByEmail("medecin001@onmm-test.mr").isEmpty()) {
            return;
        }

        seedBureauExecutif();
        seedSectionA();
    }

    private void seedBureauExecutif() {
        if (electionRepo.existsByTitre(BUREAU_TITLE)) {
            return;
        }

        Election election = createElection(
                BUREAU_TITLE,
                "Election de test du Bureau Executif avec resultats publies, trois candidatures par poste et votes de demonstration.",
                ElectionType.BUREAU_EXECUTIF,
                ElectionNiveau.NATIONAL,
                CorpsElectoral.TOUS_MEDECINS_ACTIFS,
                ElectionStatut.RESULTATS_PUBLIES,
                true
        );

        List<PositionElectorale> positions = createPositions(election);
        List<Medecin> candidates = loadTestMedecins(1, 24);
        Map<Long, List<Candidature>> candidaturesByPosition = createCandidatures(election, positions, candidates);

        keyManagementService.generateElectionKeyPair(election.getId());
        List<Medecin> voters = loadTestMedecins(25, 64);
        seedBureauVotes(election, positions, candidaturesByPosition, voters);
    }

    private void seedSectionA() {
        if (electionRepo.existsByTitre(SECTION_A_TITLE)) {
            return;
        }

        Election election = createElection(
                SECTION_A_TITLE,
                "Election de test du Bureau de la Section A, ouverte au vote pour les medecins generalistes.",
                ElectionType.BUREAU_SECTION_A,
                ElectionNiveau.SECTION,
                CorpsElectoral.CONSEIL_SECTION_A,
                ElectionStatut.VOTE_EN_COURS,
                false
        );

        List<PositionElectorale> positions = createPositions(election);
        List<Medecin> candidates = loadGeneralistes(24);
        createCandidatures(election, positions, candidates);
        keyManagementService.generateElectionKeyPair(election.getId());
    }

    private Election createElection(String titre,
                                    String description,
                                    ElectionType type,
                                    ElectionNiveau niveau,
                                    CorpsElectoral corps,
                                    ElectionStatut statut,
                                    boolean resultatsPublies) {
        LocalDateTime now = LocalDateTime.now().truncatedTo(ChronoUnit.SECONDS);

        Election election = new Election();
        election.setTitre(titre);
        election.setDescription(description);
        election.setType(type);
        election.setStatut(statut);
        election.setNiveau(niveau);
        election.setSeatsCount(POSTES_BUREAU.size());
        election.setMaxVotesParElecteur(POSTES_BUREAU.size());
        election.setCandidatureStartDate(now.minusDays(45));
        election.setCandidatureEndDate(now.minusDays(25));
        election.setVoteStartDate(now.minusDays(10));
        election.setVoteEndDate(resultatsPublies ? now.minusDays(2) : now.plusDays(10));
        election.setDateCreation(now.minusDays(50));
        election.setResultatsPublies(resultatsPublies);
        election.setCorpsElectoral(corps);
        election.setQuorumPourcentage(10.0);
        election.setPresetCode(type.name());

        return electionRepo.saveAndFlush(election);
    }

    private List<PositionElectorale> createPositions(Election election) {
        List<PositionElectorale> positions = new ArrayList<>();
        for (int i = 0; i < POSTES_BUREAU.size(); i++) {
            PositionElectorale position = new PositionElectorale();
            position.setElection(election);
            position.setLibelle(POSTES_BUREAU.get(i));
            position.setOrdre(i + 1);
            position.setNombreSieges(1);
            position.setMaxVotesParElecteur(1);
            position.setActif(true);
            positions.add(position);
        }
        return positionRepo.saveAllAndFlush(positions);
    }

    private Map<Long, List<Candidature>> createCandidatures(Election election,
                                                            List<PositionElectorale> positions,
                                                            List<Medecin> candidates) {
        if (candidates.size() < positions.size() * 3) {
            throw new IllegalStateException("Pas assez de medecins de test pour creer les candidatures election.");
        }

        List<Candidature> candidatures = new ArrayList<>();
        int candidateIndex = 0;
        for (PositionElectorale position : positions) {
            for (int rank = 1; rank <= 3; rank++) {
                Medecin medecin = candidates.get(candidateIndex++);
                Candidature candidature = new Candidature();
                candidature.setElection(election);
                candidature.setMedecin(medecin);
                candidature.setPosition(position);
                candidature.setStatut(StatutCandidature.VALIDEE);
                candidature.setDeclarationCandidature("Candidature test au poste " + position.getLibelle() + ".");
                candidature.setProgrammeElectoral("Programme test: gouvernance, transparence, formation continue et modernisation numerique.");
                candidature.setDateDepot(LocalDateTime.now().minusDays(30).plusHours(rank));
                candidature.setDateValidation(LocalDateTime.now().minusDays(22).plusHours(rank));
                candidatures.add(candidature);
            }
        }

        return candidatureRepo.saveAllAndFlush(candidatures)
                .stream()
                .collect(Collectors.groupingBy(c -> c.getPosition().getId()));
    }

    private void seedBureauVotes(Election election,
                                 List<PositionElectorale> positions,
                                 Map<Long, List<Candidature>> candidaturesByPosition,
                                 List<Medecin> voters) {
        List<Vote> votes = new ArrayList<>();

        for (int voterIndex = 0; voterIndex < voters.size(); voterIndex++) {
            Medecin voter = voters.get(voterIndex);
            String voterToken = buildVoterToken(election.getId(), voter);
            LocalDateTime timestamp = LocalDateTime.now()
                    .minusDays(7)
                    .plusMinutes(voterIndex)
                    .truncatedTo(ChronoUnit.MICROS);

            for (PositionElectorale position : positions) {
                Candidature selected = selectCandidate(candidaturesByPosition.get(position.getId()), voterIndex);
                votes.add(buildVote(election, position, selected, voterToken, timestamp));
            }
        }

        voteRepo.saveAllAndFlush(votes);
    }

    private Candidature selectCandidate(List<Candidature> candidatures, int voterIndex) {
        if (voterIndex < 20) {
            return candidatures.get(0);
        }
        if (voterIndex < 32) {
            return candidatures.get(1);
        }
        return candidatures.get(2);
    }

    private Vote buildVote(Election election,
                           PositionElectorale position,
                           Candidature candidature,
                           String voterToken,
                           LocalDateTime timestamp) {
        String encryptedChoice = ballotCryptoService.encryptChoice(candidature.getId(), election.getId());
        String voteHash = hashingService.buildVoteHash(election.getId(), voterToken, encryptedChoice, timestamp);
        String ballotSignature = signatureService.signBallot(encryptedChoice, voterToken, timestamp);

        Vote vote = new Vote();
        vote.setElection(election);
        vote.setPositionElectorale(position);
        vote.setEncryptedChoice(encryptedChoice);
        vote.setVoterToken(voterToken);
        vote.setVoteHash(voteHash);
        vote.setBallotSignature(ballotSignature);
        vote.setDateVote(timestamp);
        return vote;
    }

    private List<Medecin> loadTestMedecins(int fromInclusive, int toInclusive) {
        return IntStream.rangeClosed(fromInclusive, toInclusive)
                .mapToObj(n -> medecinRepo.findByEmail("medecin" + String.format("%03d", n) + "@onmm-test.mr")
                        .orElseThrow(() -> new IllegalStateException("Medecin de test manquant: " + n)))
                .collect(Collectors.toList());
    }

    private List<Medecin> loadGeneralistes(int limit) {
        List<Medecin> generalistes = IntStream.rangeClosed(1, 100)
                .mapToObj(n -> medecinRepo.findByEmail("medecin" + String.format("%03d", n) + "@onmm-test.mr"))
                .flatMap(java.util.Optional::stream)
                .filter(m -> m.getSectionOrdre() == SectionOrdre.GENERALISTE)
                .limit(limit)
                .collect(Collectors.toList());

        if (generalistes.size() < limit) {
            throw new IllegalStateException("Pas assez de medecins generalistes de test pour l'election Section A.");
        }
        return generalistes;
    }

    private String buildVoterToken(Long electionId, Medecin medecin) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(masterSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] bytes = mac.doFinal((electionId + ":" + medecin.getId()).getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(bytes);
        } catch (Exception ex) {
            throw new RuntimeException("HMAC-SHA256 unavailable", ex);
        }
    }
}
