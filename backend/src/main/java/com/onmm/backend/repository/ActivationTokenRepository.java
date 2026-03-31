package com.onmm.backend.repository;

import com.onmm.backend.entity.ActivationToken;
import com.onmm.backend.entity.User;
import com.onmm.backend.entity.enums.TokenType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.Optional;

public interface ActivationTokenRepository extends JpaRepository<ActivationToken, Long> {


    Optional<ActivationToken> findByToken(String token);

    Optional<ActivationToken> findFirstByUserAndTypeAndUsedFalseAndExpirationDateAfterOrderByExpirationDateDesc(
            User user,
            TokenType type,
            LocalDateTime now
    );
}
