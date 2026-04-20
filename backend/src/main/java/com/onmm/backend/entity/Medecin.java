package com.onmm.backend.entity;

import com.onmm.backend.entity.enums.SectionOrdre;
import com.onmm.backend.entity.enums.StatutMedecin;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Data
@Entity
@Table(
        name = "medecins",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_medecin_email", columnNames = "email"),
                @UniqueConstraint(name = "uk_medecin_telephone", columnNames = "telephone"),
                @UniqueConstraint(name = "uk_medecin_nni", columnNames = "nni"),
                @UniqueConstraint(name = "uk_medecin_numero_inscription", columnNames = "numero_inscription"),
                @UniqueConstraint(name = "uk_medecin_user_id", columnNames = "user_id")
        }
)
public class Medecin {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nom;

    @Column(nullable = false, length = 100)
    private String prenom;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(nullable = false, unique = true, length = 30)
    private String telephone;

    @Column(nullable = false, unique = true, length = 30)
    private String nni;

    @Column(name = "photo_profil_path", length = 500)
    private String photoProfilPath;

    @Column(length = 20)
    private String sexe;

    @Column(length = 100)
    private String nationalite;

    @Column(length = 255)
    private String adresse;

    @Column(name = "numero_inscription", unique = true, length = 100)
    private String numeroInscription;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private StatutMedecin statut;

    @Enumerated(EnumType.STRING)
    @Column(name = "section_ordre", nullable = false, length = 50)
    private SectionOrdre sectionOrdre;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "specialite_id")
    private Specialite specialite;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sous_specialite_id")
    private SousSpecialite sousSpecialite;

    @Column(name = "date_naissance")
    private LocalDate dateNaissance;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    public Medecin() {
    }

}