package com.onmm.backend.entity;

import com.onmm.backend.entity.enums.Role;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "users")
@Getter
@Setter
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    private String password;

    @Enumerated(EnumType.STRING)
    private Role role;

    private boolean enabled = false;

    @OneToOne
    @JoinColumn(name = "demande_id")
    private DemandeAdhesion demandeApprouvee;


}