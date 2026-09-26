// Offline support for the installed app. This caches the pages and their assets;
// data works offline through Firestore's own IndexedDB cache.
// ponytail: one cache that only grows; old hashed chunks pile up across deploys.
// Bump CACHE to wipe it if it ever matters.
const CACHE = 'faxyna-v2';
const PAGES = ['/', '/semana', '/comodos', '/progresso', '/casa'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      // Cache every page plus the /_next/static files it references, so the
      // first offline launch works even for tabs never opened online.
      const assets = new Set();
      for (const page of PAGES) {
        const res = await fetch(page, { cache: 'no-cache' });
        if (!res.ok) continue;
        const html = await res.clone().text();
        for (const [path] of html.matchAll(/\/_next\/static\/[^"'\s)\\]+/g)) assets.add(path);
        await cache.put(page, res);
      }
      await cache.addAll([...assets, '/manifest.webmanifest', '/icon.svg']);
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      for (const key of await caches.keys()) if (key !== CACHE) await caches.delete(key);
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  const sameOrigin = url.origin === self.location.origin;
  const isFont = url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';
  if (!sameOrigin && !isFont) return;

  // Hashed build files and fonts never change: cache first.
  if (url.pathname.startsWith('/_next/static/') || isFont) {
    event.respondWith(cacheFirst(request));
    return;
  }
  // Pages and everything else: network first so deploys show up right away,
  // falling back to the cache (or the home page) when offline.
  event.respondWith(networkFirst(request));
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const res = await fetch(request);
  if (res.ok || res.type === 'opaque') (await caches.open(CACHE)).put(request, res.clone());
  return res;
}

async function networkFirst(request) {
  try {
    const res = await fetch(request);
    if (res.ok) (await caches.open(CACHE)).put(request, res.clone());
    return res;
  } catch (err) {
    const cached = await caches.match(request, { ignoreSearch: true });
    if (cached) return cached;
    if (request.mode === 'navigate') return (await caches.match('/')) ?? Response.error();
    throw err;
  }
}
