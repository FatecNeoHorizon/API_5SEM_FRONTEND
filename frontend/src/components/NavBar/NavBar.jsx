import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logoWhite from "../../assets/logoWhite.png";
import userWhite from "../../assets/userWhite.png";
import ModalCustoDev from "../Modal/ModalCustoDev.jsx";
import { extractRoles } from "../../services/auth.service";
import Hint from "../Hint/Hint";

const NavBar = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);                // dropdown principal
  const [openSettings, setOpenSettings] = useState(false); // submenu Configurações
  const [showCustoModal, setShowCustoModal] = useState(false); // modal custo
  const [user, setUser] = useState(null);

  // lê userPayload do localStorage para checar papel (role)
  useEffect(() => {
    try {
      const raw = localStorage.getItem("userPayload");
      if (raw) setUser(JSON.parse(raw));
    } catch (e) {
      console.error("Erro ao ler userPayload", e);
    }
  }, []);

  // Extrai roles explicitamente e usa como fonte de verdade
  const roles = user ? extractRoles(user) : [];
  // debug: roles atuais para inspeção rápida
  React.useEffect(() => {
    if (user) console.debug("[NavBar] user roles:", roles);
  }, [user]);

  const canSeeSettings = roles.includes("ADMIN") || roles.includes("ETL");

  const displayEmail = user?.UserDetails?.email || user?.email || user?.sub || "user@domain.com";

  // fecha dropdown ao clicar fora
  useEffect(() => {
    function handleClick(e) {
      const nav = document.querySelector("nav.navbar-neohorizon");
      if (nav && !nav.contains(e.target)) {
        setOpen(false);
        setOpenSettings(false);
      }
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  // função de logout seguro
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userPayload");
    setOpen(false);
    setOpenSettings(false);
    navigate("/");
  };

  return (
    <>
      <nav className="bg-dark d-flex flex-row justify-content-between position-relative navbar-neohorizon">
        {/* Logo */}
        <div className="px-4 py-2 d-flex align-items-center justify-content-center">
          <img src={logoWhite} alt="Logo" width="65" className="d-inline-block align-text-top" />
        </div>

        {/* Usuário */}
        <div
          className="d-flex align-items-center flex-row p-4 gap-4 border-start border-left-dark"
          style={{ cursor: "pointer" }}
          onClick={() => setOpen((v) => !v)}
        >
          <div className="d-flex align-items-center justify-content-center">
            <p className="m-0 text-white">
              <span>{displayEmail}</span>
            </p>
          </div>
          <div className="d-flex align-items-center justify-content-center">
            <img src={userWhite} width="50" alt="User" />
          </div>
        </div>

        {/* Dropdown principal */}
        {open && (
          <div
            className="position-absolute bg-white shadow rounded"
            style={{ right: "1rem", top: "110%", minWidth: "240px", zIndex: 1050 }}
          >
            <ul className="list-unstyled m-0">
              {canSeeSettings && (
                <li
                  className="p-2 text-dark d-flex justify-content-between align-items-center"
                  style={{ cursor: "pointer" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f1f1f1")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  onClick={() => setOpenSettings((v) => !v)}
                >
                  <span>⚙️ Configurações</span>
                  <span className="ms-2">{openSettings ? "▴" : "▾"}</span>
                </li>
              )}

              {/* Submenu Configurações */}
              {canSeeSettings && openSettings && (
                <li className="pb-2">
                  <ul className="list-unstyled m-0 ps-3">
                    <li
                      className="p-2 text-dark d-flex align-items-center gap-2"
                      style={{ cursor: "pointer" }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f7f7f7")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                      onClick={() => {
                        setShowCustoModal(true);
                        setOpen(false);
                        setOpenSettings(false);
                      }}
                    >
                      <span>• Custo por hora dos devs</span>
                      <Hint 
                        text="Configure o valor do custo por hora de cada desenvolvedor. Este valor é utilizado para calcular os custos totais do projeto."
                        position="right"
                        size="sm"
                      />
                    </li>
                  </ul>
                </li>
              )}

              {/* Logout */}
              <li
                className="p-2 text-dark"
                style={{ cursor: "pointer" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f1f1f1")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                onClick={handleLogout}
              >
                🚪 Sair
              </li>
            </ul>
          </div>
        )}
      </nav>

      {/* Modal de Custo por Hora */}
      <ModalCustoDev
        show={showCustoModal}
        onClose={() => setShowCustoModal(false)}
        onSaveSuccess={() => {
          // futuramente disparar refetch das métricas/dashboards
        }}
      />
    </>
  );
};

export default NavBar;
