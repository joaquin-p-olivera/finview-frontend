import api from "../api/client";
import { useAuthStore } from "../store/authStore";
import { readJson, writeJson, newId } from "./storage";

// Writes made from the supermarket (adding, editing or removing cart items,
// ticking list items) are applied on screen right away and queued here. The
// queue lives in localStorage, so it survives closing the tab, and is sent in
// order whenever there is a connection. Each queued write keeps the same
// Idempotency-Key across attempts, and cart items carry an id generated here,
// so a write whose response was lost is never applied twice.

const OUTBOX_KEY = "outbox";
const RETRY_DELAYS_MS = [2000, 5000, 10000, 20000, 30000];
// Statuses that will never succeed by retrying: the write is dropped and the
// screen goes back to what the server has.
const PERMANENT_STATUSES = [400, 404, 409, 422];

let ops = readJson(OUTBOX_KEY, []);
let syncing = false;
let failures = 0;
let retryTimer = null;
let lastError = null;
let lastFailure = null;
const listeners = new Set();
const syncedListeners = new Set();
const sentListeners = new Set();
let currentFlush = null;

const persist = () => writeJson(OUTBOX_KEY, ops.length ? ops : null);

const notify = () => listeners.forEach((listener) => listener());

let snapshot = null;
const buildSnapshot = () => ({ ops, syncing, lastError, lastFailure, online: navigator.onLine });

export const getOutboxState = () => {
  if (!snapshot) snapshot = buildSnapshot();
  return snapshot;
};

const changed = () => {
  snapshot = null;
  notify();
};

export const subscribeOutbox = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

// Called after the queue empties, so pages can reload what the server has.
export const onOutboxSynced = (listener) => {
  syncedListeners.add(listener);
  return () => syncedListeners.delete(listener);
};

// Called with each write the server accepted, so pages can apply it to their
// copy of the server's data without waiting for a full reload.
export const onOutboxOpSent = (listener) => {
  sentListeners.add(listener);
  return () => sentListeners.delete(listener);
};

export const enqueue = (op) => {
  ops = [...ops, { id: newId(), createdAt: Date.now(), ...op }];
  persist();
  changed();
  flushOutbox();
};

export const clearLastFailure = () => {
  lastFailure = null;
  changed();
};

const scheduleRetry = () => {
  clearTimeout(retryTimer);
  const delay = RETRY_DELAYS_MS[Math.min(failures, RETRY_DELAYS_MS.length - 1)];
  failures += 1;
  retryTimer = setTimeout(flushOutbox, delay);
};

const send = (op) =>
  api.request({
    method: op.method,
    url: op.url,
    data: op.data,
    __idempotencyKey: op.id,
  });

const isAlreadyDone = (op, status) => op.method === "delete" && status === 404;

// Resolves once the queue is empty or sending stopped on a connection error.
export const flushOutbox = () => {
  if (currentFlush) return currentFlush;
  if (ops.length === 0) return Promise.resolve();
  currentFlush = runFlush().finally(() => {
    currentFlush = null;
  });
  return currentFlush;
};

const OFFLINE_MESSAGE = "Sin conexión con el servidor. Los cambios se guardan en el teléfono y se envían solos.";

const runFlush = async () => {
  if (!navigator.onLine) {
    // No point waiting for timeouts; the "online" event sends it.
    lastError = OFFLINE_MESSAGE;
    changed();
    scheduleRetry();
    return;
  }
  syncing = true;
  clearTimeout(retryTimer);
  changed();

  while (ops.length > 0) {
    const op = ops[0];
    try {
      const response = await send(op);
      sentListeners.forEach((listener) => listener(op, response.data));
    } catch (err) {
      const status = err.response?.status;
      if (isAlreadyDone(op, status)) {
        // Deleting something that's already gone counts as done.
        sentListeners.forEach((listener) => listener(op, null));
      } else if (PERMANENT_STATUSES.includes(status)) {
        const detail = err.response?.data?.detail;
        lastFailure = `No se pudo guardar "${op.label || "un cambio"}"${typeof detail === "string" ? `: ${detail}` : ""}.`;
      } else {
        // No connection, timeout, server error or expired session: keep the
        // write and try again later.
        lastError = status === 401
          ? "La sesión expiró. Volvé a iniciar sesión para enviar los cambios pendientes."
          : OFFLINE_MESSAGE;
        syncing = false;
        changed();
        scheduleRetry();
        return;
      }
    }
    ops = ops.slice(1);
    persist();
    lastError = null;
    failures = 0;
    changed();
  }

  syncing = false;
  changed();
  syncedListeners.forEach((listener) => listener());
};

// Try again as soon as the phone says it's back online or the app comes back
// to the foreground (iOS pauses timers in background tabs).
if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    failures = 0;
    changed();
    flushOutbox();
  });
  window.addEventListener("offline", changed);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") flushOutbox();
  });
  flushOutbox();

  // Logging back in after an expired session sends what's queued. The queue
  // is kept across logouts on purpose: losing the products added without
  // signal is worse, and writes for another account's cart just get a 404
  // from the API and are dropped.
  useAuthStore.subscribe((state, prev) => {
    if (state.accessToken && state.accessToken !== prev.accessToken) {
      failures = 0;
      flushOutbox();
    }
  });
}

export const pendingFor = (predicate) => ops.filter(predicate);

