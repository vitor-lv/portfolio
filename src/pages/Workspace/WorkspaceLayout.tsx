import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { clearWsTrusted } from "./WorkspaceGuard";
import { useSpace } from "../../contexts/WorkspaceSpaceContext";
import "./WorkspaceLayout.css";

/* ── Icons ─────────────────────────────────────────── */
const IcoHome = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 7L8 2l6 5v7a1 1 0 01-1 1H3a1 1 0 01-1-1V7z"/>
    <path d="M6 15V9h4v6"/>
  </svg>
);
const IcoPlanos = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="12" height="10" rx="1.5"/>
    <path d="M5 7h6M5 10h4"/>
  </svg>
);
const IcoOKRs = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <circle cx="8" cy="8" r="6"/><circle cx="8" cy="8" r="3"/><circle cx="8" cy="8" r="0.75" fill="currentColor" stroke="none"/>
  </svg>
);
const IcoStakeholders = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="5.5" cy="5" r="2.5"/>
    <path d="M1.5 14c0-2.2 1.8-4 4-4s4 1.8 4 4"/>
    <circle cx="11.5" cy="5.5" r="2"/>
    <path d="M10 14c0-1.7 1.3-3 3-3"/>
  </svg>
);
const IcoSemana = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13.5 8A5.5 5.5 0 102.5 8"/>
    <path d="M13.5 8l-2-2.5M13.5 8l2.5-2"/>
  </svg>
);
const IcoUmaUm = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3.5h12a1 1 0 011 1v5.5a1 1 0 01-1 1H8l-3 2.5V11H2a1 1 0 01-1-1V4.5a1 1 0 011-1z"/>
  </svg>
);
const IcoBenchmarks = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <circle cx="6.5" cy="6.5" r="4.5"/>
    <path d="M11 11l3.5 3.5"/>
  </svg>
);
const IcoArquivo = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="12" height="4" rx="1"/>
    <path d="M3 6v7a1 1 0 001 1h8a1 1 0 001-1V6"/>
    <path d="M6 10h4"/>
  </svg>
);
const IcoDados = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="8" cy="4.5" rx="5" ry="2"/>
    <path d="M3 4.5v3c0 1.1 2.24 2 5 2s5-.9 5-2v-3"/>
    <path d="M3 7.5v3c0 1.1 2.24 2 5 2s5-.9 5-2v-3"/>
  </svg>
);
const IcoLogout = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5.5 2H2.5a1 1 0 00-1 1v8a1 1 0 001 1h3"/>
    <path d="M9.5 4.5L12 7l-2.5 2.5M12 7H6"/>
  </svg>
);

/* ── Nav structure ──────────────────────────────────── */
const NAV_GROUPS = [
  {
    label: null,
    items: [{ to: "/workspace/home", label: "Home", icon: <IcoHome /> }],
  },
  {
    label: "Estratégia",
    items: [
      { to: "/workspace/planos",       label: "Planos",       icon: <IcoPlanos /> },
      { to: "/workspace/okrs",         label: "OKRs",         icon: <IcoOKRs /> },
      { to: "/workspace/stakeholders", label: "Stakeholders", icon: <IcoStakeholders /> },
    ],
  },
  {
    label: "Semana",
    items: [
      { to: "/workspace/semana",     label: "Ritual Semanal", icon: <IcoSemana /> },
      { to: "/workspace/um-a-um",    label: "1:1s",           icon: <IcoUmaUm /> },
      { to: "/workspace/benchmarks", label: "Benchmarks",     icon: <IcoBenchmarks /> },
    ],
  },
  {
    label: "Revisão",
    items: [
      { to: "/workspace/historico", label: "Arquivo",        icon: <IcoArquivo /> },
      { to: "/workspace/dados",     label: "Backup & Dados", icon: <IcoDados /> },
    ],
  },
];

const SCROLL_SHOW_THRESHOLD = 40;
const SCROLL_TOP_THRESHOLD = 24;

/* ── Component ──────────────────────────────────────── */
export default function WorkspaceLayout() {
  const { space, setSpace } = useSpace();
  const [menuOpen, setMenuOpen] = useState(false);
  const [topbarHidden, setTopbarHidden] = useState(true);
  const prevScrollY = useRef(0);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      if (y <= SCROLL_TOP_THRESHOLD) {
        setTopbarHidden(true);
      } else if (y > prevScrollY.current && y > SCROLL_SHOW_THRESHOLD) {
        setTopbarHidden(false);
      } else if (y < prevScrollY.current) {
        setTopbarHidden(true);
      }
      prevScrollY.current = y;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function handleLogout() {
    clearWsTrusted();
    navigate("/workspace/login", { replace: true });
  }

  return (
    <div className="wsLayout">
      {/* Mobile overlay */}
      {menuOpen && (
        <button
          className="wsOverlay"
          onClick={() => setMenuOpen(false)}
          aria-label="Fechar menu"
        />
      )}

      {/* Mobile drawer */}
      <aside className={`wsMobileDrawer${menuOpen ? " wsMobileDrawer--open" : ""}`}>
        <div className="wsSidebarLogo" style={{ paddingBottom: 12 }}>LV</div>

        <div className="wsSpaceSwitcher">
          <button
            className={`wsSpaceBtn${space === "itau" ? " wsSpaceBtn--active" : ""}`}
            onClick={() => setSpace("itau")}
          >Itaú</button>
          <button
            className={`wsSpaceBtn${space === "pessoal" ? " wsSpaceBtn--active" : ""}`}
            onClick={() => setSpace("pessoal")}
          >Pessoal</button>
        </div>

        <nav className="wsSidebarNav">
          {NAV_GROUPS.map((group, gi) => (
            <div key={gi} className={`wsSidebarGroup${gi > 0 ? " wsSidebarGroup--spaced" : ""}`}>
              {group.label && (
                <span className="wsSidebarGroupLabel">{group.label}</span>
              )}
              {group.items.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `wsSidebarLink${isActive ? " wsSidebarLink--active" : ""}`
                  }
                  onClick={() => setMenuOpen(false)}
                >
                  <span className="wsSidebarIcon">{item.icon}</span>
                  <span className="wsSidebarLabel">{item.label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="wsSidebarFooter" style={{ flexDirection: "row", gap: 8 }}>
          <button className="wsSidebarLogout" onClick={handleLogout}>
            <span className="wsSidebarIcon"><IcoLogout /></span>
            <span className="wsSidebarLabel">Sair</span>
          </button>
        </div>
      </aside>

      <div className="wsMain">
        {/* Desktop topbar (scroll-reveal) */}
        <header className={`wsDesktopTopbar${topbarHidden ? " wsDesktopTopbar--hidden" : ""}`}>
          <div className="wsDesktopGreeting">
            <h1>LV Workspace</h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div className="wsSpaceSwitcher">
              <button
                className={`wsSpaceBtn${space === "itau" ? " wsSpaceBtn--active" : ""}`}
                onClick={() => setSpace("itau")}
              >Itaú</button>
              <button
                className={`wsSpaceBtn${space === "pessoal" ? " wsSpaceBtn--active" : ""}`}
                onClick={() => setSpace("pessoal")}
              >Pessoal</button>
            </div>
            <button
              className="wsSidebarLogout"
              style={{ width: "auto" }}
              onClick={handleLogout}
            >
              <span className="wsSidebarIcon"><IcoLogout /></span>
              <span>Sair</span>
            </button>
          </div>
        </header>

        {/* Mobile topbar */}
        <header className="wsTopbar">
          <button
            className="wsMenuBtn"
            onClick={() => setMenuOpen(true)}
            aria-label="Abrir menu"
          >
            <span /><span /><span />
          </button>
          <span className="wsTopbarLogo">LV</span>
          <button className="wsTopbarLogout" onClick={handleLogout}>Sair</button>
        </header>

        <main className="wsContent">
          <div className="wsPageContainer">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
