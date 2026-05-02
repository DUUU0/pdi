import React, { useEffect, useState } from 'react';
import styles from './PessoaTemplate.module.scss';
import { apiClient } from '../../services/api';
import EditInfoModal from './EditInfoModal/EditInfoModal';

interface Props {
    pessoa: any;
    onClose: () => void;
}

const PessoaTemplate: React.FC<Props> = ({ pessoa, onClose }) => {
    const [dadosPessoa, setDadosPessoa] = useState(pessoa);
    const [caracteristicas, setCaracteristicas] = useState<any>(null);
    const [anomalias, setAnomalias] = useState<any>(null);
    const [adicionais, setAdicionais] = useState<any>(null);
    const [biometria, setBiometria] = useState<any>(null); // Novo estado

    const [editModal, setEditModal] = useState<{ open: boolean; type: string }>({ open: false, type: '' });

    const loadAllData = async () => {
        try {
            const resPessoa = await apiClient.get(`/pessoas/${pessoa.id}`);
            setDadosPessoa(resPessoa.data);

            const [resCarac, resAnom, resAdd, resBio] = await Promise.allSettled([
                apiClient.get(`/caracteristicas/pessoa/${pessoa.id}`),
                apiClient.get(`/anomalias/pessoa/${pessoa.id}`),
                apiClient.get(`/caracteristicas-adicionais/pessoa/${pessoa.id}`),
                apiClient.get(`/biometria/pessoa/${pessoa.id}`) // Chamada para biometria
            ]);

            if (resCarac.status === 'fulfilled') setCaracteristicas(resCarac.value.data);
            if (resAnom.status === 'fulfilled') setAnomalias(resAnom.value.data);
            if (resAdd.status === 'fulfilled') setAdicionais(resAdd.value.data);
            if (resBio.status === 'fulfilled') setBiometria(resBio.value.data);
        } catch (e) {
            console.error("Erro ao carregar detalhes");
        }
    };

    useEffect(() => { loadAllData(); }, [pessoa.id]);

    const openEdit = (type: string) => setEditModal({ open: true, type });

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.templateCard}>
                <header className={styles.header}>
                    <div className={styles.titleGroup}>
                        <h1>Ficha de Identificação Civil</h1>
                        <span className={styles.idBadge}>ID: {pessoa.id}</span>
                    </div>
                    <button onClick={onClose} className={styles.closeBtn}>X</button>
                </header>

                <div className={styles.content}>
                    {/* SEÇÃO 1: INFORMAÇÕES CIVIS */}
                    <section className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h3>📄 Informações Civis</h3>
                            <button className={styles.editBtn} onClick={() => openEdit('pessoa')}>Editar</button>
                        </div>
                        <div className={styles.grid}>
                            <p><strong>Nome:</strong> {dadosPessoa.nome}</p>
                            <p><strong>CPF:</strong> {dadosPessoa.cpf}</p>
                            <p><strong>Nascimento:</strong> {dadosPessoa.dataNascimento}</p>
                            <p><strong>Local:</strong> {dadosPessoa.localNascimento}</p>
                            <p><strong>RG:</strong> {dadosPessoa.rg || 'N/A'}</p>
                        </div>
                    </section>

                    {/* SEÇÃO 2: BIOMETRIA (FOTOS) */}
                    <section className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h3>📸 Biometria Facial</h3>
                            <button className={styles.editBtn} onClick={() => openEdit('biometria')}>Editar</button>
                        </div>
                        <div className={styles.biometriaGrid}>
                            <div className={styles.photoBox}>
                                <strong>Frontal</strong>
                                {biometria?.faceFrontal ? <img src={biometria.faceFrontal} alt="Frontal" /> : <div className={styles.noImage}>Sem Foto</div>}
                            </div>
                            <div className={styles.photoBox}>
                                <strong>Lado Esquerdo</strong>
                                {biometria?.faceEsq ? <img src={biometria.faceEsq} alt="Esquerda" /> : <div className={styles.noImage}>Sem Foto</div>}
                            </div>
                            <div className={styles.photoBox}>
                                <strong>Lado Direito</strong>
                                {biometria?.faceDir ? <img src={biometria.faceDir} alt="Direita" /> : <div className={styles.noImage}>Sem Foto</div>}
                            </div>
                        </div>
                    </section>

                    {/* SEÇÃO 3: CARACTERÍSTICAS FÍSICAS */}
                    <section className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h3>👤 Características Físicas</h3>
                            <button className={styles.editBtn} onClick={() => openEdit('caracteristicas')}>Editar</button>
                        </div>
                        <div className={styles.grid}>
                            <p><strong>Gênero:</strong> {caracteristicas?.genero || '---'}</p>
                            <p><strong>Raça:</strong> {caracteristicas?.raca || '---'}</p>
                            <p><strong>Altura:</strong> {caracteristicas?.altura ? `${caracteristicas.altura}m` : '---'}</p>
                            <p><strong>Peso:</strong> {caracteristicas?.peso ? `${caracteristicas.peso}kg` : '---'}</p>
                            <p><strong>Cabelo:</strong> {caracteristicas?.cabelo || '---'}</p>
                            <p><strong>Biotipo:</strong> {caracteristicas?.biotipo || '---'}</p>
                        </div>
                    </section>

                    {/* SEÇÃO 4: ANOMALIAS */}
                    <section className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h3>⚠️ Anomalias</h3>
                            <button className={styles.editBtn} onClick={() => openEdit('anomalias')}>Editar</button>
                        </div>
                        <div className={styles.grid}>
                            <p><strong>Física:</strong> {anomalias?.fisica || 'Nenhuma'}</p>
                            <p><strong>Congênita:</strong> {anomalias?.congenita || 'Nenhuma'}</p>
                            <p><strong>Adquirida:</strong> {anomalias?.adquirida || 'Nenhuma'}</p>
                        </div>
                    </section>

                    {/* SEÇÃO 5: CARACTERÍSTICAS ADICIONAIS */}
                    <section className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h3>➕ Outros Detalhes</h3>
                            <button className={styles.editBtn} onClick={() => openEdit('adicionais')}>Editar</button>
                        </div>
                        <div className={styles.grid}>
                            <p className={styles.fullWidth}><strong>Descrição:</strong> {adicionais?.caracteristica || 'Sem registros'}</p>
                        </div>
                    </section>
                </div>
            </div>

            {editModal.open && (
                <EditInfoModal
                    type={editModal.type}
                    pessoaId={pessoa.id}
                    data={
                        editModal.type === 'pessoa' ? dadosPessoa :
                            editModal.type === 'caracteristicas' ? caracteristicas :
                                editModal.type === 'anomalias' ? anomalias :
                                    editModal.type === 'biometria' ? biometria : adicionais
                    }
                    onClose={() => {
                        setEditModal({ open: false, type: '' });
                        loadAllData();
                    }}
                />
            )}
        </div>
    );
};

export default PessoaTemplate;