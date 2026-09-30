import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import {
  getActiveCart,
  listPurchaseCarts,
  createPurchaseCart,
  listPurchaseLists,
  listPurchaseCategories,
} from "../../api/purchase";

function PurchaseDashboardPage() {
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const [activeCart, setActiveCart] = useState(null);
  const [carts, setCarts] = useState([]);
  const [lists, setLists] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCartName, setNewCartName] = useState("");
  const [creatingCart, setCreatingCart] = useState(false);

  const fetchData = async () => {
    try {
      const [active, cartsData, listsData, catsData] = await Promise.all([
        getActiveCart(),
        listPurchaseCarts(10),
        listPurchaseLists(),
        listPurchaseCategories(),
      ]);
      setActiveCart(active);
      setCarts(cartsData);
      setLists(listsData);
      setCategories(catsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateCart = async (e) => {
    e.preventDefault();
    if (!newCartName.trim()) return;
    setCreatingCart(true);
    try {
      const newCart = await createPurchaseCart({ store_name: newCartName.trim() });
      setActiveCart(newCart);
      setNewCartName("");
      fetchData();
    } catch (err) {
      alert(err.response?.data?.detail || "Error al crear carrito");
    } finally {
      setCreatingCart(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("es-UY", {
      style: "currency",
      currency: "UYU",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("es-UY", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center">
        <p className="text-slate-400">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <header className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
        <Link to="/" className="text-lg font-semibold hover:text-indigo-400">Finview</Link>
        <div className="flex items-center gap-3 text-sm">
          <Link to="/transactions" className="text-slate-400 hover:text-white">
            Gastos
          </Link>
          <Link
            to="/purchase/lists"
            className="text-slate-400 hover:text-white"
          >
            Listas
          </Link>
          <Link
            to="/purchase/stats"
            className="text-slate-400 hover:text-white"
          >
            Stats
          </Link>
          <button
            onClick={logout}
            className="rounded-md border border-slate-700 px-3 py-1 text-xs text-slate-300 hover:bg-slate-800"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-1 text-3xl font-bold">Carrito de Compras</h1>
            <p className="text-slate-400">Gestiona tus compras en el supermercado</p>
          </div>
        </div>

        {/* Active Cart Section */}
        <section className="mb-8 rounded-xl border border-slate-800 bg-slate-900/60 p-6">
          <h2 className="mb-4 text-xl font-semibold">Carrito Actual</h2>
          
          {activeCart ? (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-lg font-medium">
                    {activeCart.store_name || "Sin nombre"}
                  </p>
                  <p className="text-sm text-slate-400">
                    {activeCart.items?.length || 0} productos
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-emerald-400">
                    {formatCurrency(activeCart.total)}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Link
                  to={`/purchase/cart/${activeCart.id}`}
                  className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-400"
                >
                  Continuar Comprando
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleCreateCart} className="flex gap-3">
              <input
                type="text"
                placeholder="Nombre del supermercado"
                value={newCartName}
                onChange={(e) => setNewCartName(e.target.value)}
                required
                className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={creatingCart || !newCartName.trim()}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
              >
                {creatingCart ? "Creando..." : "Iniciar Carrito"}
              </button>
            </form>
          )}
        </section>

        {/* Categories Section */}
        <section className="mb-8 rounded-xl border border-slate-800 bg-slate-900/60 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Categorías</h2>
            <Link
              to="/purchase/categories"
              className="text-sm text-indigo-400 hover:text-indigo-300"
            >
              Editar categorías
            </Link>
          </div>
          {categories.length === 0 ? (
            <p className="text-slate-400">
              No tenés categorías.{" "}
              <Link to="/purchase/categories" className="text-indigo-400 hover:underline">
                Crear categorías
              </Link>
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <span
                  key={cat.id}
                  className="rounded-full px-3 py-1 text-xs"
                  style={{ backgroundColor: cat.color || "#6366f1" }}
                >
                  {cat.name}
                </span>
              ))}
            </div>
          )}
        </section>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Recent Carts */}
          <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
            <h2 className="mb-4 text-lg font-semibold">Historial de Carritos</h2>
            {carts.filter(c => !c.is_active).length === 0 ? (
              <p className="text-slate-400">No hay carritos completados</p>
            ) : (
              <ul className="space-y-3">
                {carts.filter(c => !c.is_active).slice(0, 5).map((cart) => (
                  <li key={cart.id}>
                    <Link
                      to={`/purchase/cart/${cart.id}`}
                      className="flex items-center justify-between rounded-lg bg-slate-800/50 p-3 hover:bg-slate-800"
                    >
                      <div>
                        <p className="font-medium">{cart.store_name || "Sin nombre"}</p>
                        <p className="text-xs text-slate-400">{formatDate(cart.completed_at || cart.created_at)}</p>
                      </div>
                      <p className="font-semibold text-emerald-400">{formatCurrency(cart.total)}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Shopping Lists */}
          <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Apuntes de Compras</h2>
              <Link
                to="/purchase/lists"
                className="text-sm text-indigo-400 hover:text-indigo-300"
              >
                Ver todas
              </Link>
            </div>
            {lists.length === 0 ? (
              <p className="text-slate-400">
                No tenés listas.{" "}
                <Link to="/purchase/lists" className="text-indigo-400 hover:underline">
                  Crear lista
                </Link>
              </p>
            ) : (
              <ul className="space-y-2">
                {lists.slice(0, 5).map((list) => (
                  <li key={list.id}>
                    <Link
                      to={`/purchase/lists/${list.id}`}
                      className="block rounded-lg bg-slate-800/50 p-3 hover:bg-slate-800"
                    >
                      <p className="font-medium">{list.name}</p>
                      <p className="text-xs text-slate-400">{formatDate(list.created_at)}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default PurchaseDashboardPage;
