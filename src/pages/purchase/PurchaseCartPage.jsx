import { useState, useEffect, useMemo } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  getPurchaseCart,
  completeCart,
  listPurchaseCategories,
  listPurchaseProducts,
} from "../../api/purchase";
import { suggestProducts } from "./productSearch";
import { getErrorMessage } from "../../api/client";
import LoadingScreen from "../../components/common/LoadingScreen";
import SyncBanner from "../../components/common/SyncBanner";
import { flushOutbox, getOutboxState, onOutboxOpSent, onOutboxSynced } from "../../offline/outbox";
import {
  applyCartOps,
  cacheKeys,
  pendingCountFor,
  queueAddCartItem,
  queueDeleteCartItem,
  queueUpdateCartItem,
  readCache,
  useOutbox,
  writeCache,
} from "../../offline/purchaseOffline";

function PurchaseCartPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  // The last copy the server returned opens the page instantly, even without
  // signal; it's refreshed in the background.
  const [serverCart, setServerCart] = useState(() => readCache(cacheKeys.cart(id)));
  const [categories, setCategories] = useState(() => readCache(cacheKeys.categories) || []);
  const [loading, setLoading] = useState(() => !readCache(cacheKeys.cart(id)));
  const [stale, setStale] = useState(false);
  const [products, setProducts] = useState(() => readCache(cacheKeys.products) || []);
  const emptyItem = { product_name: "", product_id: null, price: "", quantity: 1, category_id: "" };
  const [newItem, setNewItem] = useState(emptyItem);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [completing, setCompleting] = useState(false);
  const { ops } = useOutbox();

  // What the user sees: the server's cart plus every change not sent yet.
  const cart = useMemo(() => applyCartOps(serverCart, ops, categories), [serverCart, ops, categories]);
  const pending = pendingCountFor(ops, id);

  const fetchProducts = async () => {
    try {
      const data = await listPurchaseProducts();
      setProducts(data);
      writeCache(cacheKeys.products, data);
    } catch (err) {
      // Suggestions are optional: keep the cached ones.
      console.error(err);
    }
  };

  const fetchData = async ({ initial = false } = {}) => {
    fetchProducts();
    try {
      const [cartData, catsData] = await Promise.all([
        getPurchaseCart(id),
        listPurchaseCategories(),
      ]);
      setServerCart(cartData);
      setCategories(catsData);
      writeCache(cacheKeys.cart(id), cartData);
      writeCache(cacheKeys.categories, catsData);
      setStale(false);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 404) {
        writeCache(cacheKeys.cart(id), null);
        navigate("/purchase");
        return;
      }
      // Without a saved copy there's nothing to show; with one, keep working
      // from it.
      if (initial && !readCache(cacheKeys.cart(id))) navigate("/purchase");
      else setStale(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData({ initial: true });
    // Each change the server accepts becomes part of the saved copy right
    // away, so it doesn't flicker while the rest of the queue is sent...
    const offSent = onOutboxOpSent((op, data) => {
      if (op.cartId !== id) return;
      setServerCart((prev) => {
        const sentOp = op.kind === "cart-add" && data ? { ...op, data: { ...op.data, ...data } } : op;
        const next = applyCartOps(prev, [sentOp], readCache(cacheKeys.categories));
        if (!next) return next;
        const saved = { ...next, items: next.items.map(({ pending, ...item }) => item) };
        writeCache(cacheKeys.cart(id), saved);
        return saved;
      });
    });
    // ...and once the whole queue is sent, reload the server's version.
    const offSynced = onOutboxSynced(() => fetchData());
    return () => {
      offSent();
      offSynced();
    };
  }, [id]);

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItem.product_name || !newItem.price) return;

    queueAddCartItem(id, {
      product_name: newItem.product_name,
      price: parseFloat(newItem.price),
      quantity: parseInt(newItem.quantity) || 1,
      category_id: newItem.category_id || null,
      ...(newItem.product_id ? { product_id: newItem.product_id } : {}),
    });
    setNewItem(emptyItem);
    setShowSuggestions(false);
  };

  const suggestions = newItem.product_id ? [] : suggestProducts(products, newItem.product_name);
  const selectedProduct = products.find((p) => p.id === newItem.product_id);

  const pickProduct = (product) => {
    setNewItem((p) => ({ ...p, product_name: product.name, product_id: product.id }));
    setShowSuggestions(false);
  };

  const handleUpdateItem = (item, updates) => {
    queueUpdateCartItem(id, item.id, updates, updates.product_name || item.product_name);
    setEditingItem(null);
  };

  const handleDeleteItem = (item) => {
    if (!confirm("¿Eliminar este producto?")) return;
    queueDeleteCartItem(id, item.id, item.product_name);
  };

  const handleComplete = async () => {
    if (!confirm("¿Finalizar este carrito?")) return;
    setCompleting(true);
    try {
      // Everything added in the store has to reach the server before the
      // cart is closed.
      await flushOutbox();
      if (pendingCountFor(getOutboxState().ops, id) > 0) {
        alert("Todavía hay productos sin enviar al servidor. Quedan guardados en el teléfono; finalizá el carrito cuando haya conexión.");
        return;
      }
      await completeCart(id);
      writeCache(cacheKeys.cart(id), null);
      navigate("/purchase");
    } catch (err) {
      alert(getErrorMessage(err, "Error al completar carrito"));
    } finally {
      setCompleting(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("es-UY", {
      style: "currency",
      currency: "UYU",
      minimumFractionDigits: 2,
    }).format(value);
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (!cart) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center">
        <p>Carrito no encontrado</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <header className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
        <div className="flex items-center gap-4">
          <Link to="/purchase" className="text-lg font-semibold hover:text-indigo-400">← Volver</Link>
          <div>
            <h1 className="text-lg font-semibold">{cart.store_name || "Carrito de Compras"}</h1>
            <p className="text-xs text-slate-400">{cart.items?.length || 0} productos</p>
          </div>
        </div>
        {cart.is_active ? (
          <button
            onClick={handleComplete}
            disabled={completing}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
          >
            {completing ? "Finalizando..." : "Finalizar Compra"}
          </button>
        ) : (
          <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-400">
            Completado
          </span>
        )}
      </header>

      <main className="mx-auto max-w-3xl px-6 py-8">
        <SyncBanner pending={pending} stale={stale} />

        {/* Add Item Form */}
        {cart.is_active && (
        <form onSubmit={handleAddItem} className="mb-8 rounded-xl border border-slate-800 bg-slate-900/60 p-6">
          <h2 className="mb-4 text-lg font-semibold">Agregar Producto</h2>
          <div className="grid gap-4 sm:grid-cols-5">
            <div className="relative sm:col-span-2">
              <input
                type="text"
                placeholder="Producto"
                value={newItem.product_name}
                onChange={(e) => {
                  setNewItem((p) => ({ ...p, product_name: e.target.value, product_id: null }));
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                // Delayed so a tap on a suggestion lands before the list closes.
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                autoComplete="off"
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-hidden"
                required
              />
              {showSuggestions && suggestions.length > 0 && (
                <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-slate-700 bg-slate-900 shadow-lg">
                  {suggestions.map((product) => (
                    <li key={product.id}>
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => pickProduct(product)}
                        className="flex w-full items-center justify-between gap-3 px-4 py-2 text-left text-sm hover:bg-slate-800"
                      >
                        <span className="truncate">
                          {product.name}
                          {product.category_name && (
                            <span className="ml-2 text-xs text-slate-400">{product.category_name}</span>
                          )}
                        </span>
                        {product.last_price != null && (
                          <span className="shrink-0 text-xs text-slate-400">
                            {formatCurrency(product.last_price)}
                          </span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {selectedProduct?.category_name && !newItem.category_id && (
                <p className="mt-1 text-xs text-slate-400">Categoría: {selectedProduct.category_name}</p>
              )}
            </div>
            <input
              type="number"
              placeholder={
                selectedProduct?.last_price != null
                  ? `Último: ${selectedProduct.last_price}`
                  : "Precio"
              }
              step="0.01"
              value={newItem.price}
              onChange={(e) => setNewItem((p) => ({ ...p, price: e.target.value }))}
              className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-hidden"
              required
            />
            <input
              type="number"
              placeholder="Cant"
              min="1"
              value={newItem.quantity}
              onChange={(e) => setNewItem((p) => ({ ...p, quantity: e.target.value }))}
              className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-hidden"
            />
            <button
              type="submit"
              className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-400"
            >
              Agregar
            </button>
          </div>
          {categories.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setNewItem((p) => ({ ...p, category_id: cat.id }))}
                  className={`rounded-full px-2 py-1 text-xs transition ${
                    newItem.category_id === cat.id ? "ring-2 ring-white" : ""
                  }`}
                  style={{ backgroundColor: cat.color || "#6366f1" }}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}
        </form>
        )}

        {/* Items List */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
          {cart.items?.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              No hay productos en el carrito
            </div>
          ) : (
            <ul className="divide-y divide-slate-800">
              {cart.items?.map((item) => (
                <li key={item.id} className="flex items-center justify-between p-4">
                  {editingItem === item.id ? (
                    <div className="grid min-w-0 flex-1 grid-cols-2 gap-2 sm:flex sm:items-center">
                      <input
                        type="text"
                        aria-label="Producto"
                        defaultValue={item.product_name}
                        id={`edit-name-${item.id}`}
                        className="col-span-2 min-w-0 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm sm:flex-1 sm:py-1"
                      />
                      <input
                        type="number"
                        defaultValue={item.price}
                        step="0.01"
                        aria-label="Precio"
                        id={`edit-price-${item.id}`}
                        className="min-w-0 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm sm:w-24 sm:py-1"
                      />
                      <input
                        type="number"
                        defaultValue={item.quantity}
                        min="1"
                        aria-label="Cantidad"
                        id={`edit-qty-${item.id}`}
                        className="min-w-0 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm sm:w-16 sm:py-1"
                      />
                      <button
                        onClick={() => handleUpdateItem(item, {
                          product_name: document.getElementById(`edit-name-${item.id}`).value,
                          price: parseFloat(document.getElementById(`edit-price-${item.id}`).value),
                          quantity: parseInt(document.getElementById(`edit-qty-${item.id}`).value),
                        })}
                        className="rounded-lg bg-emerald-600 px-3 py-2 text-sm sm:py-1 sm:text-xs"
                      >
                        Guardar
                      </button>
                      <button
                        onClick={() => setEditingItem(null)}
                        className="rounded-lg bg-slate-700 px-3 py-2 text-sm sm:py-1 sm:text-xs"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1">
                        <p className="font-medium">{item.product_name}</p>
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          {item.category_name && (
                            <span
                              className="rounded-full px-2 py-0.5 text-xs"
                              style={{ backgroundColor: categories.find(c => c.name === item.category_name)?.color || "#6366f1" }}
                            >
                              {item.category_name}
                            </span>
                          )}
                          <span>x{item.quantity}</span>
                          {item.pending && (
                            <span className="text-xs text-amber-300">Sin enviar</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="font-semibold">{formatCurrency(item.price * item.quantity)}</p>
                        {cart.is_active && (
                          <>
                            <button
                              onClick={() => setEditingItem(item.id)}
                              className="text-sm text-slate-400 hover:text-white"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item)}
                              className="text-sm text-red-400 hover:text-red-300"
                            >
                              Eliminar
                            </button>
                          </>
                        )}
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Total */}
        <div className="mt-6 flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-6">
          <span className="text-lg">Total</span>
          <span className="text-4xl font-bold text-emerald-400">{formatCurrency(cart.total)}</span>
        </div>
      </main>
    </div>
  );
}

export default PurchaseCartPage;
