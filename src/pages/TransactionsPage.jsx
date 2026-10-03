import { useState, useEffect } from "react";
import { getTransactions, deleteTransaction } from "../api/stats";
import AppHeader from "../components/common/AppHeader";

function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    search: "",
    startDate: "",
    endDate: "",
  });
  const [deletingId, setDeletingId] = useState(null);

  const fetchTransactions = async (pageNum = 1) => {
    setLoading(true);
    try {
      const params = {
        page: pageNum,
        page_size: 20,
        ...(filters.search && { search: filters.search }),
        ...(filters.startDate && { start_date: filters.startDate }),
        ...(filters.endDate && { end_date: filters.endDate }),
      };
      const data = await getTransactions(params);
      setTransactions(data.items);
      setTotal(data.total);
      setTotalPages(data.total_pages);
      setPage(data.page);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions(1);
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Borrar esta transacción? No se puede deshacer.")) return;
    setDeletingId(id);
    try {
      await deleteTransaction(id);
      await fetchTransactions(page);
    } catch (err) {
      console.error(err);
      alert("No se pudo borrar la transacción.");
    } finally {
      setDeletingId(null);
    }
  };

  const exportCSV = () => {
    const headers = ["Fecha", "Descripción", "Comercio", "Monto", "Moneda", "Categoría"];
    const rows = transactions.map((t) => [
      t.date,
      t.description || "",
      t.merchant || "",
      t.amount,
      t.currency,
      t.category_name || "Sin categoría",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((r) => r.map((c) => `"${c}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transacciones_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <AppHeader
        links={[
          { to: "/dashboard", label: "Dashboard" },
          { to: "/purchase", label: "Compras" },
        ]}
        showUpload
      />

      <main className="px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Transacciones</h2>
          <button
            onClick={exportCSV}
            disabled={transactions.length === 0}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
          >
            Exportar CSV
          </button>
        </div>

        <div className="mb-4 flex flex-wrap gap-4">
          <input
            type="text"
            placeholder="Buscar descripción..."
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-hidden"
          />
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => handleFilterChange("startDate", e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-white focus:border-indigo-500 focus:outline-hidden"
          />
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => handleFilterChange("endDate", e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-white focus:border-indigo-500 focus:outline-hidden"
          />
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-800 bg-slate-900 text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Fecha</th>
                  <th className="px-4 py-3 font-medium">Descripción</th>
                  <th className="px-4 py-3 font-medium">Comercio</th>
                  <th className="px-4 py-3 font-medium text-right">Monto</th>
                  <th className="px-4 py-3 font-medium">Moneda</th>
                  <th className="px-4 py-3 font-medium">Categoría</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                      Cargando...
                    </td>
                  </tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                      No hay transacciones
                    </td>
                  </tr>
                ) : (
                  transactions.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-800/50">
                      <td className="px-4 py-3">{t.date}</td>
                      <td className="px-4 py-3">{t.description || "-"}</td>
                      <td className="px-4 py-3">{t.merchant || "-"}</td>
                      <td
                        className={`px-4 py-3 text-right ${
                          t.amount >= 0 ? "text-emerald-400" : "text-red-400"
                        }`}
                      >
                        {t.amount >= 0 ? "+" : "-"}
                        {Math.abs(t.amount).toLocaleString("es-UY", {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                      <td className="px-4 py-3">{t.currency}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-slate-800 px-2 py-1 text-xs">
                          {t.category_name || "Sin categoría"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDelete(t.id)}
                          disabled={deletingId === t.id}
                          className="text-xs text-red-400 hover:text-red-300 disabled:opacity-50"
                        >
                          {deletingId === t.id ? "..." : "✕"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-800 px-4 py-3">
              <span className="text-sm text-slate-400">
                Mostrando {(page - 1) * 20 + 1} - {Math.min(page * 20, total)} de {total}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => fetchTransactions(page - 1)}
                  disabled={page <= 1}
                  className="rounded-lg border border-slate-700 px-3 py-1 text-sm hover:bg-slate-800 disabled:opacity-50"
                >
                  Anterior
                </button>
                <button
                  onClick={() => fetchTransactions(page + 1)}
                  disabled={page >= totalPages}
                  className="rounded-lg border border-slate-700 px-3 py-1 text-sm hover:bg-slate-800 disabled:opacity-50"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default TransactionsPage;
