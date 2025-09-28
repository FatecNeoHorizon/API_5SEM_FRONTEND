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

import { HorasPorDev } from "../../services/metrics/horasPorDev";
import DevTooltip from "./DevTooltip";

export default function HorasDevChart() {
    const [horaDevData, setHoraDevData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                const result = await HorasPorDev.getHorasPorDev();

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
                    <h6 className="mb-0 fs-5 fw-semibold">👨‍💻 Horas por Desenvolvedor</h6>
                </div>
                <div className="card-body">
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={horaDevData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" dataKey="horas" />
                            <YAxis
                                dataKey="dev"
                                type="category"
                                width={140}
                                tick={{ fontSize: 12 }}
                                tickFormatter={(v) => (typeof v === "string" && v.length > 20 ? `${v.slice(0, 20)}…` : v)}
                            />
                            <Tooltip content={<DevTooltip />} />
                            <Bar dataKey="horas" fill="#F6B26B" radius={[2, 2, 2, 2]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div> 
    );
}