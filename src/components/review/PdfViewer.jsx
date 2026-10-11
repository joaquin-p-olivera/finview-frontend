import { useEffect, useState } from "react";

// Shows the PDF the user just uploaded, straight from their browser: the API
// doesn't keep the file once it's parsed.
function PdfViewer({ file }) {
  const [src, setSrc] = useState(null);

  useEffect(() => {
    if (!file) return undefined;
    const url = URL.createObjectURL(file);
    setSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  if (!file) {
    return (
      <p className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-xs text-slate-400">
        <svg
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
          className="h-4 w-4 shrink-0 text-slate-500"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z"
            clipRule="evenodd"
          />
        </svg>
        Finview no guarda el PDF. Para compararlo con el parseo, abrilo desde tu dispositivo.
      </p>
    );
  }

  return (
    <div className="h-full w-full overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
      {src && <iframe title="Estado de cuenta PDF" src={src} className="h-full w-full" />}
    </div>
  );
}

export default PdfViewer;
