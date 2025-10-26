import axios from "axios";

const API_BASE = `${process.env.REACT_APP_API_URL}/fato-custo-hora`;

const api = axios.create({
  baseURL: API_BASE,
});

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
    const res = await api.get("/total");
    return res.data;
  } catch (err) {
    throw new Error("Falha ao buscar total de custos");
  }
}

export async function getCustoPorProjeto() {
  try {
    const res = await api.get("/total-por-projeto");
    return res.data;
  } catch (err) {
    throw new Error("Falha ao buscar custo por projeto");
  }
}

export async function getCustoPorDev() {
  try {
    const res = await api.get("/por-dev");
    return excluiNaoAtribuido(res.data);
  } catch (err) {
    throw new Error("Falha ao buscar custo por dev");
  }
}

export async function getEvolucaoCustos(granularidade = "mes") {
  try {
    const res = await api.get("/evolucao", { params: { granularidade } });
    return res.data;
  } catch (err) {
    throw new Error("Falha ao buscar evolução de custos");
  }
}
