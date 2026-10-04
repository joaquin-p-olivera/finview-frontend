import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getPurchaseStats } from "../../api/purchase";

const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f43f5e", "#f97316", "#eab308", "#22c55e", "#14b8a6"];

function PurchaseStatsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [days, setDays] = useState(30);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getPurchaseStats(days);
        setStats(data);
      } catch (err) {
        console.error(err);
        setStats(null);
        setError("No se pudieron cargar las estadísticas. Probá de nuevo más tarde.");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [days]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("es-UY", {
      style: "currency",
      currency: "UYU",
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <header className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
        <Link to="/purchase" className="text-lg font-semibold hover:text-indigo-400">← Volver</Link>
        <Link to="/purchase/analysis" className="text-sm text-indigo-400 hover:text-indigo-300">Análisis por categoría y producto</Link>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-2xl font-semibold">Estadísticas de Compras</h1>
          <div className="flex gap-2">
            {[7, 30, 90, 365].map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`rounded-lg px-3 py-1 text-sm ${
                  days === d ? "bg-indigo-500 text-white" : "bg-slate-800 text-slate-400"
                }`}
              >
                {d} días
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <p className="text-center text-slate-400">Cargando...</p>
        ) : error ? (
          <p className="rounded-xl border border-rose-900 bg-rose-950/40 p-6 text-center text-rose-300">{error}</p>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
                <p className="text-sm text-slate-400">Total gastado</p>
                <p className="mt-1 text-3xl font-bold text-emerald-400">
                  {formatCurrency(stats?.total_spent || 0)}
                </p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
                <p className="text-sm text-slate-400">Carritos completados</p>
                <p className="mt-1 text-3xl font-bold">{stats?.carts_count || 0}</p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
                <p className="text-sm text-slate-400">Promedio por carrito</p>
                <p className="mt-1 text-3xl font-bold">
                  {formatCurrency(stats?.avg_per_cart || 0)}
                </p>
              </div>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              {/* By Month */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
                <h3 className="mb-4 text-lg font-medium">Gastos por mes</h3>
                <div className="h-64">
                  {stats?.by_month?.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.by_month}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                        <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                        <Tooltip
                          contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155" }}
                          formatter={(value) => [formatCurrency(value), "Total"]}
                        />
                        <Bar dataKey="total" fill="#6366f1" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-center text-slate-400">No hay datos</p>
                  )}
                </div>
              </div>

              {/* By Store */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
                <h3 className="mb-4 text-lg font-medium">Gastos por supermercado</h3>
                <div className="h-64">
                  {stats?.by_store?.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.by_store} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis type="number" stroke="#94a3b8" fontSize={12} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                        <YAxis dataKey="store" type="category" stroke="#94a3b8" fontSize={12} width={100} />
                        <Tooltip
                          contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155" }}
                          formatter={(value) => [formatCurrency(value), "Total"]}
                        />
                        <Bar dataKey="total" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-center text-slate-400">No hay datos</p>
                  )}
                </div>
              </div>
            </div>

            {/* Individual Carts */}
            <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900/60 p-6">
              <h3 className="mb-4 text-lg font-medium">Gastos individuales</h3>
              <div className="h-64">
                {stats?.individual_carts?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.individual_carts}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                      <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155" }}
                        formatter={(value, name, props) => [
                          formatCurrency(value),
                          props.payload.store || "Sin nombre"
                        ]}
                      />
                      <Bar dataKey="total" fill="#22c55e" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-slate-400">No hay datos</p>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default PurchaseStatsPage;
