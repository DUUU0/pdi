package com.projeto.pdi.dtos;

public record AnomaliasResponseDto(
        Long id,
        Long pessoaId,
        String fisica,
        String congenita,
        String adquirida,
        String comportamental
) {}
