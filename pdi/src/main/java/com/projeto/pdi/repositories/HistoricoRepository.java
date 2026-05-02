package com.projeto.pdi.repositories;

import com.projeto.pdi.models.Historico;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HistoricoRepository extends JpaRepository<Historico, Long> {
    List<Historico> findAllByPessoaId(Long pessoaId);
}
