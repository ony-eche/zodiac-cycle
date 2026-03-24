// public/sw.js - Combined service worker for ZodiacCycle

// Push notification handler
self.addEventListener('push', function(event) {
  console.log('[Service Worker] Push received');
  
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'ZodiacCycle', body: event.data.text() };
    }
  }
  
  const options = {
    body: data.body || 'New update from ZodiacCycle',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-96x96.png',
    vibrate: [200, 100, 200],
    data: { url: data.url || '/' },
    tag: 'zodiac-notification',
    renotify: true
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'ZodiacCycle', options)
  );
});

// Notification click handler - opens the app
self.addEventListener('notificationclick', function(event) {
  console.log('[Service Worker] Notification clicked');
  event.notification.close();
  
  const url = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If there's already a window/tab open, focus it
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open a new window
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// Service worker installation
self.addEventListener('install', function(event) {
  console.log('[Service Worker] Installing');
  self.skipWaiting();
});

// Service worker activation
self.addEventListener('activate', function(event) {
  console.log('[Service Worker] Activating');
  event.waitUntil(clients.claim());
});