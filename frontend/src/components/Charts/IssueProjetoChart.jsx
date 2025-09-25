import React, { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";
import IssuesProjetoService from "../../services/metrics/issues.projeto";

export default function IssueProjetoChart() {
  const [projectData, setProjectData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const brandPalette = [
    "#7C3AED", "#3B82F6", "#06B6D4",
    "#22C55E", "#F59E0B", "#14B8A6",
    "#F43F5E", "#6366F1",
  ];

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const result = await IssuesProjetoService.getTotalIssues();
        
        if (!result.success) {
          throw new Error(result.error || "Erro ao buscar dados");
        }

        const chartData = result.data.map(item => ({
          name: item.projectName,
          value: item.totalIssues,
        }));

        setProjectData(chartData);
      } catch (err) {
        console.error("Erro ao buscar issues por projeto:", err);
        setError("Erro ao carregar dados");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) return <div className="p-3">Carregando…</div>;
  if (error) return <div className="text-danger p-3">{error}</div>;

  return (
    <div className="card h-100">
      <div className="card-header">
        <h6 className="mb-0 fs-5 fw-semibold">🕒 Total de Issues por Projeto</h6>
      </div>
      <div className="card-body d-flex justify-content-center align-items-center">
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={projectData}
              cx="50%"
              cy="50%"
              outerRadius={90}
              dataKey="value"
              label={({ name, value }) => `${name}: ${value}`}
            >
              {projectData.map((entry, index) => (
                <Cell
                  key={`proj-${entry.name}`}
                  fill={brandPalette[index % brandPalette.length]}
                />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [value, "Total de Issues"]} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}