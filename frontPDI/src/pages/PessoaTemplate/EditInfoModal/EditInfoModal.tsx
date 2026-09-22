import React, { useState } from 'react';
import { apiClient } from '../../../services/api';
import styles from './EditInfoModal.module.scss';
import {
    aplicarMascara,
    DATA_NASCIMENTO_MINIMA,
    errosDaResposta,
    hojeIso,
    validarCampo,
    validarPessoa,
    type DadosPessoa,
    type ErrosPessoa,
} from '../../../utils/validacaoPessoa';

const CAMPOS_PESSOA: { name: keyof DadosPessoa; label: string; placeholder?: string; type?: string; fullWidth?: boolean }[] = [
    { name: 'nome', label: 'Nome' },
    { name: 'cpf', label: 'CPF', placeholder: '000.000.000-00' },
    { name: 'rg', label: 'RG', placeholder: 'Ex.: 12.345.678-9' },
    { name: 'passaporte', label: 'Passaporte', placeholder: 'Ex.: FZ123456' },
    { name: 'cnh', label: 'CNH', placeholder: '11 dígitos' },
    { name: 'dataNascimento', label: 'Data de Nascimento', type: 'date' },
    { name: 'localNascimento', label: 'Local de Nascimento', fullWidth: true },
];

interface EditProps {
    type: string;
    pessoaId: number;
    data: any;
    onClose: () => void;
}

const EditInfoModal: React.FC<EditProps> = ({ type, pessoaId, data, onClose }) => {
    const [formData, setFormData] = useState({ ...data, pessoaId: pessoaId });
    const [loading, setLoading] = useState(false);
    const [erros, setErros] = useState<ErrosPessoa>({});

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

    // Dados pessoais: aplica a máscara e limpa o erro enquanto o usuário corrige
    const setPessoaCampo = (field: keyof DadosPessoa, value: string) => {
        set(field, aplicarMascara(field, value));
        if (erros[field]) setErros(prev => ({ ...prev, [field]: undefined }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => set(field, reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        if (type === 'pessoa') {
            const errosValidacao = validarPessoa(formData);
            setErros(errosValidacao);
            if (Object.keys(errosValidacao).length > 0) return;
        }

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
            const errosBackend = errosDaResposta(e);
            if (errosBackend) {
                setErros(errosBackend);
                return;
            }
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
                            {CAMPOS_PESSOA.map((campo) => (
                                <div key={campo.name} className={`${styles.inputField} ${campo.fullWidth ? styles.fullWidth : ''}`}>
                                    <label>{campo.label}</label>
                                    <input
                                        type={campo.type ?? 'text'}
                                        value={formData[campo.name] || ''}
                                        placeholder={campo.placeholder}
                                        onChange={e => setPessoaCampo(campo.name, e.target.value)}
                                        onBlur={() => setErros(prev => ({ ...prev, [campo.name]: validarCampo(campo.name, formData[campo.name]) }))}
                                        className={erros[campo.name] ? styles.inputInvalid : ''}
                                        aria-invalid={!!erros[campo.name]}
                                        {...(campo.type === 'date' ? { min: DATA_NASCIMENTO_MINIMA, max: hojeIso() } : {})}
                                    />
                                    {erros[campo.name] && <span className={styles.fieldError}>{erros[campo.name]}</span>}
                                </div>
                            ))}
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