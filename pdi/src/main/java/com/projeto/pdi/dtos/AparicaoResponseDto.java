package com.projeto.pdi.dtos;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record AparicaoResponseDto(Long id,            // ID da Aparição
                                  Long pessoaId,      // ID da Pessoa (ajuste para Integer se necessário)
                                  String nome,
                                  String cpf,
                                  LocalDateTime dataHora,
                                  BigDecimal similaridade) {
}
