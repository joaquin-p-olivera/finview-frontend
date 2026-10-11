import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getByBank, getCategoryTrends } from "../api/stats";
import AppHeader from "../components/common/AppHeader";
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
const UNCATEGORIZED = "Sin categoría";
const UNCATEGORIZED_COLOR = "#64748b";

const MONTHS_ES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const RANGES = [3, 6, 12];

const monthLabel = (key) => {
  const [year, month] = key.split("-");
  return `${MONTHS_ES[Number(month) - 1]} ${year.slice(2)}`;
};

const formatMoney = (value, currency) =>
  new Intl.NumberFormat("es-UY", { style: "currency", currency, maximumFractionDigits: 0 }).format(value);

const formatAxis = (value) => (Math.abs(value) >= 1000 ? `${(value / 1000).toFixed(0)}k` : `${value}`);

function Segmented({ options, value, onChange, label }) {
  return (
    <div role="group" aria-label={label} className="flex gap-1 rounded-lg border border-slate-800 p-1 text-xs">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={`rounded px-3 py-1 ${
            value === option ? "bg-indigo-500 text-white" : "text-slate-400 hover:text-white"
          }`}
        >
          {typeof option === "number" ? `${option} meses` : option}
        </button>
      ))}
    </div>
  );
}

function EvolutionPage() {
  // Pesos and dollars are never summed together, like the dashboard
  const [currency, setCurrency] = useState("UYU");
  const [months, setMonths] = useState(6);
  const [bank, setBank] = useState("");
  const [banks, setBanks] = useState([]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getByBank("all")
      .then((list) => setBanks(list.map((b) => b.bank)))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setError("");
    getCategoryTrends(months, currency, bank)
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err) => {
        console.error(err);
        if (!cancelled) setError("No se pudo cargar la evolución.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [months, currency, bank]);

  const categories = data?.categories ?? [];
  // each category keeps its color in the chart, the legend and the table
  const colorOf = useMemo(() => {
    const colors = {};
    categories
      .filter((c) => c.category !== UNCATEGORIZED)
      .forEach((c, index) => {
        colors[c.category] = COLORS[index % COLORS.length];
      });
    colors[UNCATEGORIZED] = UNCATEGORIZED_COLOR;
    return colors;
  }, [categories]);

  const chartData = useMemo(
    () =>
      (data?.months ?? []).map((key, index) => {
        const row = { month: monthLabel(key) };
        categories.forEach((c) => {
          row[c.category] = c.totals[index];
        });
        return row;
      }),
    [data, categories]
  );

  if (loading) {
    return <LoadingScreen />;
  }

  const hasData = categories.length > 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <AppHeader
        links={[
          { to: "/dashboard", label: "Dashboard" },
          { to: "/transactions", label: "Transacciones" },
          { to: "/reports", label: "Reportes" },
        ]}
        showUpload
      />

      <main className="px-6 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-2xl font-semibold">Evolución</h2>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={bank}
              onChange={(e) => setBank(e.target.value)}
              aria-label="Banco"
              className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-xs"
            >
              <option value="">Todos los bancos</option>
              {banks.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
            <Segmented label="Período" options={RANGES} value={months} onChange={setMonths} />
            <Segmented label="Moneda" options={["UYU", "USD"]} value={currency} onChange={setCurrency} />
          </div>
        </div>

        <p className="mb-6 text-sm text-slate-400">
          Cuánto gastaste en cada categoría, mes a mes{bank ? ` con ${bank}` : ""}.
        </p>

        {error && <p className="mb-4 text-sm text-red-400">{error}</p>}

        {!hasData && !error && (
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-8 text-center text-sm text-slate-400">
            No hay gastos en {currency}
            {bank ? ` con ${bank}` : ""} para mostrar.{" "}
            <Link to="/upload" className="text-indigo-400 hover:text-indigo-300">
              Subí un estado de cuenta
            </Link>{" "}
            o probá con otra moneda.
          </div>
        )}

        {hasData && (
          <>
            <section className="mb-6 rounded-xl border border-slate-800 bg-slate-900/60 p-6">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={formatAxis} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155" }}
                      formatter={(value, name) => [formatMoney(value, currency), name]}
                      itemSorter={(item) => -item.value}
                    />
                    <Legend wrapperStyle={{ fontSize: "12px" }} />
                    {[...categories].reverse().map((c) => (
                      <Bar key={c.category} dataKey={c.category} stackId="spend" fill={colorOf[c.category]} />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60 p-6">
              <table className="w-full min-w-max text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-left text-slate-400">
                    <th className="py-2 pr-4 font-normal">Categoría</th>
                    {data.months.map((key) => (
                      <th key={key} className="px-3 py-2 text-right font-normal">
                        {monthLabel(key)}
                      </th>
                    ))}
                    <th className="py-2 pl-4 text-right font-normal">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((c) => (
                    <tr key={c.category} className="border-b border-slate-800/60">
                      <td className="py-2 pr-4">
                        <span
                          className="mr-2 inline-block h-2.5 w-2.5 rounded-sm"
                          style={{ backgroundColor: colorOf[c.category] }}
                        />
                        {c.category}
                      </td>
                      {c.totals.map((value, index) => (
                        <td
                          key={data.months[index]}
                          className={`px-3 py-2 text-right tabular-nums ${value ? "" : "text-slate-600"}`}
                        >
                          {value ? formatMoney(value, currency) : "—"}
                        </td>
                      ))}
                      <td className="py-2 pl-4 text-right font-medium tabular-nums">
                        {formatMoney(c.total, currency)}
                      </td>
                    </tr>
                  ))}
                  <tr className="font-semibold">
                    <td className="py-2 pr-4">Total</td>
                    {data.totals.map((value, index) => (
                      <td key={data.months[index]} className="px-3 py-2 text-right tabular-nums">
                        {formatMoney(value, currency)}
                      </td>
                    ))}
                    <td className="py-2 pl-4 text-right tabular-nums">
                      {formatMoney(
                        data.totals.reduce((sum, value) => sum + value, 0),
                        currency
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default EvolutionPage;
