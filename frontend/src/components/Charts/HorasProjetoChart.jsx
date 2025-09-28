import React, { useEffect, useState } from "react";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip
} from "recharts";

import { HorasPorProjeto } from "../../services/metrics/horasPorProjeto";
import ProjetoTooltip from "./ProjetoTooltip";

export default function HoraProjetoChart() {
    const [horaDevData, setHoraDevData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                const result = await HorasPorProjeto.getHorasPorProjeto();

                setHoraDevData(result);

            } catch (err) {
                console.error("Erro ao buscar horas por dev:", err);
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
                <h6 className="mb-0 fs-5 fw-semibold">📊 Horas trabalhadas por projeto</h6>
            </div>
            <div className="card-body">
                <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={horaDevData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" dataKey="horas" />
                        <YAxis
                            dataKey="task"
                            type="category"
                            width={120}
                            tick={{ fontSize: 12 }}
                            tickFormatter={(v) => (typeof v === "string" && v.length > 18 ? `${v.slice(0, 18)}…` : v)}
                        />
                        <Tooltip content={<ProjetoTooltip />} />
                        <Bar dataKey="horas" fill="#536c85ff" radius={[2, 2, 2, 2]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}