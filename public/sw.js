// public/sw.js
self.addEventListener('push', function(event) {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'ZodiacCycle', body: event.data.text() };
    }
  }
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'ZodiacCycle', {
      body: data.body || 'New update',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      data: { url: data.url || '/' }
    })
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url));
});