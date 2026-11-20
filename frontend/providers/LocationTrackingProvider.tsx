'use client';

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/authStore';
import { backendFetch } from '@/lib/backendFetch';
import { submitLocation } from '@/lib/submitLocation';

// Haversine formula to measure distance between two GPS points
function getDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) *
    Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// Client browser detection
function parseUserAgent() {
  if (typeof window === 'undefined') return { browser: 'Server', os: 'Server', deviceType: 'DESKTOP' };
  const ua = window.navigator.userAgent;
  let browser = 'Unknown';
  let os = 'Unknown';
  let deviceType = 'DESKTOP';

  if (/Windows/i.test(ua)) os = 'Windows';
  else if (/Macintosh/i.test(ua)) os = 'macOS';
  else if (/Linux/i.test(ua)) os = 'Linux';
  else if (/Android/i.test(ua)) {
    os = 'Android';
    deviceType = 'MOBILE';
  } else if (/iPhone|iPad|iPod/i.test(ua)) {
    os = 'iOS';
    deviceType = /iPad/i.test(ua) ? 'TABLET' : 'MOBILE';
  }

  if (/Chrome/i.test(ua)) browser = 'Chrome';
  else if (/Firefox/i.test(ua)) browser = 'Firefox';
  else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = 'Safari';
  else if (/Edge/i.test(ua)) browser = 'Edge';

  return { browser, os, deviceType };
}

interface LocationTrackingContextType {
  sessionId: string | null;
  permissionState: 'GRANTED' | 'DENIED' | 'PROMPT' | 'UNAVAILABLE' | 'UNSUPPORTED';
  showNotice: boolean;
  acknowledgeNotice: () => void;
}

const LocationTrackingContext = createContext<LocationTrackingContextType | undefined>(undefined);

export const useLocationTracking = () => {
  const context = useContext(LocationTrackingContext);
  if (!context) {
    throw new Error('useLocationTracking must be used within LocationTrackingProvider');
  }
  return context;
};

const LOCATION_SEND_INTERVAL_MS = 15000;
const LOCATION_MIN_DISTANCE_METERS = 10;
const HEARTBEAT_INTERVAL_MS = 25000;
const OFFLINE_QUEUE_KEY = 'himalaya_gps_offline_queue_v1';
const OFFLINE_QUEUE_MAX_POINTS = 200;

interface QueuedGpsPoint {
  clientPointId: string;
  latitude: number;
  longitude: number;
  accuracy?: number | null;
  altitude?: number | null;
  speed?: number | null;
  heading?: number | null;
  batteryLevel?: number | null;
  recordedAt: string;
  source: string;
}

function readOfflineQueue(): QueuedGpsPoint[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(OFFLINE_QUEUE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeOfflineQueue(points: QueuedGpsPoint[]) {
  if (typeof window === 'undefined') return;
  try {
    const trimmed = points.slice(-OFFLINE_QUEUE_MAX_POINTS);
    if (trimmed.length === 0) {
      window.localStorage.removeItem(OFFLINE_QUEUE_KEY);
    } else {
      window.localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(trimmed));
    }
  } catch {
    // ignore storage quota errors
  }
}

function enqueueOfflinePoint(pt: QueuedGpsPoint) {
  const queue = readOfflineQueue();
  queue.push(pt);
  writeOfflineQueue(queue);
}

function isFlutterApkBridge(): boolean {
  if (typeof window === 'undefined') return false;
  const w = window as any;
  return Boolean(
    w?.flutter_inappwebview &&
      typeof w.flutter_inappwebview.callHandler === 'function',
  );
}

export const LocationTrackingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const isDispatchCreate =
    pathname?.includes('/dispatch/create-dispatch') ||
    pathname?.includes('/dispatch-2/create-dispatch') ||
    pathname?.includes('/dispatch/create') ||
    pathname?.includes('/dispatch-2/create');

  const { isAuthenticated, accessToken, user } = useAuthStore();

  const isDispatchPanel = Boolean(
    pathname?.startsWith('/dispatch') ||
    pathname?.startsWith('/dispatch-2') ||
    pathname?.includes('/dispatch') ||
    String((user as any)?.role || '').toLowerCase().includes('dispatch') ||
    String((user as any)?.department || '').toLowerCase().includes('dispatch')
  );
  const isDispatchExempt = isDispatchCreate || isDispatchPanel;
  const [sessionId, setSessionIdState] = useState<string | null>(null);
  const sessionIdRef = useRef<string | null>(null);

  const setSessionId = (id: string | null) => {
    setSessionIdState(id);
    sessionIdRef.current = id;
  };

  const [permissionState, setPermissionStateState] = useState<
    'GRANTED' | 'DENIED' | 'PROMPT' | 'UNAVAILABLE' | 'UNSUPPORTED'
  >('PROMPT');
  const permissionStateRef = useRef(permissionState);

  const setPermissionState = useCallback((state: 'GRANTED' | 'DENIED' | 'PROMPT' | 'UNAVAILABLE' | 'UNSUPPORTED') => {
    setPermissionStateState(state);
    permissionStateRef.current = state;
  }, []);

  const [showNotice, setShowNotice] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const lastLocationRef = useRef<{ latitude: number; longitude: number; time: number } | null>(null);
  const batteryLevelRef = useRef<number | null>(null);
  const flushingQueueRef = useRef<boolean>(false);

  // Sample device battery percentage when supported by browser
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const nav = window.navigator as any;
    if (typeof nav?.getBattery !== 'function') return;
    let batteryObj: any = null;
    const updateBattery = () => {
      if (batteryObj && typeof batteryObj.level === 'number') {
        batteryLevelRef.current = Math.round(batteryObj.level * 100);
      }
    };
    nav
      .getBattery()
      .then((bat: any) => {
        batteryObj = bat;
        updateBattery();
        bat.addEventListener?.('levelchange', updateBattery);
      })
      .catch(() => {});
    return () => {
      batteryObj?.removeEventListener?.('levelchange', updateBattery);
    };
  }, []);

  // Flush queued offline GPS points when connectivity returns
  const flushOfflineQueue = useCallback(async () => {
    if (flushingQueueRef.current || !sessionIdRef.current) return;
    const queued = readOfflineQueue();
    if (queued.length === 0) return;

    flushingQueueRef.current = true;
    try {
      const res = await backendFetch<{ success?: boolean }>('/location/track/web-batch', {
        method: 'POST',
        body: {
          sessionId: sessionIdRef.current,
          points: queued,
        },
      });
      if (res?.success !== false) {
        // Remove only the points we flushed (preserve any newly queued points during flight)
        const remaining = readOfflineQueue().slice(queued.length);
        writeOfflineQueue(remaining);
      }
    } catch {
      // Keep in queue for next retry when online
    } finally {
      flushingQueueRef.current = false;
    }
  }, []);

  // Reusable point transmission helper (normalizes m/s -> km/h + offline queue fallback)
  const sendCoordinatePoint = useCallback(
    (coords: {
      latitude: number;
      longitude: number;
      accuracy?: number | null;
      altitude?: number | null;
      speedMps?: number | null;
      heading?: number | null;
      timestamp?: number;
      force?: boolean;
    }) => {
      const { latitude, longitude, accuracy, altitude, speedMps, heading, force } = coords;
      const now = Date.now();
      const capturedMs = coords.timestamp || now;

      if (!force && lastLocationRef.current) {
        const distance = getDistanceMeters(
          latitude,
          longitude,
          lastLocationRef.current.latitude,
          lastLocationRef.current.longitude,
        );
        const timeElapsed = now - lastLocationRef.current.time;
        if (distance < LOCATION_MIN_DISTANCE_METERS && timeElapsed < LOCATION_SEND_INTERVAL_MS) {
          return;
        }
      }

      lastLocationRef.current = { latitude, longitude, time: now };

      // Convert browser speed (m/s) -> km/h cleanly
      const speedKmh =
        speedMps != null && !isNaN(speedMps) && speedMps >= 0
          ? Math.round(speedMps * 3.6 * 10) / 10
          : null;

      try {
        const latDir = latitude >= 0 ? 'N' : 'S';
        const lngDir = longitude >= 0 ? 'E' : 'W';
        const coordsStr = `${Math.abs(latitude).toFixed(4)}° ${latDir}, ${Math.abs(longitude).toFixed(4)}° ${lngDir}`;
        const locObj = {
          latitude,
          longitude,
          accuracy,
          coordsStr,
          timestamp: capturedMs,
          acquiredAt: now,
        };
        localStorage.setItem('himalaya_last_real_location', JSON.stringify(locObj));
        sessionStorage.setItem('himalaya_last_real_location', JSON.stringify(locObj));
        sessionStorage.setItem('himalaya_last_lat', String(latitude));
        sessionStorage.setItem('himalaya_last_lng', String(longitude));
        sessionStorage.setItem('himalaya_last_loc_accuracy', String(accuracy ?? ''));
        sessionStorage.setItem('himalaya_last_loc_time', String(now));
      } catch {
        // ignore storage restrictions
      }

      const capturedIso = new Date(capturedMs).toISOString();
      const payload = {
        sessionId: sessionIdRef.current,
        latitude,
        longitude,
        accuracy,
        altitude,
        speed: speedKmh,
        heading,
        batteryLevel: batteryLevelRef.current,
        capturedAt: capturedIso,
      };

      const offlineRecord: QueuedGpsPoint = {
        clientPointId:
          typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
            ? crypto.randomUUID()
            : `web-${now}-${Math.random().toString(36).slice(2, 8)}`,
        latitude,
        longitude,
        accuracy: accuracy ?? null,
        altitude: altitude ?? null,
        speed: speedKmh,
        heading: heading ?? null,
        batteryLevel: batteryLevelRef.current,
        recordedAt: capturedIso,
        source: isFlutterApkBridge() ? 'MOBILE_APP' : 'WEB_REALTIME',
      };

      if (typeof navigator !== 'undefined' && navigator.onLine === false) {
        enqueueOfflinePoint(offlineRecord);
        return;
      }

      if (sessionIdRef.current) {
        void submitLocation(socketRef.current, payload, (location: typeof payload) => {
          if (sessionIdRef.current !== location.sessionId) return Promise.resolve();
          return backendFetch('/location/location-update', {
            method: 'POST',
            body: location,
          });
        })
          .then(() => {
            void flushOfflineQueue();
          })
          .catch((error: unknown) => {
            if (lastLocationRef.current?.time === now) lastLocationRef.current = null;
            enqueueOfflinePoint(offlineRecord);
            console.warn('[LocationTracking] GPS update queued offline:', error);
          });
      }
    },
    [flushOfflineQueue],
  );

  // Generate or fetch a persistent unique Device ID
  const getDeviceId = () => {
    if (typeof window === 'undefined') return '';
    let devId = window.localStorage.getItem('himalaya_device_id');
    if (!devId) {
      devId = crypto.randomUUID();
      window.localStorage.setItem('himalaya_device_id', devId);
    }
    return devId;
  };

  // Explicit confirmation helper
  const acknowledgeNotice = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('himalaya_location_policy_accepted', 'true');
    }
    setShowNotice(false);
    startTracking();
  };

  const syncPermission = useCallback((state: 'GRANTED' | 'DENIED' | 'PROMPT' | 'UNAVAILABLE' | 'UNSUPPORTED') => {
    if (sessionIdRef.current) {
      if (socketRef.current?.connected) {
        socketRef.current.emit('user:permission:update', {
          sessionId: sessionIdRef.current,
          locationPermission: state,
        });
      } else {
        backendFetch('/location/permission', {
          method: 'POST',
          body: {
            sessionId: sessionIdRef.current,
            locationPermission: state,
          },
        }).catch(() => { });
      }
    }
  }, []);

  // Immediate one-shot GPS fix (used on tab wake / resume / online recovery + Flutter bridge)
  const captureImmediateFix = useCallback(
    async (force = false) => {
      if (typeof window === 'undefined' || !sessionIdRef.current) return;

      // 1. Flutter Android APK Native Bridge if present
      if (isFlutterApkBridge()) {
        try {
          const w = window as any;
          const res = await Promise.race([
            w.flutter_inappwebview.callHandler('requestLocation'),
            new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), 12000)),
          ]);
          const lat = res?.latitude ?? res?.coords?.latitude;
          const lng = res?.longitude ?? res?.coords?.longitude;
          if (lat != null && lng != null && !isNaN(Number(lat)) && !isNaN(Number(lng))) {
            setPermissionState('GRANTED');
            sendCoordinatePoint({
              latitude: Number(lat),
              longitude: Number(lng),
              accuracy: res?.accuracy ?? res?.coords?.accuracy ?? 15,
              altitude: res?.altitude ?? res?.coords?.altitude ?? null,
              speedMps: res?.speed ?? res?.coords?.speed ?? null,
              heading: res?.heading ?? res?.coords?.heading ?? null,
              timestamp: Date.now(),
              force,
            });
            return;
          }
        } catch {
          // Fall through to standard geolocation API
        }
      }

      // 2. Standard browser Geolocation API
      if (!window.navigator?.geolocation) return;
      window.navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPermissionState('GRANTED');
          sendCoordinatePoint({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            altitude: pos.coords.altitude,
            speedMps: pos.coords.speed,
            heading: pos.coords.heading,
            timestamp: pos.timestamp || Date.now(),
            force,
          });
        },
        () => {
          // Non-fatal on wake; watchPosition will handle persistent errors
        },
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 12000 },
      );
    },
    [sendCoordinatePoint, setPermissionState],
  );

  const startTracking = useCallback(() => {
    if (typeof window === 'undefined' || !window.navigator.geolocation) {
      setPermissionState('UNSUPPORTED');
      syncPermission('UNSUPPORTED');
      return;
    }

    setPermissionState('GRANTED');

    // Clean any prior watchers
    if (watchIdRef.current !== null) {
      window.navigator.geolocation.clearWatch(watchIdRef.current);
    }

    // Immediate fix on start + flush any queued offline points
    void captureImmediateFix(true);
    void flushOfflineQueue();

    watchIdRef.current = window.navigator.geolocation.watchPosition(
      (pos) => {
        setPermissionState('GRANTED');
        sendCoordinatePoint({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          altitude: pos.coords.altitude,
          speedMps: pos.coords.speed,
          heading: pos.coords.heading,
          timestamp: pos.timestamp || Date.now(),
        });
      },
      (err) => {
        console.warn('Geolocation watch error:', err.message);
        if (err.code === err.PERMISSION_DENIED) {
          setPermissionState('DENIED');
          syncPermission('DENIED');
        } else {
          setPermissionState('UNAVAILABLE');
          syncPermission('UNAVAILABLE');
        }
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
    );
  }, [syncPermission, setPermissionState, sendCoordinatePoint, captureImmediateFix, flushOfflineQueue]);

  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      // Cleanup on logout
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      if (watchIdRef.current !== null && typeof window !== 'undefined') {
        window.navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      setSessionId(null);
      return;
    }

    const { browser, os, deviceType } = parseUserAgent();
    const cleanToken = accessToken.replace(/^Bearer\s+/i, '').trim();

    const clientType = isFlutterApkBridge() ? 'MOBILE_APP' : 'WEB';

    // 1. Authoritative Immediate REST Session Registration
    const registerDeviceViaRest = async () => {
      try {
        const res = await backendFetch<{ sessionId: string }>('/location/session', {
          method: 'POST',
          body: {
            deviceId: getDeviceId(),
            deviceType,
            browser,
            operatingSystem: os,
            clientType,
            locationPermission: permissionStateRef.current,
          },
        });
        if (res?.sessionId) {
          setSessionId(res.sessionId);
          startTracking();
        }
      } catch (err) {
        console.warn('[LocationTracking] REST device registration fallback warning:', err);
      }
    };

    registerDeviceViaRest();

    // 2. Connect to NestJS backend Socket.IO for low-latency streaming
    let socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_BACKEND_SOCKET_URL || '';
    if (typeof window !== 'undefined') {
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      if (isLocalhost) {
        socketUrl = socketUrl || `${window.location.protocol}//${window.location.hostname}:4001`;
      } else {
        socketUrl = socketUrl || window.location.origin;
      }
    } else {
      socketUrl = socketUrl || 'http://localhost:4001';
    }

    const socket = io(socketUrl, {
      path: '/socket.io',
      auth: { token: cleanToken },
      transports: ['polling', 'websocket'],
      upgrade: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 15000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit(
        'device:register',
        {
          deviceId: getDeviceId(),
          deviceType,
          browser,
          operatingSystem: os,
          clientType: 'WEB',
          locationPermission: permissionStateRef.current,
        },
        (res: any) => {
          if (res?.sessionId) {
            setSessionId(res.sessionId);
            startTracking();
          }
        }
      );
    });

    socket.on('connect_error', (err) => {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[LocationTracking] Socket connection notice (polling active):', err?.message || err);
      }
    });

    // 3. Periodic Presence Heartbeat (Socket + REST fallback)
    const sendHeartbeat = () => {
      const currentSid = sessionIdRef.current;
      if (!currentSid) {
        registerDeviceViaRest();
        return;
      }

      if (socket.connected) {
        socket.emit('user:presence:heartbeat', { sessionId: currentSid });
      } else {
        backendFetch('/location/heartbeat', {
          method: 'POST',
          body: { sessionId: currentSid },
        }).catch(() => { });
      }
    };

    const heartbeatTimer = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL_MS);

    // 4. Instant wake / focus / online recovery so unlocking phone immediately pushes fresh GPS + flushes offline queue
    const handleVisibilityResume = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        sendHeartbeat();
        void captureImmediateFix(true);
        void flushOfflineQueue();
      }
    };
    const handleOnlineRecovery = () => {
      sendHeartbeat();
      void flushOfflineQueue();
      void captureImmediateFix(true);
    };

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityResume);
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('focus', handleVisibilityResume);
      window.addEventListener('online', handleOnlineRecovery);
    }

    return () => {
      clearInterval(heartbeatTimer);
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibilityResume);
      }
      if (typeof window !== 'undefined') {
        window.removeEventListener('focus', handleVisibilityResume);
        window.removeEventListener('online', handleOnlineRecovery);
      }
      socket.disconnect();
      socketRef.current = null;
      if (watchIdRef.current !== null && typeof window !== 'undefined') {
        window.navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [isAuthenticated, accessToken, startTracking, captureImmediateFix, flushOfflineQueue]);

  return (
    <LocationTrackingContext.Provider value={{ sessionId, permissionState, showNotice, acknowledgeNotice }}>
      {children}

      {/* Tracking Privacy Alert / Consent Notice Modal */}
      {showNotice && !isDispatchExempt && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 99999,
          maxWidth: '380px',
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
          borderRadius: '12px',
          padding: '20px',
          color: '#F8FAFC',
          fontFamily: "'Outfit', sans-serif",
          animation: 'slideUp 0.3s ease-out',
        }}>
          <style>{`
            @keyframes slideUp {
              from { transform: translateY(20px); opacity: 0; }
              to { transform: translateY(0); opacity: 1; }
            }
          `}</style>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <span style={{ fontSize: '20px' }}>📍</span>
            <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 600, letterSpacing: '0.5px', color: '#60A5FA' }}>
              Work Location Sharing
            </h4>
          </div>
          <p style={{ margin: '0 0 16px 0', fontSize: '13px', lineHeight: '1.5', color: '#94A3B8' }}>
            Location sharing is enabled while you are logged into Himalaya ERP so authorized administrators can view your current work-device location.
          </p>
          <button
            onClick={acknowledgeNotice}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 12px',
              color: '#FFFFFF',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.filter = 'brightness(1.1)')}
            onMouseLeave={(e) => (e.currentTarget.style.filter = 'brightness(1.0)')}
          >
            Allow Location
          </button>
        </div>
      )}
    </LocationTrackingContext.Provider>
  );
};
