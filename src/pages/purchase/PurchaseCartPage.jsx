import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  getPurchaseCart,
  addCartItem,
  updateCartItem,
  deleteCartItem,
  completeCart,
  listPurchaseCategories,
} from "../../api/purchase";

function PurchaseCartPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newItem, setNewItem] = useState({ product_name: "", price: "", quantity: 1, category_id: "" });
  const [adding, setAdding] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const fetchData = async () => {
    try {
      const [cartData, catsData] = await Promise.all([
        getPurchaseCart(id),
        listPurchaseCategories(),
      ]);
      setCart(cartData);
      setCategories(catsData);
    } catch (err) {
      console.error(err);
      navigate("/purchase");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItem.product_name || !newItem.price) return;
    
    setAdding(true);
    try {
      await addCartItem(id, {
        product_name: newItem.product_name,
        price: parseFloat(newItem.price),
        quantity: parseInt(newItem.quantity) || 1,
        category_id: newItem.category_id || null,
      });
      setNewItem({ product_name: "", price: "", quantity: 1, category_id: "" });
      fetchData();
    } catch (err) {
      alert("Error al agregar item");
    } finally {
      setAdding(false);
    }
  };

  const handleUpdateItem = async (itemId, updates) => {
    try {
      await updateCartItem(id, itemId, updates);
      setEditingItem(null);
      fetchData();
    } catch (err) {
      alert("Error al actualizar item");
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!confirm("¿Eliminar este producto?")) return;
    try {
      await deleteCartItem(id, itemId);
      fetchData();
    } catch (err) {
      alert("Error al eliminar item");
    }
  };

  const handleComplete = async () => {
    if (!confirm("¿Finalizar este carrito?")) return;
    try {
      await completeCart(id);
      navigate("/purchase");
    } catch (err) {
      alert(err.response?.data?.detail || "Error al completar carrito");
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
    return (
      <div className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center">
        <p className="text-slate-400">Cargando...</p>
      </div>
    );
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
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
          >
            Finalizar Compra
          </button>
        ) : (
          <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-400">
            Completado
          </span>
        )}
      </header>

      <main className="mx-auto max-w-3xl px-6 py-8">
        {/* Add Item Form */}
        {cart.is_active && (
        <form onSubmit={handleAddItem} className="mb-8 rounded-xl border border-slate-800 bg-slate-900/60 p-6">
          <h2 className="mb-4 text-lg font-semibold">Agregar Producto</h2>
          <div className="grid gap-4 sm:grid-cols-5">
            <input
              type="text"
              placeholder="Producto"
              value={newItem.product_name}
              onChange={(e) => setNewItem((p) => ({ ...p, product_name: e.target.value }))}
              className="sm:col-span-2 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              required
            />
            <input
              type="number"
              placeholder="Precio"
              step="0.01"
              value={newItem.price}
              onChange={(e) => setNewItem((p) => ({ ...p, price: e.target.value }))}
              className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              required
            />
            <input
              type="number"
              placeholder="Cant"
              min="1"
              value={newItem.quantity}
              onChange={(e) => setNewItem((p) => ({ ...p, quantity: e.target.value }))}
              className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={adding}
              className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-400 disabled:opacity-50"
            >
              {adding ? "Agregando..." : "Agregar"}
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
                    <div className="flex flex-1 items-center gap-2">
                      <input
                        type="text"
                        defaultValue={item.product_name}
                        id={`edit-name-${item.id}`}
                        className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1 text-sm"
                      />
                      <input
                        type="number"
                        defaultValue={item.price}
                        step="0.01"
                        id={`edit-price-${item.id}`}
                        className="w-24 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1 text-sm"
                      />
                      <input
                        type="number"
                        defaultValue={item.quantity}
                        min="1"
                        id={`edit-qty-${item.id}`}
                        className="w-16 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1 text-sm"
                      />
                      <button
                        onClick={() => handleUpdateItem(item.id, {
                          product_name: document.getElementById(`edit-name-${item.id}`).value,
                          price: parseFloat(document.getElementById(`edit-price-${item.id}`).value),
                          quantity: parseInt(document.getElementById(`edit-qty-${item.id}`).value),
                        })}
                        className="rounded-lg bg-emerald-600 px-3 py-1 text-xs"
                      >
                        Guardar
                      </button>
                      <button
                        onClick={() => setEditingItem(null)}
                        className="rounded-lg bg-slate-700 px-3 py-1 text-xs"
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
                              onClick={() => handleDeleteItem(item.id)}
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
