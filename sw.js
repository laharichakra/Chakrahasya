// Chakrahasya offline support.
// Online: always load the newest version from GitHub and refresh the saved copy.
// Offline: use the saved copy.
const CACHE = "chakrahasya-v7";
const FILES = ["./", "index.html", "manifest.json", "icon.png", "cities.json", "astronomy.min.js"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c =>
    Promise.all(FILES.map(f => fetch(new Request(f, { cache: "reload" })).then(r => r.ok && c.put(f, r))))
  ));
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(
    fetch(req, { cache: "no-cache" })
      .then(res => {
        if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
        return res;
      })
      .catch(() => caches.match(req, { ignoreSearch: true }).then(hit => hit || caches.match("index.html")))
  );
});
