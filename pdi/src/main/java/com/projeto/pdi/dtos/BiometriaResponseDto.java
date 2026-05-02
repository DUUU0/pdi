package com.projeto.pdi.dtos;

public record BiometriaResponseDto(
        Long pessoaId,
        String faceFrontal,
        String faceEsq,
        String faceDir
) {}