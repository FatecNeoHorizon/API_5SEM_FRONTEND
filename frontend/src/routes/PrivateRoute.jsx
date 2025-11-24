// PrivateRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

// Função que verifica se o usuário está logado
const isAuthenticated = () => {
  const token = localStorage.getItem("token");
  return !!token; // true se existir token
};

// Componente para envolver rotas privadas
export default function PrivateRoute({ children }) {
  if (!isAuthenticated()) {
    // Redireciona para a tela de NotFound se não estiver autenticado
    return <Navigate to="/notfound" replace />;
  }

  // Renderiza o componente filho se estiver logado
  return children;
}
