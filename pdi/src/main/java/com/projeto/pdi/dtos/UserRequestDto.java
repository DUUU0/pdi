package com.projeto.pdi.dtos;

import com.projeto.pdi.models.enums.RoleUser;

public record UserRequestDto(String name, String email, String password, RoleUser tipo) {
}
