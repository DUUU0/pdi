package com.projeto.pdi.models;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "biometria")
@Data
public class Biometria {
    @Id
    private Long pessoaId;

    @OneToOne
    @MapsId
    @JoinColumn(name = "pessoa_id")
    @JsonBackReference
    private Pessoa pessoa;

    @Column(columnDefinition = "TEXT")
    private String faceFrontal;

    @Column(columnDefinition = "TEXT")
    private String faceEsq;

    @Column(columnDefinition = "TEXT")
    private String faceDir;
}