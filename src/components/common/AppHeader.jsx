import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import Logo from "./Logo";

// Top bar shared by the main pages. On desktop it's the usual row of links;
// on phones the links, user and logout move into a menu so nothing overflows,
// and "Subir estado" stays visible next to the menu button.
function AppHeader({ links = [], showUpload = false, showUser = false, showLogout = false }) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  const username = user ? `${user.username}` : "Sesión iniciada";

  return (
    <header className="relative z-30 border-b border-slate-800 bg-slate-950">
      <div className="flex items-center justify-between gap-3 px-4 py-3 md:px-6 md:py-4">
        <Link to="/" aria-label="Finview, ir al inicio" className="shrink-0 rounded-md hover:opacity-80">
          <Logo />
        </Link>

        <div className="hidden items-center gap-3 text-sm md:flex">
          {links.map((link) => (
            <Link key={link.to} to={link.to} className="text-slate-400 hover:text-white">
              {link.label}
            </Link>
          ))}
          {showUpload && (
            <Link
              to="/upload"
              className="rounded-md bg-indigo-500 px-3 py-1 text-xs font-medium text-white shadow-xs hover:bg-indigo-400"
            >
              Subir estado
            </Link>
          )}
          {showUser && <span className="text-slate-400">{username}</span>}
          {showLogout && (
            <button
              onClick={logout}
              className="rounded-md border border-slate-700 px-3 py-1 text-xs text-slate-300 hover:bg-slate-800"
            >
              Cerrar sesión
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          {showUpload && (
            <Link
              to="/upload"
              className="inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-md bg-indigo-600 px-3 text-[13px] font-medium text-white hover:bg-indigo-500"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 16V4" />
                <path d="m6 10 6-6 6 6" />
                <path d="M4 20h16" />
              </svg>
              Subir estado
            </Link>
          )}
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={menuOpen}
            aria-controls="app-header-menu"
            className={`inline-flex h-11 w-11 items-center justify-center rounded-lg border ${
              menuOpen
                ? "border-slate-600 bg-slate-800 text-white"
                : "border-slate-700 text-slate-300 hover:bg-slate-800"
            }`}
          >
            {menuOpen ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M6 6l12 12" />
                <path d="M18 6 6 18" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M4 6h16" />
                <path d="M4 12h16" />
                <path d="M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {menuOpen && (
        <>
          <div
            className="absolute inset-x-0 top-full h-screen bg-slate-950/70 md:hidden"
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
          />
          <nav
            id="app-header-menu"
            aria-label="Menú principal"
            className="absolute inset-x-0 top-full flex flex-col border-b border-slate-800 bg-slate-900 px-4 pt-2 pb-4 md:hidden"
          >
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className="flex h-12 items-center rounded-lg px-3 text-[15px] text-slate-300 hover:bg-slate-800 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
            <div className="my-2 h-px bg-slate-800" />
            <div className="flex items-center justify-between gap-3 px-3 pt-1">
              <span className="truncate text-sm text-slate-400">{username}</span>
              <button
                onClick={logout}
                className="h-10 shrink-0 rounded-lg border border-slate-700 px-3.5 text-sm text-slate-300 hover:bg-slate-800"
              >
                Cerrar sesión
              </button>
            </div>
          </nav>
        </>
      )}
    </header>
  );
}

export default AppHeader;
