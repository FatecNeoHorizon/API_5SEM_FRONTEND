import axios from "axios";
import { DimProjeto } from "../DimProjeto";
import { DimDev } from "../DimDev";

const API_BASE = `${process.env.REACT_APP_API_URL}/fato-custo-hora`;

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

      const totalHoras = fatoCustoHora.reduce((acc, cur) => acc + cur.horas_quantidade, 0);

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

      const totalHoras = fatoCustoHora.reduce((acc, cur) => acc + cur.horas_quantidade, 0);

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

export const getHorasPorPeriodo = async (periodo = "mes") => {
  try {
    const { data } = await axios.get(API_BASE);
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

      const semanasExistentes = [...new Set(dadosFiltrados.map(d => d.dimPeriodo.semana))].sort((a,b) => a-b);
      const mapaSemana = {};
      semanasExistentes.forEach((sem, i) => mapaSemana[sem] = i + 1);

      dadosFiltrados = dadosFiltrados.map(d => ({
        ...d,
        dimPeriodo: { ...d.dimPeriodo, semana: mapaSemana[d.dimPeriodo.semana] }
      }));
    }

    if (periodo === "dia") {
      const { ultimoMes, ultimoAno } = getUltimoMesAno();
      dadosFiltrados = dadosFiltrados.filter(d => d.dimPeriodo.mes === ultimoMes && d.dimPeriodo.ano === ultimoAno);

      const ultimoDiaDoMes = new Date(ultimoAno, ultimoMes, 0).getDate();
      const ultimos7Dias = Array.from({ length: 7 }, (_, i) => ultimoDiaDoMes - 6 + i);
      const mapaHoras = {};
      ultimos7Dias.forEach(dia => mapaHoras[dia] = 0);
      dadosFiltrados.forEach(d => {
        mapaHoras[d.dimPeriodo.dia] = d.horas_quantidade;
      });

      dadosFiltrados = ultimos7Dias.map(dia => ({
        dimPeriodo: { dia, mes: ultimoMes, ano: ultimoAno },
        horas_quantidade: mapaHoras[dia]
      }));
    }

    const agrupado = dadosFiltrados.reduce((acc, item) => {
      const p = item.dimPeriodo;
      let chave;
      switch (periodo) {
        case "dia": chave = `${p.dia}/${p.mes}/${p.ano}`; break;
        case "semana": chave = `Sem ${p.semana}`; break;
        case "mes": chave = `${p.mes}/${p.ano}`; break;
        case "ano": chave = `${p.ano}`; break;
        default: chave = `${p.mes}/${p.ano}`;
      }
      acc[chave] = (acc[chave] || 0) + item.horas_quantidade;
      return acc;
    }, {});

    let resultado = Object.entries(agrupado).map(([periodo, horas]) => ({ periodo, atividades: horas }));

    if (periodo === "mes") {
      const meses = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
      resultado = resultado.map(r => {
        const [mes, ano] = r.periodo.split("/").map(Number);
        return { periodo: `${meses[mes-1]}/${ano}`, atividades: r.atividades };
      });
      resultado.sort((a,b) => {
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
