package com.onmm.backend.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(RateLimitFilter.class);

    // endpoint → [maxRequests, windowMs]
    private static final Map<String, long[]> LIMITS = Map.of(
            "/api/auth/login",           new long[]{ 5,  5 * 60 * 1000L },  // 5 req / 5 min
            "/api/auth/forgot-password", new long[]{ 3, 10 * 60 * 1000L }   // 3 req / 10 min
    );

    // clé = "IP::endpoint" → [count, windowStartMs]
    private final ConcurrentHashMap<String, long[]> counters = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String uri    = request.getRequestURI();
        String method = request.getMethod();

        if ("POST".equals(method) && LIMITS.containsKey(uri)) {
            String ip  = getClientIp(request);
            String key = ip + "::" + uri;
            long[] limit = LIMITS.get(uri);
            long maxRequests = limit[0];
            long windowMs    = limit[1];
            long now = System.currentTimeMillis();

            counters.compute(key, (k, v) -> {
                if (v == null || (now - v[1]) > windowMs) {
                    return new long[]{ 1, now };       // nouveau créneau
                }
                return new long[]{ v[0] + 1, v[1] };  // incrémenter dans le créneau actuel
            });

            long[] state = counters.get(key);
            if (state[0] > maxRequests) {
                long remainingSec = (windowMs - (now - state[1])) / 1000;
                log.warn("[RATE LIMIT] IP {} bloquée sur {} ({} tentatives). Retry dans {} s",
                        ip, uri, state[0], remainingSec);
                sendTooManyRequests(response, remainingSec);
                return;
            }

            // Purger les entrées inactives dont la fenêtre est expirée depuis 2x le délai
            counters.entrySet().removeIf(e -> {
                String[] parts = e.getKey().split("::");
                if (parts.length < 2) return true;
                long[] lim = LIMITS.get(parts[1]);
                return lim != null && (now - e.getValue()[1]) > lim[1] * 2;
            });
        }

        filterChain.doFilter(request, response);
    }

    private String getClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private void sendTooManyRequests(HttpServletResponse response, long retryAfterSec)
            throws IOException {
        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        response.setHeader("Retry-After", String.valueOf(retryAfterSec));
        Map<String, Object> body = Map.of(
                "status",  429,
                "message", "Trop de tentatives. Veuillez réessayer dans " + retryAfterSec + " secondes."
        );
        new ObjectMapper().writeValue(response.getWriter(), body);
    }
}
