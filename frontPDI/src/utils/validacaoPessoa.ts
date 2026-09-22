// Regras de validação e máscaras dos dados pessoais.
// Todos os campos são opcionais: só são validados quando preenchidos.
// As mesmas regras são aplicadas no backend (PessoaValidator.java).

export interface DadosPessoa {
    nome?: string | null;
    dataNascimento?: string | null;
    localNascimento?: string | null;
    rg?: string | null;
    cpf?: string | null;
    passaporte?: string | null;
    cnh?: string | null;
}

export type ErrosPessoa = Partial<Record<keyof DadosPessoa, string>>;

export const somenteDigitos = (valor: string) => valor.replace(/\D/g, '');

// ── CPF ──

export const mascaraCpf = (valor: string) => {
    const d = somenteDigitos(valor).slice(0, 11);
    return d
        .replace(/^(\d{3})(\d)/, '$1.$2')
        .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/\.(\d{3})(\d)/, '.$1-$2');
};

export const cpfValido = (valor: string) => {
    const d = somenteDigitos(valor);
    if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;

    const digito = (tamanho: number) => {
        let soma = 0;
        for (let i = 0; i < tamanho; i++) soma += Number(d[i]) * (tamanho + 1 - i);
        const resto = (soma * 10) % 11;
        return resto === 10 ? 0 : resto;
    };
    return digito(9) === Number(d[9]) && digito(10) === Number(d[10]);
};

// ── CNH (número de registro, 11 dígitos com 2 verificadores) ──

export const mascaraCnh = (valor: string) => somenteDigitos(valor).slice(0, 11);

export const cnhValida = (valor: string) => {
    const d = somenteDigitos(valor);
    if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;

    let soma = 0;
    for (let i = 0, peso = 9; i < 9; i++, peso--) soma += Number(d[i]) * peso;
    let dv1 = soma % 11;
    let desconto = 0;
    if (dv1 >= 10) {
        dv1 = 0;
        desconto = 2;
    }

    soma = 0;
    for (let i = 0, peso = 1; i < 9; i++, peso++) soma += Number(d[i]) * peso;
    const resto = soma % 11;
    const dv2 = resto >= 10 ? 0 : resto - desconto;

    return dv1 === Number(d[9]) && dv2 === Number(d[10]);
};

// ── RG ──
// O formato varia por estado (ex.: 12.345.678-9, MG-12.345.678, 1234567), e só alguns têm
// dígito verificador público, então valida-se a estrutura: UF opcional + 5 a 13 dígitos + dígito final (0-9 ou X)

export const mascaraRg = (valor: string) => valor.toUpperCase().replace(/[^0-9A-Z.\-\s]/g, '').slice(0, 20);

export const rgValido = (valor: string) => /^([A-Z]{2})?\d{5,13}[0-9X]?$/.test(valor.toUpperCase().replace(/[.\-\s]/g, ''));

// ── Passaporte ──
// Brasileiro: 2 letras + 6 dígitos (ex.: FZ123456). Estrangeiros: 6 a 9 caracteres alfanuméricos

export const mascaraPassaporte = (valor: string) => valor.toUpperCase().replace(/[^0-9A-Z]/g, '').slice(0, 9);

export const passaporteValido = (valor: string) => /^(?=.*\d)[A-Z0-9]{6,9}$/.test(valor.toUpperCase());

// ── Data de nascimento (yyyy-MM-dd, formato do input type="date") ──

export const DATA_NASCIMENTO_MINIMA = '1900-01-01';
export const hojeIso = () => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
};

export const erroDataNascimento = (valor: string): string | undefined => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(valor) || Number.isNaN(new Date(valor).getTime())) return 'Data inválida.';
    if (valor > hojeIso()) return 'A data de nascimento não pode estar no futuro.';
    if (valor < DATA_NASCIMENTO_MINIMA) return 'A data de nascimento deve ser posterior a 1900.';
    return undefined;
};

// ── Nome ──

export const nomeValido = (valor: string) => /^[\p{L}][\p{L}\s'.-]{1,254}$/u.test(valor.trim());

// ── Validação completa ──

export const validarCampo = (campo: keyof DadosPessoa, valor: unknown): string | undefined => {
    const v = String(valor ?? '').trim();
    if (!v) return undefined;

    switch (campo) {
        case 'nome':
            return nomeValido(v) ? undefined : 'Nome deve ter ao menos 2 letras e não conter números ou símbolos.';
        case 'cpf':
            return cpfValido(v) ? undefined : 'CPF inválido. Verifique os dígitos.';
        case 'cnh':
            return cnhValida(v) ? undefined : 'CNH inválida. Deve conter 11 dígitos válidos.';
        case 'rg':
            return rgValido(v) ? undefined : 'RG inválido. Use de 5 a 14 dígitos, com UF e dígito X opcionais.';
        case 'passaporte':
            return passaporteValido(v) ? undefined : 'Passaporte inválido. Use de 6 a 9 letras/números (ex.: FZ123456).';
        case 'dataNascimento':
            return erroDataNascimento(v);
        case 'localNascimento':
            return v.length <= 255 ? undefined : 'Máximo de 255 caracteres.';
        default:
            return undefined;
    }
};

const CAMPOS_VALIDADOS: (keyof DadosPessoa)[] = ['nome', 'dataNascimento', 'localNascimento', 'rg', 'cpf', 'passaporte', 'cnh'];

// Valida só os campos pessoais: o objeto pode trazer outros (id, pessoaId, createdAt...)
export const validarPessoa = (pessoa: DadosPessoa): ErrosPessoa => {
    const erros: ErrosPessoa = {};
    CAMPOS_VALIDADOS.forEach((campo) => {
        const erro = validarCampo(campo, pessoa[campo]);
        if (erro) erros[campo] = erro;
    });
    return erros;
};

// Aplica a máscara adequada a cada campo enquanto o usuário digita
export const aplicarMascara = (campo: string, valor: string) => {
    switch (campo) {
        case 'cpf': return mascaraCpf(valor);
        case 'cnh': return mascaraCnh(valor);
        case 'rg': return mascaraRg(valor);
        case 'passaporte': return mascaraPassaporte(valor);
        default: return valor;
    }
};

// Extrai os erros por campo devolvidos pelo backend ({ erros: { cpf: '...' } })
export const errosDaResposta = (error: unknown): ErrosPessoa | null => {
    const data = (error as { response?: { data?: { erros?: ErrosPessoa } } })?.response?.data;
    return data?.erros ?? null;
};
