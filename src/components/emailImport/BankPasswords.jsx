import { useCallback, useEffect, useState } from "react";
import { deleteBankPassword, getBankPasswords, saveBankPassword } from "../../api/emailImport";
import { getErrorMessage } from "../../api/client";

const inputClass =
  "w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none";

// Saved PDF passwords per bank, so the email import can open protected
// statements (Santander uses the holder's ID number).
function BankPasswords() {
  const [items, setItems] = useState([]);
  const [bankName, setBankName] = useState("");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setItems(await getBankPasswords());
    } catch (err) {
      setError(getErrorMessage(err, "No se pudieron cargar las contraseñas."));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await saveBankPassword({ bank_name: bankName.trim(), password });
      setBankName("");
      setPassword("");
      await load();
    } catch (err) {
      setError(getErrorMessage(err, "No se pudo guardar la contraseña."));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (item) => {
    if (!window.confirm(`¿Borrar la contraseña de ${item.bank_name}?`)) return;
    try {
      await deleteBankPassword(item.id);
      await load();
    } catch (err) {
      setError(getErrorMessage(err, "No se pudo borrar la contraseña."));
    }
  };

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 text-sm text-slate-300">
      <h3 className="text-base font-medium text-slate-100">PDFs con contraseña</h3>
      <p className="mt-1 text-slate-400">
        Algunos bancos protegen el PDF (Santander usa tu cédula). Guardá la contraseña de cada banco
        y la usamos para abrirlos cuando llegan por mail. Se guarda cifrada y no se puede volver a ver,
        solo reemplazar o borrar.
      </p>

      {items.length > 0 && (
        <ul className="mt-4 divide-y divide-slate-800 rounded-lg border border-slate-800">
          {items.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-3 px-4 py-2">
              <span className="truncate text-slate-100">{item.bank_name}</span>
              <span className="shrink-0 text-xs text-slate-500">••••••••</span>
              <button
                type="button"
                onClick={() => remove(item)}
                className="shrink-0 text-xs text-red-300 hover:text-red-200"
              >
                Borrar
              </button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={submit} className="mt-4 flex flex-col gap-2 sm:flex-row">
        <input
          className={inputClass}
          placeholder="Banco (ej. Santander)"
          value={bankName}
          onChange={(e) => setBankName(e.target.value)}
          maxLength={100}
          required
        />
        <input
          className={inputClass}
          type="password"
          autoComplete="off"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          maxLength={200}
          required
        />
        <button
          type="submit"
          disabled={saving || !bankName.trim() || !password}
          className="shrink-0 rounded-md bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-400 disabled:opacity-60"
        >
          {saving ? "Guardando..." : "Guardar"}
        </button>
      </form>
      <p className="mt-2 text-xs text-slate-500">
        Si ya hay una para ese banco, se reemplaza. El nombre ayuda a probar primero la correcta; si el
        mail no lo menciona, se prueban todas.
      </p>
      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
    </section>
  );
}

export default BankPasswords;
