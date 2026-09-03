import { getToken, onMessage, isSupported, getMessaging } from 'firebase/messaging';
import { app } from './firebase';
import { useNotificationStore } from '@/store/notificationStore';

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || 'BDO2LpNii_w92F7_aA8Czfp9Xx82IWI-mPhi4Xt3DLC0CF6gRU7Knkg2W8oiv-lGvbiUjlh5xF2D6cijH55dgns';

const getAuthToken = () => {
  if (typeof window === 'undefined') return null;
  const hasAuthStorage = localStorage.getItem('auth-storage');
  let token = localStorage.getItem('token') || sessionStorage.getItem('token');
  if (!token && hasAuthStorage) {
    try {
      const auth = JSON.parse(hasAuthStorage);
      token = auth?.state?.accessToken || auth?.state?.token;
    } catch (e) {}
  }
  return token;
};

/**
 * Register FCM device token on backend.
 */
export const sendTokenToServer = async (fcmToken) => {
  try {
    const token = getAuthToken();
    if (!token) return false;

    const isMobile = typeof navigator !== 'undefined' && /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);

    const res = await fetch('/api/backend/notifications/device-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        token: fcmToken,
        deviceType: isMobile ? 'mobile' : 'web',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (res.ok || data.success) {
      console.log('[Firebase Client] Token registered successfully on backend.');
      if (typeof window !== 'undefined') {
        localStorage.setItem('registered_fcm_token', fcmToken);
      }
      return true;
    } else {
      console.warn('[Firebase Client] Backend rejected FCM token registration:', res.status, data);
      return false;
    }
  } catch (err) {
    console.warn('[Firebase Client] Failed to register token on backend:', err.message);
    return false;
  }
};

/**
 * Remove/Deactivate FCM token on logout.
 */
export const deactivateFCMToken = async () => {
  const currentToken = typeof window !== 'undefined' ? localStorage.getItem('registered_fcm_token') : null;
  if (typeof window !== 'undefined') {
    localStorage.removeItem('fcm_registration_failed');
  }
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
    if (typeof window !== 'undefined') {
      localStorage.removeItem('registered_fcm_token');
    }
  } catch (err) {
    console.warn('[Firebase Client] Failed to deactivate token:', err.message);
  }
};

/**
 * Main permission requesting and token registration flow.
 */
export const initializePushNotifications = async () => {
  if (typeof window === 'undefined') {
    return { success: false, error: 'SSR environment' };
  }

  // Detect iOS Safari without Notification support
  if (!('Notification' in window)) {
    return { success: true, unsupported: true, message: 'Notifications unsupported on this browser platform' };
  }

  if (!('serviceWorker' in navigator)) {
    return { success: false, error: 'Service Worker not supported' };
  }

  try {
    const supported = await isSupported();
    if (!supported || !app) {
      console.log('[Firebase Client] Messaging not supported or configured — skipping push setup.');
      return { success: true, unsupported: true, message: 'Firebase Messaging unsupported' };
    }

    const messagingInstance = getMessaging(app);

    // 1. Register background service worker
    const swRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    await navigator.serviceWorker.ready;

    // 2. Validate VAPID key
    const validateVapidKey = (value) => {
      if (!value) return null;
      const key = String(value).trim().replace(/^['"]|['"]$/g, '').trim();
      if (!key || key === 'undefined' || key === 'null') return null;
      if (!/^[A-Za-z0-9_\-+/=]+$/.test(key)) return null;
      return key;
    };

    const cleanVapidKey = validateVapidKey(VAPID_KEY);
    if (!cleanVapidKey) {
      return { success: false, error: 'Invalid VAPID key' };
    }

    // 3. Fetch FCM token
    const fcmToken = await getToken(messagingInstance, {
      serviceWorkerRegistration: swRegistration,
      vapidKey: cleanVapidKey,
    });

    if (!fcmToken) {
      return { success: false, error: 'Failed to obtain FCM token' };
    }

    console.log('[Firebase Client] FCM token obtained successfully.');

    // 4. Send token to backend
    const registered = await sendTokenToServer(fcmToken);

    // 5. Foreground FCM Listener
    onMessage(messagingInstance, (payload) => {
      console.log('[Firebase Client] Foreground push received:', payload);
      const title = payload.notification?.title || payload.data?.title || 'New Notification';
      const body = payload.notification?.body || payload.data?.message || '';

      const store = useNotificationStore.getState();
      if (store.fetchNotifications) {
        store.fetchNotifications();
      }
      if (store.showToast && body) {
        store.showToast(`${title}: ${body}`);
      }

      // Mobile compatible showNotification via Service Worker registration
      try {
        if (typeof window !== 'undefined' && 'Notification' in window && window.Notification?.permission === 'granted') {
          if ('serviceWorker' in navigator && navigator.serviceWorker.ready) {
            navigator.serviceWorker.ready.then((reg) => {
              if (reg && typeof reg.showNotification === 'function') {
                reg.showNotification(title, {
                  body,
                  icon: '/icon.png',
                  badge: '/icon.png',
                  data: { route: payload.data?.route || '/' },
                });
              }
            }).catch((err) => {
              console.warn('[Firebase Client] showNotification error:', err);
            });
          }
        }
      } catch (notifErr) {
        console.warn('[Firebase Client] Notification permission evaluation error:', notifErr);
      }
    });

    return { success: true, token: fcmToken, backendRegistered: registered };
  } catch (err) {
    console.warn('[Firebase Client] Error setting up push notifications:', err?.message || err);
    if (typeof window !== 'undefined') {
      localStorage.setItem('fcm_registration_failed', 'true');
    }
    return { success: false, error: err?.message || 'Unknown push initialization error' };
  }
};
