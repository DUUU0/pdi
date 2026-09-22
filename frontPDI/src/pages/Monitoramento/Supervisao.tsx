import React, { useEffect, useState } from 'react';
import { apiClient } from '../../services/api';
import styles from './Supervisao.module.scss'; // Usando os mesmos estilos base do dashboard
import { Link } from 'react-router-dom';
import PessoaTemplate from '../PessoaTemplate/PessoaTemplate';

const Supervisao: React.FC = () => {
    const [aparicoes, setAparicoes] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

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
        return new Date(dataStr).toLocaleString('pt-BR');
    };

    return (
        <div className={styles.appContainer}>
            <header className={styles.globalHeader}>
                <div className={styles.logo}>SISTEMA DE IDENTIFICAÇÃO</div>
                <nav className={styles.navLinks}>
                    <Link to="/dashboard">Dashboard</Link>
                    <Link to="/supervisao" className={styles.active}>Supervisão</Link>
                    <Link to="/mapa">Mapa</Link>
                    <Link to="/nf">Registro Agências</Link>
                    <Link to="/cadastro-pessoa" className={styles.btnAction}>+ Novo Registro</Link>
                </nav>
            </header>

            <main className={styles.container}>
                <div className={styles.pageHeader}>
                    <div className={styles.titleSection}>
                        <h2>Histórico de Supervisão</h2>
                        <p>Acompanhamento de aparições via biometria facial</p>
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

                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Data e Hora</th>
                                <th>Identificado</th>
                                <th>CPF</th>
                                <th>Local</th>
                                <th className={styles.textCenter}>Grau de Certeza</th>
                                <th className={styles.textCenter}>Ação</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6} className={styles.noResults}>Buscando...</td></tr>
                            ) : aparicoesFiltradas.length > 0 ? (
                                aparicoesFiltradas.map((a: any) => (
                                    <tr key={a.id}>
                                        <td className={styles.dateText}>{formatarData(a.dataHora)}</td>
                                        <td className={styles.boldText}>{a.nome}</td>
                                        <td>{a.cpf}</td>
                                        <td>{a.local || '---'}</td>
                                        <td className={styles.textCenter}>
                                            <span className={`${styles.badge} ${a.similaridade > 80 ? styles.highMatch : styles.lowMatch}`}>
                                                {Number(a.similaridade).toFixed(1)}%
                                            </span>
                                        </td>
                                        <td className={styles.textCenter}>
                                            <button className={styles.viewBtn} onClick={() => handleVerTemplate(a)}>
                                                Ficha
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan={6} className={styles.noResults}>Nenhuma ocorrência.</td></tr>
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
            </main>
        </div>
    );
};

export default Supervisao;