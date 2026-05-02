package com.projeto.pdi.dtos;

public record CaracteristicasResponseDto(
        Long pessoaId,
        String genero,
        String raca,
        Double altura,
        Double peso,
        String biotipo,
        String cabelo,
        String roupaUsoComum
) {}