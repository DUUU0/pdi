package com.projeto.pdi.repositories;

import com.projeto.pdi.dtos.AparicaoResponseDto;
import com.projeto.pdi.models.Aparicao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface AparicaoRepository extends JpaRepository<Aparicao, Long> {
    @Query("SELECT new com.projeto.pdi.dtos.AparicaoResponseDto(a.id, p.id, p.nome, p.cpf, a.dataHora, a.similaridade, a.local, a.latitude, a.longitude) " +
            "FROM Aparicao a JOIN Pessoa p ON a.pessoaId = p.id " +
            "ORDER BY a.dataHora DESC")
    List<AparicaoResponseDto> listarTodasComDadosPessoais();

    @Query("SELECT new com.projeto.pdi.dtos.AparicaoResponseDto(a.id, p.id, p.nome, p.cpf, a.dataHora, a.similaridade, a.local, a.latitude, a.longitude) " +
            "FROM Aparicao a JOIN Pessoa p ON a.pessoaId = p.id " +
            "WHERE p.id = :pessoaId " +
            "ORDER BY a.dataHora DESC")
    List<AparicaoResponseDto> buscarPorPessoaComDadosPessoais(Integer pessoaId);

    // Apenas aparições com coordenadas, para exibição no mapa
    @Query("SELECT new com.projeto.pdi.dtos.AparicaoResponseDto(a.id, p.id, p.nome, p.cpf, a.dataHora, a.similaridade, a.local, a.latitude, a.longitude) " +
            "FROM Aparicao a JOIN Pessoa p ON a.pessoaId = p.id " +
            "WHERE a.latitude IS NOT NULL AND a.longitude IS NOT NULL " +
            "ORDER BY a.dataHora DESC")
    List<AparicaoResponseDto> listarLocalizadas();
}
