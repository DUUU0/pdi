import React, { useEffect, useState } from 'react';
import { apiClient } from '../../services/api';
import styles from './Dashboard.module.scss';
import PessoaTemplate from '../PessoaTemplate/PessoaTemplate';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
    const [pessoas, setPessoas] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPessoa, setSelectedPessoa] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchPessoas();
    }, []);

    const fetchPessoas = async () => {
        try {
            const response = await apiClient.get('/pessoas');
            setPessoas(response.data);
        } catch (error) {
            console.error("Erro ao buscar pessoas", error);
        }
    };

    const pessoasFiltradas = pessoas.filter((p) => {
        const busca = searchTerm.toLowerCase();
        return (
            p.nome?.toLowerCase().includes(busca) ||
            p.cpf?.includes(busca)
        );
    });

    const handleVerTemplate = (pessoa: any) => {
        setSelectedPessoa(pessoa);
        setIsModalOpen(true);
    };

    return (
        <div className={styles.container}>
            <header className={styles.dashboardHeader}>
                <div className={styles.titleSection}>
                    <h2>Registros de Identificação</h2>
                    <p>Painel de controle de dados civis e monitoramento</p>
                </div>

                <div className={styles.topActions}>
                    {/* Grupo de Botões de Ação Global */}
                    <div className={styles.buttonGroup}>
                        <Link to="/cadastro-pessoa">
                            <button className={styles.createBtn}>
                                <span className={styles.icon}>+</span> Novo Template
                            </button>
                        </Link>

                        <Link to="/monitoramento">
                            <button className={styles.monitorBtn}>
                                <span className={styles.icon}>👁️</span> Monitoramento
                            </button>
                        </Link>

                    </div>

                    <div className={styles.searchBox}>
                        <input
                            type="text"
                            placeholder="Buscar por nome ou CPF..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={styles.searchInput}
                        />
                        <span className={styles.resultCount}>
                            {pessoasFiltradas.length} registro(s) encontrado(s)
                        </span>
                    </div>
                </div>
            </header>

            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Nome Completo</th>
                            <th>CPF</th>
                            <th className={styles.textCenter}>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pessoasFiltradas.length > 0 ? (
                            pessoasFiltradas.map((p: any) => (
                                <tr key={p.id}>
                                    <td className={styles.boldText}>{p.nome}</td>
                                    <td>{p.cpf}</td>
                                    <td className={styles.textCenter}>
                                        <button
                                            className={styles.viewBtn}
                                            onClick={() => handleVerTemplate(p)}
                                        >
                                            📄 Ver Template
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={3} className={styles.noResults}>
                                    Nenhum registro encontrado.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <PessoaTemplate
                    pessoa={selectedPessoa}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </div>
    );
};

export default Dashboard;