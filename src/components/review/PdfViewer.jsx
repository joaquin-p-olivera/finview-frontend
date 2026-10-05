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
      <div className="flex h-full w-full items-center justify-center rounded-xl border border-slate-800 bg-slate-900 p-6 text-center text-xs text-slate-400">
        Finview no guarda el PDF. Para compararlo con el parseo, abrilo desde tu dispositivo.
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
      {src && <iframe title="Estado de cuenta PDF" src={src} className="h-full w-full" />}
    </div>
  );
}

export default PdfViewer;
