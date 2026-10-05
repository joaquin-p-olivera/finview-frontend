import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { getStatementDetail, confirmStatement, deleteStatement } from "../api/statements";
import { listCategories } from "../api/categories";
import ReviewTable from "../components/review/ReviewTable";
import PdfViewer from "../components/review/PdfViewer";

function ReviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  // the uploaded PDF, passed along by UploadPage (the API doesn't store it)
  const pdfFile = useLocation().state?.file ?? null;
  const [statement, setStatement] = useState(null);
  const [rows, setRows] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [stmt, cats] = await Promise.all([
          getStatementDetail(id),
          listCategories()
        ]);
        setStatement(stmt);
        setRows(
          (stmt.transactions || []).map((tx) => ({
            ...tx
          }))
        );
        setCategories(cats);
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar el parseo para revisión.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleChangeRow = (updatedRow) => {
    setRows((prev) => prev.map((r) => (r.id === updatedRow.id ? updatedRow : r)));
  };

  const handleDeleteRow = (rowId) => {
    setRows((prev) => prev.filter((r) => r.id !== rowId));
  };

  const handleConfirm = async () => {
    setSaving(true);
    setError("");
    try {
      const payload = {
        transactions: rows.map((r) => ({
          date: r.date,
          description: r.description,
          merchant: r.merchant,
          amount: r.amount,
          currency: r.currency,
          installment_num: r.installment_num ?? null,
          installment_tot: r.installment_tot ?? null,
          category_id: r.category_id ?? null,
          category_source: r.category_source || "user"
        }))
      };
      await confirmStatement(id, payload);
      navigate("/", { replace: true });
    } catch (err) {
      console.error(err);
      setError("No se pudieron guardar las transacciones. Probá de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async () => {
    try {
      await deleteStatement(id);
    } catch (err) {
      console.error(err);
    } finally {
      navigate("/", { replace: true });
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-200">
        Cargando parseo...
      </div>
    );
  }

  if (!statement) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-200">
        No se encontró el estado de cuenta.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <main className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Revisar parseo</h1>
            <p className="mt-1 text-xs text-slate-400">
              Banco: {statement.bank_name || "—"} · Período:{" "}
              {statement.period_start || "?"} – {statement.period_end || "?"} · Tarjeta:{" "}
              {statement.card_last4 ? `***${statement.card_last4}` : "—"}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-800"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={saving || rows.length === 0}
              className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-medium text-white shadow-xs hover:bg-emerald-400 disabled:opacity-60"
            >
              {saving ? "Guardando..." : "Confirmar y guardar"}
            </button>
          </div>
        </header>

        {error && <p className="text-xs text-red-400">{error}</p>}

        <div className="grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)] md:items-stretch">
          <div className="h-[70vh]">
            <ReviewTable
              rows={rows}
              categories={categories}
              onChangeRow={handleChangeRow}
              onDeleteRow={handleDeleteRow}
            />
          </div>
          <div className="h-[70vh]">
            <PdfViewer file={pdfFile} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default ReviewPage;

