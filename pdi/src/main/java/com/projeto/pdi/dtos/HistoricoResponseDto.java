package com.projeto.pdi.dtos;

import java.time.LocalDateTime;

public record HistoricoResponseDto(
    Long id,
    Long pessoaId,
    Integer userId,
    String nomeUsuario,
    LocalDateTime dataAlteracao,
    String tipoOperacao,
    Object dadosAnteriores,
    Object dadosNovos
) {
}
