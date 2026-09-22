package com.projeto.pdi.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.projeto.pdi.dtos.HistoricoResponseDto;
import com.projeto.pdi.repositories.HistoricoRepository;


@RestController
@RequestMapping("/historico")
public class HistoricoController {

    @Autowired
    private HistoricoRepository repository;

    @GetMapping("/pessoa/{pessoaId}")
    public ResponseEntity<List<HistoricoResponseDto>> getByPessoa(@PathVariable Long pessoaId) {
        List<HistoricoResponseDto> logs = repository.listarComNomeUsuario(pessoaId);
        return ResponseEntity.ok(logs);
    }
}