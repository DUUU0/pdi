import React, { useEffect, useState } from 'react';
import { apiClient } from '../../services/api';
import styles from './Monitoramento.module.scss';
import { Link } from 'react-router-dom';
// Importe o seu Template de Pessoa
import PessoaTemplate from '../PessoaTemplate/PessoaTemplate';

const Monitoramento: React.FC = () => {
    const [aparicoes, setAparicoes] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    // Estados para o Modal de Template
    const [selectedPessoa, setSelectedPessoa] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchAparicoes();
        const interval = setInterval(fetchAparicoes, 3000);
        return () => clearInterval(interval);
    }, []);

    const fetchAparicoes = async () => {
        try {
            const response = await apiClient.get('/api/aparicoes');
            setAparicoes(response.data);
        } catch (error) {
            console.error("Erro ao buscar aparições", error);
        } finally {
            setLoading(false);
        }
    };

    const handleVerTemplate = (aparicao: any) => {

        setSelectedPessoa({
            id: aparicao.pessoaId,
            nome: aparicao.nome,
            cpf: aparicao.cpf
        });
        setIsModalOpen(true);
    };

    const aparicoesFiltradas = aparicoes.filter((a) => {
        const busca = searchTerm.toLowerCase();
        return (
            a.nome?.toLowerCase().includes(busca) ||
            a.cpf?.includes(busca)
        );
    });

    const formatarData = (dataStr: string) => {
        const data = new Date(dataStr);
        return data.toLocaleString('pt-BR');
    };

    return (
        <div className={styles.container}>
            <header className={styles.dashboardHeader}>
                <div className={styles.titleSection}>
                    <h2>Histórico de Monitoramento</h2>
                    <p>Registros de aparições detectadas pelo sistema facial</p>
                </div>

                <div className={styles.topActions}>
                    <div className={styles.buttonGroup}>
                        <Link to="/dashboard">
                            <button className={styles.backBtn}>
                                <span className={styles.icon}></span> Dashboard
                            </button>
                        </Link>
                    </div>

                    <div className={styles.searchBox}>
                        <input
                            type="text"
                            placeholder="Filtrar por nome ou CPF..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={styles.searchInput}
                        />
                    </div>
                </div>
            </header>

            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Data e Hora</th>
                            <th>Identificado</th>
                            <th>CPF</th>
                            <th className={styles.textCenter}>Similaridade</th>
                            <th className={styles.textCenter}>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} className={styles.noResults}>Carregando...</td></tr>
                        ) : aparicoesFiltradas.length > 0 ? (
                            aparicoesFiltradas.map((a: any) => (
                                <tr key={a.id}>
                                    <td className={styles.dateText}>{formatarData(a.dataHora)}</td>
                                    <td className={styles.boldText}>{a.nome}</td>
                                    <td>{a.cpf}</td>
                                    <td className={styles.textCenter}>
                                        <span className={`${styles.badge} ${a.similaridade > 80 ? styles.highMatch : styles.lowMatch}`}>
                                            {Number(a.similaridade).toFixed(1)}%
                                        </span>
                                    </td>
                                    <td className={styles.textCenter}>
                                        <button
                                            className={styles.viewBtn}
                                            onClick={() => handleVerTemplate(a)}
                                        >
                                            📄 Ver Template
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan={5} className={styles.noResults}>Sem registros.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Inserção do Modal */}
            {isModalOpen && (
                <PessoaTemplate
                    pessoa={selectedPessoa}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </div>
    );
};

export default Monitoramento;