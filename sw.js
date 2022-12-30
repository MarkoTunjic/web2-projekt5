import { entries, del } from "https://cdn.jsdelivr.net/npm/idb-keyval@6/+esm"
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
    console.log("Attempting to install service worker and cache static assets");
    event.waitUntil(
        caches.open(staticCacheName).then((cache) => {
            return cache.addAll(filesToCache);
        })
    );
});

self.addEventListener("fetch", (event) => {
    console.log("here3");
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

self.addEventListener("sync", function(event) {
    console.log("here1")
    if (event.tag === "sync-counter") {
        event.waitUntil(syncCounter());
    }
});
let syncCounter = async function() {
    console.log("here2")
    entries().then((entries) => {
        entries.forEach((entry) => {
            let value = entry[1]; // Each entry is an array of [key, value].
            console.log(entry);
            fetch("http://localhost:8080/generatedDocuments/" + value.counter, {
                method: "GET"
            }).then(function(res) {
                if (res.ok) {
                    res.json().then(function(data) {
                        document.getElementById('counter').innerHTML = data;
                        del(1);
                    });
                } else { console.log(res); }
            }).catch(function(error) { console.log(error); });
        });
    });
};