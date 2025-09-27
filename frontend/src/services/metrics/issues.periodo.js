import axios from "axios";

export const getIssuesPorPeriodo = async (periodo) => {
  const dataInicio = "1900-01-01";
  const hoje = new Date();
  const dataFim = hoje.toISOString().split("T")[0];

  const params = { dataInicio, dataFim, periodo };

  const { data } = await axios.get(
    "http://localhost:8080/fato-issue/agregado",
    { params }
  );

  let lista = data.map((item) => ({
    periodo: item.projectName,
    issues: item.totalIssues,
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
        issues: item.issues,
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
        issues: item.issues,
      }));
    }
  }

  if (periodo === "dia") {
    if (lista.length > 0) {
      const datas = lista.map((d) => new Date(d.periodo));
      const ultimaData = datas.reduce((a, b) => (a > b ? a : b));
      const ultimoAno = ultimaData.getFullYear();
      const ultimoMes = ultimaData.getMonth() + 1;

      const ultimoDiaDoMes = new Date(ultimoAno, ultimoMes, 0).getDate();
      const dias = [];

      for (let dia = ultimoDiaDoMes - 6; dia <= ultimoDiaDoMes; dia++) {
        const dt = new Date(ultimoAno, ultimoMes - 1, dia);
        const iso = dt.toISOString().split("T")[0];
        const encontrado = lista.find((d) => d.periodo === iso);
        dias.push({
          periodo: iso,
          issues: encontrado ? encontrado.issues : 0,
        });
      }

      lista = dias;
    }
  }

  return lista;
};
