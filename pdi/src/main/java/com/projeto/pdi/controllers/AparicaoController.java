package com.projeto.pdi.controllers;

import com.projeto.pdi.dtos.AparicaoRequestDto;
import com.projeto.pdi.dtos.AparicaoResponseDto;
import com.projeto.pdi.models.Aparicao;
import com.projeto.pdi.repositories.AparicaoRepository;
import com.projeto.pdi.repositories.PessoaRepository;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/aparicoes")
@CrossOrigin("*")
public class AparicaoController {

    @Autowired
    private AparicaoRepository repository;

    @Autowired
    private PessoaRepository pessoaRepository;

    @GetMapping
    public List<AparicaoResponseDto> listarTodas() {
        return repository.listarTodasComDadosPessoais();
    }

    @GetMapping("/pessoa/{pessoaId}")
    public List<AparicaoResponseDto> buscarPorPessoa(@PathVariable Integer pessoaId) {
        return repository.buscarPorPessoaComDadosPessoais(pessoaId);
    }

    // Aparições que possuem coordenadas (usado pela tela de mapa)
    @GetMapping("/localizadas")
    public List<AparicaoResponseDto> listarLocalizadas() {
        return repository.listarLocalizadas();
    }

    // Registra uma aparição (ex.: enviada pelo serviço de reconhecimento facial), com a localização da captura
    @PostMapping
    public ResponseEntity<Object> registrar(@RequestBody AparicaoRequestDto dto) {
        if (dto.pessoaId() == null || !pessoaRepository.existsById(dto.pessoaId().longValue())) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Pessoa não encontrada");
        }
        if ((dto.latitude() == null) != (dto.longitude() == null)) {
            return ResponseEntity.badRequest().body("Informe latitude e longitude juntas");
        }

        Aparicao aparicao = new Aparicao();
        BeanUtils.copyProperties(dto, aparicao);
        if (aparicao.getDataHora() == null) {
            aparicao.setDataHora(LocalDateTime.now());
        }
        Aparicao saved = repository.save(aparicao);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved.getId());
    }
}
