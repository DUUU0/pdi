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

import com.projeto.pdi.dtos.AnomaliasRequestDto;
import com.projeto.pdi.models.Anomalias;
import com.projeto.pdi.models.Pessoa;
import com.projeto.pdi.models.User;
import com.projeto.pdi.repositories.AnomaliasRepository;
import com.projeto.pdi.repositories.PessoaRepository;
import com.projeto.pdi.security.AuthenticatedUser;
import com.projeto.pdi.services.HistoricoService;

@RestController
@RequestMapping("/anomalias")
public class AnomaliasController {

    @Autowired
    private AnomaliasRepository repository;

    @Autowired
    private PessoaRepository pessoaRepository;

    @Autowired
    private HistoricoService historicoService;

    @Autowired
    private AuthenticatedUser authenticatedUser;

    @PutMapping("/pessoa/{pessoaId}")
    public ResponseEntity<Object> update(@PathVariable Long pessoaId, @RequestBody AnomaliasRequestDto dto) {
        Pessoa pessoa = pessoaRepository.findById(pessoaId)
                .orElseThrow(() -> new RuntimeException("Pessoa não encontrada"));

        Optional<Anomalias> anomaliaOptional = repository.findByPessoaId(pessoaId);
        boolean isNovo = anomaliaOptional.isEmpty();

        Anomalias anomalia = anomaliaOptional.orElseGet(() -> {
            Anomalias nova = new Anomalias();
            nova.setPessoa(pessoa);
            return nova;
        });

        // Tira snapshot do estado anterior caso já existisse
        Anomalias antes = null;
        if (!isNovo) {
            antes = new Anomalias();
            BeanUtils.copyProperties(anomalia, antes);
        }

        BeanUtils.copyProperties(dto, anomalia, "id", "pessoa");
        anomalia.setPessoa(pessoa);

        Anomalias saved = repository.save(anomalia);

        User usuario = authenticatedUser.getUsuarioLogado();
        String acao = isNovo ? HistoricoService.CREATE : HistoricoService.UPDATE;

        historicoService.registrar(pessoa, usuario.getId(), acao, antes, saved);

        return ResponseEntity.ok("Anomalias atualizadas com sucesso!");
    }

    @GetMapping("/pessoa/{pessoaId}")
    public ResponseEntity<Object> get(@PathVariable Long pessoaId) {
        return repository.findByPessoaId(pessoaId)
                .<ResponseEntity<Object>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body("Registro não encontrado."));
    }
}