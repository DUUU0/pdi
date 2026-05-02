package com.projeto.pdi.controllers;

import com.projeto.pdi.dtos.PessoaRequestDto;
import com.projeto.pdi.dtos.PessoaResponseDto;
import com.projeto.pdi.models.Pessoa;
import com.projeto.pdi.repositories.PessoaRepository;
import com.projeto.pdi.repositories.UserRepository;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/pessoas")
public class PessoaController {

    @Autowired
    private PessoaRepository pessoaRepository;

    @Autowired
    private UserRepository userRepository;

    @PostMapping
    public ResponseEntity<PessoaResponseDto> createPessoa(@RequestBody PessoaRequestDto dto) {
        Pessoa pessoa = new Pessoa();
        BeanUtils.copyProperties(dto, pessoa);

        userRepository.findById(dto.criadoPorId()).ifPresent(user -> {
            pessoa.setCriadoPor(user.getId().intValue());
        });

        Pessoa saved = pessoaRepository.save(pessoa);
        return ResponseEntity.status(HttpStatus.CREATED).body(mapToResponse(saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Object> updatePessoa(@PathVariable Long id, @RequestBody PessoaRequestDto dto) {
        Optional<Pessoa> pessoaOptional = pessoaRepository.findById(id);
        if (pessoaOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Pessoa não encontrada");
        }

        Pessoa pessoa = pessoaOptional.get();
        BeanUtils.copyProperties(dto, pessoa, "id", "createdAt");

        userRepository.findById(dto.criadoPorId()).ifPresent(user -> {
            pessoa.setAtualizadoPor(user.getId().intValue());
        });

        Pessoa updated = pessoaRepository.save(pessoa);
        return ResponseEntity.ok(mapToResponse(updated));
    }

    @GetMapping
    public ResponseEntity<List<PessoaResponseDto>> getAll() {
        List<PessoaResponseDto> list = pessoaRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Object> getById(@PathVariable Long id) {
        return pessoaRepository.findById(id)
                .map(p -> ResponseEntity.ok((Object) mapToResponse(p)))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body("Pessoa não encontrada"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Object> delete(@PathVariable Long id) {
        if (!pessoaRepository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Pessoa não encontrada");
        }
        pessoaRepository.deleteById(id);
        return ResponseEntity.ok("Removido com sucesso");
    }

    private PessoaResponseDto mapToResponse(Pessoa p) {
        return new PessoaResponseDto(
                p.getId(), p.getNome(), p.getDataNascimento(),
                p.getLocalNascimento(), p.getRg(), p.getCpf(),
                p.getPassaporte(), p.getCnh(), p.getCreatedAt(), p.getUpdatedAt()
        );
    }
}