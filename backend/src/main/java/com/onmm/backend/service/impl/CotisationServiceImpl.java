package com.onmm.backend.service.impl;

import com.onmm.backend.dto.cotisation.CotisationDto;
import com.onmm.backend.dto.cotisation.InitierPaiementResponse;
import com.onmm.backend.entity.Cotisation;
import com.onmm.backend.entity.Medecin;
import com.onmm.backend.entity.enums.StatutCotisation;
import com.onmm.backend.entity.enums.StatutMedecin;
import com.onmm.backend.repository.CotisationRepository;
import com.onmm.backend.repository.MedecinRepository;
import com.onmm.backend.service.CotisationService;
import com.onmm.backend.service.NotificationService;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Random;
import java.util.UUID;

@Service
public class CotisationServiceImpl implements CotisationService {

    private static final BigDecimal MONTANT_ANNUEL = new BigDecimal("5000.00");
    private final CotisationRepository cotisationRepository;
    private final MedecinRepository medecinRepository;
    private final NotificationService notificationService;

    public CotisationServiceImpl(CotisationRepository cotisationRepository,
                                 MedecinRepository medecinRepository,
                                 NotificationService notificationService) {
        this.cotisationRepository = cotisationRepository;
        this.medecinRepository = medecinRepository;
        this.notificationService = notificationService;
    }

    @Override
    public List<CotisationDto> getMyCotisations(String email) {
        return cotisationRepository.findByMedecinEmailOrderByAnneeDesc(email)
                .stream().map(this::toDto).toList();
    }

    @Override
    @Transactional
    public CotisationDto getCotisationCourante(String email) {
        int currentYear = LocalDate.now().getYear();
        return cotisationRepository.findByMedecinEmailAndAnnee(email, currentYear)
                .map(this::toDto)
                .orElseGet(() -> {
                    // Auto-create if doctor is ACTIF and none exists yet
                    Medecin medecin = medecinRepository.findByEmail(email)
                            .orElseThrow(() -> new RuntimeException("Médecin introuvable"));
                    if (medecin.getStatut() == StatutMedecin.ACTIF) {
                        Cotisation c = createCotisationFor(medecin, currentYear);
                        return toDto(cotisationRepository.save(c));
                    }
                    return null;
                });
    }

    @Override
    @Transactional
    public InitierPaiementResponse initierPaiement(String email, Long cotisationId) {
        Cotisation cotisation = getCotisationOwned(email, cotisationId);

        if (cotisation.getStatut() == StatutCotisation.PAYEE) {
            throw new RuntimeException("Cette cotisation est déjà payée.");
        }

        String code = String.format("%04d", new Random().nextInt(10000));
        String reference = "BKLY-" + cotisation.getAnnee() + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        cotisation.setCodeTransaction(code);
        cotisation.setReferenceBankily(reference);
        cotisationRepository.save(cotisation);

        InitierPaiementResponse resp = new InitierPaiementResponse();
        resp.setCotisationId(cotisationId);
        resp.setCodeTransaction(code);
        resp.setReferenceBankily(reference);
        resp.setMontant(cotisation.getMontant());
        resp.setMessage("Utilisez le code ci-dessous pour confirmer votre paiement via B-pay Bankily.");
        return resp;
    }

    @Override
    @Transactional
    public CotisationDto confirmerPaiement(String email, Long cotisationId, String codeTransaction) {
        Cotisation cotisation = getCotisationOwned(email, cotisationId);

        if (cotisation.getStatut() == StatutCotisation.PAYEE) {
            throw new RuntimeException("Cette cotisation est déjà payée.");
        }
        if (cotisation.getCodeTransaction() == null || !cotisation.getCodeTransaction().equals(codeTransaction)) {
            throw new RuntimeException("Code de transaction invalide.");
        }

        cotisation.setStatut(StatutCotisation.PAYEE);
        cotisation.setDatePaiement(LocalDate.now());
        cotisationRepository.save(cotisation);

        notificationService.createMedecinNotification(
                email,
                "COTISATION_CONFIRMEE",
                "Cotisation " + cotisation.getAnnee() + " payée",
                "Votre paiement de " + cotisation.getMontant() + " MRU a été confirmé via Bankily B-pay. Référence : " + cotisation.getReferenceBankily(),
                "/medecin/cotisation",
                false
        );

        Medecin medecin = cotisation.getMedecin();
        notificationService.createNotification(
                "COTISATION_PAYEE",
                "Paiement de cotisation reçu",
                "Dr. " + medecin.getPrenom() + " " + medecin.getNom() +
                " a réglé sa cotisation " + cotisation.getAnnee() +
                " — " + cotisation.getMontant() + " MRU (réf. " + cotisation.getReferenceBankily() + ")",
                "/admin/cotisations",
                false
        );

        return toDto(cotisation);
    }

    @Override
    @Transactional
    public void createAnnualCotisations() {
        int year = LocalDate.now().getYear();
        List<Medecin> actifs = medecinRepository.findAllByStatut(StatutMedecin.ACTIF);
        for (Medecin medecin : actifs) {
            if (!cotisationRepository.existsByMedecinEmailAndAnnee(medecin.getEmail(), year)) {
                cotisationRepository.save(createCotisationFor(medecin, year));
            }
        }
    }

    @Override
    @Transactional
    public void sendReminderNotifications() {
        LocalDate reminderDate = LocalDate.now().plusDays(14);
        List<Cotisation> dueSoon = cotisationRepository.findByStatutAndDateEcheance(
                StatutCotisation.EN_ATTENTE, reminderDate);
        for (Cotisation c : dueSoon) {
            notificationService.createMedecinNotification(
                    c.getMedecin().getEmail(),
                    "COTISATION_RAPPEL",
                    "Rappel : cotisation " + c.getAnnee() + " due dans 14 jours",
                    "Votre cotisation annuelle de " + c.getMontant() + " MRU est due le " + c.getDateEcheance() + ". Payez depuis votre espace cotisation.",
                    "/medecin/cotisation",
                    true
            );
        }
    }

    private Cotisation createCotisationFor(Medecin medecin, int year) {
        Cotisation c = new Cotisation();
        c.setMedecin(medecin);
        c.setAnnee(year);
        c.setMontant(MONTANT_ANNUEL);
        c.setStatut(StatutCotisation.EN_ATTENTE);
        LocalDate dateApprouvement = medecin.getDateApprouvement();
        c.setDateEcheance(dateApprouvement != null
                ? dateApprouvement.withYear(year)
                : LocalDate.of(year, 3, 31));
        c.setCreatedAt(LocalDateTime.now());
        return c;
    }

    private Cotisation getCotisationOwned(String email, Long cotisationId) {
        Cotisation c = cotisationRepository.findById(cotisationId)
                .orElseThrow(() -> new RuntimeException("Cotisation introuvable"));
        if (!c.getMedecin().getEmail().equals(email)) {
            throw new RuntimeException("Accès refusé");
        }
        return c;
    }

    private CotisationDto toDto(Cotisation c) {
        CotisationDto dto = new CotisationDto();
        dto.setId(c.getId());
        dto.setAnnee(c.getAnnee());
        dto.setMontant(c.getMontant());
        dto.setStatut(c.getStatut().name());
        dto.setDateEcheance(c.getDateEcheance() != null ? c.getDateEcheance().toString() : null);
        dto.setDatePaiement(c.getDatePaiement() != null ? c.getDatePaiement().toString() : null);
        dto.setReferenceBankily(c.getReferenceBankily());
        if (c.getStatut() != StatutCotisation.PAYEE && c.getDateEcheance() != null) {
            dto.setJoursRestants(ChronoUnit.DAYS.between(LocalDate.now(), c.getDateEcheance()));
        }
        return dto;
    }
}
