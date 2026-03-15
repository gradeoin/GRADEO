/* ================================================================
   GRADEO Service Worker v5
   Smart caching like Spotify / Google Maps PWA:
   - App shell: cache-first (instant load)
   - Pages: stale-while-revalidate (fast + fresh)
   - Images/fonts: cache-first with long TTL
   - API/Firebase: network-only
   - Offline fallback page
================================================================ */

const V           = 'v5';
const SHELL_CACHE = 'gradeo-shell-' + V;
const PAGE_CACHE  = 'gradeo-pages-' + V;
const ASSET_CACHE = 'gradeo-assets-' + V;
const MAX_PAGES   = 10;
const MAX_ASSETS  = 60;

/* App shell — cached on install, served instantly forever */
const SHELL = [
  '/',
  '/offline.html',
  '/manifest.webmanifest',
];

/* ── Install: pre-cache app shell ── */
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(SHELL_CACHE)
      .then(c => c.addAll(SHELL).catch(() => c.add('/').catch(() => {})))
      .then(() => self.skipWaiting())
  );
});

/* ── Activate: purge old caches ── */
self.addEventListener('activate', e => {
  const keep = [SHELL_CACHE, PAGE_CACHE, ASSET_CACHE];
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => !keep.includes(k)).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* ── Fetch: routing strategies ── */
self.addEventListener('fetch', e => {
  const { request } = e;
  const url = new URL(request.url);

  /* Skip non-GET */
  if (request.method !== 'GET') return;

  /* Skip third-party APIs — never cache these */
  if (
    url.protocol === 'chrome-extension:' ||
    url.hostname.includes('firebaseio.com') ||
    url.hostname.includes('firestore.googleapis.com') ||
    url.hostname.includes('identitytoolkit.googleapis.com') ||
    url.hostname.includes('securetoken.googleapis.com') ||
    url.hostname.includes('cloudflareinsights.com') ||
    url.hostname.includes('workers.dev') ||
    url.hostname.includes('cdn-cgi')
  ) return;

  /* Firebase JS SDKs — network only but don't break */
  if (url.hostname.includes('gstatic.com') && url.pathname.includes('firebase')) return;

  /* ── Strategy 1: App shell files — cache first ── */
  if (SHELL.includes(url.pathname) || url.pathname === '/sw.js') {
    e.respondWith(
      caches.match(request).then(cached => cached || fetch(request))
    );
    return;
  }

  /* ── Strategy 2: HTML pages — stale-while-revalidate ── */
  /* Shows cached version instantly, updates in background */
  if (request.headers.get('Accept')?.includes('text/html')) {
    e.respondWith(
      caches.open(PAGE_CACHE).then(async cache => {
        const cached = await cache.match(request);
        const fetchPromise = fetch(request).then(res => {
          if (res && res.status === 200) {
            cache.put(request, res.clone());
            trimCache(PAGE_CACHE, MAX_PAGES);
          }
          return res;
        }).catch(() => null);

        /* Return cached immediately, update in background */
        if (cached) {
          fetchPromise.catch(() => {});
          return cached;
        }
        /* No cache — wait for network */
        return fetchPromise.then(res =>
          res || caches.match('/offline.html') || caches.match('/')
        );
      })
    );
    return;
  }

  /* ── Strategy 3: Images & fonts — cache first, long TTL ── */
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
        if (res && res.status === 200) {
          cache.put(request, res.clone());
          trimCache(ASSET_CACHE, MAX_ASSETS);
        }
        return res;
      })
    );
    return;
  }

  /* ── Strategy 4: JS/CSS — stale-while-revalidate ── */
  if (request.destination === 'script' || request.destination === 'style') {
    e.respondWith(
      caches.open(ASSET_CACHE).then(async cache => {
        const cached = await cache.match(request);
        const fetchPromise = fetch(request).then(res => {
          if (res && res.status === 200) cache.put(request, res.clone());
          return res;
        }).catch(() => null);
        return cached || fetchPromise;
      })
    );
    return;
  }

  /* ── Strategy 5: Everything else — network with cache fallback ── */
  e.respondWith(
    fetch(request).then(res => {
      if (res && res.status === 200) {
        const clone = res.clone();
        caches.open(ASSET_CACHE).then(c => c.put(request, clone));
      }
      return res;
    }).catch(() => caches.match(request))
  );
});

/* ── Trim cache to max size (LRU-style) ── */
async function trimCache(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys  = await cache.keys();
  if (keys.length > maxItems) {
    await cache.delete(keys[0]);
    trimCache(cacheName, maxItems);
  }
}

/* ── Push Notifications ── */
self.addEventListener('push', e => {
  let title = 'GRADEO', body = 'Check your grade plan!', url = 'https://gradeo.in';
  if (e.data) {
    try {
      const d = e.data.json();
      if (d.title) title = d.title;
      if (d.body)  body  = d.body;
      if (d.url)   url   = d.url;
    } catch (_) {
      try { body = e.data.text(); } catch (_) {}
    }
  }
  e.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon:   'https://res.cloudinary.com/djy3mjtsz/image/upload/v1770296454/Untitled-2_i2ezfh.png',
      badge:  'https://res.cloudinary.com/djy3mjtsz/image/upload/v1770296454/Untitled-2_i2ezfh.png',
      vibrate: [200, 100, 200],
      tag:    'gradeo',
      renotify: true,
      data:   { url },
      actions: [
        { action: 'open',    title: 'Open GRADEO' },
        { action: 'dismiss', title: 'Dismiss' }
      ]
    })
  );
});

/* ── Notification click ── */
self.addEventListener('notificationclick', e => {
  e.notification.close();
  if (e.action === 'dismiss') return;
  const target = e.notification.data?.url || 'https://gradeo.in';
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const c of list) {
        if (c.url.includes('gradeo.in') && 'focus' in c) { c.focus(); return c.navigate(target); }
      }
      return clients.openWindow(target);
    })
  );
});

/* ── Messages from page ── */
self.addEventListener('message', e => {
  if (e.data?.type === 'SKIP_WAITING') self.skipWaiting();
  if (e.data?.type === 'PING') e.source?.postMessage({ type: 'PONG', version: V });
  if (e.data?.type === 'CLEAR_CACHE') {
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== SHELL_CACHE).map(k => caches.delete(k))
    )).then(() => e.source?.postMessage({ type: 'CACHE_CLEARED' }));
  }
  if (e.data?.type === 'CACHE_SIZE') {
    getCacheSize().then(size => e.source?.postMessage({ type: 'CACHE_SIZE_RESULT', size }));
  }
});

async function getCacheSize() {
  let total = 0;
  const keys = await caches.keys();
  for (const k of keys) {
    const c = await caches.open(k);
    const reqs = await c.keys();
    total += reqs.length;
  }
  return total;
}

/* ── Background sync ── */
self.addEventListener('sync', e => {
  if (e.tag === 'gradeo-sync') {
    e.waitUntil(
      clients.matchAll().then(all => all.forEach(c => c.postMessage({ type: 'BG_SYNC' })))
    );
  }
});

/* ── Periodic background sync (refresh content) ── */
self.addEventListener('periodicsync', e => {
  if (e.tag === 'gradeo-refresh') {
    e.waitUntil(
      fetch('/').then(res => {
        if (res.ok) caches.open(PAGE_CACHE).then(c => c.put('/', res));
      }).catch(() => {})
    );
  }
});
