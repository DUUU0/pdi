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
        <div className={styles.appContainer}>
            {/* NOVO HEADER GLOBAL */}
            <header className={styles.globalHeader}>
                <div className={styles.logo}>SISTEMA DE IDENTIFICAÇÃO</div>
                <nav className={styles.navLinks}>
                    <Link to="/dashboard" className={styles.active}>Dashboard</Link>
                    <Link to="/supervisao">Supervisão</Link>
                    <Link to="/nf">Registro Agências</Link>
                    <Link to="/cadastro-pessoa" className={styles.btnAction}>+ Novo Registro</Link>
                </nav>
            </header>

            <main className={styles.container}>
                <div className={styles.pageHeader}>
                    <div className={styles.titleSection}>
                        <h2>Registros Civis</h2>
                        <p>Painel de controle de dados civis</p>
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
                            {pessoasFiltradas.length} registro(s)
                        </span>
                    </div>
                </div>

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
                                                Ver Ficha
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
            </main>

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