import { useEffect, useState } from "react";

// After this long, a load is most likely waiting for the API to wake up from
// Render's free-tier sleep, so tell the user instead of showing a bare spinner.
const SLOW_AFTER_MS = 5000;

export const useSlowHint = (active) => {
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    if (!active) {
      setSlow(false);
      return undefined;
    }
    const timer = setTimeout(() => setSlow(true), SLOW_AFTER_MS);
    return () => clearTimeout(timer);
  }, [active]);

  return slow;
};

export const SLOW_HINT_TEXT = "El servidor se está despertando, puede tardar hasta un minuto...";

function LoadingScreen({ text = "Cargando..." }) {
  const slow = useSlowHint(true);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col items-center justify-center gap-2 px-6 text-center">
      <p className="text-slate-400">{text}</p>
      {slow && <p className="text-xs text-slate-500">{SLOW_HINT_TEXT}</p>}
    </div>
  );
}

export default LoadingScreen;
