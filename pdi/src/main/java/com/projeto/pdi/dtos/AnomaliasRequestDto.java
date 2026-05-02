package com.projeto.pdi.dtos;

public record AnomaliasRequestDto(
        String fisica,
        String congenita,
        String adquirida,
        String comportamental
) {}