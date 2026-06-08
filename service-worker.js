/* Dailies Service Worker
 * Strategy: cache-first with a versioned cache for the app shell.
 * Bump CACHE_VERSION on every deploy that changes JS/CSS/HTML/icons so
 * clients receive the update (the page shows an "update available" prompt).
 */

const CACHE_VERSION = "dailies-v1";

// App shell: local files resolved relative to the SW scope.
const PRECACHE_URLS = [
  "./",
  "./index.html",
  "./output.css",
  "./custom.css",
  "./app.js",
  "./google-drive.js",
  "./google-calendar.js",
  "./manifest.json",
  "./favicon.ico",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
  "./icons/apple-touch-icon.png",
  "./icons/cross.svg",
  "./icons/whitecross.svg",
];

// Cross-origin runtime assets we want available offline (fonts + Chart.js).
const RUNTIME_ALLOW = [
  "https://fonts.googleapis.com",
  "https://fonts.gstatic.com",
  "https://cdn.jsdelivr.net",
];

// Google APIs / OAuth must never be cached or intercepted.
const NETWORK_ONLY = [
  "https://accounts.google.com",
  "https://oauth2.googleapis.com",
  "https://www.googleapis.com",
  "https://apis.google.com",
  "https://content.googleapis.com",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_VERSION);
      // addAll fails the whole install if any request fails; add individually
      // so a single flaky CDN/font request can't break installation.
      await Promise.all(
        PRECACHE_URLS.map(async (url) => {
          try {
            await cache.add(new Request(url, { cache: "reload" }));
          } catch (err) {
            console.warn("[SW] Precache skipped:", url, err);
          }
        })
      );
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))
      );
      await self.clients.claim();
    })()
  );
});

// Let the page trigger an immediate update (used by the "Reload" prompt).
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

function isNetworkOnly(url) {
  return NETWORK_ONLY.some((origin) => url.startsWith(origin));
}

function isRuntimeAllowed(url) {
  return RUNTIME_ALLOW.some((origin) => url.startsWith(origin));
}

self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Only handle GET; everything else (POST to APIs, etc.) goes to network.
  if (req.method !== "GET") return;

  const url = req.url;

  // Never touch Google auth/API traffic.
  if (isNetworkOnly(url)) return;

  const sameOrigin = url.startsWith(self.location.origin);

  // Navigation requests: serve cached index.html when offline (SPA shell).
  if (req.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          return await fetch(req);
        } catch (err) {
          const cache = await caches.open(CACHE_VERSION);
          return (
            (await cache.match("./index.html")) ||
            (await cache.match("./")) ||
            Response.error()
          );
        }
      })()
    );
    return;
  }

  // Same-origin assets: cache-first.
  if (sameOrigin) {
    event.respondWith(cacheFirst(req));
    return;
  }

  // Allowed cross-origin (fonts, Chart.js): stale-while-revalidate.
  if (isRuntimeAllowed(url)) {
    event.respondWith(staleWhileRevalidate(req));
    return;
  }

  // Anything else: pass through to network (no interception).
});

async function cacheFirst(req) {
  const cache = await caches.open(CACHE_VERSION);
  const cached = await cache.match(req);
  if (cached) return cached;
  try {
    const res = await fetch(req);
    if (res && res.status === 200) {
      cache.put(req, res.clone());
    }
    return res;
  } catch (err) {
    return cached || Response.error();
  }
}

async function staleWhileRevalidate(req) {
  const cache = await caches.open(CACHE_VERSION);
  const cached = await cache.match(req);
  const network = fetch(req)
    .then((res) => {
      // Cache successful or opaque (cross-origin font) responses.
      if (res && (res.status === 200 || res.type === "opaque")) {
        cache.put(req, res.clone());
      }
      return res;
    })
    .catch(() => cached);
  return cached || network;
}
