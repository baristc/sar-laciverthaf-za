const CACHE_NAME = "fener-transfer-duellosu-pwa-v2";
const APP_SHELL = [
  "./",
  "./index.html",
  "./style.css?v=9",
  "./script.js?v=10",
  "./leaderboard.js?v=1",
  "./online.js?v=7",
  "./pwa.js?v=1",
  "./manifest.webmanifest?v=1",
  "./players.json?v=8",
  "./club_catalog.json?v=1",
  "./images/fenerbahce-logo.png?v=2",
  "./images/club-badges.png?v=1",
  "./images/icon-192.png?v=1",
  "./images/icon-512.png?v=1"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== "GET" || url.origin !== self.location.origin) return;
  if (url.pathname.includes("/api/")) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put("./index.html", copy));
          return response;
        })
        .catch(() => caches.match("./index.html"))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      });
    })
  );
});