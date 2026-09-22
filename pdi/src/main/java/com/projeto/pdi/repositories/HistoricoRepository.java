package com.projeto.pdi.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.projeto.pdi.dtos.HistoricoResponseDto;
import com.projeto.pdi.models.Historico;

public interface HistoricoRepository extends JpaRepository<Historico, Long> {

    List<Historico> findAllByPessoaId(Long pessoaId);

    @Query("SELECT new com.projeto.pdi.dtos.HistoricoResponseDto(" +
            "h.id, p.id, h.userId, u.nome, h.dataAlteracao, h.tipoOperacao, h.dadosAnteriores, h.dadosNovos) " +
            "FROM Historico h " +
            "JOIN h.pessoa p " +
            "LEFT JOIN com.projeto.pdi.models.User u ON u.id = h.userId " +
            "WHERE p.id = :pessoaId " +
            "ORDER BY h.dataAlteracao DESC")
    List<HistoricoResponseDto> listarComNomeUsuario(@Param("pessoaId") Long pessoaId);
}
