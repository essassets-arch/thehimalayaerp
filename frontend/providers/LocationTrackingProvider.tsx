'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/authStore';

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
const HEARTBEAT_INTERVAL_MS = 30000;

export const LocationTrackingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, accessToken, user } = useAuthStore();
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

  const setPermissionState = (state: typeof permissionState) => {
    setPermissionStateState(state);
    permissionStateRef.current = state;
  };

  const [showNotice, setShowNotice] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const lastLocationRef = useRef<{ latitude: number; longitude: number; time: number } | null>(null);

  // Generate or fetch a persistent unique Device ID
  const getDeviceId = () => {
    if (typeof window === 'undefined') return '';
    let devId = window.localStorage.getItem('himalaya_device_id');
    if (!devId) {
      devId = crypto.randomUUID();
      window.localStorage.getItem('himalaya_device_id');
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

  const startTracking = () => {
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

    watchIdRef.current = window.navigator.geolocation.watchPosition(
      (pos) => {
        setPermissionState('GRANTED');
        const { latitude, longitude, accuracy, altitude, speed, heading } = pos.coords;
        const now = Date.now();

        // Throttle check
        const last = lastLocationRef.current;
        if (last) {
          const distance = getDistanceMeters(latitude, longitude, last.latitude, last.longitude);
          const timeElapsed = now - last.time;

          if (distance < LOCATION_MIN_DISTANCE_METERS && timeElapsed < LOCATION_SEND_INTERVAL_MS) {
            // Drop coordinate update to conserve bandwidth
            return;
          }
        }

        lastLocationRef.current = { latitude, longitude, time: now };

        // Send via Socket.IO if connected
        if (socketRef.current?.connected && sessionIdRef.current) {
          socketRef.current.emit('user:location:update', {
            sessionId: sessionIdRef.current,
            latitude,
            longitude,
            accuracy,
            altitude,
            speed,
            heading,
            capturedAt: new Date(pos.timestamp).toISOString(),
          });
        }
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
  };

  const syncPermission = (state: 'GRANTED' | 'DENIED' | 'PROMPT' | 'UNAVAILABLE' | 'UNSUPPORTED') => {
    if (socketRef.current?.connected && sessionIdRef.current) {
      socketRef.current.emit('user:permission:update', {
        sessionId: sessionIdRef.current,
        locationPermission: state,
      });
    }
  };

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

    // Connect to port 4000 NestJS backend
    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL ||
      process.env.NEXT_PUBLIC_BACKEND_SOCKET_URL ||
      (typeof window !== 'undefined'
        ? (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
            ? `${window.location.protocol}//${window.location.hostname}:4000`
            : window.location.origin)
        : 'http://localhost:4000');

    const socket = io(socketUrl, {
      path: '/socket.io',
      auth: { token: accessToken },
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      const { browser, os, deviceType } = parseUserAgent();

      // Register device session
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
          if (res?.success && res.sessionId) {
            setSessionId(res.sessionId);
            startTracking();
          } else if (res?.sessionId) {
            setSessionId(res.sessionId);
            startTracking();
          }
        }
      );
    });

    // Start periodic heartbeats to maintain online status independently of GPS
    const heartbeatTimer = setInterval(() => {
      if (socket.connected && sessionIdRef.current) {
        socket.emit('user:presence:heartbeat', { sessionId: sessionIdRef.current });
      }
    }, HEARTBEAT_INTERVAL_MS);

    return () => {
      clearInterval(heartbeatTimer);
      socket.disconnect();
      socketRef.current = null;
      if (watchIdRef.current !== null && typeof window !== 'undefined') {
        window.navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [isAuthenticated, accessToken]);

  return (
    <LocationTrackingContext.Provider value={{ sessionId, permissionState, showNotice, acknowledgeNotice }}>
      {children}

      {/* Tracking Privacy Alert / Consent Notice Modal */}
      {showNotice && (
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
