package com.projeto.pdi.repositories;

import com.projeto.pdi.models.Anomalias;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AnomaliasRepository extends JpaRepository<Anomalias, Long> {
    Optional<Anomalias> findByPessoaId(Long pessoaId);
}
