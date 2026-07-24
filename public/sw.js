// ScoutIQ service worker.
// Its only jobs are (a) making the app installable to the home screen and
// (b) letting already-visited screens open when the network is down.
// Bump CACHE when the caching rules change — old caches are dropped on activate.

const CACHE = "scoutiq-v1";
const BASE = new URL(self.registration.scope).pathname;

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(names.filter((n) => n !== CACHE).map((n) => caches.delete(n)));
      await self.clients.claim();
    })(),
  );
});

async function cacheFirst(request) {
  const cache = await caches.open(CACHE);
  const hit = await cache.match(request);
  if (hit) return hit;
  const res = await fetch(request);
  if (res.ok) cache.put(request, res.clone());
  return res;
}

// Pages must stay fresh — a redeploy changes the HTML — so try the network
// first and fall back to whatever was cached on the last successful visit.
async function networkFirst(request) {
  const cache = await caches.open(CACHE);
  try {
    const res = await fetch(request);
    if (res.ok) cache.put(request, res.clone());
    return res;
  } catch (err) {
    const hit = (await cache.match(request)) || (await cache.match(BASE));
    if (hit) return hit;
    throw err;
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (!url.pathname.startsWith(BASE)) return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request));
    return;
  }

  // Build output under /_next/static is content-hashed, so it never goes stale.
  if (url.pathname.includes("/_next/static/")) {
    event.respondWith(cacheFirst(request));
    return;
  }

  event.respondWith(
    cacheFirst(request).catch(() => fetch(request)),
  );
});
