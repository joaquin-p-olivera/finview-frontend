import { Link } from "react-router-dom";
import AppHeader from "../components/common/AppHeader";
import Logo from "../components/common/Logo";
import { useAuthStore } from "../store/authStore";

// What Finview is and how to use it, kept short. Public, so it can be read
// from the login page too; the links to the pages only work once logged in.

// Stroke icons in the same style as the header's.
const ICONS = {
  file: (
    <>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5" />
      <path d="M9 13h6M9 17h4" />
    </>
  ),
  sparkles: (
    <>
      <path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z" />
      <path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z" />
    </>
  ),
  chart: (
    <>
      <path d="M21 12A9 9 0 1 1 12 3v9z" />
      <path d="M15 3.5A9 9 0 0 1 20.5 9H15z" />
    </>
  ),
  cart: (
    <>
      <circle cx="9" cy="20" r="1.5" />
      <circle cx="18" cy="20" r="1.5" />
      <path d="M2 3h3l2.7 12.4a1 1 0 0 0 1 .8h9.6a1 1 0 0 0 1-.8L21 7H6" />
    </>
  ),
  pencil: (
    <>
      <path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16z" />
      <path d="M13.5 6.5l4 4" />
    </>
  ),
  check: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12 3 3 5-6" />
    </>
  ),
  tag: (
    <>
      <path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9z" />
      <circle cx="8" cy="8" r="1.5" />
    </>
  ),
  trend: (
    <>
      <path d="m3 17 6-6 4 4 8-8" />
      <path d="M15 7h6v6" />
    </>
  ),
  store: (
    <>
      <path d="M4 10v10h16V10" />
      <path d="M3 10l2-6h14l2 6z" />
      <path d="M10 20v-5h4v5" />
    </>
  ),
  offline: (
    <>
      <path d="M2 8.8a15 15 0 0 1 4.2-2.6M10.7 5.1A15 15 0 0 1 22 8.8" />
      <path d="M5 12.5a10 10 0 0 1 3.4-2M14.5 10.2a10 10 0 0 1 4.5 2.3" />
      <path d="M8.5 16a5 5 0 0 1 7 0" />
      <path d="M3 3l18 18" />
      <circle cx="12" cy="19.5" r="0.5" />
    </>
  ),
};

const TONES = {
  indigo: "bg-indigo-500/15 text-indigo-300",
  emerald: "bg-emerald-500/15 text-emerald-300",
  amber: "bg-amber-500/15 text-amber-300",
  sky: "bg-sky-500/15 text-sky-300",
  pink: "bg-pink-500/15 text-pink-300",
};

function Icon({ name, tone = "indigo" }) {
  return (
    <span className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${TONES[tone]}`}>
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {ICONS[name]}
      </svg>
    </span>
  );
}

// A little drawing of the dashboard: a pie and rising bars.
function StatementsDrawing() {
  return (
    <svg viewBox="0 0 160 90" className="h-24 w-auto" aria-hidden="true">
      <rect x="1" y="1" width="158" height="88" rx="12" fill="#0f172a" stroke="#1e293b" />
      <circle cx="42" cy="45" r="24" fill="#6366f1" />
      <path d="M42 45V21a24 24 0 0 1 22.8 16.6z" fill="#22c55e" />
      <path d="M42 45l22.8-7.4A24 24 0 0 1 58 63z" fill="#f97316" />
      <rect x="84" y="52" width="12" height="20" rx="3" fill="#334155" />
      <rect x="102" y="42" width="12" height="30" rx="3" fill="#475569" />
      <rect x="120" y="30" width="12" height="42" rx="3" fill="#818cf8" />
      <path d="M84 36l18-8 18 4 18-14" fill="none" stroke="#34d399" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// A little drawing of a cart with a receipt coming out.
function GroceriesDrawing() {
  return (
    <svg viewBox="0 0 160 90" className="h-24 w-auto" aria-hidden="true">
      <rect x="1" y="1" width="158" height="88" rx="12" fill="#0f172a" stroke="#1e293b" />
      <rect x="98" y="14" width="44" height="58" rx="4" fill="#e2e8f0" />
      <path d="M106 26h28M106 36h20M106 46h24M106 56h16" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
      <path d="M126 56h8" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" />
      <path d="M18 24h10l8 32h40l8-24H32" fill="none" stroke="#818cf8" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="40" y="30" width="12" height="14" rx="2" fill="#f97316" />
      <rect x="55" y="26" width="10" height="18" rx="2" fill="#22c55e" />
      <circle cx="68" cy="38" r="6" fill="#facc15" />
      <circle cx="42" cy="66" r="5" fill="#818cf8" />
      <circle cx="70" cy="66" r="5" fill="#818cf8" />
    </svg>
  );
}

function Step({ icon, tone, title, children }) {
  return (
    <li className="flex gap-3">
      <Icon name={icon} tone={tone} />
      <div>
        <p className="font-medium text-slate-100">{title}</p>
        <p className="text-sm text-slate-400">{children}</p>
      </div>
    </li>
  );
}

function Card({ id, title, drawing, children }) {
  return (
    <section id={id} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 md:p-6">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold">{title}</h2>
        {drawing && <div className="hidden shrink-0 sm:block">{drawing}</div>}
      </div>
      {children}
    </section>
  );
}

function PageLink({ to, children }) {
  return (
    <Link to={to} className="font-medium text-indigo-400 hover:text-indigo-300">
      {children}
    </Link>
  );
}

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

        <Card id="tarjeta" title="Los gastos de la tarjeta" drawing={<StatementsDrawing />}>
          <ol className="space-y-4">
            <Step icon="file" tone="indigo" title="Subí el PDF">
              El estado de cuenta del banco, tal cual llega. Botón{" "}
              <PageLink to="/upload">Subir estado</PageLink>.
            </Step>
            <Step icon="sparkles" tone="pink" title="La IA lo lee, vos le das el OK">
              Saca cada gasto y le pone categoría. Corregís lo que quieras y confirmás.
            </Step>
            <Step icon="chart" tone="emerald" title="Mirá a dónde fue todo">
              En el <PageLink to="/dashboard">Dashboard</PageLink> y en{" "}
              <PageLink to="/reports">Reportes</PageLink>: por categoría, mes, banco y comercio. Pesos
              y dólares, cada uno por su lado.
            </Step>
          </ol>
        </Card>

        <Card id="super" title="El súper, anotado" drawing={<GroceriesDrawing />}>
          <ol className="space-y-4">
            <Step icon="cart" tone="indigo" title="Arrancá un carrito">
              En <PageLink to="/purchase">Compras</PageLink>, elegí el súper y dale a Iniciar Carrito.
            </Step>
            <Step icon="pencil" tone="amber" title="Anotá mientras comprás">
              Producto, precio y cantidad. Finview te sugiere lo que ya compraste antes.
            </Step>
            <Step icon="check" tone="emerald" title="Finalizá en la caja">
              El carrito queda guardado en tu historial.
            </Step>
          </ol>

          <p className="mt-6 mb-3 text-sm font-medium text-slate-300">Y con el tiempo, Finview te cuenta…</p>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="flex items-center gap-3 rounded-xl bg-slate-800/50 p-3 sm:block">
              <Icon name="tag" tone="pink" />
              <p className="text-sm text-slate-300 sm:mt-2">
                En qué gastás, con los <PageLink to="/purchase/products">productos</PageLink>{" "}
                categorizados por IA.
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-slate-800/50 p-3 sm:block">
              <Icon name="trend" tone="amber" />
              <p className="text-sm text-slate-300 sm:mt-2">
                Qué subió de precio y tu propia inflación, en{" "}
                <PageLink to="/purchase/analysis">Análisis</PageLink>.
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-slate-800/50 p-3 sm:block">
              <Icon name="store" tone="sky" />
              <p className="text-sm text-slate-300 sm:mt-2">En qué súper te sale más barato cada cosa.</p>
            </div>
          </div>
        </Card>

        <section className="flex gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 md:p-6">
          <Icon name="offline" tone="sky" />
          <div>
            <h2 className="font-semibold">¿Sin señal en el súper? Tranqui.</h2>
            <p className="mt-1 text-sm text-slate-400">
              El carrito y las listas funcionan igual. Lo que anotes queda en el teléfono y se manda
              solo cuando vuelve la conexión. Solo para finalizar el carrito necesitás internet.
            </p>
          </div>
        </section>

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
