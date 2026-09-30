import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { seedCategories } from "../api/categories";

const SUGGESTED = [
  { name: "Comida", color: "#22c55e" },
  { name: "Transporte", color: "#0ea5e9" },
  { name: "Combustible", color: "#f97316" },
  { name: "Entretenimiento", color: "#a855f7" },
  { name: "Salud", color: "#ef4444" }
];

function OnboardingPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState(
    SUGGESTED.map((c) => ({ ...c, selected: true }))
  );
  const [isSaving, setIsSaving] = useState(false);

  const toggleCategory = (name) => {
    setCategories((prev) =>
      prev.map((c) => (c.name === name ? { ...c, selected: !c.selected } : c))
    );
  };

  const onSave = async () => {
    const selected = categories.filter((c) => c.selected);
    if (selected.length === 0) {
      alert("Necesitás al menos una categoría para empezar.");
      return;
    }
    setIsSaving(true);
    try {
      await seedCategories(selected.map(({ name, color }) => ({ name, color })));
      navigate("/", { replace: true });
    } catch (err) {
      console.error(err);
      alert("No se pudieron guardar las categorías iniciales.");
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    // En una versión más avanzada podrías consultar si el usuario ya tiene categorías
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950">
      <div className="w-full max-w-xl rounded-2xl bg-slate-900/70 p-8 shadow-xl shadow-slate-900/70 border border-slate-800">
        <h1 className="mb-2 text-2xl font-semibold text-slate-50">
          Configurá tus primeras categorías
        </h1>
        <p className="mb-6 text-sm text-slate-400">
          Elegí cómo querés agrupar tus gastos. Podés cambiar esto más adelante.
        </p>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {categories.map((cat) => (
            <button
              key={cat.name}
              type="button"
              onClick={() => toggleCategory(cat.name)}
              className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm ${
                cat.selected
                  ? "border-emerald-400/70 bg-emerald-500/10 text-emerald-50"
                  : "border-slate-700 bg-slate-900 text-slate-300"
              }`}
            >
              <span>{cat.name}</span>
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: cat.color }}
              />
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={onSave}
          disabled={isSaving}
          className="inline-flex w-full items-center justify-center rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white shadow-xs hover:bg-indigo-400 disabled:opacity-60"
        >
          {isSaving ? "Guardando..." : "Guardar y continuar"}
        </button>
      </div>
    </div>
  );
}

export default OnboardingPage;

