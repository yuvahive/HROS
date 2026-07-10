// HiveDesk Service Worker — Background Push Notifications
const CACHE_NAME = 'hivedesk-v1';
const NOTIFICATION_TAG = 'hivedesk-notification';

// Install — skip waiting to activate immediately
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Activate — claim all clients
self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// Listen for push messages from the main thread
self.addEventListener('message', (event) => {
  const { type, notification } = event.data;

  if (type === 'SHOW_NOTIFICATION' && notification) {
    const { title, body, icon, tag, url } = notification;

    self.registration.showNotification(title, {
      body,
      icon: icon || '/favicon.svg',
      badge: '/favicon.svg',
      tag: tag || NOTIFICATION_TAG,
      requireInteraction: false,
      silent: false,
      data: { url: url || '/' }
    });
  }

  if (type === 'CLEAR_NOTIFICATIONS') {
    self.registration.getNotifications().then(notifications => {
      notifications.forEach(n => n.close());
    });
  }
});

// Handle notification click — open the app
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const url = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      // If app is already open, focus it
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus();
          if (url !== '/') client.navigate(url);
          return;
        }
      }
      // Otherwise open a new window
      return clients.openWindow(url);
    })
  );
});
