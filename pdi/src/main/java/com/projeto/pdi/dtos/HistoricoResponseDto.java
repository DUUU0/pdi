package com.projeto.pdi.dtos;

import java.time.LocalDateTime;

public record HistoricoResponseDto(
        Long id,
        Long pessoaId,
        Integer userId,
        LocalDateTime dataAlteracao,
        String tipoOperacao,
        String dadosAnteriores,
        String dadosNovos
) {}
