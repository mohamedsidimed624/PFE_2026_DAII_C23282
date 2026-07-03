package com.onmm.backend.service;

import com.onmm.backend.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JWTService {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration-ms:86400000}")
    private long jwtExpirationMs;

    private SecretKey cachedKey;

    @PostConstruct
    private void init() {
        if (jwtSecret == null || jwtSecret.isBlank()) {
            throw new IllegalStateException(
                "[SECURITY] JWT secret is not configured. Set the JWT_SECRET environment variable."
            );
        }
        byte[] keyBytes;
        try {
            keyBytes = Decoders.BASE64.decode(jwtSecret);
        } catch (IllegalArgumentException e) {
            throw new IllegalStateException("[SECURITY] JWT secret is not valid Base64.", e);
        }
        if (keyBytes.length < 32) {
            throw new IllegalStateException(
                "[SECURITY] JWT secret is too short. Minimum 256 bits (32 bytes) required for HS256."
            );
        }
        if (jwtExpirationMs <= 0) {
            throw new IllegalStateException(
                "[SECURITY] JWT expiration must be positive. Check jwt.expiration-ms property."
            );
        }
        this.cachedKey = Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateToken(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", user.getRole().name());
        claims.put("userId", user.getId());

        return Jwts.builder()
                .claims(claims)
                .subject(user.getEmail())
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
                .signWith(getKey())
                .compact();
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public String extractRole(String token) {
        return extractAllClaims(token).get("role", String.class);
    }

    public Long extractUserId(String token) {
        Integer id = extractAllClaims(token).get("userId", Integer.class);
        return id != null ? id.longValue() : null;
    }

    public boolean validateToken(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return username.equals(userDetails.getUsername()) && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    private <T> T extractClaim(String token, Function<Claims, T> resolver) {
        return resolver.apply(extractAllClaims(token));
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public boolean isTokenValid(String token) {
        try {
            return !isTokenExpired(token);
        } catch (Exception e) {
            return false;
        }
    }

    private SecretKey getKey() {
        return cachedKey;
    }
}
