import { useEffect, useState } from "react";
import { setEmailImportNotifications } from "../../api/emailImport";

const NOTICE = {
  on: {
    text: "Te enviaremos un mail cuando nos llegue el PDF. Si no deseas ser notificado puedes desactivarlo ",
    done: { title: "Avisos activados", message: "Listo, te enviaremos un mail cuando nos llegue el PDF." },
  },
  off: {
    text: "No te enviaremos un mail cuando nos llegue el PDF. Si deseas ser notificado, puedes activar las notificaciones ",
    done: { title: "Avisos desactivados", message: "Listo, ya no te enviaremos un mail cuando nos llegue el PDF." },
  },
};

const errorDetail = (err) => {
  const detail = err?.response?.data?.detail;
  if (typeof detail === "string") return detail;
  return err?.response ? null : "No hay conexión con el servidor.";
};

// Closing text of the import page: says whether the notice email is on and lets
// the user flip it. The backend answer decides what the result modal says.
function NotificationsNotice({ enabled, onChange }) {
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!result) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") setResult(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [result]);

  const toggle = async () => {
    setSaving(true);
    try {
      const data = await setEmailImportNotifications(!enabled);
      onChange(data);
      setResult({ ok: true, ...NOTICE[data.notifications ? "on" : "off"].done });
    } catch (err) {
      setResult({
        ok: false,
        title: "No se pudo cambiar",
        message: "No pudimos guardar tu preferencia de avisos. Probá de nuevo en un rato.",
        detail: errorDetail(err),
      });
    } finally {
      setSaving(false);
    }
  };

  const notice = NOTICE[enabled ? "on" : "off"];

  return (
    <>
      <p className="text-sm text-slate-400">
        {notice.text}
        <button
          type="button"
          onClick={toggle}
          disabled={saving}
          className="text-indigo-400 underline hover:text-indigo-300 disabled:opacity-60"
        >
          {saving ? "Guardando..." : "aquí"}
        </button>
        .
      </p>

      {result && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setResult(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="notifications-result-title"
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm rounded-xl border border-slate-700 bg-slate-900 p-6"
          >
            <button
              type="button"
              onClick={() => setResult(null)}
              aria-label="Cerrar"
              className="absolute right-3 top-2 text-2xl leading-none text-slate-400 hover:text-white"
            >
              ×
            </button>
            <div
              className={`mb-3 flex h-10 w-10 items-center justify-center rounded-full text-xl ${
                result.ok ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"
              }`}
              aria-hidden="true"
            >
              {result.ok ? "✓" : "!"}
            </div>
            <h3 id="notifications-result-title" className="text-lg font-semibold">
              {result.title}
            </h3>
            <p className="mt-2 text-sm text-slate-300">{result.message}</p>
            {result.detail && <p className="mt-1 text-xs text-slate-400">Detalle: {result.detail}</p>}
            <button
              type="button"
              onClick={() => setResult(null)}
              autoFocus
              className="mt-5 w-full rounded-lg border border-slate-700 py-2 text-sm text-slate-300 hover:bg-slate-800"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default NotificationsNotice;
