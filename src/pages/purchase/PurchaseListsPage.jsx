import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import {
  listPurchaseLists,
  createPurchaseList,
  deletePurchaseList,
  getActiveCart,
} from "../../api/purchase";
import LoadingScreen from "../../components/common/LoadingScreen";

function PurchaseListsPage() {
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newListName, setNewListName] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchData = async () => {
    try {
      const data = await listPurchaseLists();
      setLists(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateList = async (e) => {
    e.preventDefault();
    if (!newListName.trim()) return;
    
    setCreating(true);
    try {
      await createPurchaseList({ name: newListName.trim() });
      setNewListName("");
      fetchData();
    } catch (err) {
      alert("Error al crear lista");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteList = async (id) => {
    if (!confirm("¿Eliminar esta lista?")) return;
    try {
      await deletePurchaseList(id);
      fetchData();
    } catch (err) {
      alert("Error al eliminar lista");
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("es-UY", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <header className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
        <Link to="/purchase" className="text-lg font-semibold hover:text-indigo-400">← Volver</Link>
        <div className="flex items-center gap-3 text-sm">
          <button
            onClick={logout}
            className="rounded-md border border-slate-700 px-3 py-1 text-xs text-slate-300 hover:bg-slate-800"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-8">
        <div className="mb-8">
          <h1 className="mb-1 text-3xl font-bold">Apuntes de Compras</h1>
          <p className="text-slate-400">Planificá lo que necesitás comprar</p>
        </div>

        {/* Create List Form */}
        <form onSubmit={handleCreateList} className="mb-8 flex gap-3">
          <input
            type="text"
            placeholder="Nombre de la lista"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-hidden"
            required
          />
          <button
            type="submit"
            disabled={creating}
            className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-400 disabled:opacity-50"
          >
            {creating ? "Creando..." : "Crear Lista"}
          </button>
        </form>

        {/* Lists */}
        {lists.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-8 text-center text-slate-400">
            No tenés listas de compras. Creá una arriba.
          </div>
        ) : (
          <ul className="space-y-3">
            {lists.map((list) => (
              <li
                key={list.id}
                className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-4"
              >
                <Link to={`/purchase/lists/${list.id}`} className="flex-1">
                  <p className="font-medium text-lg">{list.name}</p>
                  <p className="text-sm text-slate-400">Creada {formatDate(list.created_at)}</p>
                </Link>
                <button
                  onClick={() => handleDeleteList(list.id)}
                  className="rounded-lg px-3 py-1 text-sm text-red-400 hover:bg-slate-800"
                >
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}

export default PurchaseListsPage;
