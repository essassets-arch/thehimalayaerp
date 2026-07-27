import { getToken } from 'firebase/messaging';
import { messaging, isFirebaseSupported } from './firebase';

// Helper to generate a stable, pseudo-random UUID per browser session or browser storage
const getDeviceUuid = () => {
  let uuid = localStorage.getItem('erp_device_uuid');
  if (!uuid) {
    uuid = 'device_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('erp_device_uuid', uuid);
  }
  return uuid;
};

// Parse basic browser / OS environment details for the device list UI
const getDeviceInfo = () => {
  const ua = navigator.userAgent;
  let browser = 'Unknown Browser';
  let platform = 'Unknown OS';

  if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
  else if (ua.includes('Edge')) browser = 'Edge';

  if (ua.includes('Windows')) platform = 'Windows';
  else if (ua.includes('Macintosh')) platform = 'macOS';
  else if (ua.includes('Android')) platform = 'Android';
  else if (ua.includes('iPhone') || ua.includes('iPad')) platform = 'iOS';
  else if (ua.includes('Linux')) platform = 'Linux';

  return {
    browser,
    platform,
    deviceName: `${platform} ${browser}`,
    deviceUuid: getDeviceUuid(),
  };
};

/**
 * Send the FCM token to the backend server.
 */
const sendTokenToServer = async (fcmToken) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return;

    const deviceInfo = getDeviceInfo();
    const res = await fetch('/api/firebase/tokens', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        fcmToken,
        ...deviceInfo,
      }),
    });

    const data = await res.json();
    if (data.success) {
      console.log('[Firebase Client] Token registered successfully on backend.');
      localStorage.setItem('registered_fcm_token', fcmToken);
    }
  } catch (err) {
    console.warn('[Firebase Client] Failed to register token on backend:', err.message);
  }
};

/**
 * Remove/Deactivate FCM token on backend.
 */
export const deactivateFCMToken = async () => {
  const currentToken = localStorage.getItem('registered_fcm_token');
  if (!currentToken) return;

  try {
    const token = localStorage.getItem('token');
    if (!token) return;

    await fetch('/api/firebase/tokens', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ fcmToken: currentToken }),
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
  if (!isFirebaseSupported || !messaging) {
    console.log('[Firebase Client] Messaging not supported or configured on this browser — skipping push setup.');
    return;
  }

  try {
    // 1. Request notification permission
    const permission = await Notification.requestPermission();
    console.log(`[Firebase Client] Notification permission: ${permission}`);

    if (permission !== 'granted') {
      console.log('[Firebase Client] Notification permission denied by user.');
      return;
    }

    // 2. Fetch the registration token
    // We register the background service worker file name explicitly
    const swRegistration = await navigator.serviceWorker.ready;
    const fcmToken = await getToken(messaging, {
      serviceWorkerRegistration: swRegistration,
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY || '',
    });

    if (fcmToken) {
      console.log('[Firebase Client] FCM token obtained.');
      
      // 3. Register token on backend if it has changed
      const savedToken = localStorage.getItem('registered_fcm_token');
      if (savedToken !== fcmToken) {
        await sendTokenToServer(fcmToken);
      } else {
        console.log('[Firebase Client] Token is up to date.');
      }
    } else {
      console.warn('[Firebase Client] No FCM token retrieved. User may need to regrant permissions.');
    }
  } catch (err) {
    console.warn('[Firebase Client] Error setting up push notifications:', err.message);
  }
};
