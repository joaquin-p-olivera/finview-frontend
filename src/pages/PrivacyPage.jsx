import { Link } from "react-router-dom";
import AppHeader from "../components/common/AppHeader";
import Logo from "../components/common/Logo";
import { useAuthStore } from "../store/authStore";

// Privacy policy in plain words. Public: Google's consent screen links here.
// Where people write to; without it the contact box is hidden.
const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL;
// When this text last changed: update it by hand with every change to the policy.
const UPDATED = new Date(2026, 9, 13);
const UPDATED_TEXT = UPDATED.toLocaleDateString("es-UY", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const SECTIONS = [
  {
    title: "Qué guardamos",
    items: [
      "Tu cuenta: email, nombre de usuario y tu contraseña cifrada, que nadie puede leer. Si entrás con Google, guardamos el identificador que Google le da a tu cuenta, tu email, y nada más: nunca vemos tu contraseña de Google.",
      "Tus estados de cuenta ya leídos: banco, período, últimos 4 dígitos de la tarjeta, totales y cada movimiento con su categoría.",
      "Tus compras del súper: carritos, listas, productos, precios, supermercados y categorías.",
      "Si usás el import por mail: el remitente, el asunto y el nombre del archivo de cada mail que procesamos, para mostrarte el historial.",
      "Si guardás contraseñas de PDF por banco: se guardan cifradas y la app nunca te las vuelve a mostrar.",
    ],
  },
  {
    title: "Qué no guardamos",
    items: [
      "Los PDF de tus estados de cuenta: se leen y se descartan; solo quedan los datos que confirmás.",
      "Los mails que reenviás: después de procesarlos se borran de la casilla de import.",
      "No hay publicidad, ni cookies de seguimiento, ni analítica de terceros. El navegador solo guarda tu sesión para que no tengas que entrar cada vez.",
    ],
  },
  {
    title: "Con quién se comparte",
    items: [
      "Anthropic (Claude): recibe el PDF para leerlo y los nombres de tus productos para categorizarlos. Anthropic no usa esos datos para entrenar sus modelos.",
      "Google: solo si elegís “Continuar con Google”, para confirmar quién sos. Y si importás por mail, tus mails llegan a una casilla de Gmail.",
      "Render y Netlify: alojan la base de datos, el servidor y la página.",
      "Resend: envía los avisos por mail cuando llega un estado de cuenta.",
      "No vendemos ni cedemos tus datos a nadie más.",
    ],
  },
  {
    title: "Tus datos son tuyos",
    items: [
      "Podés editar o borrar movimientos, categorías y carritos desde la app, y exportar tus movimientos a CSV en Transacciones.",
      "Podés apagar los avisos por mail desde Importar por mail.",
      "Para borrar tu cuenta con todos sus datos, escribinos y lo hacemos.",
    ],
  },
];

function PrivacyPage() {
  const isAuthenticated = useAuthStore((s) => !!s.accessToken);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      {isAuthenticated ? (
        <AppHeader
          links={[
            { to: "/dashboard", label: "Dashboard" },
            { to: "/reports", label: "Reportes" },
            { to: "/evolution", label: "Evolución" },
            { to: "/purchase", label: "Compras" },
          ]}
          showUpload
          showLogout
        />
      ) : (
        <header className="flex items-center justify-between gap-3 border-b border-slate-800 px-4 py-3 md:px-6 md:py-4">
          <Logo />
          <Link
            to="/login"
            className="rounded-md bg-indigo-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-400"
          >
            Iniciar sesión
          </Link>
        </header>
      )}

      <main className="mx-auto max-w-3xl space-y-5 px-4 py-8 md:px-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Privacidad</h1>
          <p className="mt-2 text-slate-400">
            Finview guarda lo justo para mostrarte en qué se va tu plata, y nada más.
          </p>
          <p className="mt-1 text-xs text-slate-500">Última actualización: {UPDATED_TEXT}</p>
        </div>

        {SECTIONS.map((section) => (
          <section
            key={section.title}
            className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 md:p-6"
          >
            <h2 className="mb-3 font-semibold">{section.title}</h2>
            <ul className="list-disc space-y-2 pl-5 text-sm text-slate-400 marker:text-slate-600">
              {section.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        ))}

        {CONTACT_EMAIL && (
          <section className="rounded-2xl border border-indigo-500/30 bg-indigo-500/10 p-5 md:p-6">
            <h2 className="mb-1 font-semibold">¿Dudas o querés borrar tu cuenta?</h2>
            <p className="text-sm text-slate-400">
              Escribinos a{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-indigo-400 hover:text-indigo-300">
                {CONTACT_EMAIL}
              </a>
              . Si cambia algo de esta página, lo vas a ver acá con la fecha nueva.
            </p>
          </section>
        )}
      </main>
    </div>
  );
}

export default PrivacyPage;
