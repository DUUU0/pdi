import React, { useEffect, useState } from 'react';
import styles from './PessoaTemplate.module.scss';
import { apiClient } from '../../services/api';
import EditInfoModal from './EditInfoModal/EditInfoModal';
import { useNavigate } from 'react-router-dom';

interface Props {
    pessoa: any;
    onClose: () => void;
}

type Historico = {
    id: number;
    userId: number | null;
    nomeUsuario: string | null;
    dataAlteracao: string;
    tipoOperacao: 'CREATE' | 'UPDATE' | 'DELETE';
    dadosAnteriores: string | null;
    dadosNovos: string | null;
};

const PessoaTemplate: React.FC<Props> = ({ pessoa, onClose }) => {
    const navigate = useNavigate();
    const [dadosPessoa, setDadosPessoa] = useState(pessoa);
    const [caracteristicas, setCaracteristicas] = useState<any>({});
    const [anomalias, setAnomalias] = useState<any>({});
    const [biometria, setBiometria] = useState<any>({});
    const [historico, setHistorico] = useState<Historico[]>([]);
    const [erroHistorico, setErroHistorico] = useState(false);

    const [editModal, setEditModal] = useState<{ open: boolean; type: string }>({ open: false, type: '' });
    
    // Novos estados para a geração de imagem por IA
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);

    const loadAllData = async () => {
        try {
            const resPessoa = await apiClient.get(`/pessoas/${pessoa.id}`);
            setDadosPessoa(resPessoa.data);

            const [resCarac, resAnom, resBio, resHistorico] = await Promise.allSettled([
                apiClient.get(`/caracteristicas/pessoa/${pessoa.id}`),
                apiClient.get(`/anomalias/pessoa/${pessoa.id}`),
                apiClient.get(`/biometria/pessoa/${pessoa.id}`),
                apiClient.get<Historico[]>(`/historico/pessoa/${pessoa.id}`)
            ]);

            if (resCarac.status === 'fulfilled') setCaracteristicas(resCarac.value.data || {});
            if (resAnom.status === 'fulfilled') setAnomalias(resAnom.value.data || {});
            if (resBio.status === 'fulfilled') setBiometria(resBio.value.data || {});
            if (resHistorico.status === 'fulfilled') {
                setHistorico(resHistorico.value.data || []);
                setErroHistorico(false);
            } else {
                setErroHistorico(true);
            }
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

    const formatarData = (data: string) => new Intl.DateTimeFormat('pt-BR', {
        dateStyle: 'short', timeStyle: 'medium'
    }).format(new Date(data));

    const rotuloOperacao = (operacao: Historico['tipoOperacao']) => ({
        CREATE: 'Criou',
        UPDATE: 'Atualizou',
        DELETE: 'Excluiu',
    })[operacao] ?? operacao;

    // Chave opcional (https://enter.pollinations.ai/keys) definida em .env.local; sem ela, usa o endpoint anônimo
    const POLLINATIONS_KEY = import.meta.env.VITE_POLLINATIONS_KEY as string | undefined;

    const handleGenerateImage = async () => {
        setIsGenerating(true);
        try {
            const prompt = `Retrato hiper-realista, fotografia de documento de identificação (RG), fundo branco neutro, iluminação plana de estúdio, olhando diretamente para a câmera. 
            Gênero: ${caracteristicas.genero || 'não especificado'}, 
            Etnia: ${caracteristicas.raca || 'não especificada'}, 
            Biotipo: ${caracteristicas.biotipo || 'não especificado'}, 
            Cabelo: ${caracteristicas.cabelo || 'não especificado'}. 
            ${anomalias.fisica ? 'Detalhe facial: ' + anomalias.fisica : ''}. Sem sorrir, expressão neutra.`;

            // Pollinations.ai: o prompt vai na própria URL e a resposta é a imagem em si
            const encodedPrompt = encodeURIComponent(prompt.replace(/\s+/g, ' ').trim());
            const params = new URLSearchParams({
                width: '768',
                height: '1024',
                nologo: 'true',
                seed: String(Math.floor(Math.random() * 1_000_000)),
            });
            const url = POLLINATIONS_KEY
                ? `https://gen.pollinations.ai/image/${encodedPrompt}?${params}`
                : `https://image.pollinations.ai/prompt/${encodedPrompt}?${params}`;

            const response = await fetch(url, {
                headers: POLLINATIONS_KEY ? { Authorization: `Bearer ${POLLINATIONS_KEY}` } : undefined,
            });

            const contentType = response.headers.get('content-type') ?? '';
            if (!response.ok || !contentType.startsWith('image/')) {
                // Em caso de erro, o serviço responde com JSON ou texto em vez da imagem
                const errorText = await response.text();
                console.error('Erro detalhado da API:', response.status, errorText);
                throw new Error(`Falha na resposta da API (${response.status}): ${errorText.slice(0, 200) || 'Erro desconhecido'}`);
            }

            // Converte para data URL, mantendo o mesmo formato usado antes em generatedImage
            const blob = await response.blob();
            const dataUrl = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = () => reject(reader.error);
                reader.readAsDataURL(blob);
            });
            setGeneratedImage(dataUrl);

        } catch (error) {
            console.error('Erro ao gerar imagem com IA:', error);
            alert('Falha ao gerar retrato. Verifique o console para mais detalhes.');
        } finally {
            setIsGenerating(false);
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
                        {/* ... Código anterior mantido ... */}
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
                        {/* ... Código anterior mantido ... */}
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
                            <div style={{ display: 'flex', gap: '10px' }}>
                                {/* NOVO BOTÃO DE IA AQUI */}
                                <button 
                                    className={styles.editLink} 
                                    onClick={handleGenerateImage} 
                                    disabled={isGenerating}
                                    style={{ backgroundColor: '#f0f4ff', color: '#0056b3', border: '1px solid #cce5ff' }}
                                >
                                    {isGenerating ? 'Gerando IA...' : 'Gerar Retrato via IA'}
                                </button>
                                <button className={styles.editLink} onClick={() => openEdit('biometria')}>Atualizar Fotos</button>
                            </div>
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
                            
                            {/* RENDERIZAÇÃO DA IMAGEM GERADA PELA IA */}
                            {generatedImage && (
                                <div className={styles.photoBox} style={{ borderColor: '#0056b3' }}>
                                    <span style={{ color: '#0056b3', fontWeight: 'bold' }}>Retrato IA</span>
                                    <img src={generatedImage} alt="Retrato Gerado" />
                                </div>
                            )}
                        </div>
                    </section>

                    {/* SEÇÃO 4: ANOMALIAS */}
                    <section className={styles.infoCard}>
                        {/* ... Código anterior mantido ... */}
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

                    <section className={styles.infoCard}>
                        <div className={styles.cardHeader}>
                            <h3>Histórico de alterações</h3>
                        </div>
                        {erroHistorico && <p className={styles.historyMessage}>Não foi possível carregar o histórico.</p>}
                        {!erroHistorico && historico.length === 0 && <p className={styles.historyMessage}>Nenhuma alteração registrada.</p>}
                        {historico.length > 0 && (
                            <ul className={styles.historyList}>
                                {historico.map((item) => (
                                    <li key={item.id}>
                                        <span className={styles.historyOperation}>{rotuloOperacao(item.tipoOperacao)}</span>
                                        <span>{item.nomeUsuario || 'Usuário não identificado'}</span>
                                        <time dateTime={item.dataAlteracao}>{formatarData(item.dataAlteracao)}</time>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                </div>

                <footer className={styles.windowFooter}>
                    <button
                        className={styles.closeBtnFooter}
                        onClick={() => { onClose(); navigate(`/mapa?pessoa=${pessoa.id}`); }}
                    >
                        Ver no Mapa
                    </button>
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
