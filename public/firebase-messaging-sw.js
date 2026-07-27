/* eslint-disable no-undef */
// ── Firebase Messaging Service Worker ───────────────────────────────────────
// Runs in background context: handles push messages even when app tab is closed.
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

// ── Firebase Project Config ──────────────────────────────────────────────────
// This must match the config in src/shared/firebase/firebase.js
const firebaseConfig = {
  apiKey:            "AIza...",
  authDomain:        "himalaya-c9d06.firebaseapp.com",
  projectId:         "himalaya-c9d06",
  storageBucket:     "himalaya-c9d06.firebasestorage.app",
  messagingSenderId: "478469947785",
  appId:             "1:478469947785:web:5250079f83412713b7e158",
};

// Initialize Firebase inside the service worker
let messaging = null;
try {
  firebase.initializeApp(firebaseConfig);
  messaging = firebase.messaging();
  console.log('[Service Worker] Firebase initialized successfully.');
} catch (err) {
  console.error('[Service Worker] Firebase initialization failed:', err.message);
}

// ── Background Message Handler (FCM SDK) ─────────────────────────────────────
// Called when a push message arrives and the app tab is in the background/closed.
if (messaging) {
  messaging.onBackgroundMessage((payload) => {
    console.log('[Service Worker] Background FCM message received:', payload);

    const title = payload.notification?.title || 'Himalaya ERP Alert';
    const body  = payload.notification?.body  || '';
    const data  = payload.data || {};

    const options = {
      body,
      icon:  '/favicon.svg',
      badge: '/icons.svg',
      data: {
        navigation_url: data.navigation_url || '/',
        event_type:     data.event_type     || '',
      },
      requireInteraction: data.priority === 'High' || data.priority === 'Critical',
      tag: `himalaya-erp-${data.event_type || 'notification'}`,
    };

    self.registration.showNotification(title, options);
  });
}

// ── Native Push Listener Fallback ─────────────────────────────────────────────
// Catches raw WebPush payloads in case Firebase SDK does not intercept first.
// This ensures delivery robustness even on non-Chrome browsers or edge cases.
self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const payload = event.data.json();

    // FCM SDK already handles this — avoid double notification
    if (payload.from || payload.fcmMessageId) return;

    const title  = payload.notification?.title || payload.title || 'Himalaya ERP Alert';
    const body   = payload.notification?.body  || payload.message || payload.body || '';
    const data   = payload.data || {};

    const options = {
      body,
      icon:  '/favicon.svg',
      badge: '/icons.svg',
      data: {
        navigation_url: data.navigation_url || '/',
      },
    };

    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  } catch (err) {
    console.error('[Service Worker] Error parsing push event payload:', err.message);
  }
});

// ── Notification Click Listener ──────────────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const navigationUrl = event.notification.data?.navigation_url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // 1. If an ERP portal tab is already open, focus it and navigate
      for (const client of clientList) {
        const url = new URL(client.url);
        if (url.origin === self.location.origin) {
          return client.focus().then(() => client.navigate(navigationUrl));
        }
      }
      // 2. If no tab is open, open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(navigationUrl);
      }
    })
  );
});
