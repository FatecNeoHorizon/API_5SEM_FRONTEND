import React, { useEffect, useMemo, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
} from "recharts";

import {
  getTotalCusto,
  getCustoPorProjeto,
  getCustoPorDev,
  getEvolucaoCustos,
} from "../../services/metrics/custos.service";

const currency = (v) =>
  v?.toLocaleString?.("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }) ?? v;

export default function CustosChart() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [totalCusto, setTotalCusto] = useState(0);
  const [porProjeto, setPorProjeto] = useState([]);
  const [porDev, setPorDev] = useState([]);
  const [evolucao, setEvolucao] = useState([]);

  const [gran, setGran] = useState("mes");
  const [loadingEvolution, setLoadingEvolution] = useState(false);

  const fetchBaseDatasets = async () => {
    try {
      setLoading(true);
      setError(null);
      const [tJson, pJson, dJson] = await Promise.all([
        getTotalCusto(),
        getCustoPorProjeto(),
        getCustoPorDev(),
      ]);
      setTotalCusto(tJson?.total ?? 0);
      setPorProjeto(pJson ?? []);
      setPorDev(dJson ?? []);
    } catch (e) {
      setError("Erro ao buscar dados consolidados. Verifique a API.");
    } finally {
      setLoading(false);
    }
  };

  const fetchEvolution = async (g = gran) => {
    try {
      setLoadingEvolution(true);
      const eJson = await getEvolucaoCustos(g);
      setEvolucao(eJson ?? []);
    } catch (e) {
      setError("Erro ao buscar evolução de custos. Verifique a API.");
    } finally {
      setLoadingEvolution(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      await fetchBaseDatasets();
      await fetchEvolution(gran);
    };
    init();
  }, []);

  const devsUnicos = useMemo(() => porDev.length || 0, [porDev]);
  const totalHoras = useMemo(
    () => porDev.reduce((acc, r) => acc + (Number(r.horas) || 0), 0),
    [porDev]
  );
  const mediaCustoHora = useMemo(() => {
    if (!totalHoras) return 0;
    return Number(totalCusto) / Number(totalHoras);
  }, [totalCusto, totalHoras]);

  const isEmpty =
    !loading &&
    !error &&
    (porProjeto.length === 0 && porDev.length === 0 && evolucao.length === 0 && (!totalCusto || totalCusto === 0));

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 360 }}>
        <div className="spinner-border text-primary" role="status" aria-label="Carregando..." />
      </div>
    );
  }
  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <h4 className="alert-heading mb-2">Erro ao carregar custos</h4>
        <p className="mb-3">{error}</p>
        <button
          className="btn btn-outline-danger"
          onClick={async () => {
            await fetchBaseDatasets();
            await fetchEvolution(gran);
          }}
        >
          Tentar novamente
        </button>
      </div>
    );
  }
  if (isEmpty) {
    return (
      <div className="alert alert-info" role="alert">
        <h4 className="alert-heading">Sem dados</h4>
        <p>Não há custos disponíveis para exibição no momento.</p>
      </div>
    );
  }

  return (
    <div className="container-fluid p-3">

      <div className="collapse show" id="collapse_cost_container">
        <div className="row g-3 align-items-stretch mb-3">
          <div className="col-md-4">
            <div className="card h-100 text-center shadow-sm">
              <div className="card-body d-flex flex-column justify-content-center">
                <h5 className="card-subtitle text-muted mb-1 fs-6 fw-semibold">Custo Total</h5>
                <div className="display-6 text-success fw-semibold">{currency(totalCusto)}</div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card h-100 text-center shadow-sm">
              <div className="card-body d-flex flex-column justify-content-center">
                <h5 className="card-subtitle text-muted mb-1 fs-6 fw-semibold">Nº de Desenvolvedores</h5>
                <div className="display-6 text-secondary fw-semibold">{devsUnicos}</div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card h-100 text-center shadow-sm">
              <div className="card-body d-flex flex-column justify-content-center">
                <h5 className="card-subtitle text-muted mb-1 fs-6 fw-semibold">Média - Custo/Hora</h5>
                <div className="display-6 text-secondary fw-semibold">
                  {totalHoras ? currency(mediaCustoHora) : "—"}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row g-3 mb-3">
          <div className="col-md-8">
            <div className="card h-100">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h6 className="mb-0 fs-5 fw-semibold">Evolução do Custo ao Longo do Tempo</h6>
                <div className="btn-group btn-group-sm" role="group" aria-label="Período">
                  {[
                    { id: "dia", label: "Dia" },
                    { id: "semana", label: "Semana" },
                    { id: "mes", label: "Mês" },
                    { id: "ano", label: "Ano" },
                  ].map(({ id, label }) => (
                    <React.Fragment key={id}>
                      <input
                        type="radio"
                        className="btn-check"
                        name="periodo-costs"
                        id={`periodo-costs-${id}`}
                        checked={gran === id}
                        onChange={async () => {
                          setGran(id);
                          await fetchEvolution(id);
                        }}
                      />
                      <label className="btn btn-outline-primary" htmlFor={`periodo-costs-${id}`}>
                        {label}
                      </label>
                    </React.Fragment>
                  ))}
                </div>
              </div>

              <div className="card-body position-relative">
                {loadingEvolution && (
                  <div
                    className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                    style={{ background: "rgba(255,255,255,0.6)", zIndex: 2 }}
                  >
                    <div className="spinner-border text-primary" role="status" aria-label="Atualizando..." />
                  </div>
                )}
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={evolucao}>
                    <defs>
                      <linearGradient id="fillCusto" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#5B8FF9" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#5B8FF9" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="periodo" angle={-25} textAnchor="end" height={60} tick={{ fontSize: 12 }} />
                    <YAxis width={80} tickFormatter={(v) => currency(v)} />
                    <Tooltip formatter={(v) => [currency(v), "Custo"]} labelStyle={{ color: "#333" }} />
                    <Area type="monotone" dataKey="custo" stroke="#5B8FF9" fill="url(#fillCusto)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card h-100">
              <div className="card-header">
                <h6 className="mb-0 fs-5 fw-semibold">Custo por Projeto</h6>
              </div>
              <div className="card-body">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart
                    data={porProjeto}
                    layout="vertical"
                    margin={{ top: 8, right: 12, left: 8, bottom: 8 }}
                    barCategoryGap={10}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tickFormatter={(v) => currency(v)} tick={{ fontSize: 12 }} />
                    <YAxis
                      dataKey="projetoNome"
                      type="category"
                      width={100}
                      tick={{ fontSize: 12 }}
                      tickMargin={4}
                      tickFormatter={(v) => (typeof v === "string" && v.length > 20 ? `${v.slice(0, 20)}…` : v)}
                    />
                    <Tooltip formatter={(v) => [currency(v), "Custo"]} />
                    <Bar dataKey="total" fill="#5AD8A6" radius={[6, 6, 6, 6]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        <div className="row g-3">
          <div className="col-md-6">
            <div className="card h-100">
              <div className="card-header">
                <h6 className="mb-0 fs-5 fw-semibold">Horas vs Custo por Desenvolvedor</h6>
              </div>
              <div className="card-body">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart
                    data={porDev}
                    margin={{ top: 8, right: 12, left: 8, bottom: 12 }}
                    barGap={6}
                    maxBarSize={28}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="devNome"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(v) => (v?.length > 12 ? `${v.slice(0, 12)}…` : v)}
                      interval={0}
                    />
                    <YAxis yAxisId="left" orientation="left" tick={{ fontSize: 12 }} tickMargin={6} />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tickFormatter={(v) => currency(v)}
                      tick={{ fontSize: 12 }}
                      tickMargin={6}
                      width={70}
                    />
                    <Legend />
                    <Tooltip
                      formatter={(value, name) =>
                        name === "custo" ? [currency(value), "Custo (R$)"] : [`${value}h`, "Horas"]
                      }
                    />
                    <Bar yAxisId="left" dataKey="horas" name="Horas" fill="#A97FFF" radius={[6, 6, 0, 0]} />
                    <Bar yAxisId="right" dataKey="custo" name="Custo" fill="#0dcaf0" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card h-100">
              <div className="card-header">
                <h6 className="mb-0 fs-5 fw-semibold">Custo Total por Desenvolvedor</h6>
              </div>
              <div className="card-body">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart
                    data={porDev}
                    layout="vertical"
                    margin={{ top: 8, right: 12, left: 8, bottom: 8 }}
                    barCategoryGap={10}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tickFormatter={(v) => currency(v)} tick={{ fontSize: 12 }} />
                    <YAxis
                      dataKey="devNome"
                      type="category"
                      width={100}
                      tick={{ fontSize: 12 }}
                      tickMargin={4}
                      tickFormatter={(v) => (typeof v === "string" && v.length > 18 ? `${v.slice(0, 18)}…` : v)}
                    />
                    <Tooltip formatter={(v) => [currency(v), "Custo"]} />
                    <Bar dataKey="custo" fill="#F6BD16" radius={[6, 6, 6, 6]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
