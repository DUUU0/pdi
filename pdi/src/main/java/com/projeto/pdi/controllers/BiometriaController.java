package com.projeto.pdi.controllers;

import java.util.Optional;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.projeto.pdi.models.Biometria;
import com.projeto.pdi.models.Pessoa;
import com.projeto.pdi.models.User;
import com.projeto.pdi.repositories.BiometriaRepository;
import com.projeto.pdi.repositories.PessoaRepository;
import com.projeto.pdi.security.AuthenticatedUser;
import com.projeto.pdi.services.HistoricoService;

@RestController
@RequestMapping("/biometria")
public class BiometriaController {

    @Autowired
    private BiometriaRepository repository;

    @Autowired
    private PessoaRepository pessoaRepository;

    @Autowired
    private HistoricoService historicoService;

    @Autowired
    private AuthenticatedUser authenticatedUser;

    @GetMapping("/pessoa/{pessoaId}")
    public ResponseEntity<Object> getByPessoaId(@PathVariable Long pessoaId) {
        Optional<Biometria> biometria = repository.findById(pessoaId);

        return biometria
                .<ResponseEntity<Object>>map(ResponseEntity::ok)
                .orElseGet(() ->
                        ResponseEntity.status(HttpStatus.NOT_FOUND)
                                .body("Biometria não encontrada."));
    }

    @PutMapping("/pessoa/{pessoaId}")
    public ResponseEntity<Object> update(@PathVariable Long pessoaId, @RequestBody Biometria dto) {
        Pessoa pessoa = pessoaRepository.findById(pessoaId)
                .orElseThrow(() -> new RuntimeException("Pessoa não existe"));

        Optional<Biometria> biometriaOptional = repository.findById(pessoaId);
        boolean isNovo = biometriaOptional.isEmpty();

        Biometria biometria = biometriaOptional.orElseGet(() -> {
            Biometria nova = new Biometria();
            nova.setPessoa(pessoa);
            pessoa.setBiometria(nova);
            return nova;
        });

        // Snapshot do estado anterior antes de copiar novas propriedades
        Biometria antes = null;
        if (!isNovo) {
            antes = new Biometria();
            BeanUtils.copyProperties(biometria, antes);
        }

        BeanUtils.copyProperties(dto, biometria, "pessoa", "pessoaId");

        biometria.setPessoa(pessoa);
        pessoa.setBiometria(biometria);

        Biometria saved = repository.save(biometria);

        User usuario = authenticatedUser.getUsuarioLogado();
        String acao = isNovo ? HistoricoService.CREATE : HistoricoService.UPDATE;

        historicoService.registrar(pessoa, usuario.getId(), acao, antes, saved);

        return ResponseEntity.ok("Biometria atualizada com sucesso!");
    }
}