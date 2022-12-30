const filesToCache = [
    "manifest.webmanifest",
    "index.html",
    "404.html",
    "offline.html",
    "images/icon48.png",
    "images/icon72.png",
    "images/icon96.png",
    "images/icon144.png",
    "images/icon168.png",
    "images/icon192.png",
    "sw.js",
    "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"
];
const staticCacheName = "static-cache-v1";

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(staticCacheName).then((cache) => {
            return cache.addAll(filesToCache);
        })
    );
});

self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches
        .match(event.request)
        .then((response) => {
            if (response) {
                return response;
            }
            return fetch(event.request).then((response) => {
                if (response.status === 404) {
                    return caches.match("404.html");
                }
                return caches.open(staticCacheName).then((cache) => {
                    cache.put(event.request.url, response.clone());
                    return response;
                });
            });
        })
        .catch((error) => {
            return caches.match("offline.html");
        })
    );
});