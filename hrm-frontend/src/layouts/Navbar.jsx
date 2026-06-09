import { useState } from "react";
import logoImg from "../assets/logo.png";
import { NavLink, Link } from "react-router-dom";
import { Globe, X, Menu } from "lucide-react";
import { useWebsiteSettings } from "../hook/useWebsiteSettings";

const Navbar = () => {
  const { data: s } = useWebsiteSettings("header");
  const appName = s?.appName || "Levroxen Software Innovations";
  const [menuOpen, setMenuOpen] = useState(false);

  const menuItems = [
    { name: "Home", path: "/" },
    { name: "About Us", path: "/#about" },
    { name: "Services", path: "/#services" },
    { name: "Industries", path: "/#industries" },
    { name: "Contact", path: "/contact" },
  ];

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');
        
        .shn-navbar {
          height: 72px;
          background: #090e1a;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          font-family: 'DM Sans', sans-serif;
        }

        .shn-navbar .shn-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 24px;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .shn-brand {
          display: flex;
          align-items: center;
          text-decoration: none;
          flex-shrink: 0;
        }

        .shn-brand img {
          height: 32px;
          width: auto;
          object-fit: contain;
        }

        .shn-nav-links {
          display: flex;
          align-items: center;
          gap: 8px;
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .shn-nav-link {
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.75);
          text-decoration: none;
          transition: color 0.15s, background-color 0.15s;
          white-space: nowrap;
        }

        .shn-nav-link:hover {
          color: #ffffff;
        }

        .shn-nav-link.active {
          color: #ffffff;
        }

        .shn-actions {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
        }

        .shn-btn-login {
          padding: 9px 18px;
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 30px;
          background: transparent;
          color: #fff;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          text-decoration: none;
          transition: background 0.15s, border-color 0.15s;
          font-family: 'DM Sans', sans-serif;
          white-space: nowrap;
        }

        .shn-btn-login:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.25);
        }

        .shn-btn-connect {
          padding: 9px 20px;
          border: none;
          border-radius: 30px;
          background: #0F62FE;
          color: #fff;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          text-decoration: none;
          transition: background 0.15s, transform 0.12s;
          font-family: 'DM Sans', sans-serif;
          white-space: nowrap;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .shn-btn-connect:hover {
          background: #0052ec;
        }

        .shn-btn-connect:active {
          transform: scale(0.98);
        }

        .shn-toggler {
          display: none;
          flex-direction: column;
          justify-content: center;
          gap: 5px;
          background: none;
          border: 1.5px solid rgba(255, 255, 255, 0.15);
          border-radius: 9px;
          padding: 8px 9px;
          cursor: pointer;
          width: 40px;
          height: 40px;
          flex-shrink: 0;
        }

        .shn-toggler-bar {
          display: block;
          width: 18px;
          height: 2px;
          background: #fff;
          border-radius: 2px;
          transition: transform 0.22s ease, opacity 0.22s ease;
        }

        .shn-toggler.is-open .shn-toggler-bar:nth-child(1) {
          transform: rotate(45deg) translate(5px, 5px);
        }
        .shn-toggler.is-open .shn-toggler-bar:nth-child(2) {
          opacity: 0;
        }
        .shn-toggler.is-open .shn-toggler-bar:nth-child(3) {
          transform: rotate(-45deg) translate(5px, -5px);
        }

        .shn-mobile-menu {
          position: fixed;
          top: 72px;
          left: 0;
          right: 0;
          background: #090e1a;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          z-index: 999;
          overflow: hidden;
          max-height: 0;
          transition: max-height 0.3s ease, opacity 0.3s ease;
          opacity: 0;
          pointer-events: none;
        }

        .shn-mobile-menu.open {
          max-height: 500px;
          opacity: 1;
          pointer-events: auto;
        }

        .shn-mobile-menu-inner {
          padding: 12px 20px 20px;
        }

        .shn-mobile-links {
          list-style: none;
          margin: 0 0 12px;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .shn-mobile-links .shn-nav-link {
          display: block;
          padding: 10px 14px;
          font-size: 0.95rem;
          border-radius: 10px;
        }

        .shn-mobile-divider {
          border: none;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          margin: 0 0 12px;
        }

        .shn-mobile-actions {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .shn-mobile-actions .shn-btn-login,
        .shn-mobile-actions .shn-btn-connect {
          text-align: center;
          padding: 10px 16px;
          font-size: 0.9rem;
          display: block;
        }
        .shn-overlay {
          position: fixed;
          inset: 0;
          top: 72px;
          background: rgba(0, 0, 0, 0.5);
          z-index: 998;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s ease;
        }

        .shn-overlay.open {
          opacity: 1;
          pointer-events: auto;
        }

        @media (max-width: 768px) {
          .shn-toggler { display: flex; }
          .shn-desktop-only { display: none !important; }
        }
      `}</style>

      <nav className="shn-navbar" role="navigation" aria-label="Main navigation">
        <div className="shn-inner">
          <Link to="/" className="shn-brand" onClick={closeMenu}>
            <img src={logoImg} alt={appName} />
          </Link>
          
          <ul className="shn-nav-links shn-desktop-only" role="list">
            {menuItems.map((item) => (
              <li key={item.name}>
                {item.path.startsWith("/#") ? (
                  <a
                    href={item.path}
                    className="shn-nav-link"
                    onClick={(e) => {
                      closeMenu();
                      const element = document.getElementById(item.path.substring(2));
                      if (element) {
                        e.preventDefault();
                        element.scrollIntoView({ behavior: "smooth" });
                      }
                    }}
                  >
                    {item.name}
                  </a>
                ) : (
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      "shn-nav-link" + (isActive ? " active" : "")
                    }
                  >
                    {item.name}
                  </NavLink>
                )}
              </li>
            ))}
          </ul>

          <div className="shn-actions shn-desktop-only">
            <Link to="/login" className="shn-btn-login">Login</Link>
            <Link to="/contact" className="shn-btn-connect">
              Let's Connect <span style={{ marginLeft: "4px" }}>→</span>
            </Link>
          </div>

          <button
            className={`shn-toggler${menuOpen ? " is-open" : ""}`}
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="shn-mobile-menu"
          >
            <span className="shn-toggler-bar" />
            <span className="shn-toggler-bar" />
            <span className="shn-toggler-bar" />
          </button>
        </div>
      </nav>
      <div
        className={`shn-overlay${menuOpen ? " open" : ""}`}
        onClick={closeMenu}
        aria-hidden="true"
      />
      <div
        id="shn-mobile-menu"
        className={`shn-mobile-menu${menuOpen ? " open" : ""}`}
        role="dialog"
        aria-label="Mobile navigation"
      >
        <div className="shn-mobile-menu-inner">
          <ul className="shn-mobile-links" role="list">
            {menuItems.map((item) => (
              <li key={item.name}>
                {item.path.startsWith("/#") ? (
                  <a
                    href={item.path}
                    className="shn-nav-link"
                    onClick={(e) => {
                      closeMenu();
                      const element = document.getElementById(item.path.substring(2));
                      if (element) {
                        e.preventDefault();
                        element.scrollIntoView({ behavior: "smooth" });
                      }
                    }}
                  >
                    {item.name}
                  </a>
                ) : (
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      "shn-nav-link" + (isActive ? " active" : "")
                    }
                    onClick={closeMenu}
                  >
                    {item.name}
                  </NavLink>
                )}
              </li>
            ))}
          </ul>
          <hr className="shn-mobile-divider" />
          <div className="shn-mobile-actions">
            <Link to="/login" className="shn-btn-login" onClick={closeMenu}>
              Login
            </Link>
            <Link to="/contact" className="shn-btn-connect" onClick={closeMenu}>
              Let's Connect
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;