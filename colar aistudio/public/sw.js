// CondoManager AI - Service Worker (Offline Cache, Push Notifications, Background Sync)

const CACHE_NAME = "condomanager-v2.0-cache";
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/src/assets/images/condomanager_logo.webp"
];

// 1. Install Event - Pre-cache critical offline shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[ServiceWorker] A pré-carregar shell offline...");
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// 2. Activate Event - Clean up stale caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log("[ServiceWorker] A remover cache antiga:", cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Fetch Event - Network First with Offline Fallback
self.addEventListener("fetch", (event) => {
  // Ignore non-GET requests or chrome-extension URLs
  if (event.request.method !== "GET" || !event.request.url.startsWith("http")) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Cache successful GET responses
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        console.log("[ServiceWorker] Modo Offline: A servir recurso da cache...", event.request.url);
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Offline Fallback Page
          if (event.request.headers.get("accept").includes("text/html")) {
            return caches.match("/index.html");
          }
        });
      })
  );
});

// 4. Push Notification Event
self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : { title: "CondoManager AI", body: "Nova notificação do condomínio." };
  const options = {
    body: data.body,
    icon: "/src/assets/images/condomanager_logo.webp",
    badge: "/src/assets/images/condomanager_logo.webp",
    vibrate: [100, 50, 100],
    data: {
      url: data.url || "/"
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click event
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});

// 5. Background Sync Event (Offline -> Online Queue Sync)
self.addEventListener("sync", (event) => {
  if (event.tag === "pwa-sync-offline-queue") {
    console.log("[ServiceWorker] Sincronização em segundo plano ativada: A enviar fila de pedidos offline...");
    event.waitUntil(
      fetch("/api/pwa/sync-offline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: "background-sync-sw" })
      }).catch((err) => console.error("Erro na sincronização SW:", err))
    );
  }
});
