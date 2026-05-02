package com.projeto.pdi.dtos;

import com.projeto.pdi.models.enums.RoleUser;

public record AuthResponseDto(String token, RoleUser tipo) {
}
