/* ================================================================
   PINK PEARL COUTURE ZM — SERVICE WORKER
   File: sw.js
   Minimal cache: makes barcode-labels.html installable as an app
   and lets it open instantly even on a flaky connection.
   (Printing still needs a live connection to load fresh stock.)
================================================================ */

const CACHE_NAME = 'ppc-barcode-v1';
const ASSETS = [
  './barcode-labels.html',
  './assets/css/admin.css',
  './assets/css/barcode.css',
  './assets/js/barcode.js',
  './assets/data/supabase-client.js',
  './assets/icons/icon.svg',
  './manifest.json',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  // Network-first for Supabase/API calls, cache-first for static assets
  if (event.request.url.includes('supabase.co')) return;

  event.respondWith(
    caches.match(event.request).then(cached =>
      cached || fetch(event.request).catch(() => cached)
    )
  );
});
