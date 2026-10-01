// Service Worker for FoodBridge AI
// Caches essential static assets and app shell for offline resilience during volunteer pickups

const CACHE_NAME = 'foodbridge-ai-cache-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/src/main.tsx',
  '/src/index.css',
  '/src/App.tsx',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
];

self.addEventListener('install', (event: any) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(STATIC_ASSETS);
      })
      .catch((err) => {
        console.warn('SW asset pre-cache non-fatal error:', err);
      })
  );
  (self as any).skipWaiting();
});

self.addEventListener('activate', (event: any) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  (self as any).clients.claim();
});

// Network-First with Cache Fallback for navigation & dynamic requests, Cache-First for static assets
self.addEventListener('fetch', (event: any) => {
  const url = new URL(event.request.url);

  // For API endpoints or Leaflet tiles: Try network first, fall back to cache if offline
  if (url.pathname.startsWith('/api/') || url.hostname.includes('tile.openstreetmap.org')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(event.request);
          if (cached) return cached;
          // If offline and API call fails, return custom offline JSON response
          if (url.pathname.startsWith('/api/')) {
            return new Response(
              JSON.stringify({
                offline: true,
                message: 'Operating in offline cache mode. Action queued locally.',
              }),
              { headers: { 'Content-Type': 'application/json' } }
            );
          }
          return new Response('Network unavailable', { status: 503 });
        })
    );
    return;
  }

  // For app assets: Stale-While-Revalidate
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
