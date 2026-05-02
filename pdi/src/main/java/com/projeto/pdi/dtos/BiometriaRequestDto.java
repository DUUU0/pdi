package com.projeto.pdi.dtos;

public record BiometriaRequestDto(
        String faceFrontal,
        String faceEsq,
        String faceDir
) {}