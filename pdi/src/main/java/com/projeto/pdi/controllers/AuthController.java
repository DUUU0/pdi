package com.projeto.pdi.controllers;

import com.projeto.pdi.dtos.AuthRequestDto;
import com.projeto.pdi.dtos.AuthResponseDto;
import com.projeto.pdi.dtos.UserResponseDto;
import com.projeto.pdi.models.enums.RoleUser;
import com.projeto.pdi.services.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register/admin")
    public ResponseEntity<UserResponseDto> registerAdmin(@RequestBody AuthRequestDto dto) {
        return ResponseEntity.ok(authService.register(dto, RoleUser.admin));
    }

    @PostMapping("/register/editor")
    public ResponseEntity<UserResponseDto> registerEditor(@RequestBody AuthRequestDto dto) {
        return ResponseEntity.ok(authService.register(dto, RoleUser.editor));
    }

    @PostMapping("/register/view")
    public ResponseEntity<UserResponseDto> registerView(@RequestBody AuthRequestDto dto) {
        return ResponseEntity.ok(authService.register(dto, RoleUser.vizualizador));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDto> login(@RequestBody AuthRequestDto dto) {
        return ResponseEntity.ok(authService.login(dto));
    }
}