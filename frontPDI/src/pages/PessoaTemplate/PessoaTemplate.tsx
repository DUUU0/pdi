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
    const [caracteristicas, setCaracteristicas] = useState<any>({});
    const [anomalias, setAnomalias] = useState<any>({});
    const [biometria, setBiometria] = useState<any>({});

    const [editModal, setEditModal] = useState<{ open: boolean; type: string }>({ open: false, type: '' });

    const loadAllData = async () => {
        try {
            const resPessoa = await apiClient.get(`/pessoas/${pessoa.id}`);
            setDadosPessoa(resPessoa.data);

            const [resCarac, resAnom, resBio] = await Promise.allSettled([
                apiClient.get(`/caracteristicas/pessoa/${pessoa.id}`),
                apiClient.get(`/anomalias/pessoa/${pessoa.id}`),
                apiClient.get(`/biometria/pessoa/${pessoa.id}`)
            ]);

            if (resCarac.status === 'fulfilled') setCaracteristicas(resCarac.value.data || {});
            if (resAnom.status === 'fulfilled') setAnomalias(resAnom.value.data || {});
            if (resBio.status === 'fulfilled') setBiometria(resBio.value.data || {});
        } catch (e) {
            console.error('Erro ao carregar detalhes');
        }
    };

    useEffect(() => { loadAllData(); }, [pessoa.id]);

    const openEdit = (type: string) => setEditModal({ open: true, type });
    const closeEdit = () => {
        setEditModal({ open: false, type: '' });
        loadAllData();
    };

    const getEditData = () => {
        switch (editModal.type) {
            case 'pessoa': return dadosPessoa;
            case 'caracteristicas': return caracteristicas;
            case 'anomalias': return anomalias;
            case 'biometria': return biometria;
            default: return {};
        }
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.templateWindow}>
                <header className={styles.windowHeader}>
                    <div className={styles.titleGroup}>
                        <h1>Ficha de Identificação Civil</h1>
                        <span className={styles.idBadge}>ID #{pessoa.id}</span>
                    </div>
                    <button onClick={onClose} className={styles.closeBtn}>&times;</button>
                </header>

                <div className={styles.scrollContent}>

                    {/* SEÇÃO 1: DADOS PESSOAIS */}
                    <section className={styles.infoCard}>
                        <div className={styles.cardHeader}>
                            <h3>Dados Pessoais</h3>
                            <button className={styles.editLink} onClick={() => openEdit('pessoa')}>Editar</button>
                        </div>
                        <div className={styles.infoGrid}>
                            <div className={styles.infoItem}><label>Nome Completo</label><p>{dadosPessoa.nome || '---'}</p></div>
                            <div className={styles.infoItem}><label>CPF</label><p>{dadosPessoa.cpf || '---'}</p></div>
                            <div className={styles.infoItem}><label>RG</label><p>{dadosPessoa.rg || '---'}</p></div>
                            <div className={styles.infoItem}><label>Passaporte</label><p>{dadosPessoa.passaporte || '---'}</p></div>
                            <div className={styles.infoItem}><label>CNH</label><p>{dadosPessoa.cnh || '---'}</p></div>
                            <div className={styles.infoItem}><label>Data de Nascimento</label><p>{dadosPessoa.dataNascimento || '---'}</p></div>
                            <div className={`${styles.infoItem} ${styles.fullWidth}`}><label>Naturalidade</label><p>{dadosPessoa.localNascimento || '---'}</p></div>
                        </div>
                    </section>

                    {/* SEÇÃO 2: CARACTERÍSTICAS FÍSICAS */}
                    <section className={styles.infoCard}>
                        <div className={styles.cardHeader}>
                            <h3>Características Físicas</h3>
                            <button className={styles.editLink} onClick={() => openEdit('caracteristicas')}>Editar</button>
                        </div>
                        <div className={styles.infoGrid}>
                            <div className={styles.infoItem}><label>Gênero</label><p>{caracteristicas.genero || '---'}</p></div>
                            <div className={styles.infoItem}><label>Raça</label><p>{caracteristicas.raca || '---'}</p></div>
                            <div className={styles.infoItem}><label>Altura</label><p>{caracteristicas.altura ? `${caracteristicas.altura} m` : '---'}</p></div>
                            <div className={styles.infoItem}><label>Peso</label><p>{caracteristicas.peso ? `${caracteristicas.peso} kg` : '---'}</p></div>
                            <div className={styles.infoItem}><label>Biotipo</label><p>{caracteristicas.biotipo || '---'}</p></div>
                            <div className={styles.infoItem}><label>Cabelo</label><p>{caracteristicas.cabelo || '---'}</p></div>
                            {caracteristicas.roupaUsoComum && (
                                <div className={`${styles.infoItem} ${styles.fullWidth}`}>
                                    <label>Roupa de Uso Comum</label>
                                    <p>{caracteristicas.roupaUsoComum}</p>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* SEÇÃO 3: BIOMETRIA FACIAL */}
                    <section className={styles.infoCard}>
                        <div className={styles.cardHeader}>
                            <h3>Biometria Facial</h3>
                            <button className={styles.editLink} onClick={() => openEdit('biometria')}>Atualizar Fotos</button>
                        </div>
                        <div className={styles.biometriaGrid}>
                            <div className={styles.photoBox}>
                                <span>Frontal</span>
                                {biometria.faceFrontal
                                    ? <img src={biometria.faceFrontal} alt="Frontal" />
                                    : <div className={styles.noPhoto}>N/A</div>}
                            </div>
                            <div className={styles.photoBox}>
                                <span>Perfil Esquerdo</span>
                                {biometria.faceEsq
                                    ? <img src={biometria.faceEsq} alt="Esquerda" />
                                    : <div className={styles.noPhoto}>N/A</div>}
                            </div>
                            <div className={styles.photoBox}>
                                <span>Perfil Direito</span>
                                {biometria.faceDir
                                    ? <img src={biometria.faceDir} alt="Direita" />
                                    : <div className={styles.noPhoto}>N/A</div>}
                            </div>
                        </div>
                    </section>

                    {/* SEÇÃO 4: ANOMALIAS */}
                    <section className={styles.infoCard}>
                        <div className={styles.cardHeader}>
                            <h3>Anomalias e Observações</h3>
                            <button className={styles.editLink} onClick={() => openEdit('anomalias')}>Editar</button>
                        </div>
                        <div className={styles.obsList}>
                            <div className={styles.obsItem}><strong>Física:</strong> {anomalias.fisica || 'Nenhuma registrada.'}</div>
                            <div className={styles.obsItem}><strong>Congênita:</strong> {anomalias.congenita || 'Nenhuma registrada.'}</div>
                            <div className={styles.obsItem}><strong>Adquirida:</strong> {anomalias.adquirida || 'Nenhuma registrada.'}</div>
                            <div className={styles.obsItem}><strong>Comportamental:</strong> {anomalias.comportamental || 'Nenhuma registrada.'}</div>
                        </div>
                    </section>
                </div>

                <footer className={styles.windowFooter}>
                    <button className={styles.closeBtnFooter} onClick={onClose}>Fechar Ficha</button>
                </footer>
            </div>

            {editModal.open && (
                <EditInfoModal
                    type={editModal.type}
                    pessoaId={pessoa.id}
                    data={getEditData()}
                    onClose={closeEdit}
                />
            )}
        </div>
    );
};

export default PessoaTemplate;