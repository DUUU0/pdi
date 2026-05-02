package com.projeto.pdi.dtos;

import java.time.LocalDate;

public record PessoaRequestDto(
        String nome,
        LocalDate dataNascimento,
        String localNascimento,
        String rg,
        String cpf,
        String passaporte,
        String cnh,
        Long criadoPorId,
        Long atualizadoPorId
) {}