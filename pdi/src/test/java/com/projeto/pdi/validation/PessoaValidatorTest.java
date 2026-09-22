package com.projeto.pdi.validation;

import com.projeto.pdi.dtos.PessoaRequestDto;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class PessoaValidatorTest {

    private static PessoaRequestDto pessoa(String nome, LocalDate nascimento, String rg, String cpf, String passaporte, String cnh) {
        return new PessoaRequestDto(nome, nascimento, null, rg, cpf, passaporte, cnh, null, null);
    }

    @Test
    void cpf() {
        assertTrue(PessoaValidator.cpfValido("529.982.247-25"));
        assertTrue(PessoaValidator.cpfValido("52998224725"));
        assertFalse(PessoaValidator.cpfValido("529.982.247-24"));
        assertFalse(PessoaValidator.cpfValido("111.111.111-11"));
        assertFalse(PessoaValidator.cpfValido("1234"));
        assertEquals("529.982.247-25", PessoaValidator.formatarCpf("52998224725"));
    }

    @Test
    void cnh() {
        // Mesmos valores aceitos pelo frontend (validacaoPessoa.ts)
        assertTrue(PessoaValidator.cnhValida("12345678026"));
        assertTrue(PessoaValidator.cnhValida("12345678134"));
        assertTrue(PessoaValidator.cnhValida("12345678242"));
        assertFalse(PessoaValidator.cnhValida("12345678027"));
        assertFalse(PessoaValidator.cnhValida("11111111111"));
        assertFalse(PessoaValidator.cnhValida("123"));
    }

    @Test
    void camposVaziosSaoAceitos() {
        assertTrue(PessoaValidator.validar(pessoa("", null, " ", null, "", null)).isEmpty());
    }

    @Test
    void registroValido() {
        Map<String, String> erros = PessoaValidator.validar(pessoa(
                "Maria D'Ávila", LocalDate.of(1990, 5, 10), "MG-12.345.678", "529.982.247-25", "FZ123456", "12345678026"));
        assertTrue(erros.isEmpty(), erros.toString());
    }

    @Test
    void registroInvalidoApontaCadaCampo() {
        Map<String, String> erros = PessoaValidator.validar(pessoa(
                "J0ão", LocalDate.now().plusDays(1), "12AB", "529.982.247-24", "A1", "11111111111"));
        assertEquals(java.util.Set.of("nome", "dataNascimento", "rg", "cpf", "passaporte", "cnh"), erros.keySet());
    }

    @Test
    void dataNascimentoAnteriorA1900() {
        assertTrue(PessoaValidator.validar(pessoa(null, LocalDate.of(1850, 1, 1), null, null, null, null))
                .containsKey("dataNascimento"));
    }
}
