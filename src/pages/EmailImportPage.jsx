import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AppHeader from "../components/common/AppHeader";
import LoadingScreen from "../components/common/LoadingScreen";
import BankPasswords from "../components/emailImport/BankPasswords";
import NotificationsNotice from "../components/emailImport/NotificationsNotice";
import { getEmailImport, regenerateEmailImportAddress } from "../api/emailImport";
import { getErrorMessage } from "../api/client";

const formatDateTime = (value) =>
  new Date(value).toLocaleString("es-UY", { dateStyle: "short", timeStyle: "short" });

const formatPeriod = (start, end) => {
  if (!start || !end) return null;
  const fmt = (d) => new Date(`${d}T00:00:00`).toLocaleDateString("es-UY", { day: "numeric", month: "short" });
  return `${fmt(start)} – ${fmt(end)}`;
};

function ImportStatus({ item }) {
  if (item.status === "error") {
    return <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-xs text-red-300">Error</span>;
  }
  if (item.status === "duplicate") {
    return <span className="rounded-full bg-slate-700/60 px-2 py-0.5 text-xs text-slate-300">Ya estaba</span>;
  }
  if (item.status === "processing") {
    return <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-xs text-amber-300">Procesando</span>;
  }
  if (item.statement_status === "confirmed") {
    return <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs text-emerald-300">Confirmado</span>;
  }
  if (item.statement_status === "pending_review") {
    return <span className="rounded-full bg-indigo-500/15 px-2 py-0.5 text-xs text-indigo-300">Para revisar</span>;
  }
  return <span className="rounded-full bg-slate-700/60 px-2 py-0.5 text-xs text-slate-300">Importado</span>;
}

function EmailImportPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  const load = useCallback(async () => {
    try {
      setData(await getEmailImport());
      setError("");
    } catch (err) {
      setError(getErrorMessage(err, "No se pudo cargar la importación por mail."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(data.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const regenerate = async () => {
    if (
      !window.confirm(
        "Vas a tener una dirección nueva y la actual deja de funcionar. Si tenés un filtro de Gmail, vas a tener que cambiarlo. ¿Seguimos?",
      )
    ) {
      return;
    }
    setRegenerating(true);
    try {
      setData(await regenerateEmailImportAddress());
      setError("");
    } catch (err) {
      setError(getErrorMessage(err, "No se pudo cambiar la dirección."));
    } finally {
      setRegenerating(false);
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <AppHeader
        links={[
          { to: "/dashboard", label: "Dashboard" },
          { to: "/reports", label: "Reportes" },
        ]}
        showUpload
        showLogout
      />

      <main className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-8">
        <div>
          <h2 className="text-2xl font-semibold">Importar por mail</h2>
          <p className="mt-1 text-sm text-slate-400">
            Reenviá el mail del banco con el estado de cuenta a tu dirección de Finview y lo vas a
            encontrar listo para revisar. El PDF no se guarda, y el mail se borra apenas se procesa.
          </p>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        {data && !data.enabled && (
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 text-sm text-slate-300">
            La importación por mail todavía no está disponible. Mientras tanto podés{" "}
            <Link to="/upload" className="font-medium text-indigo-400 hover:text-indigo-300">
              subir el PDF
            </Link>
            .
          </div>
        )}

        {data?.enabled && (
          <>
            <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
              <p className="text-sm text-slate-400">Tu dirección de Finview</p>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
                <code className="break-all rounded-md bg-slate-950 px-3 py-2 text-sm text-slate-100">
                  {data.address}
                </code>
                <button
                  type="button"
                  onClick={copyAddress}
                  className="shrink-0 rounded-md bg-indigo-500 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-400"
                >
                  {copied ? "¡Copiada!" : "Copiar"}
                </button>
              </div>
              <p className="mt-3 text-xs text-slate-500">
                Cualquiera que tenga esta dirección puede mandarte estados de cuenta para revisar. Si
                se filtró, cambiala.{" "}
                <button
                  type="button"
                  onClick={regenerate}
                  disabled={regenerating}
                  className="text-indigo-400 hover:text-indigo-300 disabled:opacity-60"
                >
                  {regenerating ? "Cambiando..." : "Cambiar dirección"}
                </button>
              </p>
            </section>

            {data.gmail_confirmation && (
              <section className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-6 text-sm">
                <p className="font-medium text-amber-200">Gmail pidió confirmar el reenvío</p>
                <p className="mt-1 text-slate-300">
                  Ingresá este código en Gmail (Configuración → Reenvío y correo POP/IMAP) o abrí el
                  link de confirmación. Llegó el {formatDateTime(data.gmail_confirmation.received_at)}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  {data.gmail_confirmation.code && (
                    <code className="rounded-md bg-slate-950 px-3 py-2 text-lg tracking-widest text-slate-100">
                      {data.gmail_confirmation.code}
                    </code>
                  )}
                  {data.gmail_confirmation.link && (
                    <a
                      href={data.gmail_confirmation.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-md border border-amber-400/60 px-3 py-2 text-amber-200 hover:bg-amber-500/10"
                    >
                      Abrir link de confirmación
                    </a>
                  )}
                </div>
              </section>
            )}

            <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 text-sm text-slate-300">
              <h3 className="text-base font-medium text-slate-100">Cómo usarla</h3>
              <ol className="mt-3 list-decimal space-y-2 pl-5">
                <li>
                  <span className="text-slate-100">Una vez:</span> reenviá el mail del banco a tu
                  dirección. Lo revisamos cada 10 minutos, así que puede tardar un poco en aparecer abajo.
                </li>
                <li>
                  <span className="text-slate-100">Automático con Gmail:</span> en Configuración →
                  Reenvío y correo POP/IMAP, agregá tu dirección de Finview. Gmail manda un código, que
                  vas a ver en esta página. Después creá un filtro con el remitente del banco (por
                  ejemplo el de Itaú) y elegí &quot;Reenviar a&quot; tu dirección.
                </li>
                <li>
                  Cuando llegue, revisalo y confirmalo como cualquier estado de cuenta que subís.
                </li>
              </ol>
            </section>

            <BankPasswords />

            <section>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-base font-medium">Últimos mails recibidos</h3>
                <button type="button" onClick={load} className="text-xs text-slate-400 hover:text-white">
                  Actualizar
                </button>
              </div>
              {data.imports.length === 0 ? (
                <p className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 text-sm text-slate-400">
                  Todavía no llegó ningún estado de cuenta.
                </p>
              ) : (
                <ul className="divide-y divide-slate-800 rounded-xl border border-slate-800 bg-slate-900/60">
                  {data.imports.map((item) => (
                    <li key={item.id} className="flex flex-col gap-1 p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <ImportStatus item={item} />
                          <span className="truncate font-medium text-slate-100">
                            {item.bank_name || item.filename || item.subject || "Mail sin asunto"}
                          </span>
                          {formatPeriod(item.period_start, item.period_end) && (
                            <span className="text-xs text-slate-400">
                              {formatPeriod(item.period_start, item.period_end)}
                            </span>
                          )}
                        </div>
                        <p className="mt-1 truncate text-xs text-slate-500">
                          {formatDateTime(item.created_at)}
                          {item.sender ? ` · ${item.sender}` : ""}
                        </p>
                        {item.status === "error" && item.error_message && (
                          <p className="mt-1 text-xs text-red-300">{item.error_message}</p>
                        )}
                      </div>
                      {item.status === "done" && item.statement_status === "pending_review" && (
                        <Link
                          to={`/review/${item.statement_id}`}
                          className="shrink-0 rounded-md bg-indigo-500 px-3 py-1.5 text-center text-xs font-medium text-white hover:bg-indigo-400"
                        >
                          Revisar
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <NotificationsNotice enabled={data.notifications !== false} onChange={setData} />
          </>
        )}
      </main>
    </div>
  );
}

export default EmailImportPage;
