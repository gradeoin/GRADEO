/* GRADEO Service Worker v4 */
const SW_VERSION = 'gradeo-v4';
const STATIC_CACHE = SW_VERSION + '-static';
const DYNAMIC_CACHE = SW_VERSION + '-dynamic';
const ICON = 'https://res.cloudinary.com/djy3mjtsz/image/upload/v1770296454/Untitled-2_i2ezfh.png';

/* ── Install ── */
self.addEventListener('install', event => {
  console.log('[SW] Installing', SW_VERSION);
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(['/', '/manifest.webmanifest']).catch(() => {}))
      .then(() => self.skipWaiting())
  );
});

/* ── Activate ── */
self.addEventListener('activate', event => {
  console.log('[SW] Activating', SW_VERSION);
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== STATIC_CACHE && k !== DYNAMIC_CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
      .then(() => console.log('[SW] Active and claimed all clients'))
  );
});

/* ── Fetch ── */
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;
  if (url.protocol === 'chrome-extension:') return;
  if (url.hostname.includes('firebaseio.com')) return;
  if (url.hostname.includes('googleapis.com') && !url.hostname.includes('fcm')) return;
  if (url.hostname.includes('cloudflareinsights.com')) return;
  if (url.hostname.includes('workers.dev')) return;

  if (request.headers.get('Accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request).then(res => {
        const clone = res.clone();
        caches.open(DYNAMIC_CACHE).then(c => c.put(request, clone));
        return res;
      }).catch(() => caches.match(request).then(c => c || caches.match('/')))
    );
    return;
  }

  if (
    url.hostname.includes('cloudinary.com') ||
    url.hostname.includes('gstatic.com') ||
    request.destination === 'image' ||
    request.destination === 'font'
  ) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;
        return fetch(request).then(res => {
          if (res && res.status === 200) {
            const clone = res.clone();
            caches.open(DYNAMIC_CACHE).then(c => c.put(request, clone));
          }
          return res;
        }).catch(() => cached);
      })
    );
    return;
  }

  event.respondWith(
    fetch(request).then(res => {
      if (res && res.status === 200) {
        const clone = res.clone();
        caches.open(DYNAMIC_CACHE).then(c => c.put(request, clone));
      }
      return res;
    }).catch(() => caches.match(request))
  );
});

/* ── Push ── */
self.addEventListener('push', event => {
  console.log('[SW] Push received', event.data ? 'with data' : 'no data');

  let title = 'GRADEO';
  let body  = 'You have a new update!';
  let openUrl = 'https://gradeo.in';

  if (event.data) {
    try {
      const d = event.data.json();
      console.log('[SW] Push data:', JSON.stringify(d));
      if (d.title) title = d.title;
      if (d.body)  body  = d.body;
      if (d.url)   openUrl = d.url;
    } catch (e) {
      console.log('[SW] Push data parse error:', e.message);
      try { body = event.data.text(); } catch (_) {}
    }
  }

  console.log('[SW] Showing notification:', title, body);

  const showPromise = self.registration.showNotification(title, {
    body,
    icon: ICON,
    badge: ICON,
    vibrate: [300, 100, 300],
    tag: 'gradeo-' + Date.now(),
    renotify: false,
    requireInteraction: false,
    silent: false,
    data: { url: openUrl }
  });

  event.waitUntil(
    showPromise.then(() => {
      console.log('[SW] Notification shown successfully');
    }).catch(err => {
      console.error('[SW] showNotification failed:', err.message);
    })
  );
});

/* ── Notification click ── */
self.addEventListener('notificationclick', event => {
  console.log('[SW] Notification clicked, action:', event.action);
  event.notification.close();
  if (event.action === 'dismiss') return;

  const targetUrl = event.notification.data?.url || 'https://gradeo.in';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const client of list) {
        if (client.url.includes('gradeo.in') && 'focus' in client) {
          client.focus();
          return client.navigate(targetUrl);
        }
      }
      return clients.openWindow(targetUrl);
    })
  );
});

/* ── Message ── */
self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') {
    console.log('[SW] Skip waiting requested');
    self.skipWaiting();
  }
  if (event.data?.type === 'PING') {
    event.source?.postMessage({ type: 'PONG', version: SW_VERSION });
  }
});

/* ── Sync ── */
self.addEventListener('sync', event => {
  if (event.tag === 'gradeo-sync') {
    event.waitUntil(
      clients.matchAll().then(all => all.forEach(c => c.postMessage({ type: 'BG_SYNC_COMPLETE' })))
    );
  }
});
