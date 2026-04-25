// MyClubTracker Service Worker
// Cache version — bump this string whenever sw.js or its caching strategy changes.
// Bumping this triggers cache cleanup in the activate handler on next visit.
const CACHE_VERSION = 'mct-v2';
const CACHE_NAME = CACHE_VERSION;

// Core shell files cached on install — used as offline fallback only.
// HTML pages here are still fetched network-first on every request; precaching
// just guarantees they're available when offline.
const SHELL_FILES = [
  '/app.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/favicon.ico',
  'https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&family=Outfit:wght@400;600;700;800&display=block',
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js'
];

// ── INSTALL: cache shell files ─────────────────────────────────────────────
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      // Cache what we can; ignore individual failures so install always succeeds.
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

// ── FETCH: network-first by default, cache-first only for immutable assets ─
//
// CRITICAL: HTML pages MUST be network-first. Jeffrey ships changes daily;
// serving cached HTML would mean users see stale UI for hours or days.
// Cache-first is reserved strictly for assets that never change between
// deploys (icons, fonts, pinned CDN libraries).
self.addEventListener('fetch', function(event) {
  var url = new URL(event.request.url);

  // Skip non-GET (POST to Supabase, etc.)
  if (event.request.method !== 'GET') return;

  // Skip cross-origin we never want to intercept (Supabase API, OAuth callbacks, analytics)
  var crossOriginAllowList = [
    'fonts.googleapis.com',
    'fonts.gstatic.com',
    'cdn.jsdelivr.net',
    'unpkg.com'
  ];
  if (url.origin !== location.origin) {
    var allowed = crossOriginAllowList.some(function(host) {
      return url.host.indexOf(host) !== -1;
    });
    if (!allowed) return;
  }

  // Cache-first patterns: assets that are immutable per-deploy
  var isImmutable =
    /\.(png|jpg|jpeg|gif|svg|webp|ico|woff2?|ttf)$/i.test(url.pathname) ||
    url.host.indexOf('fonts.googleapis.com') !== -1 ||
    url.host.indexOf('fonts.gstatic.com') !== -1 ||
    url.host.indexOf('cdn.jsdelivr.net') !== -1 ||
    url.host.indexOf('unpkg.com') !== -1;

  if (isImmutable) {
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
    return;
  }

  // Network-first for everything else: HTML, CSS, manifest, JSON, etc.
  // Cached copy serves only as offline fallback.
  event.respondWith(
    fetch(event.request, { cache: 'no-store' })
      .then(function(response) {
        if (response && response.status === 200) {
          var toCache = response.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(event.request, toCache);
          });
        }
        return response;
      })
      .catch(function() {
        return caches.match(event.request);
      })
  );
});
