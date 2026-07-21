/* Strivon service worker — offline shell + cached map tiles */
const CACHE = 'stride-v24';
const TILES = 'stride-tiles-v1';
const ASSETS = ['./', './index.html', './manifest.webmanifest', './icon.svg', './icon-512.png', './splash-logo.png',
  './config.js', './sync.js', './native-bridge.js', './vendor/supabase.js'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE && k !== TILES).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = e.request.url;
  // Map tiles: cache-first so the map works offline after first view
  if (url.includes('basemaps.cartocdn.com')) {
    e.respondWith(caches.open(TILES).then(async c => {
      const hit = await c.match(e.request);
      if (hit) return hit;
      try { const res = await fetch(e.request); c.put(e.request, res.clone()); return res; }
      catch (_) { return hit || Response.error(); }
    }));
    return;
  }
  // App shell: cache-first, fall back to network
  if (e.request.method === 'GET' && url.startsWith(self.location.origin)) {
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
  }
});
