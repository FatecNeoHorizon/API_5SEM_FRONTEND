import axios from "axios";

const API_BASE = `${process.env.REACT_APP_API_URL}`;

const devApi = axios.create({ baseURL: `${API_BASE}/dim-dev` });
const fatoApi = axios.create({ baseURL: `${API_BASE}/fato-custo-hora` });

// --------------------------
// Modal Custo Dev
// --------------------------
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

// --------------------------
// Modal Gerenciar Usuarios (integração com backend)
// --------------------------

const userApi = axios.create({ baseURL: `${API_BASE}/usuario` });

function authHeader() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function listUsuarios() {
  const res = await userApi.get("", { headers: authHeader() });
  return res.data;
}

export async function createUsuario(usuario) {
  const res = await userApi.post("", usuario, { headers: authHeader() });
  return res.data;
}

export async function updateUsuario(usuario) {
  // usuario should contain either usuario_id or id
  const id = usuario.usuario_id ?? usuario.id;
  if (!id) throw new Error("ID do usuário é necessário para atualização");
  const body = { email: usuario.email, senha: usuario.senha, cargo: usuario.cargo };
  const res = await userApi.put(`/${id}`, body, { headers: authHeader() });
  return res.data;
}

export async function deleteUsuario(id) {
  const res = await userApi.delete(`/${id}`, { headers: authHeader() });
  return res.status === 204 || res.status === 200;
}