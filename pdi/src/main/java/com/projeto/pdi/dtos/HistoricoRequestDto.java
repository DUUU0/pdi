package com.projeto.pdi.dtos;

public record HistoricoRequestDto(
        Integer userId,
        String tipoOperacao,
        String dadosAnteriores,
        String dadosNovos
) {}