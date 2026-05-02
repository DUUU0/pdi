package com.projeto.pdi.controllers;

import com.projeto.pdi.dtos.CaracteristicasAdicionaisRequestDto;
import com.projeto.pdi.models.CaracteristicasAdicionais;
import com.projeto.pdi.models.Pessoa;
import com.projeto.pdi.repositories.CaracteristicasAdicionaisRepository;
import com.projeto.pdi.repositories.PessoaRepository;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/caracteristicas-adicionais")
public class CaracteristicasAdicionaisController {

    @Autowired
    private CaracteristicasAdicionaisRepository repository;
    @Autowired
    private PessoaRepository pessoaRepository;

    @PutMapping("/pessoa/{pessoaId}")
    public ResponseEntity<Object> update(@PathVariable Long pessoaId, @RequestBody CaracteristicasAdicionaisRequestDto dto) {
        Pessoa pessoa = pessoaRepository.findById(pessoaId)
                .orElseThrow(() -> new RuntimeException("Pessoa não encontrada"));

        CaracteristicasAdicionais carac = repository.findByPessoaId(pessoaId)
                .orElseGet(() -> {
                    CaracteristicasAdicionais nova = new CaracteristicasAdicionais();
                    nova.setPessoa(pessoa);
                    return nova;
                });

        BeanUtils.copyProperties(dto, carac, "id", "pessoa");
        carac.setPessoa(pessoa);

        repository.save(carac);
        return ResponseEntity.ok("Características adicionais atualizadas!");
    }

    @GetMapping("/pessoa/{pessoaId}")
    public ResponseEntity<Object> get(@PathVariable Long pessoaId) {
        return repository.findByPessoaId(pessoaId)
                .<ResponseEntity<Object>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body("Registro não encontrado."));
    }
}
