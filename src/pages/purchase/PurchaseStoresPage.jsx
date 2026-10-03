import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  listPurchaseStores,
  createPurchaseStore,
  updatePurchaseStore,
  deletePurchaseStore,
} from "../../api/purchase";

function PurchaseStoresPage() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");

  const fetchStores = async () => {
    try {
      const data = await listPurchaseStores();
      setStores(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setIsCreating(true);
    try {
      await createPurchaseStore({ name: newName.trim() });
      setNewName("");
      fetchStores();
    } catch (err) {
      alert(err.response?.data?.detail || "Error al crear supermercado");
    } finally {
      setIsCreating(false);
    }
  };

  const startEditing = (store) => {
    setEditingId(store.id);
    setEditingName(store.name);
  };

  const handleRename = async (e) => {
    e.preventDefault();
    if (!editingName.trim()) return;
    try {
      await updatePurchaseStore(editingId, { name: editingName.trim() });
      setEditingId(null);
      fetchStores();
    } catch (err) {
      alert(err.response?.data?.detail || "No se pudo renombrar el supermercado");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar este supermercado? Los carritos anteriores conservan su nombre.")) return;
    try {
      await deletePurchaseStore(id);
      fetchStores();
    } catch (err) {
      alert("No se pudo eliminar el supermercado");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <header className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
        <Link to="/purchase" className="text-lg font-semibold hover:text-indigo-400">← Volver</Link>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-2xl font-semibold">Supermercados</h1>
          <p className="text-sm text-slate-400">
            Los supermercados que elegís al iniciar un carrito. Si renombrás uno, también se renombran sus carritos.
          </p>
        </div>

        <form onSubmit={handleCreate} className="mb-8 rounded-xl border border-slate-800 bg-slate-900/60 p-6">
          <h3 className="mb-4 text-lg font-medium">Nuevo supermercado</h3>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Nombre del supermercado"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-hidden"
            />
            <button
              type="submit"
              disabled={isCreating || !newName.trim()}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
            >
              {isCreating ? "Agregando..." : "Agregar"}
            </button>
          </div>
        </form>

        {loading ? (
          <p className="text-center text-slate-400">Cargando...</p>
        ) : stores.length === 0 ? (
          <p className="text-center text-slate-400">
            No tenés supermercados. Agregá uno arriba o iniciá un carrito.
          </p>
        ) : (
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
            <ul className="divide-y divide-slate-800 text-sm">
              {stores.map((store) => (
                <li key={store.id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800/50">
                  {editingId === store.id ? (
                    <form onSubmit={handleRename} className="flex flex-1 items-center gap-3">
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        autoFocus
                        className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm text-white focus:border-indigo-500 focus:outline-hidden"
                      />
                      <button
                        type="submit"
                        disabled={!editingName.trim()}
                        className="text-sm text-emerald-400 hover:text-emerald-300 disabled:opacity-50"
                      >
                        Guardar
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="text-sm text-slate-400 hover:text-slate-300"
                      >
                        Cancelar
                      </button>
                    </form>
                  ) : (
                    <>
                      <span className="flex-1 font-medium">{store.name}</span>
                      <button
                        onClick={() => startEditing(store)}
                        className="text-sm text-indigo-400 hover:text-indigo-300"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(store.id)}
                        className="text-sm text-red-400 hover:text-red-300"
                      >
                        Eliminar
                      </button>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}

export default PurchaseStoresPage;
