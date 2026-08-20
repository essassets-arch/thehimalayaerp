import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, isSupported } from 'firebase/messaging';

// Public Web SDK Config for Firebase Push - no hardcoded fallbacks
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

let app = null;
let messaging = null;
let isFirebaseSupported = false;

if (typeof window !== 'undefined') {
  try {
    const requiredKeys = ['apiKey', 'projectId', 'messagingSenderId', 'appId'];
    const missingKeys = requiredKeys.filter((key) => !firebaseConfig[key]);

    if (missingKeys.length > 0) {
      console.error(`[Firebase Client] Missing required configuration keys: ${missingKeys.join(', ')}`);
      isFirebaseSupported = false;
    } else {
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
    }
  } catch (err) {
    console.warn('[Firebase Client] Initialization failed:', err);
  }
}

export { app, messaging, isFirebaseSupported };
export default app;
