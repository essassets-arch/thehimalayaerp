import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, isSupported } from 'firebase/messaging';

// Public Web SDK Config for Firebase Push
const firebaseConfig = {
  apiKey:
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
    'AIzaSyCKsMYkWC3yhiKNt5VQuRhxOogrGwTh_DA',
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    'himalaya-c9d06.firebaseapp.com',
  projectId:
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'himalaya-c9d06',
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    'himalaya-c9d06.firebasestorage.app',
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '478469947785',
  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID ||
    '1:478469947785:web:bb56793c56cd6e91b7e158',
  measurementId:
    process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ||
    'G-VSNCPJ95SJ',
};

let app = null;
let messaging = null;
let isFirebaseSupported = false;

if (typeof window !== 'undefined') {
  try {
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }

    isSupported().then((supported) => {
      isFirebaseSupported = supported;
      if (supported && app) {
        messaging = getMessaging(app);
      }
    });
  } catch (err) {
    console.warn('[Firebase Client] Initialization failed:', err);
  }
}

export { app, messaging, isFirebaseSupported };
export default app;
