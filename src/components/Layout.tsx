import { useState } from "react";
import { Outlet, NavLink } from "react-router-dom";
import "./Layout.css";

export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  const navLinks = (
    <>
      <NavLink to="/" end onClick={closeMenu}>Home</NavLink>
      <a href="/#work" onClick={closeMenu}>Work</a>
      <a href="https://www.linkedin.com/in/vitor-lv-4536a06b/" target="_blank" rel="noreferrer" onClick={closeMenu}>Linkedin</a>
      <a href="https://www.instagram.com/vitor.lvv/" target="_blank" rel="noreferrer" onClick={closeMenu}>Instagram</a>
      <NavLink to="/contact" onClick={closeMenu}>Contact</NavLink>
    </>
  );

  return (
    <div className="page">
      <header className="header">
        <div className="headerInner">
          <NavLink to="/" className="logoLink" aria-label="Home">
            <img src="/logo-header.png" alt="Vitor LV" className="logoImg" />
          </NavLink>

          <nav className="nav navSerif" aria-label="Main">
            {navLinks}
          </nav>

          <button
            type="button"
            className="menuToggle"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            <span className="menuToggleBar" />
            <span className="menuToggleBar" />
            <span className="menuToggleBar" />
          </button>
        </div>

        <nav className={`navMobile ${menuOpen ? "navMobileOpen" : ""}`} aria-label="Main navigation">
          <ul className="navMobileList">
            <li><NavLink to="/" end onClick={closeMenu}>Home</NavLink></li>
            <li><a href="/#work" onClick={closeMenu}>Work</a></li>
            <li><a href="https://linkedin.com" target="_blank" rel="noreferrer" onClick={closeMenu}>Linkedin</a></li>
            <li><a href="https://instagram.com" target="_blank" rel="noreferrer" onClick={closeMenu}>Instagram</a></li>
            <li><NavLink to="/contact" onClick={closeMenu}>Contact</NavLink></li>
          </ul>
        </nav>
      </header>

      {menuOpen && (
        <button
          type="button"
          className="menuBackdrop"
          onClick={closeMenu}
          aria-label="Close menu"
        />
      )}

      <main className="main">
        <div className="mainInner">
          <Outlet />
          <footer className="footer">
            <p>© {new Date().getFullYear()} vitorlv. Designed with care.</p>
          </footer>
        </div>
      </main>
    </div>
  );
}
