import { Link } from "react-router-dom";
import AppHeader from "../components/common/AppHeader";
import Logo from "../components/common/Logo";
import FinviewTour, { PageLink } from "../components/help/FinviewTour";
import { useAuthStore } from "../store/authStore";

// What Finview is and how to use it, kept short. Public, so it can be read
// from the login page too; the links to the pages only work once logged in.

function HelpPage() {
  const isAuthenticated = useAuthStore((s) => !!s.accessToken);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      {isAuthenticated ? (
        <AppHeader
          links={[
            { to: "/dashboard", label: "Dashboard" },
            { to: "/reports", label: "Reportes" },
            { to: "/purchase", label: "Compras" },
          ]}
          showUpload
          showLogout
        />
      ) : (
        <header className="flex items-center justify-between gap-3 border-b border-slate-800 px-4 py-3 md:px-6 md:py-4">
          <Logo />
          <Link
            to="/login"
            className="rounded-md bg-indigo-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-400"
          >
            Iniciar sesión
          </Link>
        </header>
      )}

      <main className="mx-auto max-w-3xl space-y-5 px-4 py-8 md:px-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            Tu plata, <span className="text-indigo-400">bajo la lupa</span>
          </h1>
          <p className="mx-auto mt-2 max-w-md text-slate-400">
            Finview te muestra en qué se va la plata: lo que gastás con la tarjeta y lo que dejás en
            el súper.
          </p>
        </div>

        <FinviewTour />

        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 md:p-6">
          <h2 className="mb-3 font-semibold">Truquitos</h2>
          <ul className="space-y-2 text-sm text-slate-400">
            <li>
              <span className="text-slate-200">¿Escribiste “Coca” y “Coca Cola”?</span> En Productos,
              “Unir con…” los junta en uno.
            </li>
            <li>
              <span className="text-slate-200">¿Productos sin categoría?</span> “Categorizar con IA” y
              listo.
            </li>
            <li>
              <span className="text-slate-200">¿Necesitás los datos en Excel?</span>{" "}
              <PageLink to="/transactions">Transacciones</PageLink> tiene “Exportar CSV”.
            </li>
          </ul>
        </section>
      </main>
    </div>
  );
}

export default HelpPage;
