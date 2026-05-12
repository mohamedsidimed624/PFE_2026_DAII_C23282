package com.onmm.backend.repository;

import com.onmm.backend.entity.ActivationToken;
import com.onmm.backend.entity.User;
import com.onmm.backend.entity.enums.TokenType;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Optional;

public interface ActivationTokenRepository extends JpaRepository<ActivationToken, Long> {


    Optional<ActivationToken> findByToken(String token);

    Optional<ActivationToken> findFirstByUserAndTypeAndUsedFalseAndExpirationDateAfterOrderByExpirationDateDesc(
            User user,
            TokenType type,
            LocalDateTime now
    );

    @Modifying
    @Transactional
    @Query("DELETE FROM ActivationToken t WHERE t.user = :user AND t.type = :type")
    void deleteByUserAndType(@Param("user") User user, @Param("type") TokenType type);
}
