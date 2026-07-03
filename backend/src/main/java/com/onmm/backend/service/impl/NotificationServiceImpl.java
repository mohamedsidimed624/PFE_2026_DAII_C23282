package com.onmm.backend.service.impl;

import com.onmm.backend.dto.NotificationDTO;
import com.onmm.backend.entity.Medecin;
import com.onmm.backend.entity.Notification;
import com.onmm.backend.repository.MedecinRepository;
import com.onmm.backend.repository.NotificationRepository;
import com.onmm.backend.service.NotificationService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final MedecinRepository medecinRepository;

    public NotificationServiceImpl(NotificationRepository notificationRepository,
                                   MedecinRepository medecinRepository) {
        this.notificationRepository = notificationRepository;
        this.medecinRepository = medecinRepository;
    }

    // ── Admin notifications ───────────────────────────────────────────────────

    @Override
    public void createNotification(String type, String titre, String message, String lien, boolean actionRequise) {
        Notification n = new Notification();
        n.setType(type);
        n.setTitre(titre);
        n.setMessage(message);
        n.setLien(lien);
        n.setActionRequise(actionRequise);
        n.setLu(false);
        n.setCreatedAt(LocalDateTime.now());
        notificationRepository.save(n);
    }

    @Override
    public List<NotificationDTO> getAll() {
        return notificationRepository.findByMedecinIsNullOrderByCreatedAtDesc()
                .stream().map(this::toDTO).toList();
    }

    @Override
    public List<NotificationDTO> getUnread() {
        return notificationRepository.findByMedecinIsNullAndLuFalseOrderByCreatedAtDesc()
                .stream().map(this::toDTO).toList();
    }

    @Override
    public long getUnreadCount() {
        return notificationRepository.countByMedecinIsNullAndLuFalse();
    }

    @Override
    public void markAsRead(Long id) {
        notificationRepository.findById(id).ifPresent(n -> {
            n.setLu(true);
            notificationRepository.save(n);
        });
    }

    @Override
    public void markAllAsRead() {
        List<Notification> unread = notificationRepository.findByMedecinIsNullAndLuFalseOrderByCreatedAtDesc();
        unread.forEach(n -> n.setLu(true));
        notificationRepository.saveAll(unread);
    }

    @Override
    public void deleteNotification(Long id) {
        notificationRepository.deleteById(id);
    }

    // ── Doctor-scoped notifications ───────────────────────────────────────────

    @Override
    public void createMedecinNotification(String medecinEmail, String type, String titre,
                                          String message, String lien, boolean actionRequise) {
        Medecin medecin = medecinRepository.findByEmail(medecinEmail)
                .orElseThrow(() -> new RuntimeException("Médecin introuvable: " + medecinEmail));
        Notification n = new Notification();
        n.setMedecin(medecin);
        n.setType(type);
        n.setTitre(titre);
        n.setMessage(message);
        n.setLien(lien);
        n.setActionRequise(actionRequise);
        n.setLu(false);
        n.setCreatedAt(LocalDateTime.now());
        notificationRepository.save(n);
    }

    @Override
    public List<NotificationDTO> getMedecinNotifications(String medecinEmail) {
        return notificationRepository.findByMedecinEmailOrderByCreatedAtDesc(medecinEmail)
                .stream().map(this::toDTO).toList();
    }

    @Override
    public long getMedecinUnreadCount(String medecinEmail) {
        return notificationRepository.countByMedecinEmailAndLuFalse(medecinEmail);
    }

    @Override
    public void markMedecinNotifAsRead(String medecinEmail, Long id) {
        notificationRepository.findById(id).ifPresent(n -> {
            if (n.getMedecin() != null && n.getMedecin().getEmail().equals(medecinEmail)) {
                n.setLu(true);
                notificationRepository.save(n);
            }
        });
    }

    @Override
    public void markAllMedecinNotifsAsRead(String medecinEmail) {
        List<Notification> unread = notificationRepository
                .findByMedecinEmailAndLuFalseOrderByCreatedAtDesc(medecinEmail);
        unread.forEach(n -> n.setLu(true));
        notificationRepository.saveAll(unread);
    }

    @Override
    public void deleteMedecinNotif(String medecinEmail, Long id) {
        notificationRepository.findById(id).ifPresent(n -> {
            if (n.getMedecin() != null && n.getMedecin().getEmail().equals(medecinEmail)) {
                notificationRepository.delete(n);
            }
        });
    }

    @Override
    public void createMedecinNotificationBatch(List<Medecin> medecins, String type, String titre,
                                               String message, String lien, boolean actionRequise) {
        LocalDateTime now = LocalDateTime.now();
        List<Notification> notifications = medecins.stream().map(medecin -> {
            Notification n = new Notification();
            n.setMedecin(medecin);
            n.setType(type);
            n.setTitre(titre);
            n.setMessage(message);
            n.setLien(lien);
            n.setActionRequise(actionRequise);
            n.setLu(false);
            n.setCreatedAt(now);
            return n;
        }).toList();
        notificationRepository.saveAll(notifications);
    }

    private NotificationDTO toDTO(Notification n) {
        NotificationDTO dto = new NotificationDTO();
        dto.setId(n.getId());
        dto.setTitre(n.getTitre());
        dto.setMessage(n.getMessage());
        dto.setType(n.getType());
        dto.setLu(n.isLu());
        dto.setLien(n.getLien());
        dto.setActionRequise(n.isActionRequise());
        dto.setCreatedAt(n.getCreatedAt());
        return dto;
    }
}
