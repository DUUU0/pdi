package com.projeto.pdi.controllers;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.projeto.pdi.dtos.PessoaRequestDto;
import com.projeto.pdi.dtos.PessoaResponseDto;
import com.projeto.pdi.models.Pessoa;
import com.projeto.pdi.models.User;
import com.projeto.pdi.repositories.PessoaRepository;
import com.projeto.pdi.security.AuthenticatedUser;
import com.projeto.pdi.services.HistoricoService;
import com.projeto.pdi.validation.PessoaValidator;

@RestController
@RequestMapping("/pessoas")
public class PessoaController {

    @Autowired
    private PessoaRepository pessoaRepository;

    @Autowired
    private HistoricoService historicoService;

    @Autowired
    private AuthenticatedUser authenticatedUser;

    @PostMapping
    public ResponseEntity<Object> createPessoa(@RequestBody PessoaRequestDto dto) {
        ResponseEntity<Object> erro = validar(dto, null);
        if (erro != null) return erro;

        Pessoa pessoa = new Pessoa();
        BeanUtils.copyProperties(normalizar(dto), pessoa);

        User usuario = authenticatedUser.getUsuarioLogado();
        pessoa.setCriadoPor(usuario.getId().intValue());

        Pessoa saved = pessoaRepository.saveAndFlush(pessoa);
        PessoaResponseDto response = mapToResponse(saved);

        // Log: criação não tem "antes", só "depois"
        historicoService.registrar(saved, usuario.getId(), HistoricoService.CREATE, null, response);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
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
        PessoaResponseDto antes = mapToResponse(pessoa); // snapshot ANTES de aplicar as mudanças

        BeanUtils.copyProperties(normalizar(dto), pessoa, "id", "createdAt");

        User usuario = authenticatedUser.getUsuarioLogado();
        pessoa.setAtualizadoPor(usuario.getId().intValue());

        Pessoa updated = pessoaRepository.saveAndFlush(pessoa);
        PessoaResponseDto depois = mapToResponse(updated);

        historicoService.registrar(updated, usuario.getId(), HistoricoService.UPDATE, antes, depois);

        return ResponseEntity.ok(depois);
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
        Optional<Pessoa> pessoaOptional = pessoaRepository.findById(id);
        if (pessoaOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Pessoa não encontrada");
        }

        Pessoa pessoa = pessoaOptional.get();
        PessoaResponseDto antes = mapToResponse(pessoa);
        User usuario = authenticatedUser.getUsuarioLogado();

        historicoService.registrar(pessoa, usuario.getId(), HistoricoService.DELETE, antes, null);

        pessoaRepository.deleteById(id);
        return ResponseEntity.ok("Removido com sucesso");
    }

    private ResponseEntity<Object> validar(PessoaRequestDto dto, Long idAtual) {
        Map<String, String> erros = PessoaValidator.validar(dto);
        if (!erros.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("erros", erros));
        }

        String cpf = PessoaValidator.formatarCpf(dto.cpf());
        if (cpf != null) {
            List<String> formatos = List.of(cpf, PessoaValidator.somenteDigitosOuNulo(cpf));
            if (pessoaRepository.existsByCpfInAndIdNot(formatos, idAtual == null ? -1L : idAtual)) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("erros", Map.of("cpf", "Já existe uma pessoa cadastrada com este CPF.")));
            }
        }
        return null;
    }

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
