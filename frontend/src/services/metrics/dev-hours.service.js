import api from "../axios";

export class DevHoursService {
  static async getDevHours(params = {}) {
    const queryParams = {};
    if (params.dev !== undefined && params.dev !== null && `${params.dev}`.trim() !== "") {
      queryParams.dev = String(params.dev);
    }
    if (params.activity !== undefined && params.activity !== null && `${params.activity}`.trim() !== "") {
      queryParams.activity = String(params.activity);
    }
    if (params.from) queryParams.from = params.from;
    if (params.to) queryParams.to = params.to;

    const qs = new URLSearchParams(queryParams).toString();
    const url = qs ? `/metrics/dev-hours?${qs}` : `/metrics/dev-hours`;

    try {
      const response = await api.get(url);
      return { success: true, data: response.data || [] };
    } catch (error) {
      console.error("Erro ao buscar horas por dev:", error);
      return { success: false, data: [] };
    }
  }
}

export function toStackedByDay(items) {
  const allActivities = new Set();
  const byDate = {};

  (items || []).forEach((dev) => {
    (dev.atividades || []).forEach((atv) => {
      allActivities.add(atv.atividadeNome);
      (atv.diasApontamentos || []).forEach((dia) => {
        const d = dia.data;
        if (!byDate[d]) byDate[d] = {};
        byDate[d][atv.atividadeNome] = (byDate[d][atv.atividadeNome] || 0) + (dia.horas || 0);
      });
    });
  });

  const dates = Object.keys(byDate).sort();
  const activities = Array.from(allActivities.values()).sort();

  const rows = dates.map((d) => {
    const row = { date: d, total: 0 };
    activities.forEach((a) => {
      const v = byDate[d][a] || 0;
      row[a] = v;
      row.total += v;
    });
    return row;
  });

  return { rows, activities, dates };
}
