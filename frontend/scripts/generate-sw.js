const fs = require('fs');
const path = require('path');

try {
  const swPath = path.join(__dirname, '..', 'public', 'firebase-messaging-sw.js');
  
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  const messagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
  const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;

  const isProduction = process.env.NODE_ENV === 'production';

  // In production builds, we fail loudly if Firebase credentials are missing.
  if (isProduction && (!apiKey || !projectId || !messagingSenderId || !appId)) {
    console.error('================================================================');
    console.error('🔴 CRITICAL BUILD ERROR: Missing required Firebase credentials!');
    console.error('================================================================');
    console.error(`NEXT_PUBLIC_FIREBASE_API_KEY: ${apiKey ? 'PRESENT' : 'MISSING'}`);
    console.error(`NEXT_PUBLIC_FIREBASE_PROJECT_ID: ${projectId ? 'PRESENT' : 'MISSING'}`);
    console.error(`NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: ${messagingSenderId ? 'PRESENT' : 'MISSING'}`);
    console.error(`NEXT_PUBLIC_FIREBASE_APP_ID: ${appId ? 'PRESENT' : 'MISSING'}`);
    throw new Error('Missing required Firebase environment variables for production build.');
  }

  // Fallback defaults only for development mode when environment is not set
  const defaultApiKey = apiKey || '';
  const defaultAuthDomain = authDomain || '';
  const defaultProjectId = projectId || '';
  const defaultStorageBucket = storageBucket || '';
  const defaultMessagingSenderId = messagingSenderId || '';
  const defaultAppId = appId || '';

  const swContent = `// Service Worker for Firebase Cloud Messaging Background Push Notifications
// GENERATED DYNAMICALLY DURING FRONTEND PREBUILD - DO NOT EDIT MANUALLY

// Version matched to frontend NPM dependencies: firebase@11.10.0
importScripts('https://www.gstatic.com/firebasejs/11.10.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.10.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "${defaultApiKey}",
  authDomain: "${defaultAuthDomain}",
  projectId: "${defaultProjectId}",
  storageBucket: "${defaultStorageBucket}",
  messagingSenderId: "${defaultMessagingSenderId}",
  appId: "${defaultAppId}",
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
`;

  fs.writeFileSync(swPath, swContent, 'utf8');
  console.log('[Firebase SW Generator] Successfully generated static public/firebase-messaging-sw.js');
} catch (err) {
  console.error('[Firebase SW Generator] Failed to generate service worker:', err.message);
  process.exit(1);
}
