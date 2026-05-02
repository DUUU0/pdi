package com.projeto.pdi.models;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "pessoas")
@Data
public class Pessoa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;

    @Column(name = "data_nascimento")
    private LocalDate dataNascimento;

    @Column(name = "local_nascimento")
    private String localNascimento;

    private String rg;
    private String cpf;
    private String passaporte;
    private String cnh;

    // Auditoria (Relacionamento com a tabela de Users)
    @Column(name = "criado_por")
    private Integer criadoPor;

    @Column(name = "atualizado_por")
    private Integer atualizadoPor;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // --- RELACIONAMENTOS ---

    // 1. Características Pessoais (Ainda usando @MapsId conforme seu SQL anterior)
    @OneToOne(mappedBy = "pessoa", cascade = CascadeType.ALL)
    @JsonManagedReference
    private CaracteristicasPessoais caracteristicas;

    // 2. Biometria (Ainda usando @MapsId conforme seu SQL anterior)
    @OneToOne(mappedBy = "pessoa", cascade = CascadeType.ALL)
    @JsonManagedReference
    private Biometria biometria;

    // 3. Anomalias (Novo SQL: Tem ID próprio, então usamos mappedBy)
    @OneToOne(mappedBy = "pessoa", cascade = CascadeType.ALL)
    @JsonManagedReference
    private Anomalias anomalias;

    // 4. Características Adicionais (Novo SQL: Tem ID próprio)
    @OneToOne(mappedBy = "pessoa", cascade = CascadeType.ALL)
    @JsonManagedReference
    private CaracteristicasAdicionais caracteristicasAdicionais;

    // 5. Histórico de Alterações (Novo SQL: Geralmente é uma lista)
    @OneToMany(mappedBy = "pessoa", cascade = CascadeType.ALL)
    @JsonManagedReference
    private List<Historico> historicoAlteracoes;



    // Lifecycle Hooks para as datas
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}