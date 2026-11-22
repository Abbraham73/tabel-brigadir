const CACHE = "tabel-v2";
self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  );
});
self.addEventListener("activate", (e) => { e.waitUntil(clients.claim()); });
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  if (e.request.mode === "navigate") {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
          return res;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }
  e.respondWith(
    caches.open(CACHE).then((c) =>
      c.match(e.request).then((r) =>
        r ||
        fetch(e.request).then((res) => {
          if (res && res.status === 200 && e.request.method === "GET") {
            c.put(e.request, res.clone());
          }
          return res;
        })
      )
    )
  );
});
