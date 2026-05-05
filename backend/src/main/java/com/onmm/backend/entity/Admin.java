package com.onmm.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "admins")
@PrimaryKeyJoinColumn(name = "user_id")
public class Admin extends User {

}