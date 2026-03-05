import { useEffect, useRef, useState } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { useColorScheme } from "../contexts/ColorSchemeContext";
import CustomCursor from "./CustomCursor";
import "./Layout.css";

const SCROLL_THRESHOLD = 40;
const TOP_THRESHOLD = 24;

const LockIcon = () => (
  <svg className="navLoginIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(true);
  const [loginUnlocked, setLoginUnlocked] = useState(false);
  const loginClickCount = useRef(0);
  const lastScrollY = useRef(0);
  const { cyclePalette } = useColorScheme();

  const closeMenu = () => setMenuOpen(false);

  const handleLoginClick = () => {
    if (loginUnlocked) return;
    loginClickCount.current += 1;
    if (loginClickCount.current >= 3) setLoginUnlocked(true);
  };

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

          <nav className="nav navSerif navCenter" aria-label="Main">
            {navLinks}
          </nav>

          <div className="navLoginWrapper">
            {loginUnlocked ? (
              <NavLink to="/cases-admin" className="navLogin navLoginUnlocked" onClick={closeMenu}>
                <LockIcon />
                <span>Login</span>
              </NavLink>
            ) : (
              <button
                type="button"
                className="navLogin navLoginLocked"
                onClick={handleLoginClick}
                aria-label="Login"
              >
                <LockIcon />
                <span>Login</span>
              </button>
            )}
          </div>

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
            <li><NavLink to="/contact" onClick={closeMenu}>Contact</NavLink></li>
            <li className="navMobileLogin">
              {loginUnlocked ? (
                <NavLink to="/cases-admin" onClick={closeMenu} className="navLoginUnlocked">
                  <LockIcon />
                  <span>Login</span>
                </NavLink>
              ) : (
                <button type="button" className="navLoginLocked" onClick={handleLoginClick} aria-label="Login (click 3 times to unlock)">
                  <LockIcon />
                  <span>Login</span>
                </button>
              )}
            </li>
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
