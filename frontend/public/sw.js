// ConvertSheet Offline Service Worker (100% Client-Side Private Engine)
const CACHE_NAME = "convertsheet-v2";
const STATIC_ASSETS = [
  "/",
  "/tools",
  "/tools/category/financial",
  "/tools/category/data-developer",
  "/tools/category/utility",
  "/icons/icon-192.svg",
  "/icons/icon-512.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
      .catch((err) => console.warn("SW install cache warning:", err))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET requests and external origins
  if (event.request.method !== "GET" || url.origin !== self.location.origin) {
    return;
  }

  // 1. Cache-first for immutable static chunks, assets, and icons (0-2ms response)
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".wasm")
  ) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // 2. Stale-While-Revalidate for HTML pages & navigations
  // Delivers instant local cache (<5ms) while revalidating from edge in the background
  event.respondWith(
    caches.match(event.request).then((cached) => {
      // Background network fetch to revalidate and update cache
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return networkResponse;
        })
        .catch(async () => {
          if (cached) return cached;
          const rootCached = await caches.match("/");
          if (rootCached) return rootCached;
          return new Response("ConvertSheet Offline Mode: Page is cached when online.", {
            headers: { "Content-Type": "text/plain" },
          });
        });

      // If cached response exists, return it immediately (<5ms)!
      // Otherwise wait for the background network fetch to complete
      return cached || fetchPromise;
    })
  );
});
