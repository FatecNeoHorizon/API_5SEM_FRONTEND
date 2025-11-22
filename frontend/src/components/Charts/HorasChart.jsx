import React, { useEffect, useState } from "react";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    LineChart,
    Line,
    Legend,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from "recharts";
import { 
    getHorasPorProjeto, 
    getHorasPorDev, 
    getHorasPorPeriodo,
    getTotalBugs,
    getTotalManutencao,
    getBugsXManutencaoPorPeriodo
} from "../../services/metrics/horas.service";
import ProjetoTooltip from "./ProjetoTooltip";
import DevTooltip from "./DevTooltip";
import Hint from "../Hint/Hint";

export default function HorasChart() {
    const [projetoData, setProjetoData] = useState([]);
    const [devData, setDevData] = useState([]);
    const [periodoFiltro, setPeriodoFiltro] = useState("mes");
    const [periodoFiltroBugs, setPeriodoFiltroBugs] = useState("mes");
    const [periodoData, setPeriodoData] = useState([]);
    const [bugsManutData, setBugsManutData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [periodoLoading, setPeriodoLoading] = useState(false);
    const [totalBugs, setTotalBugs] = useState(0);
    const [totalManutencao, setTotalManutencao] = useState(0);

    const opcoes = [
        { key: "dia", label: "Dia" },
        { key: "semana", label: "Semana" },
        { key: "mes", label: "Mês" },
        { key: "ano", label: "Ano" },
    ];

    useEffect(() => {
        let mounted = true;
        const fetchInitial = async () => {
            setLoading(true);
            setError(null);
            try {
                const [projeto, dev, bugs, manut] = await Promise.all([
                    getHorasPorProjeto(),
                    getHorasPorDev(),
                    getTotalBugs(),
                    getTotalManutencao()
                ]);

                if (!mounted) return;
                setProjetoData(projeto.filter(p => p.horas > 0));
                setDevData(dev.filter(d => d.horas > 0));
                setTotalBugs(bugs.total);
                setTotalManutencao(manut.total);

            } catch (err) {
                console.error(err);
                if (mounted) setError("Erro ao carregar os dados iniciais.");
            } finally {
                if (mounted) setLoading(false);
            }
        };
        fetchInitial();
        return () => { mounted = false; };
    }, []);

    useEffect(() => {
        let mounted = true;
        const fetchPeriodo = async () => {
            setPeriodoLoading(true);
            try {
                const periodo = await getHorasPorPeriodo(periodoFiltro);
                if (!mounted) return;
                setPeriodoData(periodo);
            } catch (err) {
                console.error(err);
                if (mounted) setPeriodoData([]);
            } finally {
                if (mounted) setPeriodoLoading(false);
            }
        };
        fetchPeriodo();
        return () => { mounted = false; };
    }, [periodoFiltro]);

    useEffect(() => {
        let mounted = true;
        const fetchBugsManut = async () => {
            try {
                const result = await getBugsXManutencaoPorPeriodo(periodoFiltroBugs);
                if (!mounted) return;
                setBugsManutData(result);
            } catch (err) {
                console.error(err);
                if (mounted) setBugsManutData([]);
            }
        };
        fetchBugsManut();
        return () => { mounted = false; };
    }, [periodoFiltroBugs]);

    if (loading) return <p className="p-3">Carregando...</p>;
    if (error) return <p className="text-danger p-3">{error}</p>;

    return (
        <div className="container-fluid p-3">
            <div className="row g-3">

                {/* Total de Bugs */}
                <div className="col-12 col-md-6">
                    <div className="card text-center shadow-sm">
                        <div className="card-body d-flex flex-column justify-content-center align-items-center">
                            <div className="d-flex align-items-center gap-1 justify-content-center mb-1">
                                <h5 className="card-subtitle text-muted mb-0 fs-7 fw-semibold">
                                    📋 Total de Bugs
                                </h5>
                                <Hint 
                                    text="Quantidade total de bugs registrados no sistema. Bugs são erros ou problemas identificados durante o desenvolvimento ou testes."
                                    position="bottom"
                                    size="sm"
                                />
                            </div>
                            <div className="display-6 text-primary fw-bold">{totalBugs}</div>
                        </div>
                    </div>
                </div>

                {/* Total de Manutenção em Horas */}
                <div className="col-12 col-md-6">
                    <div className="card text-center shadow-sm">
                        <div className="card-body d-flex flex-column justify-content-center align-items-center">
                            <div className="d-flex align-items-center gap-1 justify-content-center mb-1">
                                <h5 className="card-subtitle text-muted mb-0 fs-7 fw-semibold">
                                    📋 Total de Manutenção em Horas
                                </h5>
                                <Hint 
                                    text="Total de horas dedicadas à manutenção do sistema, incluindo correções de bugs e melhorias no código existente."
                                    position="bottom"
                                    size="sm"
                                />
                            </div>
                            <div className="display-6 text-primary fw-bold">{totalManutencao}</div>
                        </div>
                    </div>
                </div>

                {/* Bugs x Manutenção */}
                <div className="col-12">
                    <div className="card">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center gap-2">
                                <h6 className="mb-0 fs-5 fw-semibold">
                                    📈 Bugs x Manutenção por Período
                                </h6>
                                <Hint 
                                    text="Análise comparativa entre quantidade de bugs encontrados e horas de manutenção ao longo do tempo. Permite identificar correlações e períodos críticos."
                                    position="bottom"
                                    size="sm"
                                />
                            </div>
                            <fieldset className="btn-group btn-group-sm border-0 p-0">
                                {opcoes.map(({ key, label }) => (
                                    <React.Fragment key={key}>
                                        <input
                                            type="radio"
                                            className="btn-check"
                                            name="periodo-bugs"
                                            id={`periodo-bugs-${key}`}
                                            checked={periodoFiltroBugs === key}
                                            onChange={() => setPeriodoFiltroBugs(key)}
                                        />
                                        <label
                                            className="btn btn-outline-primary"
                                            htmlFor={`periodo-bugs-${key}`}
                                        >
                                            {label}
                                        </label>
                                    </React.Fragment>
                                ))}
                            </fieldset>
                        </div>
                        <div className="card-body">
                            {bugsManutData.length === 0 ? (
                                <p>Nenhum dado disponível.</p>
                            ) : (
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={bugsManutData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="periodo"
                                            angle={-45}
                                            textAnchor="end"
                                            height={80}
                                        />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend
                                            iconType="square"
                                            wrapperStyle={{ paddingTop: 10 }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="bugs"
                                            stroke="#FF6B6B"
                                            strokeWidth={2}
                                            name="Bugs"
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="manutencao"
                                            stroke="#4ECDC4"
                                            strokeWidth={2}
                                            name="Manutenção"
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>
                </div>

                {/* Horas por Projeto */}
                <div className="col-12 col-md-6">
                    <div className="card h-100">
                        <div className="card-header">
                            <div className="d-flex align-items-center gap-2">
                                <h6 className="mb-0 fs-5 fw-semibold">
                                    📊 Horas trabalhadas por projeto
                                </h6>
                                <Hint 
                                    text="Distribuição das horas trabalhadas entre os diferentes projetos. Mostra onde o tempo da equipe está sendo investido."
                                    position="bottom"
                                    size="sm"
                                />
                            </div>
                        </div>
                        <div className="card-body">
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={projetoData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" dataKey="horas" />
                                    <YAxis
                                        type="category"
                                        dataKey="task"
                                        width={120}
                                        tick={{ fontSize: 12 }}
                                        tickFormatter={v =>
                                            v.length > 18 ? `${v.slice(0, 18)}…` : v
                                        }
                                    />
                                    <Tooltip content={<ProjetoTooltip />} />
                                    <Bar
                                        dataKey="horas"
                                        fill="#536c85ff"
                                        radius={[2, 2, 2, 2]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Horas por Dev */}
                <div className="col-12 col-md-6">
                    <div className="card h-100">
                        <div className="card-header">
                            <div className="d-flex align-items-center gap-2">
                                <h6 className="mb-0 fs-5 fw-semibold">
                                    👨‍💻 Horas por Desenvolvedor
                                </h6>
                                <Hint 
                                    text="Total de horas trabalhadas por cada desenvolvedor da equipe. Útil para análise de carga de trabalho e distribuição de tarefas."
                                    position="bottom"
                                    size="sm"
                                />
                            </div>
                        </div>
                        <div className="card-body">
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={devData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" dataKey="horas" />
                                    <YAxis
                                        type="category"
                                        dataKey="dev"
                                        width={140}
                                        tick={{ fontSize: 12 }}
                                        tickFormatter={v =>
                                            v.length > 20 ? `${v.slice(0, 20)}…` : v
                                        }
                                    />
                                    <Tooltip content={<DevTooltip />} />
                                    <Bar
                                        dataKey="horas"
                                        fill="#F6B26B"
                                        radius={[2, 2, 2, 2]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Horas por Período */}
                <div className="col-12">
                    <div className="card">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center gap-2">
                                <h6 className="mb-0 fs-5 fw-semibold">
                                    ⏱️ Horas Realizadas por Período
                                </h6>
                                <Hint 
                                    text="Evolução temporal das horas trabalhadas. Use os filtros de período para analisar tendências diárias, semanais, mensais ou anuais."
                                    position="bottom"
                                    size="sm"
                                />
                            </div>
                            <fieldset className="btn-group btn-group-sm border-0 p-0">
                                {opcoes.map(({ key, label }) => (
                                    <React.Fragment key={key}>
                                        <input
                                            type="radio"
                                            className="btn-check"
                                            name="periodo"
                                            id={`periodo-${key}`}
                                            checked={periodoFiltro === key}
                                            onChange={() => setPeriodoFiltro(key)}
                                        />
                                        <label
                                            className="btn btn-outline-primary"
                                            htmlFor={`periodo-${key}`}
                                        >
                                            {label}
                                        </label>
                                    </React.Fragment>
                                ))}
                            </fieldset>
                        </div>
                        <div className="card-body">
                            {periodoLoading ? (
                                <div className="d-flex align-items-center justify-content-center p-4">
                                    <span
                                        aria-busy="true"
                                        className="spinner-border"
                                        aria-label="Carregando"
                                    />
                                </div>
                            ) : periodoData.length === 0 ? (
                                <p>Nenhum dado disponível.</p>
                            ) : (
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={periodoData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="periodo"
                                            angle={-45}
                                            textAnchor="end"
                                            height={80}
                                        />
                                        <YAxis />
                                        <Tooltip
                                            formatter={value => [value, "Horas"]}
                                            labelFormatter={label =>
                                                `Período: ${label}`
                                            }
                                        />
                                        <Bar dataKey="atividades" fill="#8f41d8d5" />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}