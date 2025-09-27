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
import { getIssuesPorPeriodo } from "../../services/metrics/issues.periodo";

const IssuesPeriodo = () => {
  const [periodoFiltro, setPeriodoFiltro] = useState("mes");
  const [dadosPeriodo, setDadosPeriodo] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const dados = await getIssuesPorPeriodo(periodoFiltro);
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

  // rótulos customizados: semana, mes, ano, retrospectiva
  const opcoes = [
    { key: "dia", label: "Semana" },
    { key: "semana", label: "Mês" },
    { key: "mes", label: "Ano" },
    { key: "ano", label: "Retrospectiva" },
  ];

  return (
    <div className="container-fluid">
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h6 className="mb-0 fs-5 fw-semibold">
            📋 Issues por Período
          </h6>

          <div className="btn-group btn-group-sm" role="group">
            {opcoes.map((opt) => (
              <React.Fragment key={opt.key}>
                <input
                  type="radio"
                  className="btn-check"
                  name="periodo"
                  id={`periodo-${opt.key}`}
                  checked={periodoFiltro === opt.key}
                  onChange={() => setPeriodoFiltro(opt.key)}
                />
                <label
                  className="btn btn-outline-primary"
                  htmlFor={`periodo-${opt.key}`}
                >
                  {opt.label}
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
                  formatter={(value) => [value, "Issues"]}
                  labelFormatter={(label) => `Período: ${label}`}
                />
                <Bar dataKey="issues" fill="#f97316" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default IssuesPeriodo;
