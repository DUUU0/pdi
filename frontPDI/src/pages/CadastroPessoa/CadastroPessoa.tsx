import React, { useState, useEffect } from 'react';
import styles from './CadastroPessoa.module.scss';
import { apiClient } from '../../services/api';
import { useNavigate, Link } from 'react-router-dom';

const CadastroPessoa: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // Estado inicial vazio - nenhum campo é obrigatório
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
        setPessoa(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Removidas todas as validações de campos preenchidos.
        // O formulário pode ser enviado 100% em branco.

        if (!pessoa.criadoPorId) {
            alert("Aviso: ID do criador não detectado (Pode causar erro dependendo do backend).");
        }

        setLoading(true);
        console.log("Enviando para o Backend (Permitindo campos vazios):", pessoa);

        try {
            await apiClient.post('/pessoas', pessoa);
            alert('Registro criado com sucesso!');
            navigate('/dashboard');
        } catch (error: any) {
            console.error("Erro ao salvar:", error);
            const errorMsg = error.response?.data?.message || 'Erro ao salvar o registro. Verifique se o backend permite campos nulos.';
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
                    <Link to="/nf">Registro Agências</Link>
                    <Link to="/cadastro-pessoa" className={`${styles.btnAction} ${styles.active}`}>+ Novo Registro</Link>
                </nav>
            </header>

            <main className={styles.container}>
                <form onSubmit={handleSubmit} className={styles.formCard}>
                    <div className={styles.pageHeader}>
                        <div className={styles.titleSection}>
                            <h2>Novo Registro Civil</h2>
                            <p>Criação de ficha de identificação (Campos opcionais)</p>
                        </div>
                    </div>

                    <div className={styles.inputGrid}>
                        <div className={styles.inputGroup}>
                            <label>Nome Completo</label>
                            <input
                                type="text"
                                name="nome"
                                value={pessoa.nome}
                                onChange={handleChange}
                                placeholder="Opcional"
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label>CPF</label>
                            <input
                                type="text"
                                name="cpf"
                                value={pessoa.cpf}
                                onChange={handleChange}
                                placeholder="Opcional"
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label>Data de Nascimento</label>
                            <input
                                type="date"
                                name="dataNascimento"
                                value={pessoa.dataNascimento}
                                onChange={handleChange}
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label>Local de Nascimento</label>
                            <input
                                type="text"
                                name="localNascimento"
                                value={pessoa.localNascimento}
                                onChange={handleChange}
                                placeholder="Opcional"
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label>RG</label>
                            <input
                                type="text"
                                name="rg"
                                value={pessoa.rg}
                                onChange={handleChange}
                                placeholder="Opcional"
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label>Passaporte</label>
                            <input
                                type="text"
                                name="passaporte"
                                value={pessoa.passaporte}
                                onChange={handleChange}
                                placeholder="Opcional"
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label>CNH</label>
                            <input
                                type="text"
                                name="cnh"
                                value={pessoa.cnh}
                                onChange={handleChange}
                                placeholder="Opcional"
                            />
                        </div>
                    </div>

                    <div className={styles.formFooter}>
                        <p className={styles.infoText}>* Nenhum campo é obrigatório para a criação inicial do template.</p>
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