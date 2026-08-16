import { getToken, onMessage, isSupported, getMessaging } from 'firebase/messaging';
import { app } from './firebase';
import { useNotificationStore } from '@/store/notificationStore';

const VAPID_KEY =
  process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY ||
  'BFcUKdC5mGzG-Tyy1z-X1PxTrlY3nPJ-GZc9PhokyE1-g7xfnMUb24gzb3kGLCvsnVftzjIJ9sJpljR8cR1Yl2s';

const getAuthToken = () => {
  if (typeof window === 'undefined') return null;
  const hasAuthStorage = localStorage.getItem('auth-storage');
  let token = localStorage.getItem('token');
  if (!token && hasAuthStorage) {
    try {
      const auth = JSON.parse(hasAuthStorage);
      token = auth?.state?.token;
    } catch (e) {}
  }
  return token;
};

/**
 * Register FCM device token on backend.
 */
const sendTokenToServer = async (fcmToken) => {
  try {
    const token = getAuthToken();
    if (!token) return;

    const res = await fetch('/api/backend/notifications/device-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        token: fcmToken,
        deviceType: 'web',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      }),
    });

    const data = await res.json();
    if (res.ok || data.success) {
      console.log('[Firebase Client] Token registered successfully on backend.');
      localStorage.setItem('registered_fcm_token', fcmToken);
    }
  } catch (err) {
    console.warn('[Firebase Client] Failed to register token on backend:', err.message);
  }
};

/**
 * Remove/Deactivate FCM token on logout.
 */
export const deactivateFCMToken = async () => {
  const currentToken = localStorage.getItem('registered_fcm_token');
  if (!currentToken) return;

  try {
    const token = getAuthToken();
    if (!token) return;

    await fetch('/api/backend/notifications/device-token', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ token: currentToken }),
    });

    console.log('[Firebase Client] Token deactivated on backend.');
    localStorage.removeItem('registered_fcm_token');
  } catch (err) {
    console.warn('[Firebase Client] Failed to deactivate token:', err.message);
  }
};

/**
 * Main permission requesting and token registration flow.
 */
export const initializePushNotifications = async () => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  try {
    const supported = await isSupported();
    if (!supported || !app) {
      console.log('[Firebase Client] Messaging not supported or configured — skipping push setup.');
      return;
    }

    const messagingInstance = getMessaging(app);

    // 1. Register background service worker
    const swRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    await navigator.serviceWorker.ready;

    // 2. Request notification permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('[Firebase Client] Notification permission denied by user.');
      return;
    }

    // 3. Fetch FCM token
    const fcmToken = await getToken(messagingInstance, {
      serviceWorkerRegistration: swRegistration,
      vapidKey: VAPID_KEY,
    });

    if (fcmToken) {
      console.log('[Firebase Client] FCM token obtained.');
      const savedToken = localStorage.getItem('registered_fcm_token');
      if (savedToken !== fcmToken) {
        await sendTokenToServer(fcmToken);
      }
    }

    // 4. Foreground FCM Listener: Refetches Bell unread list/count and shows toast
    onMessage(messagingInstance, (payload) => {
      console.log('[Firebase Client] Foreground push received:', payload);
      const title = payload.notification?.title || payload.data?.title || 'New Notification';
      const body = payload.notification?.body || payload.data?.message || '';

      // Trigger store refetch and toast
      const store = useNotificationStore.getState();
      if (store.fetchNotifications) {
        store.fetchNotifications();
      }
      if (store.showToast && body) {
        store.showToast(`${title}: ${body}`);
      }
    });
  } catch (err) {
    console.warn('[Firebase Client] Error setting up push notifications:', err.message);
  }
};
