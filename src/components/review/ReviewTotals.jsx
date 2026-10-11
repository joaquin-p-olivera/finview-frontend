import { useMemo } from "react";

const LABELS = { UYU: "Pesos (UYU)", USD: "Dólares (USD)" };

const formatAmount = (value, currency) => {
  try {
    return new Intl.NumberFormat("es-UY", { style: "currency", currency }).format(value);
  } catch {
    // not an ISO code (the currency column is free text while reviewing)
    return `${currency} ${new Intl.NumberFormat("es-UY", { minimumFractionDigits: 2 }).format(value)}`;
  }
};

// Total of the rows being reviewed, one card per currency, so it follows any
// edit or deletion made in the table.
function ReviewTotals({ rows }) {
  const totals = useMemo(() => {
    const byCurrency = {};
    rows.forEach((row) => {
      const currency = (row.currency || "UYU").trim().toUpperCase();
      const entry = (byCurrency[currency] ||= { total: 0, count: 0 });
      entry.total += Number(row.amount) || 0;
      entry.count += 1;
    });
    return Object.entries(byCurrency).sort(([a], [b]) => (a === "UYU" ? -1 : b === "UYU" ? 1 : a.localeCompare(b)));
  }, [rows]);

  if (totals.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-3">
      {totals.map(([currency, { total, count }]) => (
        <div
          key={currency}
          className="min-w-44 rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5"
        >
          <p className="text-[11px] uppercase tracking-wide text-slate-400">
            {LABELS[currency] || currency}
          </p>
          <p className="mt-0.5 text-lg font-semibold text-slate-50">{formatAmount(total, currency)}</p>
          <p className="text-[11px] text-slate-500">
            {count} {count === 1 ? "movimiento" : "movimientos"}
          </p>
        </div>
      ))}
    </div>
  );
}

export default ReviewTotals;
