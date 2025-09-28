import axios from "axios";

export const getHorasPorPeriodo = async (periodo) => {
  const { data } = await axios.get("http://localhost:8080/fato-custo-hora");

  let dadosFiltrados = data;

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
    dadosFiltrados = data.filter(
      d => d.dimPeriodo.mes === ultimoMes && d.dimPeriodo.ano === ultimoAno
    );

    const semanasExistentes = [...new Set(dadosFiltrados.map(d => d.dimPeriodo.semana))].sort((a,b) => a-b);
    const mapaSemana = {};
    semanasExistentes.forEach((sem, index) => {
      mapaSemana[sem] = index + 1;
    });

    dadosFiltrados = dadosFiltrados.map(d => ({
      ...d,
      dimPeriodo: {
        ...d.dimPeriodo,
        semana: mapaSemana[d.dimPeriodo.semana]
      }
    }));
  }

  if (periodo === "dia") {
    const { ultimoMes, ultimoAno } = getUltimoMesAno();
    dadosFiltrados = data.filter(
      d => d.dimPeriodo.mes === ultimoMes && d.dimPeriodo.ano === ultimoAno
    );

    const ultimoDiaDoMes = new Date(ultimoAno, ultimoMes, 0).getDate();

    const ultimos7Dias = Array.from({ length: 7 }, (_, i) => ultimoDiaDoMes - 6 + i);

    const mapaHoras = {};
    ultimos7Dias.forEach(dia => (mapaHoras[dia] = 0));
    dadosFiltrados.forEach(d => {
      mapaHoras[d.dimPeriodo.dia] = d.horas_quantidade;
    });

    dadosFiltrados = ultimos7Dias.map(dia => ({
      dimPeriodo: { dia, mes: ultimoMes, ano: ultimoAno },
      horas_quantidade: mapaHoras[dia],
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

    acc[chave] = (acc[chave] || 0) + item.horas_quantidade;
    return acc;
  }, {});

  let resultado = Object.entries(agrupado).map(([periodo, atividades]) => ({
    periodo,
    atividades,
  }));

  if (periodo === "mes") {
    const nomesMeses = [
      "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
      "Jul", "Ago", "Set", "Out", "Nov", "Dez"
    ];

    resultado = resultado.map(item => {
      const [mes, ano] = item.periodo.split("/").map(Number);
      return {
        periodo: `${nomesMeses[mes - 1]}/${ano}`,
        atividades: item.atividades
      };
    });

    resultado.sort((a, b) => {
      const [mesA, anoA] = a.periodo.split("/");
      const [mesB, anoB] = b.periodo.split("/");
      const indexA = nomesMeses.indexOf(mesA);
      const indexB = nomesMeses.indexOf(mesB);
      return Number(anoA) - Number(anoB) || indexA - indexB;
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
};
