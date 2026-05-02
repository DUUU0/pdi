package com.projeto.pdi.dtos;

import com.projeto.pdi.models.enums.RoleUser;

public record UserResponseDto(Long id, String name, String email, RoleUser tipo) {
}
