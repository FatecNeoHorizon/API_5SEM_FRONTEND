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

  const resultado = Object.entries(agrupado).map(([periodo, atividades]) => ({
    periodo,
    atividades,
  }));

  resultado.sort((a, b) => {
    if (periodo === "dia") {
      const [diaA, mesA, anoA] = a.periodo.split("/").map(Number);
      const [diaB, mesB, anoB] = b.periodo.split("/").map(Number);
      if (anoA !== anoB) return anoA - anoB;
      if (mesA !== mesB) return mesA - mesB;
      return diaA - diaB;
    }

    if (periodo === "semana") {
      const semA = Number(a.periodo.replace("Sem ", ""));
      const semB = Number(b.periodo.replace("Sem ", ""));
      return semA - semB;
    }

    if (periodo === "mes") {
      const [mesA, anoA] = a.periodo.split("/").map(Number);
      const [mesB, anoB] = b.periodo.split("/").map(Number);
      if (anoA !== anoB) return anoA - anoB;
      return mesA - mesB;
    }

    if (periodo === "ano") {
      return Number(a.periodo) - Number(b.periodo);
    }

    return 0;
  });

  return resultado;
};
