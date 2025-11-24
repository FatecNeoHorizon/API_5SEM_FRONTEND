import api from "../axios";

// --------------------------
// Total de custos
// --------------------------
const EX_IDS = new Set([1]);
const EX_NAMES = new Set(["Não atribuido", "Nao atribuido", "Não Atribuido", "Nao Atribuido"]);
const excluiNaoAtribuido = (arr) =>
  Array.isArray(arr)
    ? arr.filter((r) => {
        const id = Number(r?.id ?? r?.devId ?? r?.dimDev?.id ?? r?.desenvolvedorId);
        const nome = String(r?.nome ?? r?.devNome ?? r?.desenvolvedorNome ?? "").trim();
        if (EX_IDS.has(id)) return false;
        if (EX_NAMES.has(nome)) return false;
        return true;
      })
    : arr;

export async function getTotalCusto() {
  try {
    const res = await api.get("/fato-custo-hora/total");
    return res.data;
  } catch (err) {
    throw new Error("Falha ao buscar total de custos");
  }
}

// --------------------------
// Custos por projeto
// --------------------------
export async function getCustoPorProjeto() {
  try {
    const res = await api.get("/fato-custo-hora/total-por-projeto");
    return res.data;
  } catch (err) {
    throw new Error("Falha ao buscar custo por projeto");
  }
}

// --------------------------
// Custos por desenvolvedor
// --------------------------
export async function getCustoPorDev() {
  try {
    const res = await api.get("/fato-custo-hora/por-dev");
    return excluiNaoAtribuido(res.data);
  } catch (err) {
    throw new Error("Falha ao buscar custo por dev");
  }
}

// --------------------------
// Evolução dos custos (por período)
// --------------------------
export async function getEvolucaoCustos(granularidade = "mes") {
  try {
    const res = await api.get("/fato-custo-hora/evolucao", { params: { granularidade } });
    return res.data;
  } catch (err) {
    throw new Error("Falha ao buscar evolução de custos");
  }
}
