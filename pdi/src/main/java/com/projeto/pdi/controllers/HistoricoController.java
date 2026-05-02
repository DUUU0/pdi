package com.projeto.pdi.controllers;

import com.projeto.pdi.dtos.HistoricoRequestDto;
import com.projeto.pdi.models.Historico;
import com.projeto.pdi.models.Pessoa;
import com.projeto.pdi.repositories.HistoricoRepository;
import com.projeto.pdi.repositories.PessoaRepository;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/historico")
public class HistoricoController {

    @Autowired
    private HistoricoRepository repository;
    @Autowired private PessoaRepository pessoaRepository;

    @PostMapping("/pessoa/{pessoaId}")
    public ResponseEntity<Object> createLog(@PathVariable Long pessoaId, @RequestBody HistoricoRequestDto dto) {
        Pessoa pessoa = pessoaRepository.findById(pessoaId)
                .orElseThrow(() -> new RuntimeException("Pessoa não encontrada"));

        Historico historico = new Historico();
        BeanUtils.copyProperties(dto, historico);

        historico.setPessoa(pessoa);
        historico.setDataAlteracao(LocalDateTime.now()); // Data gerada pelo servidor

        repository.save(historico);
        return ResponseEntity.status(HttpStatus.CREATED).body("Log de alteração registrado!");
    }

    @GetMapping("/pessoa/{pessoaId}")
    public ResponseEntity<List<Historico>> getByPessoa(@PathVariable Long pessoaId) {
        List<Historico> logs = repository.findAllByPessoaId(pessoaId);
        return ResponseEntity.ok(logs);
    }
}