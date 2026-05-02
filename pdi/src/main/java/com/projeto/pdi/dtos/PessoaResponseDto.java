package com.projeto.pdi.dtos;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record PessoaResponseDto(
        Long id,
        String nome,
        LocalDate dataNascimento,
        String localNascimento,
        String rg,
        String cpf,
        String passaporte,
        String cnh,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}