import React, { useEffect, useState } from 'react';
import { apiClient } from '../../services/api';
import styles from './Mapa.module.scss';

interface PessoaOpcao {
    id: number;
    nome: string;
    cpf: string;
}

interface Props {
    posicao: [number, number] | null;
    onPosicaoChange: (posicao: [number, number] | null) => void;
    pessoaInicial: string;
    onCancel: () => void;
    onSaved: (pessoaId: number) => void;
}

// Data/hora atual no formato aceito pelo input datetime-local (horário local, sem segundos)
const agoraLocal = () => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
};

const RegistrarAparicao: React.FC<Props> = ({ posicao, onPosicaoChange, pessoaInicial, onCancel, onSaved }) => {
    const [pessoas, setPessoas] = useState<PessoaOpcao[]>([]);
    const [pessoaId, setPessoaId] = useState(pessoaInicial);
    const [local, setLocal] = useState('');
    const [similaridade, setSimilaridade] = useState('100');
    const [dataHora, setDataHora] = useState(agoraLocal);
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState('');

    useEffect(() => {
        apiClient.get('/pessoas')
            .then((res) => setPessoas((res.data as PessoaOpcao[]).sort((a, b) => (a.nome ?? '').localeCompare(b.nome ?? ''))))
            .catch((error) => console.error('Erro ao buscar pessoas', error));
    }, []);

    const alterarCoordenada = (indice: 0 | 1, valor: string) => {
        const numero = parseFloat(valor);
        if (Number.isNaN(numero)) return;
        const nova: [number, number] = posicao ? [...posicao] : [0, 0];
        nova[indice] = numero;
        onPosicaoChange(nova);
    };

    const usarMinhaLocalizacao = () => {
        if (!navigator.geolocation) {
            setErro('Geolocalização não suportada neste navegador.');
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => onPosicaoChange([pos.coords.latitude, pos.coords.longitude]),
            () => setErro('Não foi possível obter sua localização.'),
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErro('');
        if (!pessoaId) return setErro('Selecione a pessoa.');
        if (!posicao) return setErro('Clique no mapa para marcar o local da aparição.');

        setSalvando(true);
        try {
            await apiClient.post('/api/aparicoes', {
                pessoaId: Number(pessoaId),
                similaridade: Number(similaridade),
                local: local.trim() || null,
                latitude: Number(posicao[0].toFixed(6)),
                longitude: Number(posicao[1].toFixed(6)),
                dataHora: dataHora || null,
            });
            onSaved(Number(pessoaId));
        } catch (error) {
            console.error('Erro ao registrar aparição', error);
            setErro('Falha ao registrar a aparição. Verifique se o servidor está disponível.');
        } finally {
            setSalvando(false);
        }
    };

    return (
        <form className={styles.registerForm} onSubmit={handleSubmit}>
            <div className={styles.registerHeader}>
                <h3>Registrar Aparição</h3>
                <p>Clique no mapa para marcar onde a pessoa foi vista. O marcador pode ser arrastado.</p>
            </div>

            <div className={styles.filters}>
                <label>
                    Pessoa *
                    <select value={pessoaId} onChange={(e) => setPessoaId(e.target.value)} required>
                        <option value="">Selecione...</option>
                        {pessoas.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.nome} {p.cpf ? `— ${p.cpf}` : ''}
                            </option>
                        ))}
                    </select>
                </label>

                <label>
                    Local / Câmera
                    <input
                        type="text"
                        placeholder="Ex.: Câmera Terminal Rodoviário"
                        value={local}
                        onChange={(e) => setLocal(e.target.value)}
                        maxLength={255}
                    />
                </label>

                <div className={styles.dateRow}>
                    <label>
                        Latitude *
                        <input
                            type="number"
                            step="any"
                            min={-90}
                            max={90}
                            value={posicao ? posicao[0].toFixed(6) : ''}
                            onChange={(e) => alterarCoordenada(0, e.target.value)}
                        />
                    </label>
                    <label>
                        Longitude *
                        <input
                            type="number"
                            step="any"
                            min={-180}
                            max={180}
                            value={posicao ? posicao[1].toFixed(6) : ''}
                            onChange={(e) => alterarCoordenada(1, e.target.value)}
                        />
                    </label>
                </div>
                <button type="button" className={styles.clearBtn} onClick={usarMinhaLocalizacao}>
                    Usar minha localização atual
                </button>

                <div className={styles.dateRow}>
                    <label>
                        Data e Hora
                        <input type="datetime-local" value={dataHora} onChange={(e) => setDataHora(e.target.value)} />
                    </label>
                    <label>
                        Certeza (%)
                        <input
                            type="number"
                            min={0}
                            max={100}
                            step="0.1"
                            value={similaridade}
                            onChange={(e) => setSimilaridade(e.target.value)}
                            required
                        />
                    </label>
                </div>
            </div>

            {erro && <div className={styles.formError}>{erro}</div>}

            <div className={styles.formActions}>
                <button type="button" className={styles.secondaryBtn} onClick={onCancel} disabled={salvando}>
                    Cancelar
                </button>
                <button type="submit" className={styles.primaryBtn} disabled={salvando}>
                    {salvando ? 'Salvando...' : 'Registrar'}
                </button>
            </div>
        </form>
    );
};

export default RegistrarAparicao;
