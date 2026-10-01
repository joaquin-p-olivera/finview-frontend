import axios from "axios";
import { useAuthStore } from "../store/authStore";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

if (!apiBaseUrl) {
  throw new Error("VITE_API_BASE_URL is not set. Create a .env file with VITE_API_BASE_URL=http://your-backend-url/api/v1");
}

// Long enough to ride out a Render free-tier cold start (the instance sleeps
// after 15 idle minutes and can take close to a minute to wake up), short
// enough that a stuck request surfaces as an error instead of spinning forever.
const REQUEST_TIMEOUT_MS = 60000;
// Writes give up sooner and are retried: on mobile data a request sometimes
// sits on a dead connection and never reaches the API, and a fresh attempt
// usually goes through right away.
const WRITE_TIMEOUT_MS = 8000;
const MAX_RETRIES = 2;
const WRITE_METHODS = ["post", "put", "patch", "delete"];

const newIdempotencyKey = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const api = axios.create({
  baseURL: apiBaseUrl,
  timeout: REQUEST_TIMEOUT_MS
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (WRITE_METHODS.includes(config.method)) {
    // Same key on every retry of this request, so the API runs it only once
    // even if an earlier attempt did reach it and just the response was lost.
    config.__idempotencyKey = config.__idempotencyKey || newIdempotencyKey();
    config.headers["Idempotency-Key"] = config.__idempotencyKey;
    // File uploads keep the longer timeout.
    if (config.timeout === REQUEST_TIMEOUT_MS && !(config.data instanceof FormData)) {
      config.timeout = WRITE_TIMEOUT_MS;
    }
  }
  return config;
});

// Retries requests that got no response (network error or timeout) or a
// gateway error from Render's proxy. That's safe for GETs, and for writes
// because they carry an Idempotency-Key the API uses to avoid running twice.
const shouldRetry = (error) => {
  const { config, response } = error;
  if (!config || axios.isCancel(error)) return false;
  if ((config.__retryCount || 0) >= MAX_RETRIES) return false;
  if (config.method !== "get" && !config.__idempotencyKey) return false;
  const status = response?.status;
  return !response || status === 502 || status === 503 || status === 504;
};

api.interceptors.response.use(undefined, async (error) => {
  if (!shouldRetry(error)) {
    return Promise.reject(error);
  }
  const config = error.config;
  config.__retryCount = (config.__retryCount || 0) + 1;
  await new Promise((resolve) => setTimeout(resolve, 1000 * config.__retryCount));
  return api(config);
});

// Fire-and-forget request to wake the API up while the user is still on the
// login screen, so the login itself doesn't pay for the cold start.
export const warmUpApi = () => {
  try {
    const healthUrl = new URL("/health", new URL(apiBaseUrl, window.location.origin));
    fetch(healthUrl, { method: "GET", mode: "cors", cache: "no-store" }).catch(() => {});
  } catch {
    // Warm-up is best effort only.
  }
};

export const getErrorMessage = (err, fallback) => {
  const detail = err?.response?.data?.detail;
  if (typeof detail === "string") return detail;
  if (err?.code === "ECONNABORTED" || !err?.response) {
    return `${fallback}: el servidor no respondió. Revisá tu conexión e intentá de nuevo.`;
  }
  return fallback;
};

export default api;
