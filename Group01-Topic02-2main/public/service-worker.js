/* Simple offline-first service worker */
const CACHE = "today-dashboard-v3";
const CORE = ["/", "/index.html", "/manifest.json", "/icon.svg"];

self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE).catch(() => {})));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;

  // Network-ONLY for the live weather API so we always try fresh data and
  // never serve a stale cached response. If offline, the fetch rejects and
  // the component shows the error/retry UI.
  const url = new URL(req.url);
  if (url.hostname === "api.open-meteo.com") {
    e.respondWith(fetch(req));
    return;
  }

  // Cache-first for the app shell.
  e.respondWith(
    caches.match(req).then(
      (cached) =>
        cached ||
        fetch(req)
          .then((res) => {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
            return res;
          })
          .catch(() => caches.match("/index.html"))
    )
  );
});
