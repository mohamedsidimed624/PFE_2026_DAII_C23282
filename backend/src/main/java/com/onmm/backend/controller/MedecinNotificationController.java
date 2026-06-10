package com.onmm.backend.controller;

import com.onmm.backend.dto.NotificationDTO;
import com.onmm.backend.entity.UserPrincipal;
import com.onmm.backend.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/medecin/notifications")
public class MedecinNotificationController {

    private final NotificationService notificationService;

    public MedecinNotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    private String currentEmail(Authentication auth) {
        return ((UserPrincipal) auth.getPrincipal()).getUser().getEmail();
    }

    @GetMapping
    public List<NotificationDTO> getMyNotifications(Authentication authentication) {
        return notificationService.getMedecinNotifications(currentEmail(authentication));
    }

    @GetMapping("/unread-count")
    public Map<String, Long> getUnreadCount(Authentication authentication) {
        return Map.of("count", notificationService.getMedecinUnreadCount(currentEmail(authentication)));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id, Authentication authentication) {
        notificationService.markMedecinNotifAsRead(currentEmail(authentication), id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(Authentication authentication) {
        notificationService.markAllMedecinNotifsAsRead(currentEmail(authentication));
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long id, Authentication authentication) {
        notificationService.deleteMedecinNotif(currentEmail(authentication), id);
        return ResponseEntity.ok().build();
    }
}
