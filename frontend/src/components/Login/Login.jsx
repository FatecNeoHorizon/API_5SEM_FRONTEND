import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../style/login.css";

import { login } from "../../services/metrics/login.service";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const isEmailValid = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!isEmailValid(email)) {
      setError("E-mail inválido! Exemplo: usuario@dominio.com");
      return;
    }

    setLoading(true);

    try {
      // Chama o backend e decodifica com segurança
      const payload = await login(email, senha);

      console.log("Payload do JWT:", payload);

      // Vai para dashboard
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-container">
      {/* Lado Esquerdo */}
      <div className="home-left">
        <div className="login-box">
          <div className="login-header">
            <h1 className="login-title">Bem-vindo</h1>
            <p className="login-subtitle">Entre com sua conta para continuar</p>
          </div>

          {error && (
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
              {error}
              <button
                type="button"
                className="btn-close"
                onClick={() => setError(null)}
                aria-label="Fechar"
              />
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            {/* Email */}
            <div className="form-group mb-3">
              <label htmlFor="email" className="form-label">
                E-mail
              </label>
              <input
                type="email"
                id="email"
                className="form-control"
                placeholder="email@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            {/* Senha */}
            <div className="form-group mb-3">
              <label htmlFor="senha" className="form-label">
                Senha
              </label>

              <div className="password-input-group">
                <input
                  type={showPassword ? "text" : "password"}
                  id="senha"
                  className="form-control"
                  placeholder="Digite sua senha"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                  disabled={loading}
                />

                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={handleTogglePasswordVisibility}
                  title={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  disabled={loading}
                >
                  {/* Ícones de olho */}
                  {showPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Entrar */}
            <button type="submit" className="btn btn-primary btn-login" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Lado Direito */}
      <div className="home-right">
        <div className="right-content">
          <h2>Dashboard Inteligente</h2>
          <p>Acompanhe suas métricas do Jira com dashboards claros e intuitivos</p>
        </div>
      </div>
    </div>
  );
}
