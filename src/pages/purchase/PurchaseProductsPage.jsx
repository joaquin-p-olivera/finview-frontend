import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  categorizePurchaseProducts,
  countUnlinkedPurchaseItems,
  dismissPurchaseProductSuggestion,
  linkPurchaseItemsToProducts,
  listPurchaseCategories,
  listPurchaseProducts,
  mergePurchaseProduct,
  updatePurchaseProduct,
} from "../../api/purchase";
import { getErrorMessage } from "../../api/client";
import { cacheKeys, writeCache } from "../../offline/purchaseOffline";
import { matchesProduct } from "./productSearch";

const formatCurrency = (value) =>
  new Intl.NumberFormat("es-UY", { style: "currency", currency: "UYU", maximumFractionDigits: 0 }).format(value);

function PurchaseProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [unlinked, setUnlinked] = useState(0);
  const [loading, setLoading] = useState(true);
  const [linking, setLinking] = useState(false);
  const [categorizing, setCategorizing] = useState(false);
  const [query, setQuery] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [mergingId, setMergingId] = useState(null);

  const fetchData = async () => {
    try {
      const [productsData, categoriesData, unlinkedCount] = await Promise.all([
        listPurchaseProducts(),
        listPurchaseCategories(),
        countUnlinkedPurchaseItems(),
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
      setUnlinked(unlinkedCount);
      writeCache(cacheKeys.products, productsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const replaceProduct = (updated) =>
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));

  const handleLink = async () => {
    setLinking(true);
    try {
      const result = await linkPurchaseItemsToProducts();
      alert(`Listo: ${result.linked_items} productos de tus carritos agrupados en ${result.created_products} productos nuevos.`);
      fetchData();
    } catch (err) {
      alert(getErrorMessage(err, "No se pudo agrupar el historial"));
    } finally {
      setLinking(false);
    }
  };

  const handleCategorize = async () => {
    setCategorizing(true);
    try {
      const result = await categorizePurchaseProducts();
      const lines = [`${result.categorized} productos categorizados.`];
      if (result.new_categories.length > 0) lines.push(`Categorías nuevas: ${result.new_categories.join(", ")}.`);
      if (result.suggestions > 0) lines.push(`${result.suggestions} sugerencias para revisar.`);
      alert(lines.join("\n"));
      fetchData();
    } catch (err) {
      alert(getErrorMessage(err, "No se pudo categorizar con IA"));
    } finally {
      setCategorizing(false);
    }
  };

  const handleDismiss = async (product) => {
    try {
      replaceProduct(await dismissPurchaseProductSuggestion(product.id));
    } catch (err) {
      alert(getErrorMessage(err, "No se pudo descartar la sugerencia"));
    }
  };

  const handleCategory = async (product, categoryId) => {
    try {
      replaceProduct(await updatePurchaseProduct(product.id, { category_id: categoryId || null }));
    } catch (err) {
      alert(getErrorMessage(err, "No se pudo cambiar la categoría"));
    }
  };

  const handleRename = async (e) => {
    e.preventDefault();
    if (!editingName.trim()) return;
    try {
      replaceProduct(await updatePurchaseProduct(editingId, { name: editingName.trim() }));
      setEditingId(null);
    } catch (err) {
      alert(getErrorMessage(err, "No se pudo renombrar el producto"));
    }
  };

  const handleMerge = async (product, intoId) => {
    const target = products.find((p) => p.id === intoId);
    if (!target) return;
    if (!confirm(`¿Unir "${product.name}" con "${target.name}"? Sus compras pasan a "${target.name}".`)) return;
    try {
      await mergePurchaseProduct(product.id, intoId);
      setMergingId(null);
      fetchData();
    } catch (err) {
      alert(getErrorMessage(err, "No se pudieron unir los productos"));
    }
  };

  // Uncategorized products first, then one group per category.
  const groups = useMemo(() => {
    const visible = products.filter((p) => matchesProduct(p, query));
    const byCategory = new Map();
    visible.forEach((p) => {
      const key = p.category_name || "";
      if (!byCategory.has(key)) byCategory.set(key, []);
      byCategory.get(key).push(p);
    });
    return [...byCategory.entries()]
      .sort(([a], [b]) => (a === "" ? -1 : b === "" ? 1 : a.localeCompare(b)))
      .map(([name, items]) => ({ name: name || "Sin categoría", items }));
  }, [products, query]);

  const uncategorized = products.filter((p) => !p.category_id).length;
  const toReview = products.filter((p) => p.suggested_merge_into_id || p.ai_note).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <header className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
        <Link to="/purchase" className="text-lg font-semibold hover:text-indigo-400">← Volver</Link>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <div className="mb-6">
          <h1 className="mb-2 text-2xl font-semibold">Productos</h1>
          <p className="text-sm text-slate-400">
            Todo lo que compraste, agrupado por producto. La categoría de un producto se aplica a todas sus compras.
            Si dos productos son el mismo, unilos.
          </p>
        </div>

        {unlinked > 0 && (
          <div className="mb-6 flex flex-col gap-3 rounded-xl border border-amber-700/50 bg-amber-900/20 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-amber-200">
              Hay {unlinked} productos de carritos anteriores sin agrupar.
            </p>
            <button
              onClick={handleLink}
              disabled={linking}
              className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-500 disabled:opacity-50"
            >
              {linking ? "Agrupando..." : "Agrupar historial"}
            </button>
          </div>
        )}

        {unlinked === 0 && uncategorized > 0 && (
          <div className="mb-6 flex flex-col gap-3 rounded-xl border border-indigo-700/50 bg-indigo-900/20 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-indigo-200">
              {uncategorized} {uncategorized === 1 ? "producto sin categoría" : "productos sin categoría"}. Claude puede
              categorizarlos usando tus categorías o creando nuevas; después podés cambiar las que no te cierren.
            </p>
            <button
              onClick={handleCategorize}
              disabled={categorizing}
              className="shrink-0 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-400 disabled:opacity-50"
            >
              {categorizing ? "Categorizando..." : "Categorizar con IA"}
            </button>
          </div>
        )}

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <input
            type="search"
            placeholder="Buscar producto"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-hidden sm:max-w-xs"
          />
          {products.length > 0 && (
            <p className="text-sm text-slate-400">
              {products.length} productos · {uncategorized} sin categoría
              {toReview > 0 && ` · ${toReview} para revisar`}
            </p>
          )}
        </div>

        {loading ? (
          <p className="text-center text-slate-400">Cargando...</p>
        ) : products.length === 0 ? (
          <p className="text-center text-slate-400">
            Todavía no hay productos. Se crean solos al agregar cosas al carrito.
          </p>
        ) : (
          <div className="space-y-6">
            {groups.map((group) => (
              <section key={group.name} className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60">
                <h2 className="border-b border-slate-800 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-300">
                  {group.name} <span className="font-normal text-slate-500">({group.items.length})</span>
                </h2>
                <ul className="divide-y divide-slate-800 text-sm">
                  {group.items.map((product) => (
                    <li key={product.id} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center">
                      <div className="min-w-0 flex-1">
                        {editingId === product.id ? (
                          <form onSubmit={handleRename} className="flex items-center gap-3">
                            <input
                              type="text"
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              autoFocus
                              className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm text-white focus:border-indigo-500 focus:outline-hidden"
                            />
                            <button type="submit" className="text-emerald-400 hover:text-emerald-300">Guardar</button>
                            <button type="button" onClick={() => setEditingId(null)} className="text-slate-400 hover:text-slate-300">
                              Cancelar
                            </button>
                          </form>
                        ) : (
                          <>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-xs text-slate-400">
                              {product.times_bought} {product.times_bought === 1 ? "compra" : "compras"}
                              {product.last_price != null && (
                                <>
                                  {" · último "}
                                  {formatCurrency(product.last_price)}
                                  {product.last_store && ` en ${product.last_store}`}
                                </>
                              )}
                              {product.min_price != null && product.max_price !== product.min_price && (
                                <> · {formatCurrency(product.min_price)} a {formatCurrency(product.max_price)}</>
                              )}
                            </p>
                          </>
                        )}
                        {product.suggested_merge_into_name && (
                          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg bg-indigo-900/30 px-3 py-2 text-xs text-indigo-200">
                            <span>IA: ¿es el mismo producto que "{product.suggested_merge_into_name}"?</span>
                            <button
                              onClick={() => handleMerge(product, product.suggested_merge_into_id)}
                              className="font-medium text-indigo-300 hover:text-white"
                            >
                              Unir
                            </button>
                            <button onClick={() => handleDismiss(product)} className="text-slate-400 hover:text-white">
                              No
                            </button>
                          </div>
                        )}
                        {product.ai_note && !product.suggested_merge_into_name && (
                          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg bg-amber-900/20 px-3 py-2 text-xs text-amber-200">
                            <span>IA: {product.ai_note}</span>
                            <button onClick={() => handleDismiss(product)} className="text-slate-400 hover:text-white">
                              Listo
                            </button>
                          </div>
                        )}
                        {mergingId === product.id && (
                          <select
                            autoFocus
                            defaultValue=""
                            onChange={(e) => handleMerge(product, e.target.value)}
                            className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm text-white"
                          >
                            <option value="" disabled>Unir con…</option>
                            {products
                              .filter((p) => p.id !== product.id)
                              .map((p) => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                              ))}
                          </select>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        {product.category_source === "ai" && (
                          <span title="Categoría elegida por la IA" className="rounded bg-indigo-900/50 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-300">
                            IA
                          </span>
                        )}
                        <select
                          aria-label="Categoría"
                          value={product.category_id || ""}
                          onChange={(e) => handleCategory(product, e.target.value)}
                          className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-sm text-white"
                        >
                          <option value="">Sin categoría</option>
                          {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => {
                            setEditingId(product.id);
                            setEditingName(product.name);
                          }}
                          className="text-indigo-400 hover:text-indigo-300"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => setMergingId(mergingId === product.id ? null : product.id)}
                          className="text-indigo-400 hover:text-indigo-300"
                        >
                          Unir
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default PurchaseProductsPage;
