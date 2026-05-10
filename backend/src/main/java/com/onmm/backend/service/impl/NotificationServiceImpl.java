package com.onmm.backend.service.impl;

import com.onmm.backend.dto.NotificationDTO;
import com.onmm.backend.entity.Notification;
import com.onmm.backend.repository.NotificationRepository;
import com.onmm.backend.service.NotificationService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationServiceImpl(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @Override
    public void createNotification(String type, String titre, String message, String lien, boolean actionRequise) {
        Notification notification = new Notification();
        notification.setType(type);
        notification.setTitre(titre);
        notification.setMessage(message);
        notification.setLien(lien);
        notification.setActionRequise(actionRequise);
        notification.setLu(false);
        notification.setCreatedAt(LocalDateTime.now());
        notificationRepository.save(notification);
    }

    @Override
    public List<NotificationDTO> getAll() {
        return notificationRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(this::toDTO).toList();
    }

    @Override
    public List<NotificationDTO> getUnread() {
        return notificationRepository.findByLuFalseOrderByCreatedAtDesc()
                .stream().map(this::toDTO).toList();
    }

    @Override
    public long getUnreadCount() {
        return notificationRepository.countByLuFalse();
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
        List<Notification> unread = notificationRepository.findByLuFalseOrderByCreatedAtDesc();
        unread.forEach(n -> n.setLu(true));
        notificationRepository.saveAll(unread);
    }

    @Override
    public void deleteNotification(Long id) {
        notificationRepository.deleteById(id);
    }

    private NotificationDTO toDTO(Notification notification) {
        NotificationDTO dto = new NotificationDTO();
        dto.setId(notification.getId());
        dto.setTitre(notification.getTitre());
        dto.setMessage(notification.getMessage());
        dto.setType(notification.getType());
        dto.setLu(notification.isLu());
        dto.setLien(notification.getLien());
        dto.setActionRequise(notification.isActionRequise());
        dto.setCreatedAt(notification.getCreatedAt());
        return dto;
    }
}
