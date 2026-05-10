package com.onmm.backend.repository;

import com.onmm.backend.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findAllByOrderByCreatedAtDesc();
    List<Notification> findByLuFalseOrderByCreatedAtDesc();
    long countByLuFalse();
}
