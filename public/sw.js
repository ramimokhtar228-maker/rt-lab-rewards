/**
 * RT Lab Rewards - Service Worker Uninstaller & Cache Buster v3.3
 * Ensures all client devices immediately purge any old cached bundles and always load the latest official laboratory data.
 */

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => Promise.all(cacheNames.map((name) => caches.delete(name))))
      .then(() => self.registration.unregister())
      .then(() => self.clients.matchAll({ type: 'window' }))
      .then((clients) => {
        clients.forEach((client) => {
          if ('navigate' in client) {
            client.navigate(client.url);
          }
        });
      })
  );
});

// Do not intercept or cache any requests - always pass straight through to network
self.addEventListener('fetch', () => {
  // Pass-through
});
