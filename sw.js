// Minimal service worker: caches the app shell so it opens instantly and
// works offline for everything except live Firebase data (journal sync
// and login still need an internet connection).
const CACHE_NAME = 'republikwar-shell-v1';
const SHELL_FILES = [
  './index.html',
  './manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // network-first for Firebase/Firestore/Google requests, cache-first for local shell files
  if (event.request.url.includes('firebase') || event.request.url.includes('google')) return;
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
