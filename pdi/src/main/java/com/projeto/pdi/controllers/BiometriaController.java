package com.projeto.pdi.controllers;

import com.projeto.pdi.models.Biometria;
import com.projeto.pdi.models.Pessoa;
import com.projeto.pdi.repositories.BiometriaRepository;
import com.projeto.pdi.repositories.PessoaRepository;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/biometria")
public class BiometriaController {

    @Autowired
    private BiometriaRepository repository;

    @Autowired
    private PessoaRepository pessoaRepository;

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
    public ResponseEntity<Object> update(
            @PathVariable Long pessoaId,
            @RequestBody Biometria dto) {

        Pessoa pessoa = pessoaRepository.findById(pessoaId)
                .orElseThrow(() ->
                        new RuntimeException("Pessoa não existe"));

        Biometria biometria = repository.findById(pessoaId)
                .orElseGet(() -> {
                    Biometria nova = new Biometria();

                    // liga os dois lados
                    nova.setPessoa(pessoa);
                    pessoa.setBiometria(nova);

                    return nova;
                });

        BeanUtils.copyProperties(dto, biometria, "pessoa", "pessoaId");

        biometria.setPessoa(pessoa);
        pessoa.setBiometria(biometria);

        repository.save(biometria);

        return ResponseEntity.ok("Biometria atualizada com sucesso!");
    }
}