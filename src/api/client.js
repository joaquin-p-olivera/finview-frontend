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
const MAX_RETRIES = 2;

const api = axios.create({
  baseURL: apiBaseUrl,
  timeout: REQUEST_TIMEOUT_MS
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Retries only what's safe to repeat: GETs on network errors, timeouts and
// gateway errors, and any method on 502/503, which Render's proxy returns
// before the request reaches the API (so nothing was written).
const shouldRetry = (error) => {
  const { config, response } = error;
  if (!config || axios.isCancel(error)) return false;
  if ((config.__retryCount || 0) >= MAX_RETRIES) return false;
  const status = response?.status;
  if (status === 502 || status === 503) return true;
  if (config.method !== "get") return false;
  return !response || status === 504;
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
