import axios from "axios";

const API_BASE = `${process.env.REACT_APP_API_URL}/fato-custo-hora`;

const api = axios.create({
  baseURL: API_BASE,
});

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
    return res.data;
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
