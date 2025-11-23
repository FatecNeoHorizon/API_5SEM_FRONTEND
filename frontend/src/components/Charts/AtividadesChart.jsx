import React, { useState, useEffect, useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from "recharts";
import Hint from "../Hint/Hint";
import {
  getTotalAtividades,
  getAtividadesPorProjeto,
  getAtividadesPorPeriodo,
  getHorasPorDev,
  toStackedByDay
} from "../../services/metrics/atividades.service";

function formatDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function addDays(base, delta) {
  const d = new Date(base);
  d.setDate(d.getDate() + delta);
  return d;
}
const today = new Date();
const defaultFrom = formatDate(addDays(today, -13));
const defaultTo = formatDate(today);

export default function AtividadesChart() {
  const [totalAtividades, setTotalAtividades] = useState(0);
  const [projetoData, setProjetoData] = useState([]);
  const [periodoData, setPeriodoData] = useState([]);
  const [periodoFiltro, setPeriodoFiltro] = useState("mes");
  const [loading, setLoading] = useState(true);

  const brandPalette = ["#7C3AED", "#3B82F6", "#06B6D4", "#22C55E", "#F59E0B", "#14B8A6", "#F43F5E", "#6366F1"];
  const opcoesPeriodo = [
    { key: "dia", label: "Dia" },
    { key: "semana", label: "Semana" },
    { key: "mes", label: "Mês" },
    { key: "ano", label: "Ano" },
  ];

  const [devs, setDevs] = useState([]);
  const [activitiesOpt, setActivitiesOpt] = useState([]);
  const [dev, setDev] = useState("");
  const [activity, setActivity] = useState("");
  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(defaultTo);
  const [hoursData, setHoursData] = useState([]);
  const [hoursLoading, setHoursLoading] = useState(false);
  const [hoursError, setHoursError] = useState(null);

  const PALETTE = [
    "#74c476","#41ab5d","#238b45","#006d2c","#00441b",
    "#6baed6","#4292c6","#2171b5","#08519c","#08306b",
    "#9e9ac8","#807dba","#6a51a3","#54278f","#3f007d",
    "#fc9272","#fb6a4a","#ef3b2c","#cb181d","#a50f15",
    "#67000d"
  ];
  const colorFor = (key) => {
    let hash = 0;
    for (let i = 0; i < key.length; i++) hash = (hash << 5) - hash + key.charCodeAt(i);
    const idx = Math.abs(hash) % PALETTE.length;
    return PALETTE[idx];
  };

  useEffect(() => {
    const fetchInitial = async () => {
      setLoading(true);
      try {
        const totalRes = await getTotalAtividades();
        if (totalRes.success) setTotalAtividades(totalRes.data.total);

        const projRes = await getAtividadesPorProjeto();
        if (projRes.success) {
          setProjetoData(projRes.data.map(item => ({ name: item.nomeProjeto, value: item.total })));
        }
      } catch (err) {
        console.error("Erro ao buscar dados iniciais de atividades:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInitial();
  }, []);

  useEffect(() => {
    let mounted = true;
    const fetchPeriodo = async () => {
      try {
        const periodoRes = await getAtividadesPorPeriodo(periodoFiltro);
        if (!mounted) return;
        setPeriodoData(periodoRes);
      } catch (err) {
        console.error("Erro ao buscar atividades por período:", err);
      }
    };
    fetchPeriodo();
    return () => { mounted = false; };
  }, [periodoFiltro]);

  const loadHours = async () => {
    setHoursLoading(true);
    setHoursError(null);

    try {
      const res = await getHorasPorDev({
        dev: dev || null,
        activity: activity || null,
        from,
        to,
      });

      if (!res.success) {
        setHoursData([]);
        setHoursError("Não foi possível carregar os dados de horas.");
      } else {
        setHoursData(res.data || []);
      }
    } catch (err) {
      console.error("Erro ao carregar horas por dev:", err);
      setHoursError("Erro ao carregar dados de horas.");
    } finally {
      setHoursLoading(false);
    }
  };

  useEffect(() => { loadHours(); }, [dev, activity, from, to]);

  useEffect(() => {
    (async () => {
      setHoursLoading(true);
      try {
        const res = await getHorasPorDev({ from, to });
        if (res.success) {
          setHoursData(res.data || []);

          const seenDevs = new Set();
          const devOpts = [];
          (res.data || []).forEach(item => {
            const id = String(item.devId);
            if (!seenDevs.has(id)) {
              seenDevs.add(id);
              devOpts.push({ value: id, label: item.devNome });
            }
          });
          devOpts.sort((a, b) => a.label.localeCompare(b.label));
          setDevs([{ value: "", label: "Todos" }, ...devOpts]);

          const seenAtv = new Set();
          const atvOpts = [];
          (res.data || []).forEach(it => {
            (it.atividades || []).forEach(a => {
              const id = String(a.atividadeId);
              if (!seenAtv.has(id)) {
                seenAtv.add(id);
                atvOpts.push({ value: id, label: a.atividadeNome });
              }
            });
          });
          atvOpts.sort((a, b) => a.label.localeCompare(b.label));
          setActivitiesOpt([{ value: "", label: "Todas" }, ...atvOpts]);
        } else {
          setHoursData([]);
          setHoursError("Não foi possível carregar os dados iniciais.");
        }
      } catch (err) {
        console.error(err);
        setHoursError("Erro ao carregar dados iniciais.");
      } finally {
        setHoursLoading(false);
      }
    })();
  }, []);

  const { rows: hoursRows, activities } = useMemo(() => toStackedByDay(hoursData), [hoursData]);
  const hoursEmpty = !hoursLoading && !hoursError && hoursRows.length === 0;

  if (loading) return <div className="p-3">Carregando…</div>;

  return (
    <div className="container-fluid">
      <div className="row g-3">

        {/* Total */}
        <div className="col-12 w-100 col-md-3">
          <div className="card text-center shadow-sm">
            <div className="card-body d-flex flex-column justify-content-center align-items-center">
              <div className="d-flex align-items-center gap-1 justify-content-center mb-1">
                <h5 className="card-subtitle text-muted mb-0 fs-7 fw-semibold">📋 Total de Atividades</h5>
                <Hint 
                  text="Quantidade total de atividades registradas no sistema, incluindo todas as tarefas concluídas em todos os projetos." 
                  position="bottom"
                  size="sm"
                />
              </div>
              <div className="display-6 text-primary fw-bold">{totalAtividades}</div>
            </div>
          </div>
        </div>

        {/* Por projeto */}
        <div className="col-2 col-md-3">
          <div className="card h-100">
            <div className="card-header">
              <div className="d-flex align-items-center gap-2">
                <h6 className="mb-0 fs-5 fw-semibold">🕒 Atividades por Projeto</h6>
                <Hint 
                  text="Distribuição de atividades entre os diferentes projetos. Cada fatia representa a proporção de atividades de um projeto em relação ao total." 
                  position="bottom"
                  size="sm"
                />
              </div>
            </div>
            <div className="card-body d-flex justify-content-center align-items-center">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={projetoData}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {projetoData.map((entry, index) => (
                      <Cell key={`proj-${entry.name}`} fill={brandPalette[index % brandPalette.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, "Atividades"]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Por período */}
        <div className="col-9">
          <div className="card">
            <div className="card-header d-flex justify-content-between">
              <div className="d-flex align-items-center gap-2">
                <span>✅ Atividades Realizadas por Período</span>
                <Hint 
                  text="Evolução das atividades ao longo do tempo. Use os filtros para visualizar por dia, semana, mês ou ano e identificar períodos de maior produtividade." 
                  position="bottom"
                  size="sm"
                />
              </div>
              <div className="btn-group btn-group-sm">
                {opcoesPeriodo.map(({ key, label }) => (
                  <React.Fragment key={key}>
                    <input
                      type="radio"
                      className="btn-check"
                      name="periodo-atividades"
                      id={`periodo-atividades-${key}`}
                      checked={periodoFiltro === key}
                      onChange={() => setPeriodoFiltro(key)}
                    />
                    <label className="btn btn-outline-primary" htmlFor={`periodo-atividades-${key}`}>
                      {label}
                    </label>
                  </React.Fragment>
                ))}
              </div>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={periodoData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="periodo" />
                  <YAxis />
                  <Tooltip formatter={(value) => [value, "Atividades"]} />
                  <Bar dataKey="atividades" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Horas por Dev / Atividade */}
        <div className="w-100">
          <div className="card shadow-sm h-100">
            <div className="card-header">
              <div className="d-flex align-items-center gap-2">
                <h6 className="mb-0 fs-5 fw-semibold">👨‍💻 Desenvolvedor - Atividade/Dia</h6>
                <Hint 
                  text="Gráfico empilhado mostrando as horas trabalhadas por desenvolvedor e atividade ao longo dos dias. Use os filtros para analisar períodos específicos ou desenvolvedores individuais." 
                  position="bottom"
                  size="sm"
                />
              </div>
            </div>
            <div className="card-body">
              <div className="d-flex flex-wrap align-items-end gap-3 mb-3">
                <div>
                  <div className="d-flex align-items-center gap-1 mb-1">
                    <label className="form-label mb-0">Desenvolvedor</label>
                    <Hint 
                      text="Filtre por desenvolvedor específico ou selecione 'Todos' para visualizar a equipe completa." 
                      position="right"
                      size="sm"
                    />
                  </div>
                  <select className="form-select" value={dev} onChange={e => setDev(e.target.value)}>
                    {devs.map(o => (<option key={o.value} value={o.value}>{o.label}</option>))}
                  </select>
                </div>
                <div>
                  <div className="d-flex align-items-center gap-1 mb-1">
                    <label className="form-label mb-0">Atividade</label>
                    <Hint 
                      text="Filtre por tipo de atividade específica ou selecione 'Todas' para ver o panorama completo das tarefas realizadas." 
                      position="right"
                      size="sm"
                    />
                  </div>
                  <select className="form-select" value={activity} onChange={e => setActivity(e.target.value)}>
                    {activitiesOpt.map(o => (<option key={o.value} value={o.value}>{o.label}</option>))}
                  </select>
                </div>
                <div>
                  <div className="d-flex align-items-center gap-1 mb-1">
                    <label className="form-label mb-0">De</label>
                    <Hint 
                      text="Data inicial do período de análise. Selecione a partir de quando deseja visualizar os dados." 
                      position="right"
                      size="sm"
                    />
                  </div>
                  <input type="date" className="form-control" value={from} max={to} onChange={e => setFrom(e.target.value)} />
                </div>
                <div>
                  <div className="d-flex align-items-center gap-1 mb-1">
                    <label className="form-label mb-0">Até</label>
                    <Hint 
                      text="Data final do período de análise. Defina até quando deseja visualizar os dados." 
                      position="right"
                      size="sm"
                    />
                  </div>
                  <input type="date" className="form-control" value={to} min={from} onChange={e => setTo(e.target.value)} />
                </div>
              </div>

              {hoursLoading && <div className="d-flex align-items-center gap-2 text-secondary"><div className="spinner-border spinner-border-sm" role="status" /><span>Carregando…</span></div>}
              {hoursError && <div className="alert alert-danger">{hoursError}</div>}
              {hoursEmpty && <div className="text-center text-muted py-5"><div className="mb-2">Sem dados para os filtros selecionados.</div><small>Altere os filtros acima para visualizar resultados.</small></div>}

              {!hoursLoading && !hoursError && !hoursEmpty && (
                <div style={{ width: "100%", height: 420 }}>
                  <ResponsiveContainer>
                    <BarChart data={hoursRows} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} label={{ value: "Horas", angle: -90, position: "insideLeft", offset: 10 }} />
                      <Tooltip formatter={(value, name) => [`${Number(value).toFixed(2)} h`, name]} labelFormatter={label => `Dia: ${label}`} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      {activities.map(k => (<Bar key={k} dataKey={k} stackId="a" fill={colorFor(k)} />))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}