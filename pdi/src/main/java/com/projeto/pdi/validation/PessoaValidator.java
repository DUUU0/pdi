package com.projeto.pdi.validation;

import com.projeto.pdi.dtos.PessoaRequestDto;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.regex.Pattern;

/**
 * Validação dos dados pessoais. Todos os campos são opcionais: só são validados quando preenchidos.
 * As mesmas regras são aplicadas no frontend (src/utils/validacaoPessoa.ts).
 */
public final class PessoaValidator {

    private static final LocalDate DATA_NASCIMENTO_MINIMA = LocalDate.of(1900, 1, 1);
    private static final Pattern NOME = Pattern.compile("^\\p{L}[\\p{L}\\s'.-]{1,254}$");
    // UF opcional + 5 a 13 dígitos + dígito final (0-9 ou X); o formato do RG varia por estado
    private static final Pattern RG = Pattern.compile("^([A-Z]{2})?\\d{5,13}[0-9X]?$");
    // Brasileiro: 2 letras + 6 dígitos; estrangeiros: 6 a 9 caracteres alfanuméricos
    private static final Pattern PASSAPORTE = Pattern.compile("^(?=.*\\d)[A-Z0-9]{6,9}$");

    private PessoaValidator() {
    }

    /** Retorna os erros encontrados, indexados pelo nome do campo (vazio quando tudo é válido). */
    public static Map<String, String> validar(PessoaRequestDto dto) {
        Map<String, String> erros = new LinkedHashMap<>();

        if (preenchido(dto.nome()) && !NOME.matcher(dto.nome().trim()).matches()) {
            erros.put("nome", "Nome deve ter ao menos 2 letras e não conter números ou símbolos.");
        }
        if (preenchido(dto.cpf()) && !cpfValido(dto.cpf())) {
            erros.put("cpf", "CPF inválido. Verifique os dígitos.");
        }
        if (preenchido(dto.cnh()) && !cnhValida(dto.cnh())) {
            erros.put("cnh", "CNH inválida. Deve conter 11 dígitos válidos.");
        }
        if (preenchido(dto.rg()) && !RG.matcher(dto.rg().toUpperCase().replaceAll("[.\\-\\s]", "")).matches()) {
            erros.put("rg", "RG inválido. Use de 5 a 14 dígitos, com UF e dígito X opcionais.");
        }
        if (preenchido(dto.passaporte()) && !PASSAPORTE.matcher(dto.passaporte().trim().toUpperCase()).matches()) {
            erros.put("passaporte", "Passaporte inválido. Use de 6 a 9 letras/números (ex.: FZ123456).");
        }
        if (dto.dataNascimento() != null) {
            if (dto.dataNascimento().isAfter(LocalDate.now())) {
                erros.put("dataNascimento", "A data de nascimento não pode estar no futuro.");
            } else if (dto.dataNascimento().isBefore(DATA_NASCIMENTO_MINIMA)) {
                erros.put("dataNascimento", "A data de nascimento deve ser posterior a 1900.");
            }
        }
        if (preenchido(dto.localNascimento()) && dto.localNascimento().length() > 255) {
            erros.put("localNascimento", "Máximo de 255 caracteres.");
        }
        return erros;
    }

    public static boolean cpfValido(String valor) {
        String d = somenteDigitos(valor);
        if (d.length() != 11 || d.chars().distinct().count() == 1) return false;
        return digitoCpf(d, 9) == d.charAt(9) - '0' && digitoCpf(d, 10) == d.charAt(10) - '0';
    }

    private static int digitoCpf(String d, int tamanho) {
        int soma = 0;
        for (int i = 0; i < tamanho; i++) {
            soma += (d.charAt(i) - '0') * (tamanho + 1 - i);
        }
        int resto = (soma * 10) % 11;
        return resto == 10 ? 0 : resto;
    }

    public static boolean cnhValida(String valor) {
        String d = somenteDigitos(valor);
        if (d.length() != 11 || d.chars().distinct().count() == 1) return false;

        int soma = 0;
        for (int i = 0, peso = 9; i < 9; i++, peso--) {
            soma += (d.charAt(i) - '0') * peso;
        }
        int dv1 = soma % 11;
        int desconto = 0;
        if (dv1 >= 10) {
            dv1 = 0;
            desconto = 2;
        }

        soma = 0;
        for (int i = 0, peso = 1; i < 9; i++, peso++) {
            soma += (d.charAt(i) - '0') * peso;
        }
        int resto = soma % 11;
        int dv2 = resto >= 10 ? 0 : resto - desconto;

        return dv1 == d.charAt(9) - '0' && dv2 == d.charAt(10) - '0';
    }

    // ── Normalização para gravação ──

    /** CPF sempre gravado como 000.000.000-00. */
    public static String formatarCpf(String valor) {
        if (!preenchido(valor)) return null;
        String d = somenteDigitos(valor);
        return d.substring(0, 3) + "." + d.substring(3, 6) + "." + d.substring(6, 9) + "-" + d.substring(9);
    }

    public static String somenteDigitosOuNulo(String valor) {
        return preenchido(valor) ? somenteDigitos(valor) : null;
    }

    public static String maiusculoOuNulo(String valor) {
        return preenchido(valor) ? valor.trim().toUpperCase() : null;
    }

    public static String textoOuNulo(String valor) {
        return preenchido(valor) ? valor.trim() : null;
    }

    private static String somenteDigitos(String valor) {
        return valor.replaceAll("\\D", "");
    }

    private static boolean preenchido(String valor) {
        return valor != null && !valor.isBlank();
    }
}
