package com.projeto.pdi.models;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "caracteristicas_pessoais")
@Data
public class CaracteristicasPessoais {
    @Id
    private Long pessoaId;

    @OneToOne
    @MapsId
    @JoinColumn(name = "pessoa_id")
    @JsonBackReference
    private Pessoa pessoa;

    private String genero;
    private String raca;
    private Double altura;
    private Double peso;
    private String biotipo;
    private String cabelo;
    private String roupaUsoComum;
}