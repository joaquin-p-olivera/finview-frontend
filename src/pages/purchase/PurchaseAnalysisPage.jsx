import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { getPurchaseAnalytics, getPurchaseProductPrices } from "../../api/purchase";
import { getErrorMessage } from "../../api/client";

// Fixed order, checked for color-blind separation between neighbors on the
// dark background. Used for stores, and for categories without a color.
const SERIES_COLORS = ["#3987e5", "#d95926", "#199e70", "#c98500", "#d55181", "#008300", "#9085e9", "#e66767"];
const UNCATEGORIZED = "Sin categoría";
const OTHERS = "Otras";
const NEUTRAL = { [UNCATEGORIZED]: "#64748b", [OTHERS]: "#475569" };
// Past this many categories the smallest ones fold into "Otras".
const MAX_CATEGORIES = 7;

const AXIS = { stroke: "#94a3b8", fontSize: 12 };
const TOOLTIP_STYLE = { backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: 8 };
// Text stays in text colors; the colored swatch next to it carries the series.
const TOOLTIP_ITEM = { color: "#e2e8f0" };
const LEGEND_PROPS = {
  wrapperStyle: { fontSize: 12, paddingTop: 8 },
  formatter: (value) => <span style={{ color: "#cbd5e1" }}>{value}</span>,
};

const formatCurrency = (value) =>
  new Intl.NumberFormat("es-UY", { style: "currency", currency: "UYU", maximumFractionDigits: 0 }).format(value);
const formatThousands = (value) =>
  value === 0 ? "0" : `${(value / 1000).toLocaleString("es-UY", { maximumFractionDigits: 1 })}k`;
const formatPercent = (value) =>
  `${value > 0 ? "+" : ""}${(value * 100).toFixed(value !== 0 && Math.abs(value) < 0.1 ? 1 : 0)}%`;
const formatMonth = (month) => {
  const [year, m] = month.split("-");
  return new Date(Number(year), Number(m) - 1, 1).toLocaleDateString("es-UY", { month: "short", year: "2-digit" });
};
const formatDate = (date) =>
  new Date(`${date}T12:00:00`).toLocaleDateString("es-UY", { day: "numeric", month: "short" });

function Card({ title, subtitle, children, className = "" }) {
  return (
    <section className={`rounded-xl border border-slate-800 bg-slate-900/60 p-4 sm:p-6 ${className}`}>
      <h2 className="text-lg font-medium">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Change({ value }) {
  // Arrow + sign, not only color: up (pricier) is rose, down is emerald.
  const up = value > 0;
  return (
    <span className={`font-medium tabular-nums ${up ? "text-rose-300" : value < 0 ? "text-emerald-300" : "text-slate-300"}`}>
      {up ? "↑" : value < 0 ? "↓" : "="} {formatPercent(value)}
    </span>
  );
}

// Keeps the biggest categories (by total in the period) and folds the rest
// into "Otras", so the stacked bars never need more than 8 colors.
function useCategorySeries(analytics) {
  return useMemo(() => {
    if (!analytics) return { keys: [], color: () => NEUTRAL[OTHERS], fold: (c) => c };
    const named = analytics.category_totals.map((c) => c.category).filter((c) => c !== UNCATEGORIZED);
    const kept = named.slice(0, MAX_CATEGORIES);
    const hasOthers = named.length > MAX_CATEGORIES;
    const hasUncategorized = analytics.category_totals.some((c) => c.category === UNCATEGORIZED);
    const keys = [...kept, ...(hasOthers ? [OTHERS] : []), ...(hasUncategorized ? [UNCATEGORIZED] : [])];
    const color = (name) =>
      NEUTRAL[name] || analytics.category_colors[name] || SERIES_COLORS[kept.indexOf(name) % SERIES_COLORS.length];
    const fold = (categories) => {
      const row = {};
      Object.entries(categories).forEach(([name, total]) => {
        const key = name === UNCATEGORIZED || kept.includes(name) ? name : OTHERS;
        row[key] = (row[key] || 0) + total;
      });
      return row;
    };
    return { keys, color, fold };
  }, [analytics]);
}

function StackedCategoryChart({ data, xKey, xFormatter, series, tooltipLabel }) {
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ left: -12, right: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis dataKey={xKey} {...AXIS} tickFormatter={xFormatter} />
          <YAxis {...AXIS} tickFormatter={formatThousands} />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            itemStyle={TOOLTIP_ITEM}
            cursor={{ fill: "#33415555" }}
            labelFormatter={tooltipLabel}
            formatter={(value, name) => [formatCurrency(value), name]}
          />
          <Legend {...LEGEND_PROPS} />
          {series.keys.map((key, i) => (
            <Bar
              key={key}
              dataKey={key}
              stackId="spend"
              fill={series.color(key)}
              // 2px gap in the background color between stacked segments.
              stroke="#0b1120"
              strokeWidth={2}
              radius={i === series.keys.length - 1 ? [4, 4, 0, 0] : 0}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function ProductPriceChart({ productId }) {
  const [history, setHistory] = useState(null);

  useEffect(() => {
    if (!productId) return;
    setHistory(null);
    getPurchaseProductPrices(productId).then(setHistory).catch(() => setHistory({ prices: [] }));
  }, [productId]);

  const { rows, stores } = useMemo(() => {
    if (!history) return { rows: [], stores: [] };
    const storeNames = [...new Set(history.prices.map((p) => p.store))].sort();
    const rows = history.prices.map((p, i) => ({ key: i, date: p.date, [p.store]: p.price }));
    return { rows, stores: storeNames };
  }, [history]);

  if (!history) return <p className="text-sm text-slate-400">Cargando...</p>;
  if (rows.length === 0) return <p className="text-sm text-slate-400">No hay compras con precio.</p>;

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={rows} margin={{ left: -12, right: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis dataKey="date" {...AXIS} tickFormatter={formatDate} />
          <YAxis {...AXIS} domain={["auto", "auto"]} tickFormatter={(v) => `$${v}`} />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            itemStyle={TOOLTIP_ITEM}
            labelFormatter={(date) => formatDate(date)}
            formatter={(value, name) => [formatCurrency(value), name]}
          />
          {stores.length > 1 && <Legend {...LEGEND_PROPS} />}
          {stores.map((store, i) => (
            <Line
              key={store}
              dataKey={store}
              stroke={SERIES_COLORS[i % SERIES_COLORS.length]}
              strokeWidth={2}
              dot={{ r: 4, strokeWidth: 2, stroke: "#0b1120", fill: SERIES_COLORS[i % SERIES_COLORS.length] }}
              activeDot={{ r: 6 }}
              connectNulls
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function PurchaseAnalysisPage() {
  const [analytics, setAnalytics] = useState(null);
  const [months, setMonths] = useState(12);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [productId, setProductId] = useState("");
  const series = useCategorySeries(analytics);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getPurchaseAnalytics(months)
      .then((data) => {
        setAnalytics(data);
        setProductId((current) => current || data.price_changes[0]?.product_id || data.top_products[0]?.product_id || "");
      })
      .catch((err) => setError(getErrorMessage(err, "No se pudo cargar el análisis.")))
      .finally(() => setLoading(false));
  }, [months]);

  const byMonth = useMemo(
    () => (analytics?.by_month || []).map((m) => ({ month: m.month, ...series.fold(m.categories) })),
    [analytics, series]
  );
  const byCart = useMemo(
    () =>
      (analytics?.by_cart || []).map((c) => ({
        key: c.cart_id,
        label: `${formatDate(c.date)} · ${c.store}`,
        date: c.date,
        ...series.fold(c.categories),
      })),
    [analytics, series]
  );

  const total = analytics?.category_totals.reduce((sum, c) => sum + c.total, 0) || 0;
  const rising = (analytics?.price_changes || []).filter((p) => p.change > 0).slice(0, 6);
  const falling = (analytics?.price_changes || []).filter((p) => p.change < 0).reverse().slice(0, 6);
  const index = analytics?.basket_index || [];
  const lastIndex = index[index.length - 1];
  const pickable = useMemo(() => {
    const map = new Map();
    [...(analytics?.price_changes || []), ...(analytics?.top_products || [])].forEach((p) => {
      if (p.product_id && !map.has(p.product_id)) map.set(p.product_id, p.name);
    });
    return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [analytics]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <header className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
        <Link to="/purchase" className="text-lg font-semibold hover:text-indigo-400">← Volver</Link>
        <Link to="/purchase/stats" className="text-sm text-indigo-400 hover:text-indigo-300">Totales por carrito</Link>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="mb-6">
          <h1 className="mb-2 text-2xl font-semibold">Análisis de compras</h1>
          <p className="mb-4 text-sm text-slate-400">
            En qué gastás, cómo cambian los precios y dónde conviene comprar. Solo cuenta carritos finalizados.
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              [3, "3 meses"],
              [6, "6 meses"],
              [12, "12 meses"],
              [0, "Todo"],
            ].map(([value, label]) => (
              <button
                key={value}
                onClick={() => setMonths(value)}
                className={`rounded-lg px-3 py-1 text-sm ${
                  months === value ? "bg-indigo-500 text-white" : "bg-slate-800 text-slate-400"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <p className="text-center text-slate-400">Cargando...</p>
        ) : error ? (
          <p className="rounded-xl border border-rose-900 bg-rose-950/40 p-6 text-center text-rose-300">{error}</p>
        ) : total === 0 ? (
          <p className="text-center text-slate-400">No hay carritos finalizados en este período.</p>
        ) : (
          <div className="space-y-6">
            {/* Headline numbers */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
                <p className="text-sm text-slate-400">Gastado en el período</p>
                <p className="mt-1 text-3xl font-bold">{formatCurrency(total)}</p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
                <p className="text-sm text-slate-400">Donde más gastás</p>
                <p className="mt-1 text-2xl font-bold">{analytics.category_totals[0].category}</p>
                <p className="text-sm text-slate-400">
                  {formatCurrency(analytics.category_totals[0].total)} · {Math.round(analytics.category_totals[0].share * 100)}% del total
                </p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
                <p className="text-sm text-slate-400">Tu inflación en el período</p>
                {lastIndex && index.length > 1 ? (
                  <>
                    <p className="mt-1 text-2xl font-bold"><Change value={lastIndex.index / 100 - 1} /></p>
                    <p className="text-sm text-slate-400">mismos productos, desde {formatMonth(index[0].month)}</p>
                  </>
                ) : (
                  <p className="mt-1 text-sm text-slate-400">Hace falta más de un mes de compras.</p>
                )}
              </div>
            </div>

            <Card title="Gasto por categoría, mes a mes">
              <StackedCategoryChart
                data={byMonth}
                xKey="month"
                xFormatter={formatMonth}
                series={series}
                tooltipLabel={(month) => formatMonth(month)}
              />
            </Card>

            <Card title="Gasto por categoría, carrito a carrito" subtitle="Los últimos carritos finalizados.">
              <StackedCategoryChart
                data={byCart}
                xKey="date"
                xFormatter={formatDate}
                series={series}
                tooltipLabel={(_, payload) => payload?.[0]?.payload?.label}
              />
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              <Card title="Lo que más subió" subtitle="Último precio contra la compra anterior.">
                <PriceChangeList items={rising} empty="Nada subió en este período." onPick={setProductId} />
              </Card>
              <Card title="Lo que bajó">
                <PriceChangeList items={falling} empty="Nada bajó en este período." onPick={setProductId} />
              </Card>
            </div>
            <p className="-mt-3 text-xs text-slate-500">
              Carne, pescado, fruta y verdura al peso cambian de precio según el tamaño de lo que compraste.
            </p>

            <Card
              title="Evolución de precio"
              subtitle="Cada compra de un producto, por supermercado. Tocá un producto de las listas para verlo acá."
            >
              <select
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                className="mb-4 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white sm:max-w-xs"
              >
                {pickable.map(([id, name]) => (
                  <option key={id} value={id}>{name}</option>
                ))}
              </select>
              {productId && <ProductPriceChart productId={productId} />}
            </Card>

            {index.length > 1 && (
              <Card
                title="Tu inflación de supermercado"
                subtitle="Índice 100 en el primer mes. Cada mes compara el precio promedio de los productos que compraste ese mes y el anterior."
              >
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={index} margin={{ left: -12, right: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis dataKey="month" {...AXIS} tickFormatter={formatMonth} />
                      <YAxis {...AXIS} domain={["auto", "auto"]} />
                      <ReferenceLine y={100} stroke="#475569" strokeDasharray="4 4" />
                      <Tooltip
                        contentStyle={TOOLTIP_STYLE}
                        itemStyle={TOOLTIP_ITEM}
            itemStyle={TOOLTIP_ITEM}
                        labelFormatter={(month) => formatMonth(month)}
                        formatter={(value, _name, props) => [
                          `${value.toFixed(1)}${
                            props.payload.change !== null
                              ? ` (${formatPercent(props.payload.change)} vs mes anterior, ${props.payload.products_compared} productos)`
                              : ""
                          }`,
                          "Índice",
                        ]}
                      />
                      <Line dataKey="index" stroke="#3987e5" strokeWidth={2} dot={{ r: 4, fill: "#3987e5" }} isAnimationActive={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            )}

            <div className="grid gap-6 md:grid-cols-2">
              <Card title="En qué se va la plata" subtitle="Productos con más gasto en el período.">
                <ul className="divide-y divide-slate-800 text-sm">
                  {analytics.top_products.map((p) => (
                    <li key={p.product_id || p.name} className="flex items-center justify-between gap-3 py-2">
                      <button
                        onClick={() => p.product_id && setProductId(p.product_id)}
                        className="min-w-0 text-left hover:text-indigo-300"
                      >
                        <p className="truncate font-medium">{p.name}</p>
                        <p className="text-xs text-slate-400">
                          {p.times} {p.times === 1 ? "compra" : "compras"}
                          {p.avg_days_between ? ` · cada ${p.avg_days_between} días` : ""}
                        </p>
                      </button>
                      <div className="shrink-0 text-right">
                        <p className="font-medium tabular-nums">{formatCurrency(p.total)}</p>
                        <p className="text-xs text-slate-400">{Math.round(p.share * 100)}%</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </Card>

              <Card title="Dónde conviene" subtitle="Productos que compraste en más de un super: precio promedio en cada uno.">
                {analytics.cheapest_stores.length === 0 ? (
                  <p className="text-sm text-slate-400">Todavía no compraste el mismo producto en dos supers.</p>
                ) : (
                  <ul className="divide-y divide-slate-800 text-sm">
                    {analytics.cheapest_stores.slice(0, 8).map((p) => (
                      <li key={p.product_id} className="py-2">
                        <div className="flex items-center justify-between gap-3">
                          <button onClick={() => setProductId(p.product_id)} className="truncate font-medium hover:text-indigo-300">
                            {p.name}
                          </button>
                          {p.saving > 0 && (
                            <span className="shrink-0 text-xs text-emerald-300">
                              {Math.round(p.saving * 100)}% menos en {p.cheapest_store}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400">
                          {p.stores.map((s) => `${s.store} ${formatCurrency(s.avg_price)}`).join(" · ")}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function PriceChangeList({ items, empty, onPick }) {
  if (items.length === 0) return <p className="text-sm text-slate-400">{empty}</p>;
  return (
    <ul className="divide-y divide-slate-800 text-sm">
      {items.map((p) => (
        <li key={p.product_id}>
          <button
            onClick={() => onPick(p.product_id)}
            className="flex w-full items-center justify-between gap-3 py-2 text-left hover:text-indigo-300"
          >
            <span className="min-w-0">
              <span className="block truncate font-medium">{p.name}</span>
              <span className="block text-xs text-slate-400">
                {formatCurrency(p.previous_price)} → {formatCurrency(p.last_price)} · {formatDate(p.last_date)} en {p.last_store}
              </span>
            </span>
            <Change value={p.change} />
          </button>
        </li>
      ))}
    </ul>
  );
}

export default PurchaseAnalysisPage;
