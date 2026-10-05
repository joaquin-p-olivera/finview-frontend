import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { uploadStatement, getStatementStatus } from "../api/statements";
import { getErrorMessage } from "../api/client";

function UploadPage() {
  const [file, setFile] = useState(null);
  const [password, setPassword] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (f && f.type !== "application/pdf") {
      setError("Solo se permiten archivos PDF.");
      setFile(null);
      return;
    }
    setError("");
    setFile(f || null);
  };

  const pollStatus = async (id) => {
    let attempts = 0;
    const maxAttempts = 150; // 5 minutos aprox si llamamos cada 2s (un PDF largo puede tardar)

    const interval = setInterval(async () => {
      attempts += 1;
      try {
        const status = await getStatementStatus(id);
        if (status.status === "pending_review") {
          clearInterval(interval);
          setIsUploading(false);
          navigate(`/review/${id}`, { replace: true, state: { file } });
        } else if (status.status === "error") {
          clearInterval(interval);
          setIsUploading(false);
          setError(status.error_message || "Hubo un error al procesar el PDF.");
        } else if (attempts >= maxAttempts) {
          clearInterval(interval);
          setIsUploading(false);
          setError("El parseo está tardando demasiado. Probá nuevamente más tarde.");
        }
      } catch (err) {
        console.error(err);
        clearInterval(interval);
        setIsUploading(false);
        setError("No se pudo consultar el estado del parseo.");
      }
    }, 2000);
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Seleccioná un PDF para continuar.");
      return;
    }
    setIsUploading(true);
    setError("");
    try {
      const stmt = await uploadStatement(file, password);
      await pollStatus(stmt.id);
    } catch (err) {
      console.error(err);
      setIsUploading(false);
      setError(getErrorMessage(err, "No se pudo subir el archivo. Verificá el tamaño y el formato."));
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <main className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-10">
        <div>
          <h1 className="text-2xl font-semibold">Subir estado de cuenta</h1>
          <p className="mt-1 text-sm text-slate-400">
            Arrastrá un PDF de tu banco o selecciónalo para que Finview lo analice con IA.
            El PDF no se guarda: se usa solo para leer las transacciones.
          </p>
        </div>
        <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/60 p-8">
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="block w-full text-sm text-slate-300 file:mr-4 file:rounded-md file:border-0 file:bg-indigo-500 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-indigo-400"
            />
            {file && (
              <p className="text-xs text-slate-400">
                Archivo seleccionado: <span className="font-medium">{file.name}</span>
              </p>
            )}
            <label className="flex w-full max-w-xs flex-col gap-1 text-left text-xs text-slate-400">
              Contraseña del PDF (solo si tiene)
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="off"
                placeholder="Ej. tu cédula, para Santander"
                className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
              />
            </label>
            {error && <p className="text-xs text-red-400">{error}</p>}
            <button
              type="button"
              onClick={handleUpload}
              disabled={isUploading || !file}
              className="mt-2 inline-flex items-center justify-center rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white shadow-xs hover:bg-indigo-400 disabled:opacity-60"
            >
              {isUploading ? "Parseando con IA..." : "Parsear con IA"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default UploadPage;

