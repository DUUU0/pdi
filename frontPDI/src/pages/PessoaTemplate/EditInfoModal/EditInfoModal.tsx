import React, { useState } from 'react';
import { apiClient } from '../../../services/api';
import styles from './EditInfoModal.module.scss';

interface EditProps {
    type: string;
    pessoaId: number;
    data: any;
    onClose: () => void;
}

const EditInfoModal: React.FC<EditProps> = ({ type, pessoaId, data, onClose }) => {
    const [formData, setFormData] = useState({ ...data, pessoaId: pessoaId });
    const [loading, setLoading] = useState(false);

    const getRoute = () => {
        switch (type) {
            case 'pessoa': return `/pessoas/${pessoaId}`;
            case 'caracteristicas': return `/caracteristicas/pessoa/${pessoaId}`;
            case 'anomalias': return `/anomalias/pessoa/${pessoaId}`;
            case 'biometria': return `/biometria/pessoa/${pessoaId}`;
            default: return '';
        }
    };

    const set = (field: string, value: any) =>
        setFormData((prev: any) => ({ ...prev, [field]: value }));

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => set(field, reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        const payload = {
            ...formData,
            pessoaId: pessoaId,
            criadoPorId: 4,
            atualizadoPorId: 4,
        };
        try {
            await apiClient.put(getRoute(), payload);
            alert('Informações sincronizadas com sucesso!');
            onClose();
        } catch (e: any) {
            console.error('Erro ao salvar:', e.response?.data);
            const errorMsg = e.response?.data?.message || e.response?.data || 'Erro desconhecido';
            alert(`Falha ao salvar: ${errorMsg}`);
        } finally {
            setLoading(false);
        }
    };

    const titleMap: Record<string, string> = {
        pessoa: 'Dados Pessoais',
        caracteristicas: 'Características',
        anomalias: 'Anomalias',
        biometria: 'Biometria',
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <header className={styles.modalHeader}>
                    <h2>{titleMap[type] ?? type.toUpperCase()}</h2>
                    <button className={styles.closeX} onClick={onClose}>&times;</button>
                </header>

                <div className={styles.scrollFields}>

                    {/* ── PESSOA ── */}
                    {type === 'pessoa' && (
                        <div className={styles.formGrid}>
                            <div className={styles.inputField}>
                                <label>Nome</label>
                                <input type="text" value={formData.nome || ''} onChange={e => set('nome', e.target.value)} />
                            </div>
                            <div className={styles.inputField}>
                                <label>CPF</label>
                                <input type="text" value={formData.cpf || ''} onChange={e => set('cpf', e.target.value)} />
                            </div>
                            <div className={styles.inputField}>
                                <label>RG</label>
                                <input type="text" value={formData.rg || ''} onChange={e => set('rg', e.target.value)} />
                            </div>
                            <div className={styles.inputField}>
                                <label>Passaporte</label>
                                <input type="text" value={formData.passaporte || ''} onChange={e => set('passaporte', e.target.value)} />
                            </div>
                            <div className={styles.inputField}>
                                <label>CNH</label>
                                <input type="text" value={formData.cnh || ''} onChange={e => set('cnh', e.target.value)} />
                            </div>
                            <div className={styles.inputField}>
                                <label>Data de Nascimento</label>
                                <input type="date" value={formData.dataNascimento || ''} onChange={e => set('dataNascimento', e.target.value)} />
                            </div>
                            <div className={`${styles.inputField} ${styles.fullWidth}`}>
                                <label>Local de Nascimento</label>
                                <input type="text" value={formData.localNascimento || ''} onChange={e => set('localNascimento', e.target.value)} />
                            </div>
                        </div>
                    )}

                    {/* ── CARACTERÍSTICAS ── */}
                    {type === 'caracteristicas' && (
                        <div className={styles.formGrid}>
                            <div className={styles.inputField}>
                                <label>Gênero</label>
                                <input type="text" value={formData.genero || ''} onChange={e => set('genero', e.target.value)} />
                            </div>
                            <div className={styles.inputField}>
                                <label>Raça</label>
                                <input type="text" value={formData.raca || ''} onChange={e => set('raca', e.target.value)} />
                            </div>
                            <div className={styles.inputField}>
                                <label>Altura (m)</label>
                                <input type="number" step="0.01" min="0" value={formData.altura || ''} onChange={e => set('altura', e.target.value)} />
                            </div>
                            <div className={styles.inputField}>
                                <label>Peso (kg)</label>
                                <input type="number" step="0.1" min="0" value={formData.peso || ''} onChange={e => set('peso', e.target.value)} />
                            </div>
                            <div className={styles.inputField}>
                                <label>Biotipo</label>
                                <input type="text" value={formData.biotipo || ''} onChange={e => set('biotipo', e.target.value)} />
                            </div>
                            <div className={styles.inputField}>
                                <label>Cabelo</label>
                                <input type="text" value={formData.cabelo || ''} onChange={e => set('cabelo', e.target.value)} />
                            </div>
                            <div className={`${styles.inputField} ${styles.fullWidth}`}>
                                <label>Roupa de Uso Comum</label>
                                <textarea
                                    value={formData.roupaUsoComum || ''}
                                    onChange={e => set('roupaUsoComum', e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    {/* ── ANOMALIAS ── */}
                    {type === 'anomalias' && (
                        <div className={styles.formColumn}>
                            <label>Física</label>
                            <textarea value={formData.fisica || ''} onChange={e => set('fisica', e.target.value)} />
                            <label>Congênita</label>
                            <textarea value={formData.congenita || ''} onChange={e => set('congenita', e.target.value)} />
                            <label>Adquirida</label>
                            <textarea value={formData.adquirida || ''} onChange={e => set('adquirida', e.target.value)} />
                            <label>Comportamental</label>
                            <textarea value={formData.comportamental || ''} onChange={e => set('comportamental', e.target.value)} />
                        </div>
                    )}

                    {/* ── BIOMETRIA ── */}
                    {type === 'biometria' && (
                        <div className={styles.biometriaUploadGrid}>
                            <div className={styles.uploadItem}>
                                <label>Face Frontal</label>
                                <input type="file" accept="image/*" onChange={e => handleFileChange(e, 'faceFrontal')} />
                                {formData.faceFrontal && <img src={formData.faceFrontal} className={styles.preview} alt="Frontal" />}
                            </div>
                            <div className={styles.uploadItem}>
                                <label>Face Esquerda</label>
                                <input type="file" accept="image/*" onChange={e => handleFileChange(e, 'faceEsq')} />
                                {formData.faceEsq && <img src={formData.faceEsq} className={styles.preview} alt="Esquerda" />}
                            </div>
                            <div className={styles.uploadItem}>
                                <label>Face Direita</label>
                                <input type="file" accept="image/*" onChange={e => handleFileChange(e, 'faceDir')} />
                                {formData.faceDir && <img src={formData.faceDir} className={styles.preview} alt="Direita" />}
                            </div>
                        </div>
                    )}
                </div>

                <div className={styles.actions}>
                    <button className={styles.cancelBtn} onClick={onClose}>Cancelar</button>
                    <button className={styles.saveBtn} onClick={handleSave} disabled={loading}>
                        {loading ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditInfoModal;