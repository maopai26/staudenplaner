const CACHE_NAME = "staudenbeet-shell-v3"; // v0.2 — bump bei jedem Release, damit Nutzer:innen das Update bekommen
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./data.js",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  // Nur eigene Dateien behandeln; externe Aufrufe (z.B. Wikipedia-Bilder)
  // unangetastet durchs Netzwerk laufen lassen.
  if (url.origin !== self.location.origin) return;

  // "Network-first": immer zuerst versuchen, die aktuelle Version aus dem
  // Netz zu laden (und den Cache dabei zu aktualisieren). Nur wenn das
  // Netzwerk nicht erreichbar ist (offline), greift der Cache als Fallback.
  // So kann eine veraltete gecachte app.js/index.html nie mehr "hängen
  // bleiben", wenn ein Update ausgeliefert wird.
  event.respondWith(
    fetch(req)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
        return res;
      })
      .catch(() => caches.match(req).then((cached) => cached || caches.match("./index.html")))
  );
});
