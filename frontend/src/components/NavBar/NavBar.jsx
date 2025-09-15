import React, { useState } from "react";
import logoWhite from '../../assets/logoWhite.png';
import userWhite from '../../assets/userWhite.png';

const NavBar = () => { 

  const [open, setOpen] = useState(false);

  return (
     <nav className="bg-dark d-flex flex-row justify-content-between position-relative">
      {/* Logo */}
      <div className="px-4 py-2 d-flex align-items-center justify-content-center">
        <img
          src={logoWhite}
          alt="Logo"
          width="65"
          className="d-inline-block align-text-top"
        />
      </div>

      {/* User */}
      <div
        className="d-flex align-items-center flex-row p-4 gap-4 border-start border-left-dark"
        style={{ cursor: "pointer" }}
        onClick={() => setOpen(!open)}
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

      {open && (
        <div
          className="position-absolute bg-white shadow rounded"
          style={{ right: "1rem", top: "110%", minWidth: "200px", zIndex: 10 }}
        >
          <ul className="list-unstyled m-0">
            <li
              className="p-2 text-dark"
              style={{ cursor: "pointer" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#f1f1f1")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              ⚙️ Configurações
            </li>
            <li
              className="p-2 text-dark"
              style={{ cursor: "pointer" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#f1f1f1")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              🚪 Sair
            </li>
          </ul>
        </div>
      )}
    </nav>
  )
}

export default NavBar;