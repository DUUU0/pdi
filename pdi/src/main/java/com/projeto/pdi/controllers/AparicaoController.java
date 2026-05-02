package com.projeto.pdi.controllers;

import com.projeto.pdi.dtos.AparicaoResponseDto;
import com.projeto.pdi.repositories.AparicaoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/aparicoes")
@CrossOrigin("*")
public class AparicaoController {

    @Autowired
    private AparicaoRepository repository;

    @GetMapping
    public List<AparicaoResponseDto> listarTodas() {
        return repository.listarTodasComDadosPessoais();
    }

    @GetMapping("/pessoa/{pessoaId}")
    public List<AparicaoResponseDto> buscarPorPessoa(@PathVariable Integer pessoaId) {
        return repository.buscarPorPessoaComDadosPessoais(pessoaId);
    }
}