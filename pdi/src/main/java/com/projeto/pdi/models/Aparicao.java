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

    @Column(name = "data_hora", updatable = false)
    private LocalDateTime dataHora;

    private BigDecimal similaridade;

    // Localização onde a pessoa foi vista
    private String local;
    private BigDecimal latitude;
    private BigDecimal longitude;
}
