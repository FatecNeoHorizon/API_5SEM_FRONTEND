import axios from "axios";
import { DimProjeto } from "../DimProjeto";
import { DimDev } from "../DimDev";

const API_BASE = `${process.env.REACT_APP_API_URL}/fato-custo-hora`;

// --------------------------
// Horas por projeto
// --------------------------
export const getHorasPorProjeto = async () => {
  let listaHorasPorProjeto = [];
  try {
    const response = await DimProjeto.getDimProjeto();
    const listaProjetos = response.data;

    for (let projeto of listaProjetos) {
      const params = new URLSearchParams();
      params.append("projeto_id", projeto.id);
      params.append("periodo_id", "0");
      params.append("dev_id", "0");

      const res = await axios.get(`${API_BASE}/filter`, { params });
      const fatoCustoHora = res.data || [];

      const totalHoras = fatoCustoHora.reduce((acc, cur) => acc + cur.horasQuantidade, 0);

      if (totalHoras > 0) {
        listaHorasPorProjeto.push({ task: projeto.nome, horas: totalHoras });
      }
    }

    return listaHorasPorProjeto;
  } catch (error) {
    console.error(error);
    return [];
  }
};

// --------------------------
// Horas por desenvolvedor
// --------------------------
export const getHorasPorDev = async () => {
  try {
    const response = await DimDev.getDimDev();
    const listaDevs = response.data;

    const listaHorasPorDev = [];

    for (let dev of listaDevs) {
      const params = new URLSearchParams();
      params.append("projeto_id", "0");
      params.append("periodo_id", "0");
      params.append("dev_id", dev.id);

      const res = await axios.get(`${API_BASE}/filter`, { params });
      const fatoCustoHora = res.data || [];

      const totalHoras = fatoCustoHora.reduce((acc, cur) => acc + cur.horasQuantidade, 0);

      if (totalHoras > 0) {
        listaHorasPorDev.push({ dev: dev.nome, horas: totalHoras });
      }
    }

    return listaHorasPorDev;
  } catch (error) {
    console.error(error);
    return [];
  }
};

// --------------------------
// Horas por período
// --------------------------
export const getHorasPorPeriodo = async (periodo = "mes") => {
  try {
    let { data } = await axios.get(API_BASE);
    data = data.filter(d => removerPeriodoCoringa(d.dimPeriodo));
    let dadosFiltrados = [...data];

    const getUltimoMesAno = () => {
      const ultimoMes = Math.max(...data.map(d => d.dimPeriodo.mes));
      const anosDoUltimoMes = data
        .filter(d => d.dimPeriodo.mes === ultimoMes)
        .map(d => d.dimPeriodo.ano);
      const ultimoAno = Math.max(...anosDoUltimoMes);
      return { ultimoMes, ultimoAno };
    };

    if (periodo === "semana") {
      const { ultimoMes, ultimoAno } = getUltimoMesAno();
      dadosFiltrados = dadosFiltrados.filter(d => d.dimPeriodo.mes === ultimoMes && d.dimPeriodo.ano === ultimoAno);

      const semanasExistentes = [...new Set(dadosFiltrados.map(d => d.dimPeriodo.semana))].sort((a, b) => a - b);
      const mapaSemana = {};
      semanasExistentes.forEach((sem, i) => (mapaSemana[sem] = i + 1));

      dadosFiltrados = dadosFiltrados.map(d => ({
        ...d,
        dimPeriodo: { ...d.dimPeriodo, semana: mapaSemana[d.dimPeriodo.semana] },
      }));
    }

    if (periodo === "dia") {
      const { ultimoMes, ultimoAno } = getUltimoMesAno();
      dadosFiltrados = dadosFiltrados.filter(d => d.dimPeriodo.mes === ultimoMes && d.dimPeriodo.ano === ultimoAno);

      const ultimoDiaDoMes = new Date(ultimoAno, ultimoMes, 0).getDate();
      const ultimos7Dias = Array.from({ length: 7 }, (_, i) => ultimoDiaDoMes - 6 + i);
      const mapaHoras = {};
      ultimos7Dias.forEach(dia => (mapaHoras[dia] = 0));
      dadosFiltrados.forEach(d => {
        mapaHoras[d.dimPeriodo.dia] = d.horasQuantidade;
      });

      dadosFiltrados = ultimos7Dias.map(dia => ({
        dimPeriodo: { dia, mes: ultimoMes, ano: ultimoAno },
        horasQuantidade: mapaHoras[dia],
      }));
    }

    const agrupado = dadosFiltrados.reduce((acc, item) => {
      const p = item.dimPeriodo;
      let chave;
      switch (periodo) {
        case "dia":
          chave = `${p.dia}/${p.mes}/${p.ano}`;
          break;
        case "semana":
          chave = `Sem ${p.semana}`;
          break;
        case "mes":
          chave = `${p.mes}/${p.ano}`;
          break;
        case "ano":
          chave = `${p.ano}`;
          break;
        default:
          chave = `${p.mes}/${p.ano}`;
      }
      acc[chave] = (acc[chave] || 0) + item.horasQuantidade;
      return acc;
    }, {});

    let resultado = Object.entries(agrupado).map(([periodo, horas]) => ({
      periodo,
      atividades: horas,
    }));

    if (periodo === "mes") {
      const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
      resultado = resultado.map(r => {
        const [mes, ano] = r.periodo.split("/").map(Number);
        return { periodo: `${meses[mes - 1]}/${ano}`, atividades: r.atividades };
      });
      resultado.sort((a, b) => {
        const [mesA, anoA] = a.periodo.split("/");
        const [mesB, anoB] = b.periodo.split("/");
        return Number(anoA) - Number(anoB) || meses.indexOf(mesA) - meses.indexOf(mesB);
      });
    }

    if (periodo === "dia") {
      resultado.sort((a, b) => {
        const [diaA, mesA, anoA] = a.periodo.split("/").map(Number);
        const [diaB, mesB, anoB] = b.periodo.split("/").map(Number);
        if (anoA !== anoB) return anoA - anoB;
        if (mesA !== mesB) return mesA - mesB;
        return diaA - diaB;
      });
    } else if (periodo === "semana") {
      resultado.sort((a, b) => Number(a.periodo.replace("Sem ", "")) - Number(b.periodo.replace("Sem ", "")));
    } else if (periodo === "ano") {
      resultado.sort((a, b) => Number(a.periodo) - Number(b.periodo));
    }

    return resultado;
  } catch (error) {
    console.error(error);
    return [];
  }
};

// --------------------------
// Total de Bugs (mock)
// --------------------------
export const getTotalBugs = async () => {
  return { total: 123 };
};

// --------------------------
// Total de Manutencao (mock)
// --------------------------
export const getTotalManutencao = async () => {
  return { total: 45 };
};

// --------------------------
// Bugs X Manutenção por Período (mock)
// --------------------------
export const getBugsXManutencaoPorPeriodo = async (periodo = "mes") => {
  const mockData = {
    dia: [
      { periodo: "10/10/2025", bugs: 3, manutencao: 5 },
      { periodo: "11/10/2025", bugs: 2, manutencao: 4 },
      { periodo: "12/10/2025", bugs: 4, manutencao: 6 },
      { periodo: "13/10/2025", bugs: 1, manutencao: 3 },
      { periodo: "14/10/2025", bugs: 5, manutencao: 7 },
      { periodo: "15/10/2025", bugs: 2, manutencao: 4 },
      { periodo: "16/10/2025", bugs: 3, manutencao: 5 },
    ],
    semana: [
      { periodo: "Sem 1", bugs: 12, manutencao: 18 },
      { periodo: "Sem 2", bugs: 15, manutencao: 20 },
      { periodo: "Sem 3", bugs: 10, manutencao: 14 },
      { periodo: "Sem 4", bugs: 8, manutencao: 12 },
    ],
    mes: [
      { periodo: "Jan/2025", bugs: 40, manutencao: 60 },
      { periodo: "Fev/2025", bugs: 35, manutencao: 50 },
      { periodo: "Mar/2025", bugs: 45, manutencao: 70 },
      { periodo: "Abr/2025", bugs: 30, manutencao: 55 },
      { periodo: "Mai/2025", bugs: 50, manutencao: 80 },
    ],
    ano: [
      { periodo: "2022", bugs: 300, manutencao: 500 },
      { periodo: "2023", bugs: 350, manutencao: 600 },
      { periodo: "2024", bugs: 400, manutencao: 650 },
      { periodo: "2025", bugs: 200, manutencao: 300 },
    ],
  };

  return mockData[periodo] || mockData["mes"];
};

const removerPeriodoCoringa = (dimPeriodo) =>
{
  return (dimPeriodo.ano != 99) && (dimPeriodo.dia != 31) && (dimPeriodo.mes != 12) && (dimPeriodo.semana != 99);
};
