package com.onmm.backend.service;

import com.onmm.backend.dto.NotificationDTO;
import com.onmm.backend.entity.Medecin;

import java.util.List;

public interface NotificationService {

    // ── Admin notifications ───────────────────────────────────────────────────
    void createNotification(String type, String titre, String message, String lien, boolean actionRequise);
    List<NotificationDTO> getAll();
    List<NotificationDTO> getUnread();
    long getUnreadCount();
    void markAsRead(Long id);
    void markAllAsRead();
    void deleteNotification(Long id);

    // ── Doctor-scoped notifications ───────────────────────────────────────────
    void createMedecinNotification(String medecinEmail, String type, String titre, String message, String lien, boolean actionRequise);

    void createMedecinNotificationBatch(List<Medecin> medecins, String type, String titre, String message, String lien, boolean actionRequise);
    List<NotificationDTO> getMedecinNotifications(String medecinEmail);
    long getMedecinUnreadCount(String medecinEmail);
    void markMedecinNotifAsRead(String medecinEmail, Long id);
    void markAllMedecinNotifsAsRead(String medecinEmail);
    void deleteMedecinNotif(String medecinEmail, Long id);
}
