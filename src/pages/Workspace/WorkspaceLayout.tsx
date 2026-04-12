import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { WS_AUTH_KEY } from "./WorkspaceGuard";
import "./WorkspaceLayout.css";

const NAV_ITEMS = [
  { to: "/workspace/home", label: "Home" },
  { to: "/workspace/semana", label: "Semana" },
  { to: "/workspace/planos", label: "Planos" },
  { to: "/workspace/benchmarks", label: "Benchmarks" },
  { to: "/workspace/historico", label: "Histórico" },
];

export default function WorkspaceLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  function handleLogout() {
    sessionStorage.removeItem(WS_AUTH_KEY);
    navigate("/workspace/login", { replace: true });
  }

  return (
    <div className="wsLayout">
      <aside className={`wsSidebar${menuOpen ? " wsSidebarOpen" : ""}`}>
        <div className="wsSidebarHeader">
          <span className="wsSidebarLogo">LV</span>
          <button
            className="wsSidebarClose"
            onClick={() => setMenuOpen(false)}
            aria-label="Fechar menu"
          >
            ✕
          </button>
        </div>
        <nav className="wsSidebarNav">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `wsSidebarLink${isActive ? " wsSidebarLink--active" : ""}`
              }
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <button className="wsSidebarLogout" onClick={handleLogout}>
          Sair
        </button>
      </aside>

      {menuOpen && (
        <button
          className="wsOverlay"
          onClick={() => setMenuOpen(false)}
          aria-label="Fechar menu"
        />
      )}

      <div className="wsMain">
        <header className="wsTopbar">
          <button
            className="wsMenuBtn"
            onClick={() => setMenuOpen(true)}
            aria-label="Abrir menu"
          >
            <span />
            <span />
            <span />
          </button>
          <span className="wsTopbarLogo">LV</span>
          <button className="wsTopbarLogout" onClick={handleLogout}>
            Sair
          </button>
        </header>

        <main className="wsContent">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
