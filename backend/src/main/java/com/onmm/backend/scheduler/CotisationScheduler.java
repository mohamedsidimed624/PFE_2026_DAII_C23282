package com.onmm.backend.scheduler;

import com.onmm.backend.service.CotisationService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class CotisationScheduler {

    private final CotisationService cotisationService;

    public CotisationScheduler(CotisationService cotisationService) {
        this.cotisationService = cotisationService;
    }

    // Every January 1st at 00:05 — create cotisations for all active doctors
    @Scheduled(cron = "0 5 0 1 1 *")
    public void createAnnualCotisations() {
        cotisationService.createAnnualCotisations();
    }

    // Every day at 08:00 — send 14-day reminder notifications
    @Scheduled(cron = "0 0 8 * * *")
    public void sendReminderNotifications() {
        cotisationService.sendReminderNotifications();
    }
}
