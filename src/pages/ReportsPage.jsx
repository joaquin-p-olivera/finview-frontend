import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { listStatements } from "../api/statements";
import { getStatementReport } from "../api/stats";
import LoadingScreen from "../components/common/LoadingScreen";

const COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#f43f5e",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#14b8a6",
  "#0ea5e9",
  "#3b82f6",
];

const MONTHS_ES = [
  "ene", "feb", "mar", "abr", "may", "jun",
  "jul", "ago", "sep", "oct", "nov", "dic",
];

const formatDate = (iso) => {
  if (!iso) return "?";
  const [y, m, d] = iso.split("-");
  return `${Number(d)} ${MONTHS_ES[Number(m) - 1]} ${y}`;
};

const formatMoney = (value, currency) =>
  new Intl.NumberFormat("es-UY", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

const statementLabel = (s) =>
  `${s.bank_name || "Banco"} · ${formatDate(s.period_start)} al ${formatDate(s.period_end)}`;

function CurrencySection({ data }) {
  const { currency, categories, categorized_total, statement_total, other_charges } = data;
  // The pie only has room for positive spend; refunds still count in the table
  const pieData = categories.filter((c) => c.total > 0);
  const total = statement_total ?? categorized_total;

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-lg font-medium">{currency}</h3>
        <p className="text-sm text-slate-400">
          {statement_total != null ? "Total del estado de cuenta" : "Total categorizado"}:{" "}
          <span className="text-xl font-semibold text-slate-50">{formatMoney(total, currency)}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieData} dataKey="total" nameKey="category" cx="50%" cy="45%" outerRadius={80} stroke="none">
                {pieData.map((entry, index) => (
                  <Cell key={entry.category} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155" }}
                formatter={(value) => [formatMoney(value, currency), "Total"]}
              />
              <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: "12px" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <table className="w-full self-start text-sm">
          <thead>
            <tr className="border-b border-slate-800 text-left text-slate-400">
              <th className="py-2 font-normal">Categoría</th>
              <th className="py-2 text-right font-normal">Monto</th>
              <th className="py-2 pl-3 text-right font-normal">%</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.category} className="border-b border-slate-800/60">
                <td className="py-2">{c.category}</td>
                <td className="py-2 text-right tabular-nums">{formatMoney(c.total, currency)}</td>
                <td className="py-2 pl-3 text-right tabular-nums text-slate-400">
                  {total ? ((c.total / total) * 100).toFixed(1) : "0.0"}
                </td>
              </tr>
            ))}
            {other_charges ? (
              <tr className="border-b border-slate-800/60 text-slate-300">
                <td className="py-2">Otros cargos (seguro, intereses, comisiones)</td>
                <td className="py-2 text-right tabular-nums">{formatMoney(other_charges, currency)}</td>
                <td className="py-2 pl-3 text-right tabular-nums text-slate-400">
                  {total ? ((other_charges / total) * 100).toFixed(1) : "0.0"}
                </td>
              </tr>
            ) : null}
            <tr className="font-semibold">
              <td className="py-2">Total</td>
              <td className="py-2 text-right tabular-nums">{formatMoney(total, currency)}</td>
              <td />
            </tr>
          </tbody>
        </table>
      </div>

      {statement_total == null && (
        <p className="mt-4 text-xs text-slate-500">
          Este estado de cuenta no tiene el total oficial del banco, así que no se pueden calcular
          los otros cargos (seguro, intereses, comisiones).
        </p>
      )}
    </section>
  );
}

function ReportsPage() {
  const [statements, setStatements] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingReport, setLoadingReport] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const all = await listStatements();
        const confirmed = all
          .filter((s) => s.status === "confirmed")
          .sort((a, b) => (b.period_end || "").localeCompare(a.period_end || ""));
        setStatements(confirmed);
        if (confirmed.length) setSelectedId(confirmed[0].id);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar los estados de cuenta.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    const load = async () => {
      setLoadingReport(true);
      setError(null);
      try {
        setReport(await getStatementReport(selectedId));
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar el reporte.");
      } finally {
        setLoadingReport(false);
      }
    };
    load();
  }, [selectedId]);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <header className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
        <Link to="/" className="text-lg font-semibold hover:text-indigo-400">Finview</Link>
        <Link to="/dashboard" className="text-sm text-slate-400 hover:text-white">
          Dashboard
        </Link>
      </header>

      <main className="px-6 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-2xl font-semibold">Reportes</h2>
          {statements.length > 0 && (
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
            >
              {statements.map((s) => (
                <option key={s.id} value={s.id}>
                  {statementLabel(s)}
                </option>
              ))}
            </select>
          )}
        </div>

        {error && <p className="mb-4 text-sm text-red-400">{error}</p>}

        {statements.length === 0 && !error && (
          <p className="text-slate-400">
            Todavía no hay estados de cuenta confirmados.{" "}
            <Link to="/upload" className="text-indigo-400 underline hover:text-indigo-300">
              Subir uno
            </Link>
          </p>
        )}

        {loadingReport && <p className="text-slate-400">Cargando reporte…</p>}

        {!loadingReport && report && (
          <>
            <p className="mb-6 text-sm text-slate-400">
              <span className="text-slate-200">{report.statement.bank_name}</span>
              {report.statement.card_last4 && ` · tarjeta ${report.statement.card_last4}`} · Período{" "}
              {formatDate(report.statement.period_start)} al {formatDate(report.statement.period_end)}
            </p>
            {report.currencies.length === 0 ? (
              <p className="text-slate-400">Este estado de cuenta no tiene transacciones.</p>
            ) : (
              <div className="grid grid-cols-1 gap-8">
                {report.currencies.map((c) => (
                  <CurrencySection key={c.currency} data={c} />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default ReportsPage;
