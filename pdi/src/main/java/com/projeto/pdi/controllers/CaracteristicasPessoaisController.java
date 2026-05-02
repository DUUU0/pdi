package com.projeto.pdi.controllers;

import com.projeto.pdi.dtos.CaracteristicasRequestDto;
import com.projeto.pdi.dtos.CaracteristicasResponseDto;
import com.projeto.pdi.models.CaracteristicasPessoais;
import com.projeto.pdi.models.Pessoa;
import com.projeto.pdi.repositories.CaracteristicasPessoaisRepository;
import com.projeto.pdi.repositories.PessoaRepository;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/caracteristicas")
public class CaracteristicasPessoaisController {

    @Autowired
    private CaracteristicasPessoaisRepository repository;

    @Autowired
    private PessoaRepository pessoaRepository;

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

        CaracteristicasPessoais carac = repository.findById(pessoaId)
                .orElseGet(() -> {
                    CaracteristicasPessoais nova = new CaracteristicasPessoais();

                    nova.setPessoa(pessoa);
                    pessoa.setCaracteristicas(nova);

                    return nova;
                });

        BeanUtils.copyProperties(dto, carac, "pessoa", "pessoaId");

        carac.setPessoa(pessoa);
        pessoa.setCaracteristicas(carac);

        repository.save(carac);

        return ResponseEntity.ok("Dados atualizados com sucesso!");
    }
}