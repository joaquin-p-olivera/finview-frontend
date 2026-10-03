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
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";
import {
  getSummary,
  getByMonth,
  getByCategory,
  getByBank,
  getTopMerchants,
  getTrends,
} from "../api/stats";
import LoadingScreen from "../components/common/LoadingScreen";
import AppHeader from "../components/common/AppHeader";

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

function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [byMonth, setByMonth] = useState([]);
  const [byCategory, setByCategory] = useState([]);
  const [categoryPeriod, setCategoryPeriod] = useState("latest");
  const [byBank, setByBank] = useState([]);
  const [bankPeriod, setBankPeriod] = useState("latest");
  const [topMerchants, setTopMerchants] = useState([]);
  const [merchantPeriod, setMerchantPeriod] = useState("latest");
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sum, month, trend] = await Promise.all([
          getSummary(),
          getByMonth(6),
          getTrends(30),
        ]);
        setSummary(sum);
        setByMonth(month.reverse());
        setTrends(trend);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        const cat = await getByCategory(categoryPeriod);
        setByCategory(cat);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategoryData();
  }, [categoryPeriod]);

  useEffect(() => {
    const fetchBankData = async () => {
      try {
        const bank = await getByBank(bankPeriod);
        setByBank(bank);
      } catch (err) {
        console.error(err);
      }
    };
    fetchBankData();
  }, [bankPeriod]);

  useEffect(() => {
    const fetchMerchantData = async () => {
      try {
        const merch = await getTopMerchants(5, merchantPeriod);
        setTopMerchants(merch);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMerchantData();
  }, [merchantPeriod]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("es-UY", {
      style: "currency",
      currency: "UYU",
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Keep "Sin categoría" out of the pie chart (it can dwarf every real
  // category visually) and surface it as a separate callout instead.
  const categorizedData = byCategory.filter((c) => c.category !== "Sin categoría");
  const uncategorized = byCategory.find((c) => c.category === "Sin categoría");
  const totalAllCategories = byCategory.reduce((sum, c) => sum + c.total, 0);
  const uncategorizedPercent =
    uncategorized && totalAllCategories > 0
      ? ((uncategorized.total / totalAllCategories) * 100).toFixed(0)
      : null;

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <AppHeader
        links={[
          { to: "/transactions", label: "Transacciones" },
          { to: "/purchase", label: "Compras" },
        ]}
        showUpload
        showUser
        showLogout
      />

      <main className="px-6 py-8">
        <h2 className="mb-6 text-2xl font-semibold">Dashboard</h2>

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
            <p className="text-sm text-slate-400">Total transacciones</p>
            <p className="mt-1 text-3xl font-bold">{summary?.total_transactions || 0}</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
            <p className="text-sm text-slate-400">Este mes</p>
            <p className="mt-1 text-3xl font-bold text-red-400">
              {formatCurrency(summary?.total_spent_current_month || 0)}
            </p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
            <p className="text-sm text-slate-400">Mes anterior</p>
            <p className="mt-1 text-3xl font-bold text-amber-400">
              {formatCurrency(summary?.total_spent_previous_month || 0)}
            </p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
            <p className="text-sm text-slate-400">Estados de cuenta</p>
            <p className="mt-1 text-3xl font-bold">{summary?.statements_count || 0}</p>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
            <h3 className="mb-4 text-lg font-medium">Gastos por mes</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byMonth}>
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
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-lg font-medium">Gastos por categoría</h3>
              <Link
                to="/categories"
                className="text-sm text-indigo-400 hover:text-indigo-300"
              >
                Editar categorías
              </Link>
            </div>
            <div className="mb-4 flex gap-2 text-xs">
              <button
                onClick={() => setCategoryPeriod("latest")}
                className={`rounded px-2 py-1 ${
                  categoryPeriod === "latest"
                    ? "bg-indigo-500 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Último mes
              </button>
              <button
                onClick={() => setCategoryPeriod("all")}
                className={`rounded px-2 py-1 ${
                  categoryPeriod === "all"
                    ? "bg-indigo-500 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Todo
              </button>
            </div>
            {uncategorized && (
              <p className="mb-2 text-xs text-amber-400">
                {formatCurrency(uncategorized.total)} sin categorizar ({uncategorizedPercent}%) —{" "}
                <Link to="/transactions" className="underline hover:text-amber-300">
                  revisar
                </Link>
              </p>
            )}
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categorizedData}
                    dataKey="total"
                    nameKey="category"
                    cx="50%"
                    cy="45%"
                    outerRadius={70}
                  >
                    {categorizedData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155" }}
                    formatter={(value) => [formatCurrency(value), "Total"]}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    wrapperStyle={{ fontSize: "12px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
            <h3 className="mb-2 text-lg font-medium">Gastos por banco</h3>
            <div className="mb-4 flex gap-2 text-xs">
              <button
                onClick={() => setBankPeriod("latest")}
                className={`rounded px-2 py-1 ${
                  bankPeriod === "latest"
                    ? "bg-indigo-500 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Último mes
              </button>
              <button
                onClick={() => setBankPeriod("all")}
                className={`rounded px-2 py-1 ${
                  bankPeriod === "all"
                    ? "bg-indigo-500 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Todo
              </button>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byBank} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis type="number" stroke="#94a3b8" fontSize={12} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <YAxis dataKey="bank" type="category" stroke="#94a3b8" fontSize={12} width={100} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155" }}
                    formatter={(value) => [formatCurrency(value), "Total"]}
                  />
                  <Bar dataKey="total" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
            <h3 className="mb-2 text-lg font-medium">Top comerciantes</h3>
            <div className="mb-4 flex gap-2 text-xs">
              <button
                onClick={() => setMerchantPeriod("latest")}
                className={`rounded px-2 py-1 ${
                  merchantPeriod === "latest"
                    ? "bg-indigo-500 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Último mes
              </button>
              <button
                onClick={() => setMerchantPeriod("all")}
                className={`rounded px-2 py-1 ${
                  merchantPeriod === "all"
                    ? "bg-indigo-500 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Todo
              </button>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topMerchants}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="merchant" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155" }}
                    formatter={(value) => [formatCurrency(value), "Total"]}
                  />
                  <Bar dataKey="total" fill="#f97316" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
          <h3 className="mb-4 text-lg font-medium">Tendencias últimos 30 días</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155" }}
                  formatter={(value) => [formatCurrency(value), "Total"]}
                />
                <Legend />
                <Line type="monotone" dataKey="total" stroke="#22c55e" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </main>
    </div>
  );
}

export default DashboardPage;
