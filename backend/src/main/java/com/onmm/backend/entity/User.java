package com.onmm.backend.entity;

import com.onmm.backend.entity.enums.Role;
import jakarta.persistence.*;

@Entity
@Table(name = "users")
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

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public DemandeAdhesion getDemandeApprouvee() {
        return demandeApprouvee;
    }

    public void setDemandeApprouvee(DemandeAdhesion demandeApprouvee) {
        this.demandeApprouvee = demandeApprouvee;
    }
}