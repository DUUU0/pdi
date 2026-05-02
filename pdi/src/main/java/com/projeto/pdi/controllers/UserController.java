package com.projeto.pdi.controllers;

import com.projeto.pdi.dtos.UserRequestDto;
import com.projeto.pdi.dtos.UserResponseDto;
import com.projeto.pdi.models.User;
import com.projeto.pdi.repositories.UserRepository;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody UserRequestDto dto) {
        User user = new User();
        BeanUtils.copyProperties(dto, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(userRepository.save(user));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Object> putUser(@PathVariable Long id, @RequestBody UserRequestDto dto) {
        Optional<User> userOptional = userRepository.findById(id);
        if (userOptional.isEmpty()){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Usuário não existe!");
        }

        User userModel = userOptional.get();
        BeanUtils.copyProperties(dto, userModel, "id");

        return ResponseEntity.status(HttpStatus.OK).body(userRepository.save(userModel));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable Long id) {
        Optional<User> userOptional = userRepository.findById(id);
        if (userOptional.isEmpty()){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Usuário não existe!");
        }
        userRepository.delete(userOptional.get());
        return ResponseEntity.status(HttpStatus.OK).body("Usuário removido com sucesso!");
    }

    @GetMapping("/{id}")
    public ResponseEntity<Object> getUserById(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(user -> ResponseEntity.ok((Object) new UserResponseDto(
                        user.getId(),
                        user.getNome(),
                        user.getEmail(),
                        user.getTipo()
                )))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body("Usuário não encontrado."));
    }

    @GetMapping("/me")
    public ResponseEntity<Object> getAuthenticatedUser(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        return userRepository.findByEmail(userDetails.getUsername())
                .map(user -> ResponseEntity.ok((Object) new UserResponseDto(
                        user.getId(),
                        user.getNome(),
                        user.getEmail(),
                        user.getTipo()
                )))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }
}