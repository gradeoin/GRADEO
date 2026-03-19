
// SW addon: cache-first for fonts, stale-while-revalidate for Cloudinary images
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Fonts
  if (event.request.destination === 'font') {
    event.respondWith((async () => {
      const cache = await caches.open('fonts-v1');
      const cached = await cache.match(event.request);
      if (cached) return cached;
      const res = await fetch(event.request);
      cache.put(event.request, res.clone());
      return res;
    })());
    return;
  }

  // Cloudinary images
  if (url.hostname === 'res.cloudinary.com') {
    event.respondWith((async () => {
      const cache = await caches.open('img-cdn-v1');
      const cached = await cache.match(event.request);
      const fetchPromise = fetch(event.request).then((res) => {
        cache.put(event.request, res.clone());
        return res;
      });
      return cached || fetchPromise;
    })());
  }
});
