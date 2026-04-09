// MyClubTracker Service Worker
// Cache version — bump this string when deploying a new version to force refresh
const CACHE_VERSION = 'mct-v1';
const CACHE_NAME = CACHE_VERSION;

// Core shell files to cache on install
const SHELL_FILES = [
  '/app.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/favicon.ico',
  'https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&family=Outfit:wght@400;600;700;800&display=block',
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js',
];

// ── INSTALL: cache shell files ─────────────────────────────────────────────
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      // Cache what we can; ignore individual failures so install always succeeds
      return Promise.allSettled(
        SHELL_FILES.map(function(url) {
          return cache.add(url).catch(function() {});
        })
      );
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

// ── ACTIVATE: clean up old caches ─────────────────────────────────────────
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE_NAME; })
            .map(function(k) { return caches.delete(k); })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

// ── FETCH: network-first for app.html, cache-first for assets ─────────────
self.addEventListener('fetch', function(event) {
  var url = new URL(event.request.url);

  // Skip non-GET and cross-origin requests (Supabase, Google, etc.)
  if (event.request.method !== 'GET') return;
  if (url.origin !== location.origin &&
      !url.href.includes('fonts.googleapis.com') &&
      !url.href.includes('fonts.gstatic.com') &&
      !url.href.includes('cdn.jsdelivr.net')) return;

  // app.html: network-first so users always get the latest version
  if (url.pathname === '/app.html' || url.pathname === '/') {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' })
        .then(function(response) {
          // Cache the fresh copy
          var toCache = response.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(event.request, toCache);
          });
          return response;
        })
        .catch(function() {
          // Offline fallback: serve cached version
          return caches.match(event.request);
        })
    );
    return;
  }

  // Icons, fonts, Chart.js: cache-first (they never change)
  event.respondWith(
    caches.match(event.request).then(function(cached) {
      if (cached) return cached;
      return fetch(event.request).then(function(response) {
        if (response && response.status === 200) {
          var toCache = response.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(event.request, toCache);
          });
        }
        return response;
      });
    })
  );
});
