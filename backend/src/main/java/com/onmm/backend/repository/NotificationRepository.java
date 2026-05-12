package com.onmm.backend.repository;

import com.onmm.backend.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // ── Admin (medecin is null) ───────────────────────────────────────────────
    List<Notification> findByMedecinIsNullOrderByCreatedAtDesc();
    List<Notification> findByMedecinIsNullAndLuFalseOrderByCreatedAtDesc();
    long countByMedecinIsNullAndLuFalse();

    // ── Doctor-scoped ─────────────────────────────────────────────────────────
    List<Notification> findByMedecinEmailOrderByCreatedAtDesc(String email);
    List<Notification> findByMedecinEmailAndLuFalseOrderByCreatedAtDesc(String email);
    long countByMedecinEmailAndLuFalse(String email);
}
