package com.projeto.pdi.controllers;

import com.projeto.pdi.dtos.PessoaRequestDto;
import com.projeto.pdi.dtos.PessoaResponseDto;
import com.projeto.pdi.models.Pessoa;
import com.projeto.pdi.repositories.PessoaRepository;
import com.projeto.pdi.repositories.UserRepository;
import com.projeto.pdi.validation.PessoaValidator;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
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
    public ResponseEntity<Object> createPessoa(@RequestBody PessoaRequestDto dto) {
        ResponseEntity<Object> erro = validar(dto, null);
        if (erro != null) return erro;

        Pessoa pessoa = new Pessoa();
        BeanUtils.copyProperties(normalizar(dto), pessoa);

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

        ResponseEntity<Object> erro = validar(dto, id);
        if (erro != null) return erro;

        Pessoa pessoa = pessoaOptional.get();
        BeanUtils.copyProperties(normalizar(dto), pessoa, "id", "createdAt");

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

    // Retorna 400/409 com os erros por campo ({ "erros": { "cpf": "..." } }), ou null se os dados forem válidos
    private ResponseEntity<Object> validar(PessoaRequestDto dto, Long idAtual) {
        Map<String, String> erros = PessoaValidator.validar(dto);
        if (!erros.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("erros", erros));
        }

        String cpf = PessoaValidator.formatarCpf(dto.cpf());
        if (cpf != null) {
            // Compara com e sem pontuação, pois registros antigos podem ter sido gravados sem máscara
            List<String> formatos = List.of(cpf, PessoaValidator.somenteDigitosOuNulo(cpf));
            if (pessoaRepository.existsByCpfInAndIdNot(formatos, idAtual == null ? -1L : idAtual)) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("erros", Map.of("cpf", "Já existe uma pessoa cadastrada com este CPF.")));
            }
        }
        return null;
    }

    // Padroniza os documentos antes de gravar (CPF com máscara, CNH só dígitos, RG/passaporte em maiúsculas)
    private PessoaRequestDto normalizar(PessoaRequestDto dto) {
        return new PessoaRequestDto(
                PessoaValidator.textoOuNulo(dto.nome()),
                dto.dataNascimento(),
                PessoaValidator.textoOuNulo(dto.localNascimento()),
                PessoaValidator.maiusculoOuNulo(dto.rg()),
                PessoaValidator.formatarCpf(dto.cpf()),
                PessoaValidator.maiusculoOuNulo(dto.passaporte()),
                PessoaValidator.somenteDigitosOuNulo(dto.cnh()),
                dto.criadoPorId(),
                dto.atualizadoPorId()
        );
    }

    private PessoaResponseDto mapToResponse(Pessoa p) {
        return new PessoaResponseDto(
                p.getId(), p.getNome(), p.getDataNascimento(),
                p.getLocalNascimento(), p.getRg(), p.getCpf(),
                p.getPassaporte(), p.getCnh(), p.getCreatedAt(), p.getUpdatedAt()
        );
    }
}