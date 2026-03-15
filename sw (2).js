/* ================================================================
   GRADEO Service Worker v5
   - App shell cache (instant load)
   - Stale-while-revalidate for pages
   - Cache-first for images and fonts
   - Offline fallback
   - No push notifications (coming later)
================================================================ */

const V           = 'v5';
const SHELL_CACHE = 'gradeo-shell-' + V;
const PAGE_CACHE  = 'gradeo-pages-' + V;
const ASSET_CACHE = 'gradeo-assets-' + V;
const MAX_PAGES   = 12;
const MAX_ASSETS  = 60;

const SHELL = ['/', '/offline.html', '/manifest.webmanifest'];

/* ── Install ── */
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(SHELL_CACHE)
      .then(c => c.addAll(SHELL).catch(() => c.add('/').catch(() => {})))
      .then(() => self.skipWaiting())
  );
});

/* ── Activate ── */
self.addEventListener('activate', e => {
  const keep = [SHELL_CACHE, PAGE_CACHE, ASSET_CACHE];
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => !keep.includes(k)).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

/* ── Fetch ── */
self.addEventListener('fetch', e => {
  const { request } = e;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;
  if (url.protocol === 'chrome-extension:') return;
  if (url.hostname.includes('firebaseio.com')) return;
  if (url.hostname.includes('firestore.googleapis.com')) return;
  if (url.hostname.includes('identitytoolkit.googleapis.com')) return;
  if (url.hostname.includes('securetoken.googleapis.com')) return;
  if (url.hostname.includes('cloudflareinsights.com')) return;
  if (url.hostname.includes('workers.dev')) return;
  if (url.hostname.includes('cdn-cgi')) return;
  if (url.hostname.includes('gstatic.com') && url.pathname.includes('firebase')) return;

  /* App shell — cache first always */
  if (SHELL.includes(url.pathname) || url.pathname === '/sw.js') {
    e.respondWith(caches.match(request).then(c => c || fetch(request)));
    return;
  }

  /* HTML pages — stale-while-revalidate */
  /* Shows cached version instantly, quietly fetches fresh copy in background */
  if (request.headers.get('Accept')?.includes('text/html')) {
    e.respondWith(
      caches.open(PAGE_CACHE).then(async cache => {
        const cached = await cache.match(request);
        const fresh  = fetch(request).then(res => {
          if (res?.status === 200) {
            cache.put(request, res.clone());
            trimCache(PAGE_CACHE, MAX_PAGES);
          }
          return res;
        }).catch(() => null);

        return cached || fresh.then(r =>
          r || caches.match('/offline.html') || caches.match('/')
        );
      })
    );
    return;
  }

  /* Images and fonts — cache first, very long TTL */
  if (
    url.hostname.includes('cloudinary.com') ||
    url.hostname.includes('fonts.gstatic.com') ||
    url.hostname.includes('fonts.googleapis.com') ||
    request.destination === 'image' ||
    request.destination === 'font'
  ) {
    e.respondWith(
      caches.open(ASSET_CACHE).then(async cache => {
        const cached = await cache.match(request);
        if (cached) return cached;
        const res = await fetch(request).catch(() => null);
        if (res?.status === 200) {
          cache.put(request, res.clone());
          trimCache(ASSET_CACHE, MAX_ASSETS);
        }
        return res;
      })
    );
    return;
  }

  /* JS and CSS — stale-while-revalidate */
  if (request.destination === 'script' || request.destination === 'style') {
    e.respondWith(
      caches.open(ASSET_CACHE).then(async cache => {
        const cached      = await cache.match(request);
        const fetchPromise = fetch(request).then(res => {
          if (res?.status === 200) cache.put(request, res.clone());
          return res;
        }).catch(() => null);
        return cached || fetchPromise;
      })
    );
    return;
  }

  /* Everything else — network with cache fallback */
  e.respondWith(
    fetch(request).then(res => {
      if (res?.status === 200) {
        caches.open(ASSET_CACHE).then(c => c.put(request, res.clone()));
      }
      return res;
    }).catch(() => caches.match(request))
  );
});

/* ── Trim cache (remove oldest entries) ── */
async function trimCache(name, max) {
  const cache = await caches.open(name);
  const keys  = await cache.keys();
  if (keys.length > max) {
    await cache.delete(keys[0]);
    await trimCache(name, max);
  }
}

/* ── Messages from page ── */
self.addEventListener('message', e => {
  if (e.data?.type === 'SKIP_WAITING') self.skipWaiting();
  if (e.data?.type === 'PING') e.source?.postMessage({ type: 'PONG', version: V });
  if (e.data?.type === 'CLEAR_CACHE') {
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== SHELL_CACHE).map(k => caches.delete(k))))
      .then(() => e.source?.postMessage({ type: 'CACHE_CLEARED' }));
  }
});

/* ── Background sync ── */
self.addEventListener('sync', e => {
  if (e.tag === 'gradeo-sync') {
    e.waitUntil(
      clients.matchAll().then(all => all.forEach(c => c.postMessage({ type: 'BG_SYNC' })))
    );
  }
});
