//package com.onmm.backend.config;
//
//import com.onmm.backend.entity.User;
//import com.onmm.backend.repository.UserRepository;
//import com.onmm.backend.service.JwtService;
//import io.jsonwebtoken.ExpiredJwtException;
//import io.jsonwebtoken.JwtException;
//import jakarta.servlet.FilterChain;
//import jakarta.servlet.ServletException;
//import jakarta.servlet.http.HttpServletRequest;
//import jakarta.servlet.http.HttpServletResponse;
//import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
//import org.springframework.security.core.authority.SimpleGrantedAuthority;
//import org.springframework.security.core.context.SecurityContextHolder;
//import org.springframework.stereotype.Component;
//import org.springframework.web.filter.OncePerRequestFilter;
//
//import java.io.IOException;
//import java.util.List;
//
//@Component
//public class JwtAuthenticationFilter extends OncePerRequestFilter {
//
//    private final JwtService jwtService;
//    private final UserRepository userRepository;
//
//    public JwtAuthenticationFilter(JwtService jwtService, UserRepository userRepository) {
//        this.jwtService = jwtService;
//        this.userRepository = userRepository;
//    }
//
//    @Override
//    protected void doFilterInternal(HttpServletRequest request,
//                                    HttpServletResponse response,
//                                    FilterChain filterChain) throws ServletException, IOException {
//
//        final String authHeader = request.getHeader("Authorization");
//
//        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
//            filterChain.doFilter(request, response);
//            return;
//        }
//
//        String jwt = authHeader.substring(7);
//
//        try {
//            String userEmail = jwtService.extractEmail(jwt);
//
//            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
//
//                User user = userRepository.findByEmail(userEmail).orElse(null);
//
//                if (user != null && jwtService.isTokenValid(jwt, user)) {
//
//                    UsernamePasswordAuthenticationToken authToken =
//                            new UsernamePasswordAuthenticationToken(
//                                    user,
//                                    null,
//                                    List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
//                            );
//
//                    SecurityContextHolder.getContext().setAuthentication(authToken);
//                }
//            }
//
//        } catch (ExpiredJwtException e) {
//            SecurityContextHolder.clearContext();
//        } catch (JwtException | IllegalArgumentException e) {
//            SecurityContextHolder.clearContext();
//        }
//
//        filterChain.doFilter(request, response);
//    }
//}