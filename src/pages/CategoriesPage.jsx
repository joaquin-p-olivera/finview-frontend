import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { listCategories, createCategory, deleteCategory } from "../api/categories";
import AppHeader from "../components/common/AppHeader";

function CategoriesPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCategory, setNewCategory] = useState({ name: "", color: "#6366f1" });
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");

  const colors = [
    "#6366f1", "#8b5cf6", "#ec4899", "#f43f5e", "#f97316",
    "#eab308", "#22c55e", "#14b8a6", "#0ea5e9", "#3b82f6",
  ];

  const fetchCategories = async () => {
    try {
      const data = await listCategories();
      setCategories(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newCategory.name.trim()) {
      setError("El nombre es requerido");
      return;
    }
    setIsCreating(true);
    setError("");
    try {
      await createCategory({ name: newCategory.name.trim(), color: newCategory.color });
      setNewCategory({ name: "", color: "#6366f1" });
      fetchCategories();
    } catch (err) {
      setError(err.response?.data?.detail || "Error al crear categoría");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Estás seguro de eliminar esta categoría?")) return;
    try {
      await deleteCategory(id);
      fetchCategories();
    } catch (err) {
      console.error(err);
      alert("No se pudo eliminar la categoría");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <AppHeader
        links={[
          { to: "/dashboard", label: "Dashboard" },
          { to: "/purchase", label: "Compras" },
        ]}
        showUpload
        showLogout
      />

      <main className="mx-auto max-w-3xl px-6 py-8">
        <div className="mb-8">
          <h2 className="mb-2 text-2xl font-semibold">Categorías</h2>
          <p className="text-sm text-slate-400">
            Gestioná las categorías para clasificar tus gastos.
          </p>
        </div>

        <form onSubmit={handleCreate} className="mb-8 rounded-xl border border-slate-800 bg-slate-900/60 p-6">
          <h3 className="mb-4 text-lg font-medium">Nueva categoría</h3>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Nombre de la categoría"
              value={newCategory.name}
              onChange={(e) => setNewCategory((prev) => ({ ...prev, name: e.target.value }))}
              className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-hidden"
            />
            <div className="flex gap-2">
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setNewCategory((prev) => ({ ...prev, color: c }))}
                  className={`h-9 w-9 rounded-full transition-transform ${
                    newCategory.color === c ? "scale-110 ring-2 ring-white" : ""
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <button
              type="submit"
              disabled={isCreating}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
            >
              {isCreating ? "Agregando..." : "Agregar"}
            </button>
          </div>
          {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
        </form>

        {loading ? (
          <p className="text-center text-slate-400">Cargando...</p>
        ) : categories.length === 0 ? (
          <p className="text-center text-slate-400">
            No tenés categorías. Creá una arriba.
          </p>
        ) : (
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-800 bg-slate-900 text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Color</th>
                  <th className="px-4 py-3 font-medium">Nombre</th>
                  <th className="px-4 py-3 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-slate-800/50">
                    <td className="px-4 py-3">
                      <div
                        className="h-6 w-6 rounded-full"
                        style={{ backgroundColor: cat.color || "#6366f1" }}
                      />
                    </td>
                    <td className="px-4 py-3 font-medium">{cat.name}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDelete(cat.id)}
                        className="text-sm text-red-400 hover:text-red-300"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

export default CategoriesPage;
