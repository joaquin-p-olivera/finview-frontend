import { clearLastFailure, flushOutbox } from "../../offline/outbox";
import { useOutbox } from "../../offline/purchaseOffline";

// Tells the user what's still on the phone only and whether the screen is
// showing saved data, so working without signal is never silent.
function SyncBanner({ pending, stale }) {
  const { syncing, lastError, lastFailure } = useOutbox();

  if (lastFailure) {
    return (
      <div className="mb-4 flex items-start justify-between gap-3 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
        <span>{lastFailure}</span>
        <button onClick={clearLastFailure} className="text-xs text-red-200 underline">
          Cerrar
        </button>
      </div>
    );
  }

  if (pending > 0) {
    const what = pending === 1 ? "1 cambio sin enviar" : `${pending} cambios sin enviar`;
    return (
      <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
        <span>
          {what}. {syncing ? "Enviando..." : lastError || "Se envían solos cuando haya conexión."}
        </span>
        {!syncing && (
          <button onClick={flushOutbox} className="shrink-0 text-xs text-amber-100 underline">
            Reintentar
          </button>
        )}
      </div>
    );
  }

  if (stale) {
    return (
      <div className="mb-4 rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-400">
        Sin conexión con el servidor: mostrando los datos guardados en el teléfono.
      </div>
    );
  }

  return null;
}

export default SyncBanner;
