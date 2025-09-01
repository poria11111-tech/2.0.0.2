// Lightweight cache-first service worker that passes PWABuilder checks
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open('app-cache-v1').then(cache => {
      // Precache core files
      return cache.addAll(['./','./index.html','./manifest.json','./offline.html',./icons/icon-192.png','./icons/icon-512.png','./icons/apple-touch-icon.png].filter(Boolean));
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    (async () => {
      // Clean up old caches
      const keys = await caches.keys();
      await Promise.all(keys.map(k => k !== 'app-cache-v1' ? caches.delete(k) : Promise.resolve()));
      await self.clients.claim();
    })()
  );
});

// Network with cache fallback, and offline fallback for navigations
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  if (req.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(req);
          return fresh;
        } catch (e) {
          const cached = await caches.match('./index.html');
          return cached || (await caches.match('./offline.html'));
        }
      })()
    );
    return;
  }

  event.respondWith(
    caches.match(req).then(cached => {
      const fetchPromise = fetch(req).then(networkResp => {
        const respClone = networkResp.clone();
        caches.open('app-cache-v1').then(cache => cache.put(req, respClone));
        return networkResp;
      }).catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
