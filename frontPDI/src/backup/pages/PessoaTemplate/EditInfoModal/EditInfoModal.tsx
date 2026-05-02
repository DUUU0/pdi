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
    const [formData, setFormData] = useState(data || {});
    const [loading, setLoading] = useState(false);

    const getRoute = () => {
        switch (type) {
            case 'pessoa': return `/pessoas/${pessoaId}`;
            case 'caracteristicas': return `/caracteristicas/pessoa/${pessoaId}`;
            case 'anomalias': return `/anomalias/pessoa/${pessoaId}`;
            case 'adicionais': return `/caracteristicas-adicionais/pessoa/${pessoaId}`;
            case 'biometria': return `/biometria/pessoa/${pessoaId}`; // Nova rota
            default: return '';
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, [field]: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await apiClient.put(getRoute(), formData);
            alert("Informações atualizadas!");
            onClose();
        } catch (e) {
            console.error(e);
            alert("Erro ao salvar. Verifique se os campos estão no formato correto.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <h2>Editar {type === 'pessoa' ? 'Dados Civis' : type.toUpperCase()}</h2>

                <div className={styles.fields}>
                    {type === 'pessoa' && (
                        <>
                            <label>Nome Completo</label>
                            <input type="text" value={formData.nome || ''} onChange={e => setFormData({ ...formData, nome: e.target.value })} />
                            <label>CPF</label>
                            <input type="text" value={formData.cpf || ''} onChange={e => setFormData({ ...formData, cpf: e.target.value })} />
                            <label>RG</label>
                            <input type="text" value={formData.rg || ''} onChange={e => setFormData({ ...formData, rg: e.target.value })} />
                            <label>Local de Nascimento</label>
                            <input type="text" value={formData.localNascimento || ''} onChange={e => setFormData({ ...formData, localNascimento: e.target.value })} />
                        </>
                    )}

                    {type === 'caracteristicas' && (
                        <>
                            <label>Gênero</label>
                            <input type="text" value={formData.genero || ''} onChange={e => setFormData({ ...formData, genero: e.target.value })} />
                            <label>Raça</label>
                            <input type="text" value={formData.raca || ''} onChange={e => setFormData({ ...formData, raca: e.target.value })} />
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <div style={{ flex: 1 }}>
                                    <label>Altura (m)</label>
                                    <input type="number" step="0.01" value={formData.altura || ''} onChange={e => setFormData({ ...formData, altura: e.target.value })} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label>Peso (kg)</label>
                                    <input type="number" step="0.1" value={formData.peso || ''} onChange={e => setFormData({ ...formData, peso: e.target.value })} />
                                </div>
                            </div>
                            <label>Cabelo</label>
                            <input type="text" value={formData.cabelo || ''} onChange={e => setFormData({ ...formData, cabelo: e.target.value })} />
                            <label>Biotipo</label>
                            <input type="text" value={formData.biotipo || ''} onChange={e => setFormData({ ...formData, biotipo: e.target.value })} />
                        </>
                    )}

                    {type === 'anomalias' && (
                        <>
                            <label>Anomalia Física</label>
                            <textarea value={formData.fisica || ''} onChange={e => setFormData({ ...formData, fisica: e.target.value })} />
                            <label>Anomalia Congênita</label>
                            <textarea value={formData.congenita || ''} onChange={e => setFormData({ ...formData, congenita: e.target.value })} />
                            <label>Anomalia Adquirida</label>
                            <textarea value={formData.adquirida || ''} onChange={e => setFormData({ ...formData, adquirida: e.target.value })} />
                        </>
                    )}

                    {type === 'adicionais' && (
                        <>
                            <label>Descrição de Característica Adicional</label>
                            <textarea value={formData.caracteristica || ''} onChange={e => setFormData({ ...formData, caracteristica: e.target.value })} />
                        </>
                    )}

                    {type === 'biometria' && (
                        <div className={styles.biometriaContainer}>
                            <div className={styles.imageUpload}>
                                <label>Face Frontal</label>
                                <input type="file" accept="image/*" onChange={e => handleFileChange(e, 'faceFrontal')} />
                                {formData.faceFrontal && <img src={formData.faceFrontal} alt="Frontal" className={styles.preview} />}
                            </div>
                            <div className={styles.imageUpload}>
                                <label>Face Esquerda</label>
                                <input type="file" accept="image/*" onChange={e => handleFileChange(e, 'faceEsq')} />
                                {formData.faceEsq && <img src={formData.faceEsq} alt="Esquerda" className={styles.preview} />}
                            </div>
                            <div className={styles.imageUpload}>
                                <label>Face Direita</label>
                                <input type="file" accept="image/*" onChange={e => handleFileChange(e, 'faceDir')} />
                                {formData.faceDir && <img src={formData.faceDir} alt="Direita" className={styles.preview} />}
                            </div>
                        </div>
                    )}
                </div>

                <div className={styles.actions}>
                    <button onClick={onClose}>Cancelar</button>
                    <button onClick={handleSave} disabled={loading} className={styles.saveBtn}>
                        {loading ? 'Salvando...' : 'Salvar'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditInfoModal;