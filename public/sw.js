const CACHE_NAME = "fjt-pages-v1";
const ASSET_CACHE = "fjt-assets-v1";

self.addEventListener("install", (event) => {
    // Pre-cache the app shell
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll([
                "/",
                "/tools",
                "/collections",
                "/large-files",
            ]);
        })
    );
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    // Clean up old caches
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys
                    .filter((key) => !key.startsWith("fjt-"))
                    .map((key) => caches.delete(key))
            );
        })
    );
    self.clients.claim();
});

self.addEventListener("fetch", (event) => {
    // Only handle GET requests on our own origin
    if (event.request.method !== "GET") return;
    if (!event.request.url.startsWith(self.location.origin)) return;

    // 1. Navigation Requests (HTML Pages) → Network First, Fallback to Cache
    if (event.request.mode === "navigate") {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
                    return response;
                })
                .catch(() => caches.match(event.request))
        );
        return;
    }

    // 2. Static Assets (CSS, JS, Fonts, Images) → Cache First
    event.respondWith(
        caches.match(event.request).then((cached) => {
            if (cached) return cached;

            return fetch(event.request).then((response) => {
                if (response.ok) {
                    const clone = response.clone();
                    caches.open(ASSET_CACHE).then((cache) => cache.put(event.request, clone));
                }
                return response;
            });
        })
    );
});