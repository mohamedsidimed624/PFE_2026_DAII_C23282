package com.onmm.backend.service;

import com.onmm.backend.dto.NotificationDTO;

import java.util.List;

public interface NotificationService {
    void createNotification(String type, String titre, String message, String lien, boolean actionRequise);
    List<NotificationDTO> getAll();
    List<NotificationDTO> getUnread();
    long getUnreadCount();
    void markAsRead(Long id);
    void markAllAsRead();
    void deleteNotification(Long id);
}
