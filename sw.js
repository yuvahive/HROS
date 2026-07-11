// HROS Service Worker — Background Push Notifications
const CACHE_NAME = 'hros-v1';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(clients.claim()));

self.addEventListener('message', (event) => {
  const { type, notification } = event.data;

  if (type === 'SHOW_NOTIFICATION' && notification) {
    self.registration.showNotification(notification.title, {
      body: notification.body,
      icon: notification.icon || '/favicon.svg',
      badge: '/favicon.svg',
      tag: notification.tag || `hros-${Date.now()}`,
      requireInteraction: false,
      silent: false,
      data: { url: notification.url || '/' }
    });
  }

  if (type === 'CLEAR_NOTIFICATIONS') {
    self.registration.getNotifications().then(ns => ns.forEach(n => n.close()));
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
      for (const c of clients) {
        if (c.url.includes(self.location.origin) && 'focus' in c) {
          c.focus();
          if (url !== '/') c.navigate(url);
          return;
        }
      }
      return clients.openWindow(url);
    })
  );
});
