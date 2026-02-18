import { useEffect, useRef, useState } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { useColorScheme } from "../contexts/ColorSchemeContext";
import CustomCursor from "./CustomCursor";
import "./Layout.css";

const SCROLL_THRESHOLD = 40;
const TOP_THRESHOLD = 24;

export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(true);
  const lastScrollY = useRef(0);
  const { cyclePalette } = useColorScheme();

  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      if (y <= TOP_THRESHOLD) {
        setHeaderVisible(true);
      } else if (y > lastScrollY.current && y > SCROLL_THRESHOLD) {
        setHeaderVisible(false);
      } else if (y < lastScrollY.current) {
        setHeaderVisible(true);
      }
      lastScrollY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
      <CustomCursor />
      <header className={`header ${headerVisible || menuOpen ? "" : "header--hidden"}`}>
        <div className="headerInner">
          <NavLink to="/" className="logoLink" aria-label="Home" onClick={cyclePalette}>
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

      <div className="headerSpacer" aria-hidden />

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
