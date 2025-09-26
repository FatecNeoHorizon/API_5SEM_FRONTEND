import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from "recharts";
import IssuesService from "../../services/metrics/issues.service";
import HorasDevChart from "./HorasDevChart";

const IssuesTotalChart = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMock, setIsMock] = useState(false);
  const [periodoFiltro, setPeriodoFiltro] = useState("mes");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await IssuesService.getTotalIssues();
        if (response.success) {
          setData(response.data);
          setIsMock(response.isMock || false);
        } else {
          setError("Erro ao carregar dados");
        }
      } catch (err) {
        setError("Erro na conexão com o servidor");
        console.error("Erro ao buscar dados:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "400px" }}>
        <div className="spinner-border text-primary">
          <span className="visually-hidden">Carregando...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <h4 className="alert-heading">Erro!</h4>
        <p>{error}</p>
        <button
          className="btn btn-outline-danger"
          onClick={() => window.location.reload()}
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="alert alert-info" role="alert">
        <h4 className="alert-heading">Sem dados</h4>
        <p>Não há dados disponíveis para exibição no momento.</p>
      </div>
    );
  }

  const ProjetoTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;
    const row = payload[0]?.payload || {};
    const nome = row.task || row.projeto || "Projeto";
    const horas = row.horas ?? "-";
    return (
      <div className="bg-white border rounded p-2 shadow-sm small">
        <div className="fw-semibold">{nome}</div>
        <div>Horas: {horas}h</div>
      </div>
    );
  };

  const DevTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;
    const row = payload[0]?.payload || {};
    const nome = row.dev || "Dev";
    const horas = row.horas ?? "-";
    const dias = row.diasTrabalhados ?? undefined;
    const atividades = Array.isArray(row.atividades) ? row.atividades.slice(0, 2).join(", ") : undefined;
    return (
      <div className="bg-white border rounded p-2 shadow-sm small">
        <div className="fw-semibold">{nome}</div>
        <div>Horas: {horas}h{typeof dias === "number" ? ` • ${dias} dias` : ""}</div>
        {atividades ? <div>Atividades: {atividades}</div> : null}
      </div>
    );
  };

  ProjetoTooltip.propTypes = {
    active: PropTypes.bool,
    payload: PropTypes.arrayOf(
      PropTypes.shape({
        payload: PropTypes.object,
        value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        name: PropTypes.string,
      })
    ),
  };

  DevTooltip.propTypes = {
    active: PropTypes.bool,
    payload: PropTypes.arrayOf(
      PropTypes.shape({
        payload: PropTypes.object,
        value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        name: PropTypes.string,
      })
    ),
  };

  const brandPalette = [
    "#7C3AED",
    "#3B82F6",
    "#06B6D4",
    "#22C55E",
    "#F59E0B",
    "#14B8A6",
    "#F43F5E",
    "#6366F1",
  ];

  const controleData = [
    { name: "Concluídas", value: data?.controle?.concluidas || 0, color: "#10B981" },
    { name: "Em Atraso", value: data?.controle?.emAtraso || 0, color: "#EF4444" },
    { name: "Em Andamento", value: data?.controle?.emAndamento || 0, color: "#F59E0B" }
  ];

  const andamentoData = data?.andamentoTarefas
    ? Object.entries(data.andamentoTarefas).map(([key, value]) => ({
        name: key,
        value: value.porcentagem
      }))
    : [
        { name: "Frontend", value: 45 },
        { name: "Backend", value: 35 },
        { name: "Database", value: 20 }
      ];

  const horasPorTaskData = data?.horasTrabalhadasPorTask || [];

  const getDadosPorPeriodo = () => {
    switch (periodoFiltro) {
      case "dia":
        return [
          { periodo: "Seg", atividades: 25 },
          { periodo: "Ter", atividades: 32 },
          { periodo: "Qua", atividades: 28 },
          { periodo: "Qui", atividades: 35 },
          { periodo: "Sex", atividades: 30 },
          { periodo: "Sáb", atividades: 8 },
          { periodo: "Dom", atividades: 3 },
        ];
      case "semana":
        return [
          { periodo: "Sem 1", atividades: 180 },
          { periodo: "Sem 2", atividades: 195 },
          { periodo: "Sem 3", atividades: 210 },
          { periodo: "Sem 4", atividades: 175 },
          { periodo: "Sem 5", atividades: 220 },
        ];
      case "ano":
        return [
          { periodo: "2021", atividades: 2800 },
          { periodo: "2022", atividades: 3200 },
          { periodo: "2023", atividades: 3600 },
          { periodo: "2024", atividades: 4200 },
          { periodo: "2025", atividades: 3800 },
        ];
      default:
        return data?.tempoPorMes ? data.tempoPorMes.map(item => ({
          periodo: item.mes.substring(0, 3),
          atividades: item.tempo
        })) : [
          { periodo: "Jan", atividades: 280 },
          { periodo: "Fev", atividades: 320 },
          { periodo: "Mar", atividades: 350 },
          { periodo: "Abr", atividades: 310 },
          { periodo: "Mai", atividades: 390 },
          { periodo: "Jun", atividades: 420 },
        ];
    }
  };

  const horasPorDevDetalhado = data?.horasPorDev || [];

  const dadosPeriodo = getDadosPorPeriodo();

  return (
    <div className="container-fluid">
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex align-items-center mb-3">
            <h2 className="fs-2 fw-bold mb-0">📊 Tarefas</h2>
            {isMock && (
              <span className="badge bg-warning ms-2">Dados Mock</span>
            )}
          </div>

          <div className="row g-3 align-items-stretch">
            <div className="col-md-3">
              <div className="card h-100 text-center shadow-sm">
                <div className="card-body d-flex flex-column justify-content-center">
                  <h5 className="card-subtitle text-muted mb-1 fs-6 fw-semibold">📋 Total de Issues</h5>
                  <div className="display-6 text-primary fw-semibold">{data?.total || 0}</div>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card h-100 text-center shadow-sm">
                <div className="card-body d-flex flex-column justify-content-center">
                  <h5 className="card-subtitle text-muted mb-1 fs-6 fw-semibold">💰 Total de Custos p/ desenvolvedor</h5>
                  <div className="display-6 text-success fw-semibold">R$ {data?.time || 0}</div>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card h-100 text-center shadow-sm">
                <div className="card-body d-flex flex-column justify-content-center">
                  <h5 className="card-subtitle text-muted mb-1 fs-6 fw-semibold">⏰ Total de Horas Geral</h5>
                  <div className="display-6 text-info fw-semibold">
                    {data?.controle ? (data.controle.concluidas + data.controle.emAtraso + data.controle.emAndamento) : 0}
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card h-100 text-center shadow-sm">
                <div className="card-body d-flex flex-column justify-content-center">
                  <h5 className="card-subtitle text-muted mb-1 fs-6 fw-semibold">🎯 Atividades do Período</h5>
                  <div className="display-6 text-warning fw-semibold">{horasPorTaskData?.length || 0}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card h-100">
            <div className="card-header">
              <h6 className="mb-0 fs-5 fw-semibold">📊 Horas trabalhadas por projeto</h6>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={horasPorTaskData}  layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" dataKey="horas"/>
                  <YAxis
                    dataKey="task"
                    type="category"
                    width={120}
                    tick={{ fontSize: 12 }}
                    tickFormatter={(v) => (typeof v === "string" && v.length > 18 ? `${v.slice(0, 18)}…` : v)}
                  />
                  <Tooltip content={<ProjetoTooltip />} />
                  <Bar dataKey="horas" fill="#3B82F6" radius={[2,2,2,2]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card h-100">
            <div className="card-header">
              <h6 className="mb-0 fs-5 fw-semibold">🕒 Total de Horas p/ projeto geral</h6>
            </div>
            <div className="card-body d-flex justify-content-center align-items-center">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={andamentoData}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {andamentoData.map((entry, index) => (
                      <Cell key={`andamento-${entry.name}`} fill={brandPalette[index % brandPalette.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, "Progresso"]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card h-100">
            <div className="card-header">
              <h6 className="mb-0 fs-5 fw-semibold">🎯 Controle de Tarefas</h6>
            </div>
            <div className="card-body d-flex justify-content-center align-items-center">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={controleData}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    dataKey="value"
                    label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(1)}%)`}
                  >
                    {controleData.map((entry) => (
                      <Cell key={`controle-${entry.name}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, "Tarefas"]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h6 className="mb-0 fs-5 fw-semibold">📅 Atividades Realizadas por Período</h6>
              <div className="btn-group btn-group-sm" role="group">
                <input
                  type="radio"
                  className="btn-check"
                  name="periodo"
                  id="periodo-dia"
                  checked={periodoFiltro === "dia"}
                  onChange={() => setPeriodoFiltro("dia")}
                />
                <label className="btn btn-outline-primary" htmlFor="periodo-dia">Dia</label>

                <input
                  type="radio"
                  className="btn-check"
                  name="periodo"
                  id="periodo-semana"
                  checked={periodoFiltro === "semana"}
                  onChange={() => setPeriodoFiltro("semana")}
                />
                <label className="btn btn-outline-primary" htmlFor="periodo-semana">Semana</label>

                <input
                  type="radio"
                  className="btn-check"
                  name="periodo"
                  id="periodo-mes"
                  checked={periodoFiltro === "mes"}
                  onChange={() => setPeriodoFiltro("mes")}
                />
                <label className="btn btn-outline-primary" htmlFor="periodo-mes">Mês</label>

                <input
                  type="radio"
                  className="btn-check"
                  name="periodo"
                  id="periodo-ano"
                  checked={periodoFiltro === "ano"}
                  onChange={() => setPeriodoFiltro("ano")}
                />
                <label className="btn btn-outline-primary" htmlFor="periodo-ano">Ano</label>
              </div>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dadosPeriodo}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="periodo"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => [value, "Atividades"]}
                    labelStyle={{ color: "#333" }}
                  />
                  <Bar dataKey="atividades" fill="#06B6D4" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <HorasDevChart />
        </div>
      </div>
    </div>
  );
};

export default IssuesTotalChart;