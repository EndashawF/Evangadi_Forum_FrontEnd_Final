/**
 * Header component for Evangadi Forum
 * Production Summary: Displays navigation bar with logo, welcome message, and dynamic login/logout links.
 */
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../../utils/auth";
import logoB from "../../images/logoBlack.png";

const Header = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/auth?tab=login");
    setMenuOpen(false);
  };

  const toggleMenu = () => {
    if (window.innerWidth <= 768) {
      setMenuOpen(!menuOpen);
    }
  };

  // Reset menuOpen state when screen size changes to wide screen
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Call on mount to set initial state

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <nav className="header">
      <div className="header-container">
        <Link className="header-logo" to="/">
          <img src={logoB} alt="logo" />
        </Link>
        <button className="hamburger" onClick={toggleMenu}>
          ☰
        </button>
        <ul className={`header-nav nav-menu ${menuOpen ? "active" : ""}`}>
          {!isAuthenticated ? (
            <>
              <li>
                <Link className="header-nav-link" to="/" onClick={toggleMenu}>
                  Home
                </Link>
              </li>
              <li>
                <Link
                  className="header-nav-link"
                  to="/about"
                  onClick={toggleMenu}
                >
                  How it Works
                </Link>
              </li>
              <li>
                <Link
                  className="header-nav-link header-signin"
                  to="/auth?tab=login"
                  onClick={toggleMenu}
                >
                  SIGN IN
                </Link>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link className="header-nav-link" to="/" onClick={toggleMenu}>
                  Home
                </Link>
              </li>
              <li>
                <Link
                  className="header-nav-link"
                  to="/about"
                  onClick={toggleMenu}
                >
                  How it Works
                </Link>
              </li>
              <li>
                <button
                  className="header-nav-link header-logout"
                  onClick={() => {
                    handleLogout();
                    toggleMenu();
                  }}
                >
                  LogOut
                </button>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Header;
