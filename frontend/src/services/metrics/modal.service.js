import axios from "axios";

const RAW_BASE = process.env.REACT_APP_API_URL || "http://localhost:8080";
const API_BASE = RAW_BASE.replace(/\/+$/,"");

const API_PREFIX = ""; 

const devApi = axios.create({ baseURL: `${API_BASE}${API_PREFIX}/dim-dev` });
const fatoApi = axios.create({ baseURL: `${API_BASE}${API_PREFIX}/fato-custo-hora` });

export async function listDevs() {
  const res = await devApi.get("");
  return res.data;
}

export async function updateDev(dev) {
  const res = await devApi.put(`/${dev.id}`, dev);
  return res.data;
}

export async function listFatos() {
  const res = await fatoApi.get("");
  return res.data;
}

export async function updateFato(fato) {
  const res = await fatoApi.put(`/${fato.id}`, fato);
  return res.data;
}