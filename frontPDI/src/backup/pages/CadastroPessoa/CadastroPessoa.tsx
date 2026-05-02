import React, { useState, useEffect } from 'react';
import styles from './CadastroPessoa.module.scss';
import { apiClient } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const CadastroPessoa: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // Estado alinhado com a Entity Pessoa.java (usando criadoPorId)
    const [pessoa, setPessoa] = useState({
        nome: '',
        dataNascimento: '',
        localNascimento: '',
        rg: '',
        cpf: '',
        passaporte: '',
        cnh: '',
        criadoPorId: null as number | null
    });

    // Busca o ID do usuário logado para auditoria
    useEffect(() => {
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
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPessoa(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validação de segurança antes de enviar para o Java
        if (!pessoa.criadoPorId) {
            alert("Erro: ID do criador não encontrado. Tente recarregar a página.");
            return;
        }

        setLoading(true);

        // Log para debug: Verifique no console do navegador (F12) se os dados estão corretos
        console.log("Enviando para o Backend:", pessoa);

        try {
            await apiClient.post('/pessoas', pessoa);
            alert('Cadastro realizado com sucesso!');
            navigate('/dashboard');
        } catch (error: any) {
            console.error("Erro ao salvar:", error);
            const errorMsg = error.response?.data?.message || 'Erro ao salvar o registro.';
            alert(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <form onSubmit={handleSubmit} className={styles.formCard}>
                <header className={styles.header}>
                    <h1>Cadastro de Pessoa</h1>
                    <p>Informações de Identificação Civil</p>
                </header>

                <div className={styles.inputGrid}>
                    <div className={styles.inputGroup}>
                        <label>Nome Completo</label>
                        <input
                            type="text"
                            name="nome"
                            value={pessoa.nome}
                            onChange={handleChange}
                            placeholder="Digite o nome completo"
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>CPF (Apenas números)</label>
                        <input
                            type="text"
                            name="cpf"
                            value={pessoa.cpf}
                            onChange={handleChange}
                            placeholder="00000000000"
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
                            placeholder="Cidade/UF"
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>RG</label>
                        <input
                            type="text"
                            name="rg"
                            value={pessoa.rg}
                            onChange={handleChange}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Passaporte</label>
                        <input
                            type="text"
                            name="passaporte"
                            value={pessoa.passaporte}
                            onChange={handleChange}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>CNH</label>
                        <input
                            type="text"
                            name="cnh"
                            value={pessoa.cnh}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className={styles.buttonArea}>
                    <button type="button" onClick={() => navigate(-1)} className={styles.cancelBtn}>
                        Voltar
                    </button>
                    <button type="submit" disabled={loading} className={styles.submitBtn}>
                        {loading ? 'Salvando...' : 'Salvar Registro'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CadastroPessoa;