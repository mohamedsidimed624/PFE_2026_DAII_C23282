package com.onmm.backend.mapper;

import com.onmm.backend.entity.CategorieContenu;
import com.onmm.backend.entity.User;
import com.onmm.backend.entity.enums.Role;
import com.onmm.backend.repository.CategorieRepository;
import com.onmm.backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initAdmin(UserRepository userRepository,
                                       PasswordEncoder passwordEncoder) {
        return args -> {
            String adminEmail = "admin@onmm.com";

            if (userRepository.findByEmail(adminEmail).isEmpty()) {
                User admin = new User();
                admin.setEmail(adminEmail);
                admin.setPassword(passwordEncoder.encode("Admin1234"));
                admin.setRole(Role.ADMIN);
                admin.setEnabled(true);

                userRepository.save(admin);

                System.out.println("ADMIN DE TEST CREE : admin@onmm.com / Admin1234");
            }
        };
    }

    @Bean
    public CommandLineRunner initCategories(CategorieRepository categorieRepository) {
        return args -> {
            if (categorieRepository.count() > 0) return;
            List.of(
                "Annonce officielle", "Recrutement", "Appel à candidature",
                "Actualité institutionnelle", "Vie de l'Ordre",
                "Communiqué officiel", "Note d'information",
                "Décision ordinale", "Réglementation",
                "Formation", "Réunion"
            ).forEach(nom -> {
                CategorieContenu c = new CategorieContenu();
                c.setNom(nom);
                categorieRepository.save(c);
            });
        };
    }
}