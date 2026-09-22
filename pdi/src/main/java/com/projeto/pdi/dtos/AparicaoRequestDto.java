package com.projeto.pdi.dtos;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record AparicaoRequestDto(Integer pessoaId,
                                 BigDecimal similaridade,
                                 String local,
                                 BigDecimal latitude,
                                 BigDecimal longitude,
                                 LocalDateTime dataHora) { // Opcional: quando ausente, usa o momento do registro
}
