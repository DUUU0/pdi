package com.projeto.pdi.models;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "aparicoes")
@Data
public class Aparicao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "pessoa_id")
    private Integer pessoaId;

    @Column(name = "data_hora", insertable = false, updatable = false)
    private LocalDateTime dataHora;

    private BigDecimal similaridade;
}