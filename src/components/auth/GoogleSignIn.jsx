import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchMe, googleLoginRequest } from "../../api/auth";
import { useAuthStore } from "../../store/authStore";
import { useSlowHint, SLOW_HINT_TEXT } from "../common/LoadingScreen";

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const SCRIPT_URL = "https://accounts.google.com/gsi/client";

let scriptPromise;

// Google Identity Services, loaded once and only on the pages that show the button
const loadGoogleScript = () => {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = SCRIPT_URL;
      script.async = true;
      script.onload = resolve;
      script.onerror = () => {
        scriptPromise = undefined;
        reject(new Error("Google script"));
      };
      document.head.appendChild(script);
    });
  }
  return scriptPromise;
};

// "Continuar con Google" button plus an "o" divider above the email form. Signs in,
// or creates the account and goes to the onboarding. Hidden without VITE_GOOGLE_CLIENT_ID.
function GoogleSignIn() {
  const navigate = useNavigate();
  const setToken = useAuthStore((s) => s.setToken);
  const setUser = useAuthStore((s) => s.setUser);
  const buttonRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const slow = useSlowHint(loading);

  useEffect(() => {
    if (!CLIENT_ID) return undefined;
    let cancelled = false;

    const onCredential = async ({ credential }) => {
      setError("");
      setLoading(true);
      try {
        const token = await googleLoginRequest(credential);
        setToken(token.access_token);
        const me = await fetchMe();
        setUser(me);
        navigate(token.is_new_user ? "/onboarding" : "/", { replace: true });
      } catch (err) {
        console.error(err);
        setToken(null);
        setError(err.response?.data?.detail || "No se pudo entrar con Google. Probá de nuevo.");
        setLoading(false);
      }
    };

    loadGoogleScript()
      .then(() => {
        if (cancelled || !buttonRef.current) return;
        window.google.accounts.id.initialize({ client_id: CLIENT_ID, callback: onCredential });
        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: "filled_black",
          size: "large",
          shape: "pill",
          text: "continue_with",
          locale: "es",
          width: Math.min(buttonRef.current.offsetWidth || 320, 400)
        });
      })
      .catch(() => {
        if (!cancelled) setError("No se pudo cargar el botón de Google.");
      });

    return () => {
      cancelled = true;
    };
  }, [navigate, setToken, setUser]);

  if (!CLIENT_ID) return null;

  return (
    <div className="mb-6">
      <div ref={buttonRef} className={`flex min-h-10 w-full justify-center ${loading ? "pointer-events-none opacity-60" : ""}`} />
      {loading && (
        <p className="mt-2 text-center text-xs text-slate-400">
          {slow ? SLOW_HINT_TEXT : "Entrando con Google..."}
        </p>
      )}
      {error && <p className="mt-2 text-center text-xs text-red-400">{error}</p>}
      <div className="mt-6 flex items-center gap-3 text-xs text-slate-500">
        <span className="h-px flex-1 bg-slate-800" />o con tu email
        <span className="h-px flex-1 bg-slate-800" />
      </div>
    </div>
  );
}

export default GoogleSignIn;
