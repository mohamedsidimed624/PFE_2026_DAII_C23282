package com.onmm.backend.scheduler;

import com.onmm.backend.entity.Candidature;
import com.onmm.backend.entity.Election;
import com.onmm.backend.entity.PositionElectorale;
import com.onmm.backend.entity.enums.CorpsElectoral;
import com.onmm.backend.entity.enums.ElectionStatut;
import com.onmm.backend.entity.enums.StatutCandidature;
import com.onmm.backend.entity.enums.StatutMedecin;
import com.onmm.backend.repository.CandidatureRepository;
import com.onmm.backend.repository.ElectionRepository;
import com.onmm.backend.repository.MedecinRepository;
import com.onmm.backend.repository.PositionElectoraleRepository;
import com.onmm.backend.service.election.ElectionAuditService;
import com.onmm.backend.service.election.key.KeyManagementService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ElectionSchedulerService {

    private final ElectionRepository electionRepo;
    private final CandidatureRepository candidatureRepo;
    private final PositionElectoraleRepository positionRepo;
    private final MedecinRepository medecinRepo;
    private final ElectionAuditService electionAuditService;
    private final KeyManagementService keyManagementService;

    public ElectionSchedulerService(
            ElectionRepository electionRepo,
            CandidatureRepository candidatureRepo,
            PositionElectoraleRepository positionRepo,
            MedecinRepository medecinRepo,
            ElectionAuditService electionAuditService,
            KeyManagementService keyManagementService
    ) {
        this.electionRepo = electionRepo;
        this.candidatureRepo = candidatureRepo;
        this.positionRepo = positionRepo;
        this.medecinRepo = medecinRepo;
        this.electionAuditService = electionAuditService;
        this.keyManagementService = keyManagementService;
    }

    @Scheduled(fixedRate = 60000)
    @Transactional
    public void advanceElectionStatuses() {
        LocalDateTime now = LocalDateTime.now();

        openCandidaturesIfReady(now);
        closeCandidaturesIfReady(now);
        openVoteIfReady(now);
        closeVoteIfReady(now);
    }

    private void openCandidaturesIfReady(LocalDateTime now) {
        List<Election> elections = electionRepo.findByStatutAndCandidatureStartDateLessThanEqual(
                ElectionStatut.BROUILLON,
                now
        );

        for (Election e : elections) {
            try {
                validateBeforeAutoOpenCandidatures(e, now);

                e.setStatut(ElectionStatut.CANDIDATURE_OUVERTE);
                electionRepo.save(e);

                audit(
                        e,
                        "AUTO_CANDIDATURES_OUVERTES",
                        "Les candidatures ont été ouvertes automatiquement.",
                        "INFO"
                );
            } catch (Exception ex) {
                audit(
                        e,
                        "AUTO_CANDIDATURES_OUVERTES_BLOQUEE",
                        ex.getMessage(),
                        "WARN"
                );
            }
        }
    }

    private void closeCandidaturesIfReady(LocalDateTime now) {
        List<Election> elections = electionRepo.findByStatutAndCandidatureEndDateLessThan(
                ElectionStatut.CANDIDATURE_OUVERTE,
                now
        );

        for (Election e : elections) {
            e.setStatut(ElectionStatut.VALIDATION_CANDIDATURES);
            electionRepo.save(e);

            audit(
                    e,
                    "AUTO_CANDIDATURES_CLOTUREES",
                    "Les candidatures ont été clôturées automatiquement.",
                    "INFO"
            );
        }
    }

    private void openVoteIfReady(LocalDateTime now) {
        List<Election> elections = electionRepo.findByStatutAndVoteStartDateLessThanEqual(
                ElectionStatut.VALIDATION_CANDIDATURES,
                now
        );

        for (Election e : elections) {
            try {
                validateBeforeAutoOpenVote(e, now);

                e.setStatut(ElectionStatut.VOTE_EN_COURS);
                electionRepo.save(e);

                // Génère la paire RSA-2048 de cette élection — sans cela, aucun bulletin ne
                // pourrait être chiffré (bug pré-existant : ce point d'entrée automatique
                // n'appelait jamais la génération de clé, contrairement à ouvrirVotes() côté admin).
                keyManagementService.generateElectionKeyPair(e.getId());

                audit(
                        e,
                        "AUTO_VOTE_OUVERT",
                        "Le vote a été ouvert automatiquement.",
                        "CRITICAL"
                );
            } catch (Exception ex) {
                audit(
                        e,
                        "AUTO_VOTE_OUVERT_BLOQUE",
                        ex.getMessage(),
                        "WARN"
                );
            }
        }
    }

    private void closeVoteIfReady(LocalDateTime now) {
        List<Election> elections = electionRepo.findByStatutAndVoteEndDateLessThan(
                ElectionStatut.VOTE_EN_COURS,
                now
        );

        for (Election e : elections) {
            e.setStatut(ElectionStatut.DEPOUILLEMENT);
            electionRepo.save(e);

            audit(
                    e,
                    "AUTO_VOTE_CLOTURE",
                    "Le vote a été clôturé automatiquement. L'élection est passée en dépouillement.",
                    "CRITICAL"
            );
        }
    }

    private void validateBeforeAutoOpenCandidatures(Election e, LocalDateTime now) {
        if (e.getTitre() == null || e.getTitre().isBlank()) {
            throw new IllegalStateException("Titre manquant");
        }

        if (e.getType() == null) {
            throw new IllegalStateException("Type d'élection manquant");
        }

        if (e.getNiveau() == null) {
            throw new IllegalStateException("Niveau d'élection manquant");
        }

        if (e.getCorpsElectoral() == null) {
            throw new IllegalStateException("Corps électoral manquant");
        }

        if (e.getCandidatureStartDate() == null || e.getCandidatureEndDate() == null) {
            throw new IllegalStateException("Dates de candidature manquantes");
        }

        if (e.getVoteStartDate() == null || e.getVoteEndDate() == null) {
            throw new IllegalStateException("Dates de vote manquantes");
        }

        if (!e.getCandidatureEndDate().isAfter(e.getCandidatureStartDate())) {
            throw new IllegalStateException("Dates de candidature incohérentes");
        }

        if (e.getVoteStartDate().isBefore(e.getCandidatureEndDate())) {
            throw new IllegalStateException("Le vote commence avant la fin des candidatures");
        }

        if (!e.getVoteEndDate().isAfter(e.getVoteStartDate())) {
            throw new IllegalStateException("Dates de vote incohérentes");
        }

        if (!now.isBefore(e.getCandidatureEndDate())) {
            throw new IllegalStateException("La date de fin des candidatures est déjà dépassée");
        }

        if (e.getSeatsCount() < 1) {
            throw new IllegalStateException("Nombre de sièges invalide");
        }

        if (e.getMaxVotesParElecteur() < 1) {
            throw new IllegalStateException("Nombre de votes par électeur invalide");
        }

        if (e.getMaxVotesParElecteur() > e.getSeatsCount()) {
            throw new IllegalStateException("Votes par électeur supérieur au nombre de sièges");
        }

        if (e.getCorpsElectoral() == CorpsElectoral.MEDECINS_REGION) {
            if (e.getRegion() == null || e.getRegion().isBlank()) {
                throw new IllegalStateException("Région obligatoire pour une élection régionale");
            }

            long nbEligibles = medecinRepo.countByStatutAndVilleExerciceIgnoreCase(
                    StatutMedecin.ACTIF,
                    e.getRegion()
            );

            if (nbEligibles == 0) {
                throw new IllegalStateException("Aucun médecin éligible trouvé pour la région");
            }
        }

        validatePositionsBeforeAutoOpenCandidatures(e);
    }

    private void validatePositionsBeforeAutoOpenCandidatures(Election e) {
        List<PositionElectorale> positions = positionRepo.findByElectionIdOrderByOrdreAsc(e.getId())
                .stream()
                .filter(PositionElectorale::isActif)
                .collect(Collectors.toList());

        for (PositionElectorale position : positions) {
            if (position.getLibelle() == null || position.getLibelle().isBlank()) {
                throw new IllegalStateException("Poste électoral avec libellé vide");
            }

            if (position.getNombreSieges() < 1) {
                throw new IllegalStateException(
                        "Nombre de sièges invalide pour le poste " + position.getLibelle()
                );
            }

            if (position.getMaxVotesParElecteur() < 1) {
                throw new IllegalStateException(
                        "Nombre de votes invalide pour le poste " + position.getLibelle()
                );
            }

            if (position.getMaxVotesParElecteur() > position.getNombreSieges()) {
                throw new IllegalStateException(
                        "Votes par électeur supérieur au nombre de sièges pour le poste "
                                + position.getLibelle()
                );
            }
        }
    }

    private void validateBeforeAutoOpenVote(Election e, LocalDateTime now) {
        if (e.getVoteStartDate() == null || e.getVoteEndDate() == null) {
            throw new IllegalStateException("Dates de vote manquantes");
        }

        if (!now.isBefore(e.getVoteEndDate())) {
            throw new IllegalStateException("La date de fin du vote est déjà dépassée");
        }

        long candidaturesEnAttente = candidatureRepo.findByElectionId(e.getId())
                .stream()
                .filter(c ->
                        c.getStatut() == StatutCandidature.SOUMISE
                                || c.getStatut() == StatutCandidature.EN_REVUE
                )
                .count();

        if (candidaturesEnAttente > 0) {
            throw new IllegalStateException(
                    "Des candidatures sont encore en attente de validation"
            );
        }

        List<PositionElectorale> positions = positionRepo.findByElectionIdOrderByOrdreAsc(e.getId())
                .stream()
                .filter(PositionElectorale::isActif)
                .collect(Collectors.toList());

        if (positions.isEmpty()) {
            validateElectionWithoutPositionsBeforeAutoVote(e);
        } else {
            validateElectionWithPositionsBeforeAutoVote(e, positions);
        }
    }

    private void validateElectionWithoutPositionsBeforeAutoVote(Election e) {
        long nbValides = candidatureRepo.countByElectionIdAndStatut(
                e.getId(),
                StatutCandidature.VALIDEE
        );

        if (nbValides == 0) {
            throw new IllegalStateException("Aucune candidature validée");
        }

        if (e.getSeatsCount() < 1) {
            throw new IllegalStateException("Nombre de sièges invalide");
        }

        if (e.getMaxVotesParElecteur() < 1) {
            throw new IllegalStateException("Nombre de votes par électeur invalide");
        }

        if (e.getMaxVotesParElecteur() > e.getSeatsCount()) {
            throw new IllegalStateException("Votes par électeur supérieur au nombre de sièges");
        }
    }

    private void validateElectionWithPositionsBeforeAutoVote(
            Election e,
            List<PositionElectorale> positions
    ) {
        List<Candidature> candidaturesValidees = candidatureRepo.findByElectionIdAndStatut(
                e.getId(),
                StatutCandidature.VALIDEE
        );

        if (candidaturesValidees.isEmpty()) {
            throw new IllegalStateException("Aucune candidature validée");
        }

        for (PositionElectorale position : positions) {
            long nbCandidatsDuPoste = candidaturesValidees.stream()
                    .filter(c -> c.getPosition() != null)
                    .filter(c -> c.getPosition().getId().equals(position.getId()))
                    .count();

            if (nbCandidatsDuPoste == 0) {
                throw new IllegalStateException(
                        "Aucun candidat validé pour le poste " + position.getLibelle()
                );
            }

            if (position.getNombreSieges() < 1) {
                throw new IllegalStateException(
                        "Nombre de sièges invalide pour le poste " + position.getLibelle()
                );
            }

            if (position.getMaxVotesParElecteur() < 1) {
                throw new IllegalStateException(
                        "Nombre de votes invalide pour le poste " + position.getLibelle()
                );
            }

            if (position.getMaxVotesParElecteur() > position.getNombreSieges()) {
                throw new IllegalStateException(
                        "Votes par électeur supérieur au nombre de sièges pour le poste "
                                + position.getLibelle()
                );
            }
        }
    }

    private void audit(Election e, String action, String details, String severity) {
        electionAuditService.save(e, action, "SYSTEME", "SYSTEME", details, severity, "Election", e.getId());
    }
}
