import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MapContainer, TileLayer, CircleMarker, Marker, Polyline, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { apiClient } from '../../services/api';
import PessoaTemplate from '../PessoaTemplate/PessoaTemplate';
import RegistrarAparicao from './RegistrarAparicao';
import styles from './Mapa.module.scss';

interface Aparicao {
    id: number;
    pessoaId: number;
    nome: string;
    cpf: string;
    dataHora: string;
    similaridade: number;
    local: string | null;
    latitude: number;
    longitude: number;
}

// Centro do Brasil, usado enquanto não há aparições para enquadrar
const CENTRO_PADRAO: [number, number] = [-15.78, -47.93];
const CORES = ['#3182ce', '#e53e3e', '#38a169', '#d69e2e', '#805ad5', '#dd6b20', '#319795', '#d53f8c'];

const corDaPessoa = (pessoaId: number) => CORES[pessoaId % CORES.length];
const formatarData = (dataStr: string) => new Date(dataStr).toLocaleString('pt-BR');

// Ajusta o zoom para mostrar todos os pontos visíveis sempre que o filtro muda
const EnquadrarPontos: React.FC<{ pontos: [number, number][]; chave: string }> = ({ pontos, chave }) => {
    const map = useMap();
    useEffect(() => {
        if (pontos.length === 0) return;
        if (pontos.length === 1) {
            map.setView(pontos[0], 15);
        } else {
            map.fitBounds(L.latLngBounds(pontos), { padding: [40, 40], maxZoom: 16 });
        }
        // Reenquadra apenas quando o filtro muda, não a cada atualização periódica
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chave, pontos.length > 0]);
    return null;
};

// Move o mapa até a aparição clicada na lista lateral
const FocarAparicao: React.FC<{ aparicao: Aparicao | null }> = ({ aparicao }) => {
    const map = useMap();
    useEffect(() => {
        if (aparicao) map.flyTo([aparicao.latitude, aparicao.longitude], 17, { duration: 0.8 });
    }, [aparicao, map]);
    return null;
};

// No modo de registro, cada clique no mapa define a posição da nova aparição
const CapturarClique: React.FC<{ onClick: (posicao: [number, number]) => void }> = ({ onClick }) => {
    useMapEvents({ click: (e) => onClick([e.latlng.lat, e.latlng.lng]) });
    return null;
};

const ICONE_NOVA_APARICAO = L.divIcon({
    className: '',
    html: `<div class="${styles.newMarker}"></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
});

const Mapa: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [aparicoes, setAparicoes] = useState<Aparicao[]>([]);
    const [loading, setLoading] = useState(true);
    const [dataInicio, setDataInicio] = useState('');
    const [dataFim, setDataFim] = useState('');
    const [focada, setFocada] = useState<Aparicao | null>(null);
    const [selectedPessoa, setSelectedPessoa] = useState<{ id: number; nome: string; cpf: string } | null>(null);
    const [registrando, setRegistrando] = useState(false);
    const [novaPosicao, setNovaPosicao] = useState<[number, number] | null>(null);

    const pessoaFiltro = searchParams.get('pessoa') ?? '';

    useEffect(() => {
        fetchAparicoes();
        const interval = setInterval(fetchAparicoes, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchAparicoes = async () => {
        try {
            const response = await apiClient.get('/api/aparicoes/localizadas');
            setAparicoes((response.data as Aparicao[]).map((a) => ({
                ...a,
                latitude: Number(a.latitude),
                longitude: Number(a.longitude),
                similaridade: Number(a.similaridade),
            })));
        } catch (error) {
            console.error('Erro ao buscar localizações', error);
        } finally {
            setLoading(false);
        }
    };

    // Pessoas que possuem ao menos uma aparição localizada
    const pessoas = useMemo(() => {
        const mapa = new Map<number, { id: number; nome: string; cpf: string; total: number }>();
        aparicoes.forEach((a) => {
            const atual = mapa.get(a.pessoaId);
            if (atual) atual.total++;
            else mapa.set(a.pessoaId, { id: a.pessoaId, nome: a.nome, cpf: a.cpf, total: 1 });
        });
        return [...mapa.values()].sort((a, b) => (a.nome ?? '').localeCompare(b.nome ?? ''));
    }, [aparicoes]);

    // Filtradas por pessoa e período, da mais recente para a mais antiga (ordem do backend)
    const filtradas = useMemo(() => {
        const inicio = dataInicio ? new Date(dataInicio).getTime() : -Infinity;
        const fim = dataFim ? new Date(dataFim).getTime() : Infinity;
        return aparicoes.filter((a) => {
            const t = new Date(a.dataHora).getTime();
            return (!pessoaFiltro || String(a.pessoaId) === pessoaFiltro) && t >= inicio && t <= fim;
        });
    }, [aparicoes, pessoaFiltro, dataInicio, dataFim]);

    // Trajeto em ordem cronológica (apenas quando uma pessoa está selecionada)
    const trajeto = useMemo(
        () => (pessoaFiltro ? [...filtradas].reverse() : []),
        [filtradas, pessoaFiltro],
    );

    const pontos = useMemo<[number, number][]>(
        () => filtradas.map((a) => [a.latitude, a.longitude]),
        [filtradas],
    );

    const pessoaAtual = pessoas.find((p) => String(p.id) === pessoaFiltro);
    const ultimaVista = filtradas[0];

    const handlePessoaChange = (id: string) => {
        setFocada(null);
        setSearchParams(id ? { pessoa: id } : {});
    };

    const limparFiltros = () => {
        setDataInicio('');
        setDataFim('');
        handlePessoaChange('');
    };

    const fecharRegistro = () => {
        setRegistrando(false);
        setNovaPosicao(null);
    };

    // Após salvar, recarrega os dados e mostra o trajeto da pessoa registrada
    const handleAparicaoRegistrada = (pessoaId: number) => {
        fecharRegistro();
        fetchAparicoes();
        handlePessoaChange(String(pessoaId));
    };

    const abrirFicha = (a: Aparicao) => setSelectedPessoa({ id: a.pessoaId, nome: a.nome, cpf: a.cpf });

    const iconeNumerado = (numero: number, cor: string, destaque: boolean) =>
        L.divIcon({
            className: '',
            html: `<div class="${styles.numberedMarker} ${destaque ? styles.latest : ''}" style="background:${cor}">${numero}</div>`,
            iconSize: [28, 28],
            iconAnchor: [14, 14],
            popupAnchor: [0, -14],
        });

    const renderPopup = (a: Aparicao) => (
        <Popup>
            <div className={styles.popup}>
                <strong>{a.nome}</strong>
                <span>CPF: {a.cpf}</span>
                <span>{a.local || 'Local não informado'}</span>
                <span>{formatarData(a.dataHora)}</span>
                <span>Certeza: {a.similaridade.toFixed(1)}%</span>
                <button onClick={() => abrirFicha(a)}>Ver Ficha</button>
            </div>
        </Popup>
    );

    return (
        <div className={styles.appContainer}>
            <header className={styles.globalHeader}>
                <div className={styles.logo}>SISTEMA DE IDENTIFICAÇÃO</div>
                <nav className={styles.navLinks}>
                    <Link to="/dashboard">Dashboard</Link>
                    <Link to="/supervisao">Supervisão</Link>
                    <Link to="/mapa" className={styles.active}>Mapa</Link>
                    <Link to="/nf">Registro Agências</Link>
                    <Link to="/cadastro-pessoa" className={styles.btnAction}>+ Novo Registro</Link>
                </nav>
            </header>

            <main className={styles.layout}>
                <aside className={styles.sidebar}>
                    <div className={styles.titleSection}>
                        <h2>Mapa de Localizações</h2>
                    </div>

                    {registrando ? (
                        <RegistrarAparicao
                            posicao={novaPosicao}
                            onPosicaoChange={setNovaPosicao}
                            pessoaInicial={pessoaFiltro}
                            onCancel={fecharRegistro}
                            onSaved={handleAparicaoRegistrada}
                        />
                    ) : (
                    <>
                    <button className={styles.primaryBtn} onClick={() => setRegistrando(true)}>
                        + Registrar Aparição
                    </button>

                    <div className={styles.filters}>
                        <label>
                            Pessoa
                            <select value={pessoaFiltro} onChange={(e) => handlePessoaChange(e.target.value)}>
                                <option value="">Todas as pessoas</option>
                                {pessoas.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.nome} ({p.total})
                                    </option>
                                ))}
                                {/* Pessoa vinda da ficha que ainda não tem aparições localizadas */}
                                {pessoaFiltro && !pessoaAtual && (
                                    <option value={pessoaFiltro}>Pessoa #{pessoaFiltro}</option>
                                )}
                            </select>
                        </label>
                        <div className={styles.dateRow}>
                            <label>
                                De
                                <input type="datetime-local" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
                            </label>
                            <label>
                                Até
                                <input type="datetime-local" value={dataFim} onChange={(e) => setDataFim(e.target.value)} />
                            </label>
                        </div>
                        {(pessoaFiltro || dataInicio || dataFim) && (
                            <button className={styles.clearBtn} onClick={limparFiltros}>Limpar filtros</button>
                        )}
                    </div>

                    <div className={styles.summary}>
                        <div>
                            <span className={styles.summaryValue}>{filtradas.length}</span>
                            <span className={styles.summaryLabel}>aparições</span>
                        </div>
                        <div>
                            <span className={styles.summaryValue}>
                                {pessoaFiltro ? new Set(filtradas.map((a) => a.local)).size : new Set(filtradas.map((a) => a.pessoaId)).size}
                            </span>
                            <span className={styles.summaryLabel}>{pessoaFiltro ? 'locais distintos' : 'pessoas'}</span>
                        </div>
                    </div>

                    {pessoaFiltro && ultimaVista && (
                        <div className={styles.lastSeen}>
                            <span>Última localização</span>
                            <strong>{ultimaVista.local || 'Local não informado'}</strong>
                            <small>{formatarData(ultimaVista.dataHora)}</small>
                        </div>
                    )}

                    <ul className={styles.list}>
                        {loading ? (
                            <li className={styles.empty}>Buscando...</li>
                        ) : filtradas.length === 0 ? (
                            <li className={styles.empty}>Nenhuma aparição localizada para este filtro.</li>
                        ) : (
                            filtradas.map((a, i) => (
                                <li
                                    key={a.id}
                                    className={`${styles.listItem} ${focada?.id === a.id ? styles.selected : ''}`}
                                    onClick={() => setFocada(a)}
                                >
                                    <span className={styles.dot} style={{ background: corDaPessoa(a.pessoaId) }}>
                                        {pessoaFiltro ? filtradas.length - i : ''}
                                    </span>
                                    <div className={styles.itemInfo}>
                                        {!pessoaFiltro && <strong>{a.nome}</strong>}
                                        <span>{a.local || 'Local não informado'}</span>
                                        <small>{formatarData(a.dataHora)} · {a.similaridade.toFixed(1)}%</small>
                                    </div>
                                </li>
                            ))
                        )}
                    </ul>
                    </>
                    )}
                </aside>

                <section className={`${styles.mapWrapper} ${registrando ? styles.picking : ''}`}>
                    <MapContainer center={CENTRO_PADRAO} zoom={4} className={styles.map}>
                        {registrando && <CapturarClique onClick={setNovaPosicao} />}
                        {registrando && novaPosicao && (
                            <Marker
                                position={novaPosicao}
                                icon={ICONE_NOVA_APARICAO}
                                draggable
                                zIndexOffset={2000}
                                eventHandlers={{
                                    dragend: (e) => {
                                        const { lat, lng } = (e.target as L.Marker).getLatLng();
                                        setNovaPosicao([lat, lng]);
                                    },
                                }}
                            />
                        )}
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <EnquadrarPontos pontos={pontos} chave={`${pessoaFiltro}|${dataInicio}|${dataFim}`} />
                        <FocarAparicao aparicao={focada} />

                        {pessoaFiltro ? (
                            <>
                                <Polyline
                                    positions={trajeto.map((a) => [a.latitude, a.longitude] as [number, number])}
                                    pathOptions={{ color: corDaPessoa(Number(pessoaFiltro)), weight: 3, dashArray: '6 8' }}
                                />
                                {trajeto.map((a, i) => (
                                    <Marker
                                        key={a.id}
                                        position={[a.latitude, a.longitude]}
                                        icon={iconeNumerado(i + 1, corDaPessoa(a.pessoaId), i === trajeto.length - 1)}
                                        zIndexOffset={i === trajeto.length - 1 ? 1000 : i}
                                    >
                                        {renderPopup(a)}
                                    </Marker>
                                ))}
                            </>
                        ) : (
                            filtradas.map((a) => (
                                <CircleMarker
                                    key={a.id}
                                    center={[a.latitude, a.longitude]}
                                    radius={8}
                                    pathOptions={{ color: '#fff', weight: 2, fillColor: corDaPessoa(a.pessoaId), fillOpacity: 0.9 }}
                                >
                                    {renderPopup(a)}
                                </CircleMarker>
                            ))
                        )}
                    </MapContainer>
                </section>
            </main>

            {selectedPessoa && (
                <PessoaTemplate pessoa={selectedPessoa} onClose={() => setSelectedPessoa(null)} />
            )}
        </div>
    );
};

export default Mapa;
