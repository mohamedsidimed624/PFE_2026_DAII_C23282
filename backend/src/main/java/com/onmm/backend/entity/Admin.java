package com.onmm.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Admin entity — hérite de User (id, email, password, role, enabled).
 * Les champs ci-dessous vont dans la table `admins` (colonne user_id = FK vers users).
 */
@Getter
@Setter
@Entity
@Table(name = "admins")
@PrimaryKeyJoinColumn(name = "user_id")
public class Admin extends User {

    @Column(length = 200)
    private String nomComplet;

    @Column(length = 30)
    private String telephone;

    @Column(name = "photo_profil_path", length = 500)
    private String photoProfilPath;

    @Column(name = "date_creation")
    private LocalDateTime dateCreation;
}
