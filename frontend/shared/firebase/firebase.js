import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, isSupported } from 'firebase/messaging';

// Reading configuration from VITE environment variables
const firebaseConfig = {
  apiKey:             import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:         import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:          import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:      import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId:  import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:              import.meta.env.VITE_FIREBASE_APP_ID,
};

let app = null;
let messaging = null;
let isFirebaseSupported = false;

// Only initialize if messagingSenderId is provided (non-mock environment)
const hasConfig = !!firebaseConfig.messagingSenderId;

if (hasConfig) {
  try {
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }
    
    // Check if browser environment supports messaging
    isSupported().then((supported) => {
      isFirebaseSupported = supported;
      if (supported) {
        messaging = getMessaging(app);
      }
    });
  } catch (err) {
    console.warn('[Firebase Client] Initialization failed:', err.message);
  }
} else {
  console.log('[Firebase Client] Running in SIMULATED Client Mode (no VITE_FIREBASE_MESSAGING_SENDER_ID configured).');
}

export { app, messaging, isFirebaseSupported };
export default app;
