import api from "../axios";

// --------------------------
// Total de atividades
// --------------------------
export const getTotalAtividades = async () => {
  try {
    const response = await api.get("/fato-atividade/total");
    return {
      success: true,
      data: { total: response.data },
    };
  } catch (error) {
    console.error("Erro ao buscar total de atividades:", error);
    return {
      success: false,
      error: error.message || "Erro desconhecido ao buscar total de atividades",
    };
  }
};

// --------------------------
// Atividades por projeto
// --------------------------
export const getAtividadesPorProjeto = async () => {
  try {
    const [proj] = await Promise.all([
      api.get("/fato-atividade/por-projeto"),
    ]);

    const lista = Array.isArray(proj.data)
      ? proj.data.map((p) => ({
          nomeProjeto: p.projectName || p.nomeProjeto || "(sem nome)",
          total: Number(p.totalAtividades ?? p.total ?? 0),
        }))
      : [];

    return {
      success: true,
      data: lista,
    };
  } catch (error) {
    console.error("Erro ao buscar atividades por projeto:", error);
    return {
      success: false,
      error: error.message || "Erro desconhecido ao buscar atividades por projeto",
    };
  }
};

// --------------------------
// Atividades por período
// --------------------------
export const getAtividadesPorPeriodo = async (periodo) => {
  const dataInicio = "1900-01-01";
  const hoje = new Date();
  const dataFim = hoje.toISOString().split("T")[0];

  const params = { dataInicio, dataFim, periodo };

  const { data } = await api.get("/fato-atividade/agregado", { params });

  let lista = data.map((item) => ({
    periodo: item.projectName,
    atividades: item.totalAtividades,
  }));

  if (periodo === "mes") {
    lista.sort((a, b) => {
      const [ma, aa] = a.periodo.split("/").map(Number);
      const [mb, ab] = b.periodo.split("/").map(Number);
      return aa - ab || ma - mb;
    });

    const nomesMeses = [
      "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
      "Jul", "Ago", "Set", "Out", "Nov", "Dez"
    ];

    lista = lista.map((item) => {
      const [ano, mes] = item.periodo.split("-").map(Number);
      return {
        periodo: `${nomesMeses[mes - 1]}/${ano}`,
        atividades: item.atividades,
      };
    });
  } else if (periodo === "ano") {
    lista.sort((a, b) => Number(a.periodo) - Number(b.periodo));
  }

  if (periodo === "semana") {
    if (lista.length > 0) {
      const qtdUltimasSemanas = 4;
      const ultimasSemanas = lista.slice(-qtdUltimasSemanas);
      lista = ultimasSemanas.map((item, index) => ({
        periodo: `Sem ${index + 1}`,
        atividades: item.atividades,
      }));
    }
  }

  if (periodo === "dia") {
    if (lista.length > 0) {
      const normalizeIso = (s) => {
        if (!s) return s;
        if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
        const m = s.match(/(\d{4})\D(\d{1,2})\D(\d{1,2})/);
        if (m) {
          const y = m[1];
          const mm = String(m[2]).padStart(2, "0");
          const dd = String(m[3]).padStart(2, "0");
          return `${y}-${mm}-${dd}`;
        }
        return s;
      };

      const mapa = {};
      lista.forEach((it) => {
        const iso = normalizeIso(String(it.periodo));
        mapa[iso] = (mapa[iso] || 0) + Number(it.atividades || 0);
      });

  const todasDatas = Object.keys(mapa).map(d => new Date(d));
  const ultimaData = todasDatas.reduce((a, b) => (a > b ? a : b), new Date(0));

      const dias = [];
      for (let i = 6; i >= 0; i--) {
        const dt = new Date(ultimaData);
        dt.setDate(ultimaData.getDate() - i);
        const iso = dt.toISOString().split("T")[0];
        dias.push({ periodo: iso, atividades: mapa[iso] || 0 });
      }

      lista = dias;
    }
  }

  return lista;
};

// --------------------------
// Horas por desenvolvedor
// --------------------------
export const getHorasPorDev = async (params = {}) => {
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
  const url = qs ? `/metrics/dev-hours?${qs}` : "/metrics/dev-hours";

  try {
    const response = await api.get(url);
    return { success: true, data: response.data || [] };
  } catch (error) {
    console.error("Erro ao buscar horas por dev:", error);
    return { success: false, data: [] };
  }
};

export const toStackedByDay = (items) => {
  const allActivities = new Set();
  const byDate = {};

  (items || []).forEach((dev) => {
    (dev.atividades || []).forEach((atv) => {
      let totalHoursForActivity = 0;
      (atv.diasApontamentos || []).forEach((dia) => {
        const horas = dia.horas || 0;
        totalHoursForActivity += horas;
      });
      
      // Só adiciona atividade se tiver horas totais > 0
      if (totalHoursForActivity > 0) {
        allActivities.add(atv.atividadeNome);
        
        (atv.diasApontamentos || []).forEach((dia) => {
          const d = dia.data;
          const horas = dia.horas || 0;
          
          // Apenas adiciona horas se > 0
          if (horas > 0) {
            if (!byDate[d]) byDate[d] = {};
            byDate[d][atv.atividadeNome] = (byDate[d][atv.atividadeNome] || 0) + horas;
          }
        });
      }
    });
  });

  const dates = Object.keys(byDate).sort((a, b) => a.localeCompare(b));
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
};
