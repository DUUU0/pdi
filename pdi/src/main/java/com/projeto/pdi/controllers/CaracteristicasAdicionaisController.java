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

import com.projeto.pdi.dtos.CaracteristicasAdicionaisRequestDto;
import com.projeto.pdi.models.CaracteristicasAdicionais;
import com.projeto.pdi.models.Pessoa;
import com.projeto.pdi.models.User;
import com.projeto.pdi.repositories.CaracteristicasAdicionaisRepository;
import com.projeto.pdi.repositories.PessoaRepository;
import com.projeto.pdi.security.AuthenticatedUser;
import com.projeto.pdi.services.HistoricoService;

@RestController
@RequestMapping("/caracteristicas-adicionais")
public class CaracteristicasAdicionaisController {

    @Autowired
    private CaracteristicasAdicionaisRepository repository;

    @Autowired
    private PessoaRepository pessoaRepository;

    @Autowired
    private HistoricoService historicoService;

    @Autowired
    private AuthenticatedUser authenticatedUser;

    @PutMapping("/pessoa/{pessoaId}")
    public ResponseEntity<Object> update(@PathVariable Long pessoaId, @RequestBody CaracteristicasAdicionaisRequestDto dto) {
        Pessoa pessoa = pessoaRepository.findById(pessoaId)
                .orElseThrow(() -> new RuntimeException("Pessoa não encontrada"));

        Optional<CaracteristicasAdicionais> caracOptional = repository.findByPessoaId(pessoaId);
        boolean isNovo = caracOptional.isEmpty();

        CaracteristicasAdicionais carac = caracOptional.orElseGet(() -> {
            CaracteristicasAdicionais nova = new CaracteristicasAdicionais();
            nova.setPessoa(pessoa);
            return nova;
        });

        // Snapshot do estado anterior
        CaracteristicasAdicionais antes = null;
        if (!isNovo) {
            antes = new CaracteristicasAdicionais();
            BeanUtils.copyProperties(carac, antes);
        }

        BeanUtils.copyProperties(dto, carac, "id", "pessoa");
        carac.setPessoa(pessoa);

        CaracteristicasAdicionais saved = repository.save(carac);

        User usuario = authenticatedUser.getUsuarioLogado();
        String acao = isNovo ? HistoricoService.CREATE : HistoricoService.UPDATE;

        historicoService.registrar(pessoa, usuario.getId(), acao, antes, saved);

        return ResponseEntity.ok("Características adicionais atualizadas!");
    }

    @GetMapping("/pessoa/{pessoaId}")
    public ResponseEntity<Object> get(@PathVariable Long pessoaId) {
        return repository.findByPessoaId(pessoaId)
                .<ResponseEntity<Object>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body("Registro não encontrado."));
    }
}