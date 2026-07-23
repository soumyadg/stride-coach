/* Strivon service worker — offline shell + cached map tiles */
const CACHE = 'stride-v55';
const TILES = 'stride-tiles-v1';
const ASSETS = ['./app.html', './manifest.webmanifest', './icon.svg', './icon-512.png', './splash-logo.png',
  './intro.mp4', './config.js', './sync.js', './native-bridge.js', './vendor/supabase.js'];

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
  if (e.request.method !== 'GET' || !url.startsWith(self.location.origin)) return;
  // HTML navigations: network-FIRST (always get fresh pages; fall back to cache only offline)
  if (e.request.mode === 'navigate' || (e.request.headers.get('accept') || '').includes('text/html')) {
    e.respondWith(
      fetch(e.request)
        .then(res => { const c = res.clone(); caches.open(CACHE).then(ca => ca.put(e.request, c)); return res; })
        .catch(() => caches.match(e.request).then(r => r || caches.match('./app.html')))
    );
    return;
  }
  // Other assets: cache-first, fall back to network
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
