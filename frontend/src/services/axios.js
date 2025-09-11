import axios from "axios";

// Cria uma instância do Axios usando a URL do .env
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

export default api;
