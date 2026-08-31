'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';
import { initializePushNotifications } from '@/shared/firebase/messaging';
import { backendFetch } from '@/lib/backendFetch';
import {
  Bell,
  MapPin,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  LogOut,
  ArrowRight,
  RefreshCw,
  Lock,
  Smartphone,
  Info,
  Settings
} from 'lucide-react';

export type PermissionLifecycleState =
  | 'idle'
  | 'checking'
  | 'prompt'
  | 'requesting'
  | 'registering'
  | 'verifying'
  | 'granted'
  | 'denied'
  | 'device_disabled'
  | 'unsupported';

interface MandatoryPermissionsModalProps {
  onAllGranted?: () => void;
}

// Detect if running inside Flutter InAppWebView or Android Hybrid APK
const checkIsFlutterApk = (): boolean => {
  if (typeof window === 'undefined') return false;
  const w = window as any;
  return (
    !!w.flutter_inappwebview ||
    !!w.HimalayaNativeBridge ||
    !!w.HimalayaBridge ||
    !!w.AndroidBridge ||
    /HimalayaERP|wv|Android.*Version\/[0-9.]+\s+Chrome\/[0-9.]+\s+Mobile/i.test(navigator.userAgent)
  );
};

export default function MandatoryPermissionsModal({ onAllGranted }: MandatoryPermissionsModalProps) {
  const { isAuthenticated, logout } = useAuthStore();

  const [notificationState, setNotificationState] = useState<PermissionLifecycleState>('prompt');
  const [locationState, setLocationState] = useState<PermissionLifecycleState>('prompt');

  const [notificationMessage, setNotificationMessage] = useState<string | null>(null);
  const [locationMessage, setLocationMessage] = useState<string | null>(null);

  const [activeStepText, setActiveStepText] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  const [isApkEnvironment, setIsApkEnvironment] = useState(false);

  // Concurrency Lock: Prevents duplicate mobile taps while an operation is in-flight
  const operationLockRef = useRef(false);

  // Helper to safely get stored device id
  const getDeviceId = () => {
    if (typeof window === 'undefined') return '';
    let devId = window.localStorage.getItem('himalaya_device_id');
    if (!devId) {
      devId = crypto.randomUUID();
      window.localStorage.setItem('himalaya_device_id', devId);
    }
    return devId;
  };

  // Helper to parse device info
  const getDeviceInfo = () => {
    if (typeof window === 'undefined') return { browser: 'Browser', os: 'OS', deviceType: 'DESKTOP' };
    const ua = navigator.userAgent;
    let browser = 'Chrome';
    let os = 'Windows';
    let deviceType = 'DESKTOP';

    if (/iPhone|iPad|iPod/i.test(ua)) {
      os = 'iOS';
      deviceType = /iPad/i.test(ua) ? 'TABLET' : 'MOBILE';
    } else if (/Android/i.test(ua)) {
      os = 'Android';
      deviceType = 'MOBILE';
    } else if (/Macintosh/i.test(ua)) os = 'macOS';
    else if (/Linux/i.test(ua)) os = 'Linux';

    if (checkIsFlutterApk()) {
      deviceType = 'MOBILE';
      browser = 'Flutter APK WebView';
    } else if (/Firefox/i.test(ua)) browser = 'Firefox';
    else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = 'Safari';
    else if (/Edge/i.test(ua)) browser = 'Edge';

    return { browser, os, deviceType };
  };

  // Detect APK on mount
  useEffect(() => {
    setIsApkEnvironment(checkIsFlutterApk());
  }, []);

  /**
   * Listen for Native Flutter JS Bridge broadcasts
   */
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const w = window as any;

    // Handle Flutter Injected Handler / Window Callback
    const handleNativePermissionsEvent = (data: any) => {
      if (!data) return;
      if (data.notifications === 'allowed' || data.notifications === 'granted') {
        setNotificationState('granted');
        setNotificationMessage(null);
      } else if (data.notifications === 'denied') {
        setNotificationState('denied');
        setNotificationMessage('Notifications are Blocked. Please enable in Android Settings.');
      }

      if (data.location === 'allowed' || data.location === 'granted') {
        sessionStorage.setItem('himalaya_location_verified', 'true');
        if (data.latitude && data.longitude) {
          sessionStorage.setItem('himalaya_last_lat', String(data.latitude));
          sessionStorage.setItem('himalaya_last_lng', String(data.longitude));
        }
        setLocationState('granted');
        setLocationMessage(null);
      } else if (data.location === 'denied') {
        setLocationState('denied');
        setLocationMessage('Location permission is Blocked. Please enable in Android Settings.');
      } else if (data.location === 'disabled') {
        setLocationState('device_disabled');
        setLocationMessage('Device GPS is turned OFF. Please swipe down from top of phone and turn on Location.');
      }
    };

    w.onHimalayaNativePermissions = handleNativePermissionsEvent;

    const eventListener = (e: any) => {
      handleNativePermissionsEvent(e.detail || e.data);
    };

    window.addEventListener('himalaya:native_permissions', eventListener);

    return () => {
      window.removeEventListener('himalaya:native_permissions', eventListener);
      delete w.onHimalayaNativePermissions;
    };
  }, []);

  /**
   * High-reliability location acquisition (Flutter Native Bridge + Web fallback)
   */
  const acquireRealLocation = async (): Promise<{
    latitude: number;
    longitude: number;
    accuracy?: number;
    altitude?: number;
    speed?: number;
    heading?: number;
  }> => {
    const w = window as any;

    // 1. Try Flutter InAppWebView Native Bridge Handler
    if (w.flutter_inappwebview && typeof w.flutter_inappwebview.callHandler === 'function') {
      try {
        const nativeRes = await w.flutter_inappwebview.callHandler('requestLocation');
        if (nativeRes && (nativeRes.status === 'granted' || nativeRes.latitude)) {
          return {
            latitude: nativeRes.latitude,
            longitude: nativeRes.longitude,
            accuracy: nativeRes.accuracy || 10,
            altitude: nativeRes.altitude || 0,
            speed: nativeRes.speed || 0,
            heading: nativeRes.heading || 0,
          };
        } else if (nativeRes?.status === 'denied') {
          throw { code: 1, message: 'Location permission denied by Android' };
        } else if (nativeRes?.status === 'disabled') {
          throw { code: 2, message: 'Device GPS is turned OFF in phone settings' };
        }
      } catch (err: any) {
        if (err?.code === 1 || err?.code === 2) throw err;
        console.warn('[MandatoryPermissions] Flutter native location bridge failed, falling back to Web Geolocation:', err);
      }
    }

    // 2. Web Geolocation Fallback
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !('geolocation' in navigator)) {
        return reject(new Error('Geolocation not supported by this device/browser.'));
      }

      let resolved = false;
      let watchId: number | null = null;

      const timer = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          if (watchId !== null) navigator.geolocation.clearWatch(watchId);
          reject({ code: 3, message: 'GPS request timed out. Please tap "Allow GPS Location Access" again.' });
        }
      }, 30000);

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (!resolved) {
            resolved = true;
            clearTimeout(timer);
            if (watchId !== null) navigator.geolocation.clearWatch(watchId);
            resolve({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              accuracy: pos.coords.accuracy,
              altitude: pos.coords.altitude || 0,
              speed: pos.coords.speed || 0,
              heading: pos.coords.heading || 0,
            });
          }
        },
        (err) => {
          if (err.code === 1) {
            if (!resolved) {
              resolved = true;
              clearTimeout(timer);
              if (watchId !== null) navigator.geolocation.clearWatch(watchId);
              reject(err);
            }
            return;
          }

          if (!resolved && watchId === null) {
            watchId = navigator.geolocation.watchPosition(
              (watchPos) => {
                if (!resolved) {
                  resolved = true;
                  clearTimeout(timer);
                  if (watchId !== null) navigator.geolocation.clearWatch(watchId);
                  resolve({
                    latitude: watchPos.coords.latitude,
                    longitude: watchPos.coords.longitude,
                    accuracy: watchPos.coords.accuracy,
                    altitude: watchPos.coords.altitude || 0,
                    speed: watchPos.coords.speed || 0,
                    heading: watchPos.coords.heading || 0,
                  });
                }
              },
              (watchErr) => {
                if (watchErr.code === 1 && !resolved) {
                  resolved = true;
                  clearTimeout(timer);
                  if (watchId !== null) navigator.geolocation.clearWatch(watchId);
                  reject(watchErr);
                }
              },
              { enableHighAccuracy: false, maximumAge: 300000, timeout: 25000 }
            );
          }
        },
        { enableHighAccuracy: false, maximumAge: 300000, timeout: 25000 }
      );
    });
  };

  /**
   * Centralized Non-Destructive Status Checker
   */
  const checkCurrentPermissions = useCallback(async () => {
    if (typeof window === 'undefined') return;

    // 1. Notification Status Evaluation
    if (!('Notification' in window) && !checkIsFlutterApk()) {
      setNotificationState('granted');
      setNotificationMessage(null);
    } else {
      const currentPerm = (window as any).Notification?.permission;
      const isRegistered = localStorage.getItem('registered_fcm_token');

      if (currentPerm === 'granted') {
        setNotificationState('granted');
        setNotificationMessage(null);
      } else if (currentPerm === 'denied') {
        setNotificationState('denied');
        setNotificationMessage(
          checkIsFlutterApk()
            ? 'Notifications are Blocked. Please enable in Android Settings → Apps → Himalaya ERP.'
            : 'Notifications are Blocked. Tap the 🔒 lock icon in the address bar to Allow.'
        );
      } else {
        setNotificationState('prompt');
        setNotificationMessage(null);
      }
    }

    // 2. Geolocation Status Evaluation
    const hasRecentLocation = sessionStorage.getItem('himalaya_location_verified') === 'true';

    if (hasRecentLocation) {
      setLocationState('granted');
      setLocationMessage(null);
    } else if (navigator.permissions && navigator.permissions.query) {
      try {
        const geoPerm = await navigator.permissions.query({ name: 'geolocation' });
        if (geoPerm.state === 'granted') {
          if (hasRecentLocation) {
            setLocationState('granted');
          } else {
            setLocationState('prompt');
          }
        } else if (geoPerm.state === 'denied') {
          setLocationState('denied');
          setLocationMessage(
            checkIsFlutterApk()
              ? 'Location is Blocked. Please enable in Android Settings → Apps → Himalaya ERP.'
              : 'Location access is Blocked. Tap the 🔒 lock icon in the address bar to Allow.'
          );
        } else {
          setLocationState('prompt');
        }

        geoPerm.onchange = () => {
          if (geoPerm.state === 'denied') {
            setLocationState('denied');
            sessionStorage.removeItem('himalaya_location_verified');
          } else if (geoPerm.state === 'granted') {
            checkCurrentPermissions();
          }
        };
      } catch {
        // Fallback
      }
    }

    setInitialCheckDone(true);
  }, []);

  // Initial check & auto-recheck when returning to tab/app
  useEffect(() => {
    if (isAuthenticated) {
      checkCurrentPermissions();

      const handleFocus = () => {
        if (!operationLockRef.current) {
          checkCurrentPermissions();
        }
      };

      window.addEventListener('focus', handleFocus);
      document.addEventListener('visibilitychange', handleFocus);

      return () => {
        window.removeEventListener('focus', handleFocus);
        document.removeEventListener('visibilitychange', handleFocus);
      };
    }
  }, [isAuthenticated, checkCurrentPermissions]);

  /**
   * Complete End-to-End Notification Permission Lifecycle
   */
  const executeNotificationFlow = async (): Promise<boolean> => {
    if (typeof window === 'undefined') return false;
    const w = window as any;

    setNotificationState('requesting');
    setActiveStepText('Requesting notifications...');
    setNotificationMessage(null);

    // 1. Try Flutter InAppWebView Native Bridge Handler
    if (w.flutter_inappwebview && typeof w.flutter_inappwebview.callHandler === 'function') {
      try {
        const nativeRes = await w.flutter_inappwebview.callHandler('requestNotifications');
        if (nativeRes?.status === 'granted' || nativeRes?.token) {
          if (nativeRes.token) {
            await fetch('/api/backend/notifications/device-token', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`,
              },
              body: JSON.stringify({
                token: nativeRes.token,
                deviceType: 'mobile',
                userAgent: navigator.userAgent,
              }),
            }).catch(() => {});
          }
          setNotificationState('granted');
          setNotificationMessage(null);
          return true;
        } else if (nativeRes?.status === 'denied') {
          setNotificationState('denied');
          setNotificationMessage('Notifications are Blocked. Please enable in Android Settings → Apps → Himalaya ERP.');
          return false;
        }
      } catch (err) {
        console.warn('[MandatoryPermissions] Flutter native notifications handler notice:', err);
      }
    }

    // 2. Web Standard Notification Flow
    if (!('Notification' in window)) {
      setNotificationState('granted');
      return true;
    }

    try {
      let permResult: NotificationPermission = Notification.permission;
      if (permResult !== 'granted') {
        try {
          permResult = await Notification.requestPermission();
        } catch {
          permResult = await new Promise<NotificationPermission>((resolve) => {
            Notification.requestPermission((res) => resolve(res));
          });
        }
      }

      if (permResult === 'denied') {
        setNotificationState('denied');
        setNotificationMessage(
          checkIsFlutterApk()
            ? 'Notifications are Blocked. Open Android Settings → Apps → Himalaya ERP → Enable Notifications.'
            : 'Notifications are Blocked. Tap 🔒 in the address bar → Permissions → Notifications → Allow.'
        );
        return false;
      }

      if (permResult !== 'granted') {
        setNotificationState('prompt');
        setNotificationMessage(
          checkIsFlutterApk()
            ? 'Please grant notification permission when prompted by Android.'
            : 'Browser popup was silenced. Please tap 🔒 in your address bar and set Notifications to Allow.'
        );
        return false;
      }

      setNotificationState('registering');
      setActiveStepText('Initializing FCM Push...');

      await initializePushNotifications();

      setNotificationState('granted');
      setNotificationMessage(null);
      return true;
    } catch (err: any) {
      console.warn('[MandatoryPermissions] Notification flow notice:', err);
      setNotificationState('granted');
      return true;
    }
  };

  /**
   * Complete End-to-End GPS Location Lifecycle
   */
  const executeLocationFlow = async (): Promise<boolean> => {
    if (typeof window === 'undefined') return false;

    setLocationState('requesting');
    setActiveStepText('Acquiring live GPS coordinates...');
    setLocationMessage(null);

    try {
      const coords = await acquireRealLocation();

      if (!coords || typeof coords.latitude !== 'number') {
        setLocationState('prompt');
        setLocationMessage('No valid coordinates received from GPS.');
        return false;
      }

      const { latitude, longitude, accuracy, altitude, speed, heading } = coords;

      // Register Location Session & Coordinates with ERP Backend
      setLocationState('registering');
      setActiveStepText('Registering location session on ERP...');

      const { browser, os, deviceType } = getDeviceInfo();
      const deviceId = getDeviceId();

      try {
        const sessionRes = await backendFetch<{ sessionId: string }>('/location/session', {
          method: 'POST',
          body: {
            deviceId,
            deviceType,
            browser,
            operatingSystem: os,
            clientType: 'WEB',
            locationPermission: 'GRANTED',
          },
        }).catch(() => null);

        const activeSessionId = sessionRes?.sessionId;

        await backendFetch('/location/location-update', {
          method: 'POST',
          body: {
            sessionId: activeSessionId || null,
            latitude,
            longitude,
            accuracy: accuracy || 10,
            altitude: altitude || 0,
            speed: speed || 0,
            heading: heading || 0,
            capturedAt: new Date().toISOString(),
          },
        }).catch(() => null);
      } catch (backendErr) {
        console.warn('[MandatoryPermissions] Backend location sync notice:', backendErr);
      }

      sessionStorage.setItem('himalaya_location_verified', 'true');
      sessionStorage.setItem('himalaya_last_lat', String(latitude));
      sessionStorage.setItem('himalaya_last_lng', String(longitude));

      setLocationState('granted');
      setLocationMessage(null);
      return true;
    } catch (err: any) {
      console.warn('[MandatoryPermissions] Geolocation execution error:', err);

      if (err?.code === 1) {
        setLocationState('denied');
        setLocationMessage(
          checkIsFlutterApk()
            ? 'Location permission was denied. Please open Android Settings → Apps → Himalaya ERP → Permissions → Location → Allow.'
            : 'Location permission was denied. Tap the 🔒 lock icon in the address bar to Allow.'
        );
      } else if (err?.code === 2) {
        setLocationState('device_disabled');
        setLocationMessage(
          'Location permission was granted, but device GPS is turned OFF. Please swipe down from top of phone and ensure Location / GPS is turned ON.'
        );
      } else {
        setLocationState('prompt');
        setLocationMessage(err?.message || 'GPS position acquisition timed out. Please try again.');
      }
      return false;
    }
  };

  /**
   * Action Handler: Allow Notifications
   */
  const handleAllowNotifications = async () => {
    if (operationLockRef.current) return;
    operationLockRef.current = true;
    try {
      await executeNotificationFlow();
    } finally {
      operationLockRef.current = false;
      setActiveStepText(null);
    }
  };

  /**
   * Action Handler: Allow GPS Location
   */
  const handleAllowLocation = async () => {
    if (operationLockRef.current) return;
    operationLockRef.current = true;
    try {
      await executeLocationFlow();
    } finally {
      operationLockRef.current = false;
      setActiveStepText(null);
    }
  };

  /**
   * Action Handler: Re-check & Allow All (State Machine Pipeline)
   */
  const handleAllowAll = async () => {
    if (operationLockRef.current) return;
    operationLockRef.current = true;

    try {
      if (notificationState !== 'granted') {
        const notifOk = await executeNotificationFlow();
        if (!notifOk && notificationState === 'denied') {
          return;
        }
      }

      if (locationState !== 'granted') {
        await executeLocationFlow();
      }
    } finally {
      operationLockRef.current = false;
      setActiveStepText(null);
    }
  };

  /**
   * Action Handler: Decline & Logout
   */
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch('/api/backend/auth/logout', { method: 'POST' }).catch(() => {});
    } catch {}
    logout();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };

  // Completion Watcher: When both are genuinely verified, notify parent to unlock workspace
  useEffect(() => {
    if (initialCheckDone && notificationState === 'granted' && locationState === 'granted') {
      if (onAllGranted) {
        onAllGranted();
      }
    }
  }, [initialCheckDone, notificationState, locationState, onAllGranted]);

  // If not authenticated or both already granted, dismiss modal
  if (!isAuthenticated || !initialCheckDone) return null;
  if (notificationState === 'granted' && locationState === 'granted') return null;

  const isAnyOperating =
    notificationState === 'requesting' ||
    notificationState === 'registering' ||
    notificationState === 'verifying' ||
    locationState === 'requesting' ||
    locationState === 'registering' ||
    locationState === 'verifying';

  const isNotifMissing = notificationState !== 'granted';
  const isLocMissing = locationState !== 'granted';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        background: 'radial-gradient(ellipse at center, rgba(15, 23, 42, 0.96) 0%, rgba(2, 6, 23, 0.99) 100%)',
        backdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.3s ease-out',
        fontFamily: "'Outfit', 'Inter', -apple-system, sans-serif",
      }}
    >
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div
        style={{
          width: '100%',
          maxWidth: '540px',
          maxHeight: '92vh',
          overflowY: 'auto',
          background: 'rgba(15, 23, 42, 0.98)',
          border: '1px solid rgba(59, 130, 246, 0.35)',
          borderRadius: '20px',
          padding: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.85), 0 0 40px rgba(30, 58, 138, 0.35)',
          color: '#F8FAFC',
          position: 'relative',
        }}
      >
        {/* Header Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(59, 130, 246, 0.2))',
              border: '1px solid rgba(59, 130, 246, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#60A5FA',
              flexShrink: 0,
            }}
          >
            <ShieldAlert size={24} />
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#60A5FA' }}>
              Security & Operations Policy
            </div>
            <h2 style={{ margin: 0, fontSize: '19px', fontWeight: 700, color: '#FFFFFF' }}>
              Mandatory Permissions Required
            </h2>
          </div>
        </div>

        {/* Description */}
        <p style={{ fontSize: '13px', lineHeight: '1.5', color: '#94A3B8', margin: '0 0 20px 0' }}>
          To operate inside the <strong style={{ color: '#F1F5F9' }}>Himalaya ERP</strong> environment, real-time alerts and location verification are strictly mandatory.
        </p>

        {/* Permission Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
          
          {/* Notifications Card */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              padding: '16px',
              background: notificationState === 'granted' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(30, 41, 59, 0.65)',
              border: `1px solid ${notificationState === 'granted' ? 'rgba(16, 185, 129, 0.35)' : 'rgba(59, 130, 246, 0.3)'}`,
              borderRadius: '14px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: notificationState === 'granted' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: notificationState === 'granted' ? '#34D399' : '#60A5FA',
                    flexShrink: 0,
                  }}
                >
                  <Bell size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#F8FAFC' }}>
                    Notifications
                  </div>
                  <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px' }}>
                    Real-time alerts for orders, QC status, dispatch, and approvals.
                  </div>
                </div>
              </div>
              <div>
                {notificationState === 'granted' ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600, color: '#34D399', background: 'rgba(16, 185, 129, 0.15)', padding: '4px 10px', borderRadius: '20px' }}>
                    <CheckCircle2 size={14} /> Allowed
                  </span>
                ) : notificationState === 'denied' ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600, color: '#F87171', background: 'rgba(239, 68, 68, 0.15)', padding: '4px 10px', borderRadius: '20px' }}>
                    <AlertTriangle size={14} /> Blocked
                  </span>
                ) : notificationState === 'requesting' || notificationState === 'registering' || notificationState === 'verifying' ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600, color: '#60A5FA', background: 'rgba(59, 130, 246, 0.15)', padding: '4px 10px', borderRadius: '20px' }}>
                    <RefreshCw size={12} style={{ animation: 'spin 1s linear infinite' }} /> Processing
                  </span>
                ) : (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600, color: '#FBBF24', background: 'rgba(245, 158, 11, 0.15)', padding: '4px 10px', borderRadius: '20px' }}>
                    Required
                  </span>
                )}
              </div>
            </div>

            {/* Notification Message / Instruction Alert */}
            {notificationMessage && (
              <div style={{ fontSize: '12px', color: '#FDE68A', background: 'rgba(245, 158, 11, 0.12)', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.3)', lineHeight: '1.45' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                  <Info size={16} style={{ color: '#FBBF24', flexShrink: 0, marginTop: '2px' }} />
                  <div>{notificationMessage}</div>
                </div>
              </div>
            )}

            {/* Direct Action Button for Notification */}
            {notificationState !== 'granted' && (
              <button
                type="button"
                onClick={handleAllowNotifications}
                disabled={isAnyOperating}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '10px 14px',
                  background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
                  border: '1px solid rgba(59, 130, 246, 0.5)',
                  borderRadius: '8px',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: isAnyOperating ? 'not-allowed' : 'pointer',
                  boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)',
                  opacity: isAnyOperating ? 0.7 : 1,
                }}
              >
                {notificationState === 'requesting' || notificationState === 'registering' || notificationState === 'verifying' ? (
                  <>
                    <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} />
                    {activeStepText || 'Processing Notifications...'}
                  </>
                ) : (
                  <>
                    <Bell size={14} />
                    Allow Notifications
                  </>
                )}
              </button>
            )}
          </div>

          {/* Location Card */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              padding: '16px',
              background: locationState === 'granted' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(30, 41, 59, 0.65)',
              border: `1px solid ${locationState === 'granted' ? 'rgba(16, 185, 129, 0.35)' : 'rgba(59, 130, 246, 0.3)'}`,
              borderRadius: '14px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: locationState === 'granted' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: locationState === 'granted' ? '#34D399' : '#60A5FA',
                    flexShrink: 0,
                  }}
                >
                  <MapPin size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#F8FAFC' }}>
                    GPS Work Location Access
                  </div>
                  <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px' }}>
                    Verified attendance geofencing, factory compliance, and security.
                  </div>
                </div>
              </div>
              <div>
                {locationState === 'granted' ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600, color: '#34D399', background: 'rgba(16, 185, 129, 0.15)', padding: '4px 10px', borderRadius: '20px' }}>
                    <CheckCircle2 size={14} /> Allowed
                  </span>
                ) : locationState === 'denied' ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600, color: '#F87171', background: 'rgba(239, 68, 68, 0.15)', padding: '4px 10px', borderRadius: '20px' }}>
                    <AlertTriangle size={14} /> Blocked
                  </span>
                ) : locationState === 'device_disabled' ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600, color: '#F87171', background: 'rgba(239, 68, 68, 0.15)', padding: '4px 10px', borderRadius: '20px' }}>
                    <AlertTriangle size={14} /> GPS Off
                  </span>
                ) : locationState === 'requesting' || locationState === 'registering' || locationState === 'verifying' ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600, color: '#60A5FA', background: 'rgba(59, 130, 246, 0.15)', padding: '4px 10px', borderRadius: '20px' }}>
                    <RefreshCw size={12} style={{ animation: 'spin 1s linear infinite' }} /> Processing
                  </span>
                ) : (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600, color: '#FBBF24', background: 'rgba(245, 158, 11, 0.15)', padding: '4px 10px', borderRadius: '20px' }}>
                    Required
                  </span>
                )}
              </div>
            </div>

            {/* Location Message / Error Alert */}
            {locationMessage && (
              <div style={{ fontSize: '12px', color: '#FCA5A5', background: 'rgba(239, 68, 68, 0.12)', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.3)', lineHeight: '1.45' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                  <AlertTriangle size={16} style={{ color: '#F87171', flexShrink: 0, marginTop: '2px' }} />
                  <div>{locationMessage}</div>
                </div>
              </div>
            )}

            {/* Direct Action Button for Location */}
            {locationState !== 'granted' && (
              <button
                type="button"
                onClick={handleAllowLocation}
                disabled={isAnyOperating}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '10px 14px',
                  background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
                  border: '1px solid rgba(59, 130, 246, 0.5)',
                  borderRadius: '8px',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: isAnyOperating ? 'not-allowed' : 'pointer',
                  boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)',
                  opacity: isAnyOperating ? 0.7 : 1,
                }}
              >
                {locationState === 'requesting' || locationState === 'registering' || locationState === 'verifying' ? (
                  <>
                    <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} />
                    {activeStepText || 'Acquiring GPS Position...'}
                  </>
                ) : (
                  <>
                    <MapPin size={14} />
                    Allow GPS Location Access
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Platform-Aware Step-by-Step Guidance */}
        {(isNotifMissing || isLocMissing) && (
          <div
            style={{
              padding: '14px 16px',
              background: 'rgba(30, 41, 59, 0.7)',
              border: '1px solid rgba(59, 130, 246, 0.25)',
              borderRadius: '12px',
              marginBottom: '20px',
              fontSize: '12px',
              lineHeight: '1.5',
              color: '#CBD5E1',
            }}
          >
            {isApkEnvironment ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#60A5FA', fontWeight: 600 }}>
                  <Settings size={16} />
                  <span>Android App Permission Settings:</span>
                </div>
                <div style={{ paddingLeft: '4px', color: '#94A3B8' }}>
                  1. Tap <strong>Allow</strong> when Android asks for Location and Notification permission.<br />
                  2. Make sure your phone&apos;s master <strong>Location / GPS</strong> toggle is turned ON in phone quick settings.<br />
                  3. If previously blocked: Open <strong>Phone Settings → Apps → Himalaya ERP → Permissions</strong> and enable both.<br />
                  4. Return here and tap <strong>&quot;Re-check & Allow All&quot;</strong>.
                </div>
              </>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#60A5FA', fontWeight: 600 }}>
                  <Smartphone size={16} />
                  <span>Browser Permission Settings:</span>
                </div>
                <div style={{ paddingLeft: '4px', color: '#94A3B8' }}>
                  1. Tap the <strong>tune/lock icon (🔒 or ⚙️)</strong> in your address bar at the top (next to the URL).<br />
                  2. Tap <strong>Permissions</strong> → Set both <strong>Location</strong> and <strong>Notifications</strong> to <strong>Allow</strong>.<br />
                  3. Make sure your phone&apos;s master <strong>Location / GPS</strong> toggle is turned ON in phone quick settings.<br />
                  4. Tap <strong>&quot;Re-check & Allow All&quot;</strong> below.
                </div>
              </>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut || isAnyOperating}
            style={{
              flex: '1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '12px 14px',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              borderRadius: '10px',
              color: '#F87171',
              fontSize: '13px',
              fontWeight: 600,
              cursor: isLoggingOut || isAnyOperating ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <LogOut size={15} />
            {isLoggingOut ? 'Logging out...' : 'Decline & Logout'}
          </button>

          <button
            type="button"
            onClick={handleAllowAll}
            disabled={isAnyOperating}
            style={{
              flex: '1.8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px 16px',
              background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
              border: '1px solid rgba(59, 130, 246, 0.5)',
              borderRadius: '10px',
              color: '#FFFFFF',
              fontSize: '13px',
              fontWeight: 600,
              cursor: isAnyOperating ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
              transition: 'all 0.2s',
              opacity: isAnyOperating ? 0.7 : 1,
            }}
          >
            {isAnyOperating ? (
              <>
                <RefreshCw size={15} style={{ animation: 'spin 1s linear infinite' }} />
                {activeStepText || 'Processing...'}
              </>
            ) : (
              <>
                <RefreshCw size={15} />
                Re-check & Allow All
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
