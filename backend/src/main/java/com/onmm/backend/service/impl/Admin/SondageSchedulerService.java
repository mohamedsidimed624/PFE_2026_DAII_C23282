package com.onmm.backend.service.impl.Admin;

import com.onmm.backend.entity.Sondage;
import com.onmm.backend.entity.enums.SondageStatut;
import com.onmm.backend.repository.SondageRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class SondageSchedulerService {

    private final SondageRepository sondageRepository;

    public SondageSchedulerService(SondageRepository sondageRepository) {
        this.sondageRepository = sondageRepository;
    }

    @Scheduled(cron = "0 */10 * * * *")
    @Transactional
    public void updateSondageStatuses() {
        LocalDateTime now = LocalDateTime.now();

        List<Sondage> toActivate =
                sondageRepository.findByStatutAndDateDebutLessThanEqual(
                        SondageStatut.PLANIFIE,
                        now
                );

        for (Sondage sondage : toActivate) {
            if (sondage.getDateFin() == null || !now.isAfter(sondage.getDateFin())) {
                sondage.setStatut(SondageStatut.ACTIF);
            }
        }

        List<Sondage> toClose =
                sondageRepository.findByStatutAndDateFinLessThan(
                        SondageStatut.ACTIF,
                        now
                );

        for (Sondage sondage : toClose) {
            sondage.setStatut(SondageStatut.CLOS);
        }

        sondageRepository.saveAll(toActivate);
        sondageRepository.saveAll(toClose);
    }
}