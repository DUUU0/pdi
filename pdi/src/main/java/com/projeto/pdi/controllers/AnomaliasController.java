package com.projeto.pdi.controllers;

import com.projeto.pdi.dtos.AnomaliasRequestDto;
import com.projeto.pdi.models.Anomalias;
import com.projeto.pdi.models.Pessoa;
import com.projeto.pdi.repositories.AnomaliasRepository;
import com.projeto.pdi.repositories.PessoaRepository;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/anomalias")
public class AnomaliasController {

    @Autowired private AnomaliasRepository repository;
    @Autowired private PessoaRepository pessoaRepository;

    @PutMapping("/pessoa/{pessoaId}")
    public ResponseEntity<Object> update(@PathVariable Long pessoaId, @RequestBody AnomaliasRequestDto dto) {
        Pessoa pessoa = pessoaRepository.findById(pessoaId)
                .orElseThrow(() -> new RuntimeException("Pessoa não encontrada"));

        Anomalias anomalia = repository.findByPessoaId(pessoaId)
                .orElseGet(() -> {
                    Anomalias nova = new Anomalias();
                    nova.setPessoa(pessoa);
                    return nova;
                });

        BeanUtils.copyProperties(dto, anomalia, "id", "pessoa");
        anomalia.setPessoa(pessoa);

        repository.save(anomalia);
        return ResponseEntity.ok("Anomalias atualizadas com sucesso!");
    }

    @GetMapping("/pessoa/{pessoaId}")
    public ResponseEntity<Object> get(@PathVariable Long pessoaId) {
        return repository.findByPessoaId(pessoaId)
                .<ResponseEntity<Object>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body("Registro não encontrado."));
    }
}