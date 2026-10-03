// Keeps the app itself (HTML, JS, CSS) on the phone so it opens even with no
// or very bad signal, e.g. inside the supermarket. API calls aren't touched:
// they go to another origin, and the pages keep their own saved copies of the
// data (see src/offline).
const CACHE = "finview-shell-v1";
const INDEX_URL = "/index.html";
// How long a page load waits for Netlify before falling back to the saved
// copy of the app.
const NAVIGATION_TIMEOUT_MS = 3000;

const assetsIn = (html) => [...new Set(html.match(/\/assets\/[^"'\s)]+/g) || [])];

// Saves index.html and the assets it references, and drops assets from older
// deploys.
const saveShell = async (cache, response) => {
  const html = await response.clone().text();
  const assets = assetsIn(html);
  await cache.put(INDEX_URL, response);
  await Promise.all(
    assets.map(async (asset) => {
      if (!(await cache.match(asset))) await cache.add(asset);
    })
  );
  const keys = await cache.keys();
  await Promise.all(
    keys
      .filter((request) => {
        const { pathname } = new URL(request.url);
        return pathname.startsWith("/assets/") && !assets.includes(pathname);
      })
      .map((request) => cache.delete(request))
  );
};

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then(async (cache) => {
      const response = await fetch(INDEX_URL, { cache: "no-store" });
      if (response.ok) await saveShell(cache, response);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

const withTimeout = (promise, ms) =>
  new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("timeout")), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      }
    );
  });

// Pages: the network first so a new deploy shows up, the saved app if the
// network is slow or down. Every route is the same SPA index.html.
const handleNavigation = async (request) => {
  const cache = await caches.open(CACHE);
  const network = fetch(request).then((response) => {
    if (response.ok) saveShell(cache, response.clone()).catch(() => {});
    return response;
  });
  try {
    return await withTimeout(network, NAVIGATION_TIMEOUT_MS);
  } catch {
    const cached = await cache.match(INDEX_URL);
    return cached || network;
  }
};

// Built assets have a content hash in their name, so a saved copy is never
// stale.
const handleAsset = async (request) => {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) cache.put(request, response.clone());
  return response;
};

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(handleNavigation(request));
  } else if (url.pathname.startsWith("/assets/")) {
    event.respondWith(handleAsset(request));
  }
});
