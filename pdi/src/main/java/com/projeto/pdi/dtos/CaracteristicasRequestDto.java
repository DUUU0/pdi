package com.projeto.pdi.dtos;

public record CaracteristicasRequestDto(
        String genero,
        String raca,
        Double altura,
        Double peso,
        String biotipo,
        String cabelo,
        String roupaUsoComum
) {}