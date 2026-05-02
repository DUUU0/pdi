package com.projeto.pdi.repositories;

import com.projeto.pdi.models.CaracteristicasAdicionais;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CaracteristicasAdicionaisRepository extends JpaRepository<CaracteristicasAdicionais, Long> {
    Optional<CaracteristicasAdicionais> findByPessoaId(Long pessoaId);
}
