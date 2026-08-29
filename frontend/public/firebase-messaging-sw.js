// Service Worker for Firebase Cloud Messaging Background Push Notifications
// GENERATED DYNAMICALLY DURING FRONTEND PREBUILD - DO NOT EDIT MANUALLY

// Version matched to frontend NPM dependencies: firebase@11.10.0
importScripts('https://www.gstatic.com/firebasejs/11.10.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.10.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyCKsMYkWC3yhiKNt5VQuRhxOogrGwTh_DA",
  authDomain: "himalaya-c9d06.firebaseapp.com",
  projectId: "himalaya-c9d06",
  storageBucket: "himalaya-c9d06.firebasestorage.app",
  messagingSenderId: "478469947785",
  appId: "1:478469947785:web:bb56793c56cd6e91b7e158",
};

// Immediate activation listeners
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

if (firebaseConfig.apiKey && firebaseConfig.projectId) {
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message: ', payload);

    const notificationTitle = payload.notification?.title || payload.data?.title || 'Himalaya ERP Notification';
    const notificationOptions = {
      body: payload.notification?.body || payload.data?.message || 'You have a new update in Himalaya ERP.',
      icon: '/icon.png',
      badge: '/badge.png',
      data: {
        route: payload.data?.route || '/',
        notificationId: payload.data?.notificationId,
      },
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  });
} else {
  console.warn('[firebase-messaging-sw.js] Firebase credentials missing inside service worker. Push notifications will be inactive.');
}

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const route = event.notification.data?.route || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          client.navigate(route);
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(route);
      }
    })
  );
});
