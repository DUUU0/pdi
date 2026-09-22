package com.projeto.pdi.services;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.projeto.pdi.models.Historico;
import com.projeto.pdi.models.Pessoa;
import com.projeto.pdi.repositories.HistoricoRepository;

@Service
public class HistoricoService {

    public static final String CREATE = "CREATE";
    public static final String UPDATE = "UPDATE";
    public static final String DELETE = "DELETE";

    private final HistoricoRepository repository;
    private final ObjectMapper objectMapper;

    public HistoricoService(HistoricoRepository repository, ObjectMapper objectMapper) {
        this.repository = repository;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public void registrar(Pessoa pessoa, Long userId, String tipoOperacao, Object dadosAnteriores, Object dadosNovos) {
        Historico historico = new Historico();
        historico.setPessoa(pessoa);
        historico.setUserId(userId != null ? userId.intValue() : null);
        historico.setDataAlteracao(LocalDateTime.now());
        historico.setTipoOperacao(tipoOperacao);
        historico.setDadosAnteriores(paraJson(dadosAnteriores));
        historico.setDadosNovos(paraJson(dadosNovos));

        repository.saveAndFlush(historico);
    }

    private String paraJson(Object valor) {
        if (valor == null) return null;
        try {
            return objectMapper.writeValueAsString(valor);
        } catch (JsonProcessingException e) {
            return "{\"erro\":\"falha ao serializar: " + e.getMessage() + "\"}";
        }
    }
}
