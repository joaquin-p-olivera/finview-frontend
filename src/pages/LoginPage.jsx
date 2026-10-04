import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { loginRequest, fetchMe } from "../api/auth";
import { useAuthStore } from "../store/authStore";
import { useSlowHint, SLOW_HINT_TEXT } from "../components/common/LoadingScreen";

const schema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres")
});

function LoginPage() {
  const navigate = useNavigate();
  const setToken = useAuthStore((s) => s.setToken);
  const setUser = useAuthStore((s) => s.setUser);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(schema)
  });
  const slow = useSlowHint(isSubmitting);

  const onSubmit = async (values) => {
    try {
      const token = await loginRequest(values);
      setToken(token.access_token);
      const me = await fetchMe();
      setUser(me);
      navigate("/", { replace: true });
    } catch (err) {
      console.error(err);
      alert("No se pudo iniciar sesión. Verificá tus datos.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950">
      <div className="w-full max-w-md rounded-2xl bg-slate-900/70 p-8 shadow-xl shadow-slate-900/70 border border-slate-800">
        <h1 className="mb-2 text-2xl font-semibold text-slate-50">Entrar a Finview</h1>
        <p className="mb-6 text-sm text-slate-400">
          Analizá tus gastos con estados de cuenta y IA.
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-200">Email</label>
            <input
              type="email"
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 placeholder-slate-500 focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/40"
              placeholder="tu@email.com"
              {...register("email")}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-200">Contraseña</label>
            <input
              type="password"
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 placeholder-slate-500 focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/40"
              placeholder="********"
              {...register("password")}
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 inline-flex w-full items-center justify-center rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white shadow-xs hover:bg-indigo-400 disabled:opacity-60"
          >
            {isSubmitting ? "Ingresando..." : "Ingresar"}
          </button>
          {slow && (
            <p className="text-center text-xs text-slate-400">{SLOW_HINT_TEXT}</p>
          )}
        </form>
        <p className="mt-4 text-center text-xs text-slate-400">
          ¿No tenés cuenta?{" "}
          <Link to="/register" className="font-medium text-indigo-400 hover:text-indigo-300">
            Crear cuenta
          </Link>
        </p>
        <p className="mt-2 text-center text-xs text-slate-400">
          <Link to="/help" className="hover:text-slate-200">
            ¿Qué es Finview?
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;

