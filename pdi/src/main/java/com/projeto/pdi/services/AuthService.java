package com.projeto.pdi.services;

import com.projeto.pdi.dtos.AuthRequestDto;
import com.projeto.pdi.dtos.AuthResponseDto;
import com.projeto.pdi.dtos.UserResponseDto;
import com.projeto.pdi.models.User;
import com.projeto.pdi.models.enums.RoleUser;
import com.projeto.pdi.repositories.UserRepository;
import com.projeto.pdi.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private final UserRepository repository;
    private final PasswordEncoder encoder;
    private final JwtService jwtService;
    private final AuthenticationManager authManager;

    public AuthService(UserRepository repository,
                       PasswordEncoder encoder,
                       JwtService jwtService,
                       AuthenticationManager authManager) {
        this.repository = repository;
        this.encoder = encoder;
        this.jwtService = jwtService;
        this.authManager = authManager;
    }

    public AuthResponseDto login(AuthRequestDto loginRequestDto) {
        authManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequestDto.email(),
                        loginRequestDto.password()
                )
        );

        User user = repository.findByEmail(loginRequestDto.email())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        String token = jwtService.generateToken(
                user.getEmail(),
                user.getTipo().name()
        );

        return new AuthResponseDto(token, user.getTipo());
    }

    public UserResponseDto register(AuthRequestDto dto, RoleUser role) {
        User user = new User();
        user.setNome(dto.name());
        user.setEmail(dto.email());
        user.setSenha(encoder.encode(dto.password()));
        user.setTipo(role);
        user = repository.save(user);

        return new UserResponseDto(user.getId(), user.getNome(), user.getEmail(), user.getTipo());
    }
}