import React, { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { getHorasPorProjeto, getHorasPorDev, getHorasPorPeriodo } from "../../services/metrics/horas.service";
import ProjetoTooltip from "./ProjetoTooltip";
import DevTooltip from "./DevTooltip";

export default function HorasChart() {
  const [projetoData, setProjetoData] = useState([]);
  const [devData, setDevData] = useState([]);
  const [periodoFiltro, setPeriodoFiltro] = useState("mes");
  const [periodoData, setPeriodoData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [periodoLoading, setPeriodoLoading] = useState(false);

  const opcoes = [
    { key: "dia", label: "Dia" },
    { key: "semana", label: "Semana" },
    { key: "mes", label: "Mês" },
    { key: "ano", label: "Ano" },
  ];

  // fetch inicial: projetos e devs (apenas no mount)
  useEffect(() => {
    let mounted = true;
    const fetchInitial = async () => {
      setLoading(true);
      setError(null);
      try {
        const [projeto, dev] = await Promise.all([
          getHorasPorProjeto(),
          getHorasPorDev(),
        ]);

        if (!mounted) return;
        setProjetoData(projeto.filter(p => p.horas > 0));
        setDevData(dev.filter(d => d.horas > 0));

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

  // fetch apenas para o card de período quando o filtro muda
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

  if (loading) return <p className="p-3">Carregando...</p>;
  if (error) return <p className="text-danger p-3">{error}</p>;

return (
  <div className="container-fluid p-3">
    <div className="row g-3">
      
      {/* Horas por Projeto*/}
      <div className="col-12 col-md-6">
        <div className="card h-100">
          <div className="card-header">
            <h6 className="mb-0 fs-5 fw-semibold">📊 Horas trabalhadas por projeto</h6>
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
                  tickFormatter={v => (v.length > 18 ? `${v.slice(0,18)}…` : v)}
                />
                <Tooltip content={<ProjetoTooltip />} />
                <Bar dataKey="horas" fill="#536c85ff" radius={[2,2,2,2]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Horas por Dev*/}
      <div className="col-12 col-md-6">
        <div className="card h-100">
          <div className="card-header">
            <h6 className="mb-0 fs-5 fw-semibold">👨‍💻 Horas por Desenvolvedor</h6>
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
                  tickFormatter={v => (v.length > 20 ? `${v.slice(0,20)}…` : v)}
                />
                <Tooltip content={<DevTooltip />} />
                <Bar dataKey="horas" fill="#F6B26B" radius={[2,2,2,2]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Horas por Período*/}
      <div className="col-12">
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h6 className="mb-0 fs-5 fw-semibold">⏱️ Horas Realizadas por Período</h6>
            <fieldset className="btn-group btn-group-sm border-0 p-0">
              {opcoes.map(({key,label}) => (
                <React.Fragment key={key}>
                  <input
                    type="radio"
                    className="btn-check"
                    name="periodo"
                    id={`periodo-${key}`}
                    checked={periodoFiltro === key}
                    onChange={() => setPeriodoFiltro(key)}
                  />
                  <label className="btn btn-outline-primary" htmlFor={`periodo-${key}`}>
                    {label}
                  </label>
                </React.Fragment>
              ))}
            </fieldset>
          </div>
          <div className="card-body">
            {(() => {
              if (periodoLoading) {
                return (
                  <div className="d-flex align-items-center justify-content-center p-4">
                    <span aria-busy="true" className="spinner-border" aria-label="Carregando" />
                  </div>
                );
              }

              if (periodoData.length === 0) {
                return <p>Nenhum dado disponível.</p>;
              }

              return (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={periodoData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="periodo" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip
                      formatter={value => [value,"Horas"]}
                      labelFormatter={label => `Período: ${label}`}
                    />
                    <Bar dataKey="atividades" fill="#8f41d8d5" />
                  </BarChart>
                </ResponsiveContainer>
              );
            })()}
          </div>
        </div>
      </div>

    </div>
  </div>
);
}