import { useEffect, useState } from "react";
import { askAboutPurchases, getPurchaseAskStatus } from "../../api/purchase";
import { getErrorMessage } from "../../api/client";

const EXAMPLES = [
  "¿Cuánto gasté en carne este año vs el año pasado?",
  "¿En qué súper está más barata la leche?",
  "¿Qué productos subieron más de precio en los últimos 3 meses?",
];
const MAX_LENGTH = 500;

function AnswerTable({ table }) {
  return (
    // Scrolls sideways on its own so a wide table never widens the page on a phone.
    <div className="mt-3 overflow-x-auto rounded-lg border border-slate-800">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-800/60 text-xs text-slate-400">
          <tr>
            {table.columns.map((column, i) => (
              <th key={i} className="whitespace-nowrap px-3 py-2 font-medium">{column}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {table.rows.map((row, i) => (
            <tr key={i}>
              {row.map((value, j) => (
                <td key={j} className={`whitespace-nowrap px-3 py-2 ${j > 0 ? "tabular-nums" : ""}`}>{value}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Answer({ item }) {
  return (
    <div>
      <p className="text-sm text-slate-400">{item.question}</p>
      <p className="mt-1 whitespace-pre-line text-slate-100">{item.answer}</p>
      {item.table && <AnswerTable table={item.table} />}
    </div>
  );
}

// "Preguntale a tus compras": a question in plain language, answered by
// Claude from the user's completed carts (POST /purchase/ask). Hidden when
// the backend has no Claude key.
function PurchaseAskCard() {
  const [status, setStatus] = useState(null);
  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    getPurchaseAskStatus().then(setStatus).catch(() => setStatus(null));
  }, []);

  if (!status?.enabled) return null;

  const [latest, ...previous] = status.history;
  const remaining = status.remaining_today;

  const ask = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || asking) return;
    setQuestion(trimmed);
    setAsking(true);
    setError(null);
    try {
      const result = await askAboutPurchases(trimmed);
      const { remaining_today, ...item } = result;
      setStatus((s) => ({ ...s, remaining_today, history: [item, ...s.history] }));
      setQuestion("");
    } catch (err) {
      setError(getErrorMessage(err, "No se pudo responder la pregunta"));
      if (err?.response?.status === 429) setStatus((s) => ({ ...s, remaining_today: 0 }));
    } finally {
      setAsking(false);
    }
  };

  return (
    <section className="mb-6 rounded-xl border border-indigo-900/60 bg-indigo-950/20 p-4 sm:p-6">
      <h2 className="text-lg font-medium">Preguntale a tus compras</h2>
      <p className="mt-1 text-sm text-slate-400">
        Escribí una pregunta y Claude la responde con tus carritos finalizados.
      </p>

      <form
        className="mt-4 flex flex-col gap-2 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          ask(question);
        }}
      >
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          maxLength={MAX_LENGTH}
          disabled={asking || remaining === 0}
          placeholder="¿Cuánto gasté en verduras el mes pasado?"
          className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-500 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={asking || remaining === 0 || !question.trim()}
          className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-400 disabled:opacity-50"
        >
          {asking ? "Pensando..." : "Preguntar"}
        </button>
      </form>

      {!latest && !asking && (
        <div className="mt-3 flex flex-wrap gap-2">
          {EXAMPLES.map((example) => (
            <button
              key={example}
              onClick={() => ask(example)}
              disabled={remaining === 0}
              className="rounded-full border border-slate-700 px-3 py-1 text-left text-xs text-slate-300 hover:border-indigo-400 hover:text-indigo-300 disabled:opacity-50"
            >
              {example}
            </button>
          ))}
        </div>
      )}

      <p className="mt-2 text-xs text-slate-500">
        {remaining === 0
          ? "Llegaste al límite de preguntas de hoy. Mañana podés seguir."
          : `Te ${remaining === 1 ? "queda 1 pregunta" : `quedan ${remaining} preguntas`} hoy.`}
      </p>

      {asking && <p className="mt-4 text-sm text-slate-400">Revisando tus compras...</p>}
      {error && <p className="mt-4 text-sm text-rose-300">{error}</p>}

      {latest && (
        <div className="mt-4 rounded-lg border border-slate-800 bg-slate-900/60 p-4">
          <Answer item={latest} />
        </div>
      )}

      {previous.length > 0 && (
        <details className="mt-4">
          <summary className="cursor-pointer text-sm text-indigo-400 hover:text-indigo-300">
            Preguntas anteriores ({previous.length})
          </summary>
          <ul className="mt-3 space-y-4">
            {previous.map((item) => (
              <li key={item.id} className="border-t border-slate-800 pt-3">
                <Answer item={item} />
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}

export default PurchaseAskCard;
