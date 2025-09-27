import React, { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from "recharts";
import { getHorasPorPeriodo } from "../../services/metrics/horaPorPeriodo";

const HorasPorPeriodo = () => {
  const [dados, setDados] = useState([]);
  const [periodoFiltro, setPeriodoFiltro] = useState("mes");

  useEffect(() => {
    const fetchData = async () => {
      const data = await getHorasPorPeriodo(periodoFiltro);
      setDados(data);
    };
    fetchData();
  }, [periodoFiltro]);

  const opcoesPeriodo = [
    { key: "dia", label: "Dia" },
    { key: "semana", label: "Semana" },
    { key: "mes", label: "Mês" },
    { key: "ano", label: "Ano" },
  ];

  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between">
        ⏱ Horas Trabalhadas
        <div className="btn-group btn-group-sm">
          {opcoesPeriodo.map(({ key, label }) => (
            <React.Fragment key={key}>
              <input
                type="radio"
                className="btn-check"
                name="periodo-horas"
                id={`periodo-horas-${key}`}
                checked={periodoFiltro === key}
                onChange={() => setPeriodoFiltro(key)}
              />
              <label
                className="btn btn-outline-primary"
                htmlFor={`periodo-horas-${key}`}
              >
                {label}
              </label>
            </React.Fragment>
          ))}
        </div>
      </div>
      <div className="card-body">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dados}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="periodo" />
            <YAxis />
            <Tooltip 
              formatter={(value) => [value, "Horas"]}
              labelFormatter={(label) => `Período: ${label}`}
            />
            <Bar dataKey="atividades" fill="#8f41d8d5" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default HorasPorPeriodo;
