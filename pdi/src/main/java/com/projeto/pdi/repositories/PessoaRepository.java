package com.projeto.pdi.repositories;

import com.projeto.pdi.models.Pessoa;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.Optional;

public interface PessoaRepository extends JpaRepository<Pessoa, Long> {
    Optional<Pessoa> findByCpf(String cpf);

    // Considera registros antigos gravados sem pontuação
    boolean existsByCpfInAndIdNot(Collection<String> cpfs, Long id);
}
