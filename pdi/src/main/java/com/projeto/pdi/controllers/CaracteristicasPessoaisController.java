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

import com.projeto.pdi.dtos.CaracteristicasRequestDto;
import com.projeto.pdi.dtos.CaracteristicasResponseDto;
import com.projeto.pdi.models.CaracteristicasPessoais;
import com.projeto.pdi.models.Pessoa;
import com.projeto.pdi.models.User;
import com.projeto.pdi.repositories.CaracteristicasPessoaisRepository;
import com.projeto.pdi.repositories.PessoaRepository;
import com.projeto.pdi.security.AuthenticatedUser;
import com.projeto.pdi.services.HistoricoService;

@RestController
@RequestMapping("/caracteristicas")
public class CaracteristicasPessoaisController {

    @Autowired
    private CaracteristicasPessoaisRepository repository;

    @Autowired
    private PessoaRepository pessoaRepository;

    @Autowired
    private HistoricoService historicoService;

    @Autowired
    private AuthenticatedUser authenticatedUser;

    @GetMapping("/pessoa/{pessoaId}")
    public ResponseEntity<Object> getByPessoaId(@PathVariable Long pessoaId) {
        Optional<CaracteristicasPessoais> carac = repository.findById(pessoaId);

        return carac.<ResponseEntity<Object>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body("Características não encontradas."));
    }

    @PutMapping("/pessoa/{pessoaId}")
    public ResponseEntity<Object> update(
            @PathVariable Long pessoaId,
            @RequestBody CaracteristicasRequestDto dto) {

        Pessoa pessoa = pessoaRepository.findById(pessoaId)
                .orElseThrow(() -> new RuntimeException("Pessoa não encontrada"));

        Optional<CaracteristicasPessoais> existente = repository.findById(pessoaId);
        CaracteristicasResponseDto antes = existente.map(this::mapToResponse).orElse(null);
        String tipoOperacao = existente.isPresent() ? HistoricoService.UPDATE : HistoricoService.CREATE;

        CaracteristicasPessoais carac = existente.orElseGet(() -> {
            CaracteristicasPessoais nova = new CaracteristicasPessoais();
            nova.setPessoa(pessoa);
            pessoa.setCaracteristicas(nova);
            return nova;
        });

        BeanUtils.copyProperties(dto, carac, "pessoa", "pessoaId");

        carac.setPessoa(pessoa);
        pessoa.setCaracteristicas(carac);

        CaracteristicasPessoais salvo = repository.save(carac);
        CaracteristicasResponseDto depois = mapToResponse(salvo);

        User usuario = authenticatedUser.getUsuarioLogado();
        historicoService.registrar(pessoa, usuario.getId(), tipoOperacao, antes, depois);

        return ResponseEntity.ok("Dados atualizados com sucesso!");
    }

    private CaracteristicasResponseDto mapToResponse(CaracteristicasPessoais c) {
        return new CaracteristicasResponseDto(
                c.getPessoaId(), c.getGenero(), c.getRaca(), c.getAltura(),
                c.getPeso(), c.getBiotipo(), c.getCabelo(), c.getRoupaUsoComum()
        );
    }
}