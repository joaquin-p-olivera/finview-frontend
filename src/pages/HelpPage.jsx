import { Link } from "react-router-dom";
import AppHeader from "../components/common/AppHeader";
import Logo from "../components/common/Logo";
import { useAuthStore } from "../store/authStore";

// What Finview is and how to use each part of it. Public, so it can be read
// from the login page too; the links to the pages only work once logged in.
const SECTIONS = [
  { id: "que-es", title: "Qué es Finview" },
  { id: "primeros-pasos", title: "Primeros pasos" },
  { id: "estados", title: "Subir un estado de cuenta" },
  { id: "dashboard", title: "Dashboard" },
  { id: "reportes", title: "Reportes" },
  { id: "transacciones", title: "Transacciones" },
  { id: "categorias", title: "Categorías de gastos" },
  { id: "compras", title: "Compras: carritos y listas" },
  { id: "supermercados", title: "Supermercados" },
  { id: "productos", title: "Productos y categorización con IA" },
  { id: "analisis", title: "Análisis de compras" },
  { id: "sin-conexion", title: "Usarla sin conexión" },
];

function Section({ id, title, children }) {
  return (
    <section
      id={id}
      className="scroll-mt-6 rounded-xl border border-slate-800 bg-slate-900/60 p-5 md:p-6"
    >
      <h2 className="mb-3 text-lg font-semibold">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-slate-300">{children}</div>
    </section>
  );
}

function PageLink({ to, children }) {
  return (
    <Link to={to} className="font-medium text-indigo-400 hover:text-indigo-300">
      {children}
    </Link>
  );
}

function Steps({ children }) {
  return <ol className="list-decimal space-y-1.5 pl-5">{children}</ol>;
}

function Bullets({ children }) {
  return <ul className="list-disc space-y-1.5 pl-5">{children}</ul>;
}

function HelpPage() {
  const isAuthenticated = useAuthStore((s) => !!s.accessToken);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      {isAuthenticated ? (
        <AppHeader
          links={[
            { to: "/dashboard", label: "Dashboard" },
            { to: "/transactions", label: "Transacciones" },
            { to: "/reports", label: "Reportes" },
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

      <main className="mx-auto max-w-3xl px-4 py-8 md:px-6">
        <h1 className="text-2xl font-semibold">Ayuda</h1>
        <p className="mt-2 text-sm text-slate-400">
          Qué es Finview, qué podés hacer con ella y cómo usar cada parte.
        </p>

        <nav
          aria-label="Contenido de la ayuda"
          className="mt-6 rounded-xl border border-slate-800 bg-slate-900/40 p-4"
        >
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
            Contenido
          </p>
          <ul className="grid gap-1 text-sm sm:grid-cols-2">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="text-slate-300 hover:text-white">
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-6 space-y-4">
          <Section id="que-es" title="Qué es Finview">
            <p>
              Finview es una app de finanzas personales con dos partes que se usan por separado:
            </p>
            <Bullets>
              <li>
                <strong className="text-slate-100">Gastos de la tarjeta.</strong> Subís el PDF del
                estado de cuenta de tu banco, una IA lee las transacciones y las categoriza, y vos
                ves en qué se va la plata: por categoría, por mes, por banco y por comercio, en
                pesos y en dólares por separado.
              </li>
              <li>
                <strong className="text-slate-100">Compras del súper.</strong> Anotás lo que vas
                metiendo al carrito con su precio mientras comprás. Con el tiempo Finview arma tu
                historial de productos y precios, los categoriza con IA y te muestra cuánto gastás
                en cada cosa, qué subió y en qué supermercado conviene.
              </li>
            </Bullets>
          </Section>

          <Section id="primeros-pasos" title="Primeros pasos">
            <Steps>
              <li>
                Creá una cuenta en <PageLink to="/register">Crear cuenta</PageLink> o entrá con la
                tuya.
              </li>
              <li>
                Al crear la cuenta elegís unas categorías iniciales (Comida, Transporte,
                Combustible…). Después podés agregar o borrar las que quieras.
              </li>
              <li>
                Subí tu primer estado de cuenta con el botón{" "}
                <strong className="text-slate-100">Subir estado</strong> del encabezado.
              </li>
            </Steps>
            <p>
              Si la app estuvo un rato sin usarse, la primera carga puede tardar un poco más de lo
              normal.
            </p>
          </Section>

          <Section id="estados" title="Subir un estado de cuenta">
            <Steps>
              <li>
                En <PageLink to="/upload">Subir estado</PageLink> elegí el PDF del estado de cuenta
                y tocá <strong className="text-slate-100">Parsear con IA</strong>.
              </li>
              <li>
                La IA lee el PDF y te lleva a la pantalla de revisión. Ahí ves el PDF al lado de la
                tabla de transacciones: fecha, descripción, comercio, monto, moneda y categoría.
              </li>
              <li>
                Corregí lo que haga falta (por ejemplo la categoría), borrá las filas que sobren y
                tocá <strong className="text-slate-100">Confirmar y guardar</strong>. Recién ahí las
                transacciones cuentan en el dashboard y los reportes.
              </li>
            </Steps>
            <p>
              Si tocás <strong className="text-slate-100">Cancelar</strong> en la revisión, el estado
              de cuenta se descarta. Solo se aceptan archivos PDF.
            </p>
          </Section>

          <Section id="dashboard" title="Dashboard">
            <p>
              El <PageLink to="/dashboard">Dashboard</PageLink> resume tus gastos confirmados:
              cuántas transacciones y estados de cuenta tenés, lo gastado este mes y el anterior,
              gastos por mes, por categoría, por banco, los comercios donde más gastás y la tendencia
              de los últimos 30 días.
            </p>
            <Bullets>
              <li>
                El selector <strong className="text-slate-100">UYU / USD</strong> cambia todos los
                gráficos y totales a una moneda; pesos y dólares nunca se suman.
              </li>
              <li>
                En categoría, banco y comercios podés elegir entre{" "}
                <strong className="text-slate-100">Último mes</strong> y{" "}
                <strong className="text-slate-100">Todo</strong>.
              </li>
              <li>
                Si hay gastos sin categoría, aparecen como aviso aparte con un link para
                revisarlos.
              </li>
            </Bullets>
          </Section>

          <Section id="reportes" title="Reportes">
            <p>
              En <PageLink to="/reports">Reportes</PageLink> elegís un estado de cuenta confirmado y
              ves, para pesos y dólares por separado, el total del estado de cuenta, una torta por
              categoría y una tabla con lo que suma cada categoría y su porcentaje. Los otros cargos
              que no son compras (seguro, intereses, comisiones) van en una fila aparte.
            </p>
          </Section>

          <Section id="transacciones" title="Transacciones">
            <p>
              <PageLink to="/transactions">Transacciones</PageLink> lista todos tus gastos
              confirmados, de a 20 por página. Podés buscar por descripción, filtrar por fechas,
              borrar una transacción y descargar la página que estás viendo con{" "}
              <strong className="text-slate-100">Exportar CSV</strong>.
            </p>
          </Section>

          <Section id="categorias" title="Categorías de gastos">
            <p>
              En <PageLink to="/categories">Categorías</PageLink> (desde{" "}
              <strong className="text-slate-100">Editar categorías</strong> en el dashboard) creás
              categorías con nombre y color, y borrás las que no uses. Son las que se eligen al
              revisar un estado de cuenta. Las categorías de compras del súper son otras y se
              manejan aparte.
            </p>
          </Section>

          <Section id="compras" title="Compras: carritos y listas">
            <p>
              <PageLink to="/purchase">Compras</PageLink> es para anotar lo que comprás en el
              supermercado.
            </p>
            <Steps>
              <li>
                Elegí el supermercado y tocá{" "}
                <strong className="text-slate-100">Iniciar Carrito</strong>.
              </li>
              <li>
                Por cada producto que metés al carrito, escribí el nombre, el precio y la cantidad
                (un número entero de unidades). Mientras escribís, Finview sugiere productos que ya
                compraste con su categoría y último precio; elegir uno ya trae su categoría.
              </li>
              <li>
                Al terminar tocá <strong className="text-slate-100">Finalizar Compra</strong>. El
                carrito pasa al <strong className="text-slate-100">Historial de Carritos</strong>,
                donde se puede ver pero ya no editar.
              </li>
            </Steps>
            <p>
              En <PageLink to="/purchase/lists">Listas</PageLink> planificás lo que tenés que
              comprar. Dentro del súper, al marcar un item de la lista ponés precio y cantidad y se
              agrega al carrito actual.
            </p>
          </Section>

          <Section id="supermercados" title="Supermercados">
            <p>
              El supermercado de cada carrito se elige de una lista (los más usados primero) o con{" "}
              <strong className="text-slate-100">+ Agregar nuevo…</strong>, así todos los carritos
              del mismo lugar tienen el mismo nombre. En{" "}
              <PageLink to="/purchase/stores">Supermercados</PageLink> agregás, renombrás o borrás
              supermercados. Renombrar uno renombra también sus carritos; borrarlo no les cambia el
              nombre a los carritos anteriores.
            </p>
          </Section>

          <Section id="productos" title="Productos y categorización con IA">
            <p>
              <PageLink to="/purchase/products">Productos</PageLink> agrupa todo lo que compraste
              por producto y por categoría, con cuántas veces lo compraste, el último precio y dónde,
              y el rango de precios.
            </p>
            <Bullets>
              <li>
                <strong className="text-slate-100">Agrupar historial</strong> junta en productos las
                compras anotadas antes de que existiera esta página. Alcanza con usarlo una vez.
              </li>
              <li>
                Al cambiar la categoría de un producto, cambia en todas sus compras.
              </li>
              <li>
                Si dos productos son el mismo (por ejemplo escritos distinto), usá{" "}
                <strong className="text-slate-100">Unir con…</strong> para juntarlos.
              </li>
              <li>
                <strong className="text-slate-100">Categorizar con IA</strong> le pide a Claude que
                categorice todos los productos sin categoría, usando tus categorías o creando
                nuevas. Las categorías que eligió la IA llevan la etiqueta{" "}
                <strong className="text-slate-100">IA</strong>, y podés cambiarlas cuando quieras.
              </li>
              <li>
                La IA también deja sugerencias en algunos productos para que las confirmes o
                descartes, como “¿es el mismo producto que…?” o una nota si hay precios muy
                distintos.
              </li>
            </Bullets>
            <p>
              Las categorías de compras se editan en{" "}
              <PageLink to="/purchase/categories">Categorías de Compras</PageLink>.
            </p>
          </Section>

          <Section id="analisis" title="Análisis de compras">
            <p>
              <PageLink to="/purchase/analysis">Análisis</PageLink> usa los carritos finalizados de
              los últimos 3, 6 o 12 meses, o de todo el historial, para mostrarte:
            </p>
            <Bullets>
              <li>Cuánto gastaste en el período y en qué categorías, mes a mes y carrito a carrito.</li>
              <li>Lo que más subió y lo que bajó de precio desde la compra anterior.</li>
              <li>La evolución de precio de cada producto, por supermercado.</li>
              <li>
                Tu inflación de supermercado: los mismos productos comparados de un mes al otro.
              </li>
              <li>En qué productos se va la plata.</li>
              <li>
                Dónde conviene: el precio promedio en cada súper de los productos que compraste en
                más de uno.
              </li>
            </Bullets>
            <p>
              Cuantos más carritos anotes, y en más supermercados, más útil se vuelve. Desde ahí
              también se llega a los totales por carrito.
            </p>
          </Section>

          <Section id="sin-conexion" title="Usarla sin conexión">
            <p>
              Adentro del súper muchas veces no hay señal, así que el carrito y las listas funcionan
              sin conexión:
            </p>
            <Bullets>
              <li>
                La app y los últimos datos que cargaste (carrito, listas, categorías y productos)
                quedan guardados en el teléfono y se abren sin internet.
              </li>
              <li>
                Podés agregar, editar y borrar productos del carrito y marcar items de las listas.
                Los cambios sin enviar se marcan como{" "}
                <strong className="text-slate-100">Sin enviar</strong> y un aviso arriba dice
                cuántos quedan.
              </li>
              <li>
                Se envían solos cuando vuelve la conexión, o con{" "}
                <strong className="text-slate-100">Reintentar</strong>.
              </li>
              <li>
                Para finalizar el carrito hace falta conexión y que no queden cambios sin enviar.
              </li>
            </Bullets>
            <p>
              El resto de la app (subir estados de cuenta, dashboard, reportes, análisis) necesita
              conexión.
            </p>
          </Section>
        </div>
      </main>
    </div>
  );
}

export default HelpPage;
