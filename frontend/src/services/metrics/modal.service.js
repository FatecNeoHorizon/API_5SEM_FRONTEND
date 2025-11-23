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
// Modal Gerenciar Usuarios
// --------------------------

// MOCK: Lista de usuários
let mockUsuarios = [
  { id: 1, email: "admin@neohorizon.com", cargo: "ADMIN" },
  { id: 2, email: "dev1@neohorizon.com", cargo: "DEVELOPER" },
  { id: 3, email: "dev2@neohorizon.com", cargo: "DEVELOPER" },
];

export async function listUsuarios() {
  // Simula delay
  await new Promise((r) => setTimeout(r, 300));
  return mockUsuarios;
}

export async function createUsuario(usuario) {
  await new Promise((r) => setTimeout(r, 300));
  const novo = { ...usuario, id: Date.now() };
  mockUsuarios.push(novo);
  return novo;
}

export async function updateUsuario(usuario) {
  await new Promise((r) => setTimeout(r, 300));
  mockUsuarios = mockUsuarios.map((u) => (u.id === usuario.id ? { ...u, ...usuario } : u));
  return usuario;
}

export async function deleteUsuario(id) {
  await new Promise((r) => setTimeout(r, 300));
  mockUsuarios = mockUsuarios.filter((u) => u.id !== id);
  return true;
}