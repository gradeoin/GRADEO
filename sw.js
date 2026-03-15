/* ═══════════════════════════════════════════════
   GRADEO Service Worker v2
   - Cache-first for assets, network-first for pages
   - Offline fallback
   - Push notification support
   - Background sync
═══════════════════════════════════════════════ */

const SW_VERSION = 'gradeo-v2';
const STATIC_CACHE = SW_VERSION + '-static';
const DYNAMIC_CACHE = SW_VERSION + '-dynamic';

/* Assets to pre-cache on install */
const PRECACHE_ASSETS = [
  '/',
  '/manifest.webmanifest',
  '/offline.html'
];

/* ── Install ──────────────────────────────── */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => {
      return cache.addAll(PRECACHE_ASSETS).catch(() => {
        /* Non-fatal: if offline.html doesn't exist yet, skip */
        return cache.add('/').catch(() => {});
      });
    }).then(() => self.skipWaiting())
  );
});

/* ── Activate: clean old caches ──────────── */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

/* ── Fetch strategy ──────────────────────── */
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  /* Skip non-GET, chrome-extension, and Firebase calls */
  if (
    request.method !== 'GET' ||
    url.protocol === 'chrome-extension:' ||
    url.hostname.includes('firebaseio.com') ||
    url.hostname.includes('googleapis.com') ||
    url.hostname.includes('cloudflareinsights.com')
  ) return;

  /* HTML pages → Network first, fallback to cache, then offline page */
  if (request.headers.get('Accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then(res => {
          const clone = res.clone();
          caches.open(DYNAMIC_CACHE).then(c => c.put(request, clone));
          return res;
        })
        .catch(() =>
          caches.match(request).then(cached =>
            cached || caches.match('/offline.html') || caches.match('/')
          )
        )
    );
    return;
  }

  /* Static assets (images, fonts, scripts) → Cache first */
  if (
    url.hostname.includes('cloudinary.com') ||
    url.hostname.includes('gstatic.com') ||
    request.destination === 'image' ||
    request.destination === 'font' ||
    request.destination === 'style' ||
    request.destination === 'script'
  ) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;
        return fetch(request).then(res => {
          if (!res || res.status !== 200) return res;
          const clone = res.clone();
          caches.open(DYNAMIC_CACHE).then(c => c.put(request, clone));
          return res;
        }).catch(() => cached);
      })
    );
    return;
  }

  /* Default: network with dynamic cache fallback */
  event.respondWith(
    fetch(request)
      .then(res => {
        if (res && res.status === 200) {
          const clone = res.clone();
          caches.open(DYNAMIC_CACHE).then(c => c.put(request, clone));
        }
        return res;
      })
      .catch(() => caches.match(request))
  );
});

/* ── Push Notifications ──────────────────── */
self.addEventListener('push', event => {
  const ICON = 'https://res.cloudinary.com/djy3mjtsz/image/upload/v1770296454/Untitled-2_i2ezfh.png';

  /* Safely parse whatever format the payload arrives in */
  let title = 'GRADEO';
  let body  = 'You have a new update!';
  let url   = 'https://gradeo.in';

  if (event.data) {
    try {
      const d = event.data.json();
      title = d.title || title;
      body  = d.body  || body;
      url   = d.url   || url;
    } catch (_) {
      try {
        const text = event.data.text();
        if (text) body = text;
      } catch (_) {}
    }
  }

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: ICON,
      badge: ICON,
      vibrate: [200, 100, 200],
      tag: 'gradeo-notification',
      renotify: true,
      requireInteraction: false,
      data: { url },
      actions: [
        { action: 'open',    title: 'Open GRADEO' },
        { action: 'dismiss', title: 'Dismiss'     }
      ]
    })
  );
});

/* ── Notification click ──────────────────── */
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const targetUrl = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      /* Focus existing tab if open */
      for (const client of windowClients) {
        if (client.url.includes('gradeo.in') && 'focus' in client) {
          client.focus();
          client.navigate(targetUrl);
          return;
        }
      }
      /* Otherwise open new window */
      if (clients.openWindow) return clients.openWindow(targetUrl);
    })
  );
});

/* ── Background sync ─────────────────────── */
self.addEventListener('sync', event => {
  if (event.tag === 'gradeo-sync') {
    event.waitUntil(
      /* Notify all open tabs that sync happened */
      clients.matchAll().then(all =>
        all.forEach(c => c.postMessage({ type: 'BG_SYNC_COMPLETE' }))
      )
    );
  }
});

/* ── Message from page ───────────────────── */
self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
  if (event.data?.type === 'CLEAR_CACHE') {
    caches.delete(DYNAMIC_CACHE).then(() =>
      event.source?.postMessage({ type: 'CACHE_CLEARED' })
    );
  }
});
