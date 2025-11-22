import React, { useState } from "react";
import logoWhite from '../../assets/logoWhite.png';
import userWhite from '../../assets/userWhite.png';
import ModalCustoDev from "../Modal/ModalCustoDev.jsx";
import Hint from "../Hint/Hint";

const NavBar = () => {
  const [open, setOpen] = useState(false);                // dropdown principal
  const [openSettings, setOpenSettings] = useState(false); // submenu Configurações
  const [showCustoModal, setShowCustoModal] = useState(false); // modal custo

  // fecha tudo ao clicar fora (opcional, simples)
  React.useEffect(() => {
    function handleClick(e) {
      // se clicar fora do nav, fecha dropdown/submenu
      const nav = document.querySelector("nav.navbar-neohorizon");
      if (nav && !nav.contains(e.target)) {
        setOpen(false);
        setOpenSettings(false);
      }
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

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
              Admin <br />
              <span>Admin@admin.com</span>
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

              {/* Submenu Configurações */}
              {openSettings && (
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

              <li
                className="p-2 text-dark"
                style={{ cursor: "pointer" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f1f1f1")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                onClick={() => {/* coloque aqui a lógica de sair */}}
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
          // aqui futuramente você pode disparar um refetch das métricas/dashboards
          // ex.: queryClient.invalidateQueries(['metrics'])
        }}
      />
    </>
  );
};

export default NavBar;
