import { Link } from "react-router-dom";
import Logo from "../components/common/Logo";
import FinviewTour, { GroceriesDrawing, Icon, StatementsDrawing } from "../components/help/FinviewTour";

// Home page for visitors who aren't logged in: what Finview is, the same
// short tour as the Help page, and the way in.
const HIGHLIGHTS = [
  { icon: "sparkles", tone: "pink", text: "La IA lee tus estados de cuenta" },
  { icon: "chart", tone: "emerald", text: "Pesos y dólares, cada uno por su lado" },
  { icon: "offline", tone: "sky", text: "El carrito anda sin señal" },
];

function CallToAction() {
  return (
    <div className="flex flex-col justify-center gap-3 sm:flex-row">
      <Link
        to="/register"
        className="inline-flex h-11 items-center justify-center rounded-lg bg-indigo-500 px-5 text-sm font-medium text-white shadow-xs hover:bg-indigo-400"
      >
        Crear cuenta
      </Link>
      <Link
        to="/login"
        className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-700 px-5 text-sm text-slate-200 hover:bg-slate-800"
      >
        Ya tengo cuenta
      </Link>
    </div>
  );
}

function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <header className="flex items-center justify-between gap-3 border-b border-slate-800 px-4 py-3 md:px-6 md:py-4">
        <Logo />
        <Link
          to="/login"
          className="rounded-md border border-slate-700 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-800"
        >
          Iniciar sesión
        </Link>
      </header>

      <main className="mx-auto max-w-3xl space-y-5 px-4 py-10 md:px-6 md:py-14">
        <section className="pb-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            Tu plata, <span className="text-indigo-400">bajo la lupa</span>
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-slate-400 md:text-lg">
            Subí el estado de cuenta de la tarjeta, anotá lo que comprás en el súper y Finview te
            muestra en qué se va la plata.
          </p>

          <div className="mt-8 flex items-center justify-center gap-3">
            <StatementsDrawing className="h-20 w-auto -rotate-3 sm:h-28" />
            <GroceriesDrawing className="h-20 w-auto rotate-3 sm:h-28" />
          </div>

          <div className="mt-8">
            <CallToAction />
          </div>

          <ul className="mx-auto mt-8 grid max-w-2xl gap-3 text-left sm:grid-cols-3">
            {HIGHLIGHTS.map((h) => (
              <li key={h.text} className="flex items-center gap-3 text-sm text-slate-300">
                <Icon name={h.icon} tone={h.tone} />
                {h.text}
              </li>
            ))}
          </ul>
        </section>

        <h2 className="pt-4 text-center text-sm font-medium uppercase tracking-wide text-slate-500">
          Cómo funciona
        </h2>

        <FinviewTour linked={false} drawings={false} />

        <section className="rounded-2xl border border-indigo-500/30 bg-indigo-500/10 p-6 text-center md:p-8">
          <h2 className="text-xl font-semibold">¿Arrancamos?</h2>
          <p className="mt-1 mb-5 text-sm text-slate-400">Creás la cuenta en un minuto.</p>
          <CallToAction />
        </section>
      </main>
    </div>
  );
}

export default LandingPage;
