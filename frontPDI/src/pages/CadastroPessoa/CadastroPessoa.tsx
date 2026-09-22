import React, { useState } from 'react';
import styles from './CadastroPessoa.module.scss';
import { apiClient } from '../../services/api';
import { useNavigate, Link } from 'react-router-dom';
import {
    aplicarMascara,
    DATA_NASCIMENTO_MINIMA,
    errosDaResposta,
    hojeIso,
    validarCampo,
    validarPessoa,
    type DadosPessoa,
    type ErrosPessoa,
} from '../../utils/validacaoPessoa';

interface Campo {
    name: keyof DadosPessoa;
    label: string;
    placeholder?: string;
    type?: string;
}

const CAMPOS: Campo[] = [
    { name: 'nome', label: 'Nome Completo', placeholder: 'Opcional' },
    { name: 'cpf', label: 'CPF', placeholder: '000.000.000-00' },
    { name: 'dataNascimento', label: 'Data de Nascimento', type: 'date' },
    { name: 'localNascimento', label: 'Local de Nascimento', placeholder: 'Opcional' },
    { name: 'rg', label: 'RG', placeholder: 'Ex.: 12.345.678-9' },
    { name: 'passaporte', label: 'Passaporte', placeholder: 'Ex.: FZ123456' },
    { name: 'cnh', label: 'CNH', placeholder: '11 dígitos' },
];

const CadastroPessoa: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [erros, setErros] = useState<ErrosPessoa>({});

    // Estado inicial vazio - nenhum campo é obrigatório, mas os preenchidos precisam ser válidos
    const [pessoa, setPessoa] = useState({
        nome: '',
        dataNascimento: '',
        localNascimento: '',
        rg: '',
        cpf: '',
        passaporte: '',
        cnh: '',
        criadoPorId: 4
    });

    /*useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await apiClient.get('/users/me');
                const userId = response.data.id;
                setPessoa(prev => ({ ...prev, criadoPorId: userId }));
            } catch (error) {
                console.error("Erro ao carregar usuário logado:", error);
            }
        };
        fetchUserData();
    }, []);*/

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPessoa(prev => ({ ...prev, [name]: aplicarMascara(name, value) }));
        // Limpa o erro enquanto o usuário corrige; a validação volta ao sair do campo
        if (erros[name as keyof DadosPessoa]) {
            setErros(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const campo = e.target.name as keyof DadosPessoa;
        setErros(prev => ({ ...prev, [campo]: validarCampo(campo, pessoa[campo]) }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const errosValidacao = validarPessoa(pessoa);
        setErros(errosValidacao);
        if (Object.keys(errosValidacao).length > 0) return;

        if (!pessoa.criadoPorId) {
            alert("Aviso: ID do criador não detectado (Pode causar erro dependendo do backend).");
        }

        setLoading(true);

        try {
            // Campos vazios vão como null para não gravar strings vazias
            const payload = Object.fromEntries(
                Object.entries(pessoa).map(([k, v]) => [k, typeof v === 'string' && !v.trim() ? null : v]),
            );
            await apiClient.post('/pessoas', payload);
            alert('Registro criado com sucesso!');
            navigate('/dashboard');
        } catch (error: any) {
            console.error("Erro ao salvar:", error);
            const errosBackend = errosDaResposta(error);
            if (errosBackend) {
                setErros(errosBackend);
                return;
            }
            const errorMsg = error.response?.data?.message || 'Erro ao salvar o registro.';
            alert(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.appContainer}>
            {/* HEADER GLOBAL PADRONIZADO */}
            <header className={styles.globalHeader}>
                <div className={styles.logo}>SISTEMA DE IDENTIFICAÇÃO</div>
                <nav className={styles.navLinks}>
                    <Link to="/dashboard">Dashboard</Link>
                    <Link to="/supervisao">Supervisão</Link>
                    <Link to="/mapa">Mapa</Link>
                    <Link to="/nf">Registro Agências</Link>
                    <Link to="/cadastro-pessoa" className={`${styles.btnAction} ${styles.active}`}>+ Novo Registro</Link>
                </nav>
            </header>

            <main className={styles.container}>
                <form onSubmit={handleSubmit} className={styles.formCard} noValidate>
                    <div className={styles.pageHeader}>
                        <div className={styles.titleSection}>
                            <h2>Novo Registro Civil</h2>
                            <p>Criação de ficha de identificação (Campos opcionais)</p>
                        </div>
                    </div>

                    <div className={styles.inputGrid}>
                        {CAMPOS.map((campo) => (
                            <div key={campo.name} className={styles.inputGroup}>
                                <label htmlFor={campo.name}>{campo.label}</label>
                                <input
                                    id={campo.name}
                                    type={campo.type ?? 'text'}
                                    name={campo.name}
                                    value={pessoa[campo.name]}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    placeholder={campo.placeholder}
                                    className={erros[campo.name] ? styles.inputInvalid : ''}
                                    aria-invalid={!!erros[campo.name]}
                                    {...(campo.type === 'date' ? { min: DATA_NASCIMENTO_MINIMA, max: hojeIso() } : {})}
                                />
                                {erros[campo.name] && <span className={styles.fieldError}>{erros[campo.name]}</span>}
                            </div>
                        ))}
                    </div>

                    <div className={styles.formFooter}>
                        <p className={styles.infoText}>* Nenhum campo é obrigatório, mas os preenchidos devem ser válidos.</p>
                        <div className={styles.buttonArea}>
                            <button type="button" onClick={() => navigate('/dashboard')} className={styles.cancelBtn}>
                                Cancelar
                            </button>
                            <button type="submit" disabled={loading} className={styles.submitBtn}>
                                {loading ? 'Processando...' : 'Salvar Registro Vazio/Parcial'}
                            </button>
                        </div>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default CadastroPessoa;
