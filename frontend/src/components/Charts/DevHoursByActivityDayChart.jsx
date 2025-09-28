import React, { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import {
  DevHoursService,
  toStackedByDay,
} from "../../services/metrics/dev-hours.service";

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

export default function DevHoursByActivityDayChart() {
  const [devs, setDevs] = useState([]);
  const [activitiesOpt, setActivitiesOpt] = useState([]);

  const [dev, setDev] = useState("");
  const [activity, setActivity] = useState("");
  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(defaultTo);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState([]);

  const PALETTE = [
  "#74c476","#41ab5d","#238b45","#006d2c","#00441b",
  "#6baed6","#4292c6","#2171b5","#08519c","#08306b",
  "#9e9ac8","#807dba","#6a51a3","#54278f","#3f007d",
  "#fc9272","#fb6a4a","#ef3b2c","#cb181d","#a50f15",
  "#67000d"];

  function colorFor(key) {
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) {
    hash = (hash << 5) - hash + key.charCodeAt(i);
    hash |= 0;
  }
  const idx = Math.abs(hash) % PALETTE.length;
  return PALETTE[idx];}

  const load = async () => {
    setLoading(true);
    setError(null);
    const res = await DevHoursService.getDevHours({
      dev: dev || null,
      activity: activity || null,
      from,
      to,
    });
    if (!res.success) {
      setData([]);
      setLoading(false);
      setError("Não foi possível carregar os dados. Tente novamente.");
      return;
    }
    setData(res.data || []);
    setLoading(false);
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await DevHoursService.getDevHours({ from, to });
      if (res.success) {
        setData(res.data || []);

        const seenDevs = new Set();
        const devOpts = [];
        (res.data || []).forEach((item) => {
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
        (res.data || []).forEach((it) => {
          (it.atividades || []).forEach((a) => {
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
        setData([]);
        setError("Não foi possível carregar os dados iniciais.");
      }
      setLoading(false);
    })();
    
  }, []);

  
  useEffect(() => {
    load();
    
  }, [dev, activity, from, to]);

  const { rows, activities } = useMemo(() => toStackedByDay(data), [data]);
  const empty = !loading && !error && rows.length === 0;

  return (
    <div className="card shadow-sm h-100">
        <div className="card-header">
            <h6 className="mb-0 fs-5 fw-semibold">👨‍💻 Desenvolvedor - Atividade/Dia</h6>
        </div>

        <div className="card-body">
        <div className="d-flex flex-wrap align-items-end gap-3 mb-3">
          <div>
            <label className="form-label mb-1">Desenvolvedor</label>
            <select
              className="form-select"
              value={dev}
              onChange={(e) => setDev(e.target.value)}
            >
              {devs.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label mb-1">Atividade</label>
            <select
              className="form-select"
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
            >
              {activitiesOpt.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label mb-1">De</label>
            <input
              type="date"
              className="form-control"
              value={from}
              max={to}
              onChange={(e) => setFrom(e.target.value)}
            />
          </div>

          <div>
            <label className="form-label mb-1">Até</label>
            <input
              type="date"
              className="form-control"
              value={to}
              min={from}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>
        </div>

        {loading && (
          <div className="d-flex align-items-center gap-2 text-secondary">
            <div className="spinner-border spinner-border-sm" role="status" />
            <span>Carregando…</span>
          </div>
        )}

        {error && <div className="alert alert-danger">{error}</div>}

        {empty && (
          <div className="text-center text-muted py-5">
            <div className="mb-2">Sem dados para os filtros selecionados.</div>
            <small>Altere os filtros acima para visualizar resultados.</small>
          </div>
        )}

        {!loading && !error && !empty && (
          <div style={{ width: "100%", height: 420 }}>
            <ResponsiveContainer>
              <BarChart data={rows} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis
                  tick={{ fontSize: 12 }}
                  label={{ value: "Horas", angle: -90, position: "insideLeft", offset: 10 }}
                />
                <Tooltip
                  formatter={(value, name) => [`${Number(value).toFixed(2)} h`, name]}
                  labelFormatter={(label) => `Dia: ${label}`}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                {activities.map((k) => (
                  <Bar key={k} dataKey={k} stackId="a" fill={colorFor(k)} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
