import React, { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { getHorasPorPeriodo } from "../../services/metrics/horaPorPeriodo";

const HorasPorPeriodo = () => {
  const [periodoFiltro, setPeriodoFiltro] = useState("mes");
  const [dadosPeriodo, setDadosPeriodo] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const opcoes = [
    { key: "dia", label: "Semana" },
    { key: "semana", label: "Mês" },
    { key: "mes", label: "Ano" },
    { key: "ano", label: "Retrospectiva" },
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const dados = await getHorasPorPeriodo(periodoFiltro);
        setDadosPeriodo(dados);
      } catch (err) {
        console.error("Erro ao buscar dados:", err);
        setError("Não foi possível carregar os dados.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [periodoFiltro]);

  return (
    <div className="container-fluid">
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h6 className="mb-0 fs-5 fw-semibold">
            ⏱️ Horas Realizadas por Período
          </h6>

          <div className="btn-group btn-group-sm" role="group">
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
                <label className="btn btn-outline-primary" htmlFor={`periodo-${key}`}>
                  {label}
                </label>
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="card-body">
          {loading ? (
            <p>Carregando dados...</p>
          ) : error ? (
            <p className="text-danger">{error}</p>
          ) : dadosPeriodo.length === 0 ? (
            <p>Nenhum dado disponível.</p>
          ) : (
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
                  formatter={(value) => [value, "Horas"]}
                  labelFormatter={(label) => `Período: ${label}`}
                />
                <Bar dataKey="atividades" fill="#06B6D4" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default HorasPorPeriodo;
