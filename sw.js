/* Increment the version whenever a shell file changes. No personal data is cached. */
const CACHE_PREFIX = "meu-treino-";
const CACHE_NAME = `${CACHE_PREFIX}v2`;
const SHELL = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./controller.js",
  "./core.js",
  "./ui.js",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-192.png",
  "./icons/icon-maskable-512.png",
  "./icons/apple-touch-icon.png",
  "./icons/favicon.svg",
];
const SCOPE = new URL(self.registration.scope);
const SHELL_URLS = new Set(SHELL.map((file) => new URL(file, SCOPE).href));

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(SHELL);
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names
          .filter(
            (name) => name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME,
          )
          .map((name) => caches.delete(name)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (
    request.method !== "GET" ||
    url.origin !== SCOPE.origin ||
    !url.pathname.startsWith(SCOPE.pathname)
  )
    return;

  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(request);
          if (response.ok) return response;
        } catch {
          /* The precached shell works without a connection. */
        }
        const cache = await caches.open(CACHE_NAME);
        return (
          (await cache.match("./index.html")) ||
          new Response(
            "Abra o Meu Treino online uma vez para habilitar o modo offline.",
            {
              status: 503,
              headers: { "Content-Type": "text/plain; charset=utf-8" },
            },
          )
        );
      })(),
    );
    return;
  }

  // Only immutable-by-version public shell assets; never backups or user content.
  if (!SHELL_URLS.has(url.href)) return;
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(request);
      if (cached) return cached;
      try {
        const response = await fetch(request);
        if (response.ok && response.type !== "opaque")
          await cache.put(request, response.clone());
        return response;
      } catch {
        return new Response("Recurso indisponível offline.", {
          status: 503,
          headers: { "Content-Type": "text/plain; charset=utf-8" },
        });
      }
    })(),
  );
});
