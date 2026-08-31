'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import { initializePushNotifications } from '@/shared/firebase/messaging';
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
  Check
} from 'lucide-react';

interface MandatoryPermissionsModalProps {
  onAllGranted?: () => void;
}

// Universal cross-browser wrapper for Notification.requestPermission
const requestNotificationPermissionUniversal = async (): Promise<'granted' | 'denied' | 'default' | 'unsupported'> => {
  if (typeof window === 'undefined') return 'unsupported';
  if (!('Notification' in window)) return 'unsupported';

  try {
    let result: string | undefined;
    try {
      const promise = Notification.requestPermission((status) => {
        result = status;
      });
      if (promise && typeof promise.then === 'function') {
        result = await promise;
      }
    } catch {
      result = await new Promise((resolve) => {
        Notification.requestPermission((status) => resolve(status));
      });
    }

    if (result === 'granted' || Notification.permission === 'granted') {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('himalaya_notif_granted', 'true');
      }
      return 'granted';
    } else if (result === 'denied' || Notification.permission === 'denied') {
      return 'denied';
    }
    return 'default';
  } catch (err) {
    console.warn('[MandatoryPermissions] Notification permission error:', err);
    return (Notification.permission as any) || 'denied';
  }
};

// Universal cross-browser & mobile wrapper for GPS Location request
const requestLocationPermissionUniversal = async (): Promise<{
  status: 'granted' | 'denied' | 'device_disabled' | 'prompt';
  coords?: GeolocationCoordinates;
  error?: string;
}> => {
  if (typeof window === 'undefined' || !('geolocation' in navigator)) {
    return { status: 'denied', error: 'Geolocation not supported by this browser' };
  }

  const tryGetPosition = (options: PositionOptions) => {
    return new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });
  };

  try {
    // Stage 1: Fast Wi-Fi / cell tower location (fast response on mobile & desktop)
    let pos: GeolocationPosition | null = null;
    try {
      pos = await tryGetPosition({ enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 });
    } catch (err: any) {
      if (err.code === 1) {
        // PERMISSION_DENIED: User explicitly clicked "Block" or site permission is blocked
        return { status: 'denied', error: 'Permission denied by user' };
      }
      // Stage 2: Try High Accuracy GPS
      try {
        pos = await tryGetPosition({ enableHighAccuracy: true, timeout: 10000, maximumAge: 0 });
      } catch (err2: any) {
        if (err2.code === 1) {
          return { status: 'denied', error: 'Permission denied by user' };
        } else if (err2.code === 2) {
          // POSITION_UNAVAILABLE: Device GPS/Location toggle is OFF in Android/Windows settings
          return {
            status: 'device_disabled',
            error: 'Device Location / GPS is turned OFF. Please swipe down from top of phone and turn on Location.',
          };
        } else {
          // Timeout or temporary unavailable: Permission was granted by browser!
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('himalaya_location_granted', 'true');
          }
          return { status: 'granted' };
        }
      }
    }

    if (pos && pos.coords) {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('himalaya_location_granted', 'true');
        sessionStorage.setItem('himalaya_last_lat', String(pos.coords.latitude));
        sessionStorage.setItem('himalaya_last_lng', String(pos.coords.longitude));
      }
      return { status: 'granted', coords: pos.coords };
    }

    if (typeof window !== 'undefined') {
      sessionStorage.setItem('himalaya_location_granted', 'true');
    }
    return { status: 'granted' };
  } catch (err: any) {
    if (err.code === 1) return { status: 'denied', error: 'Permission denied' };
    return { status: 'granted' };
  }
};

export default function MandatoryPermissionsModal({ onAllGranted }: MandatoryPermissionsModalProps) {
  const { isAuthenticated, logout } = useAuthStore();

  const [notificationStatus, setNotificationStatus] = useState<'prompt' | 'granted' | 'denied' | 'unsupported'>('prompt');
  const [locationStatus, setLocationStatus] = useState<'prompt' | 'granted' | 'denied' | 'device_disabled' | 'unsupported'>('prompt');
  const [locationError, setLocationError] = useState<string | null>(null);

  const [isRequestingNotif, setIsRequestingNotif] = useState(false);
  const [isRequestingLoc, setIsRequestingLoc] = useState(false);
  const [isRequestingAll, setIsRequestingAll] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);
  const [isInsecureContext, setIsInsecureContext] = useState(false);

  // Check current permission states from browser APIs
  const checkPermissions = useCallback(async () => {
    if (typeof window === 'undefined') return;

    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (!window.isSecureContext && !isLocal) {
      setIsInsecureContext(true);
    } else {
      setIsInsecureContext(false);
    }

    // 1. Notification Permission Check
    if (!('Notification' in window)) {
      setNotificationStatus('unsupported');
    } else {
      const perm = Notification.permission;
      const isSaved = sessionStorage.getItem('himalaya_notif_granted') === 'true';
      if (perm === 'granted' || isSaved) {
        setNotificationStatus('granted');
      } else if (perm === 'denied') {
        setNotificationStatus('denied');
      } else {
        setNotificationStatus('prompt');
      }
    }

    // 2. Geolocation Permission Check
    if (!('geolocation' in navigator)) {
      setLocationStatus('unsupported');
    } else {
      const isLocSaved = sessionStorage.getItem('himalaya_location_granted') === 'true';
      if (isLocSaved) {
        setLocationStatus('granted');
      } else if (navigator.permissions && navigator.permissions.query) {
        try {
          const geoPerm = await navigator.permissions.query({ name: 'geolocation' });
          if (geoPerm.state === 'granted') {
            setLocationStatus('granted');
            sessionStorage.setItem('himalaya_location_granted', 'true');
          } else if (geoPerm.state === 'denied') {
            setLocationStatus('denied');
          } else {
            setLocationStatus('prompt');
          }

          geoPerm.onchange = () => {
            if (geoPerm.state === 'granted') {
              setLocationStatus('granted');
              sessionStorage.setItem('himalaya_location_granted', 'true');
            } else if (geoPerm.state === 'denied') {
              setLocationStatus('denied');
              sessionStorage.removeItem('himalaya_location_granted');
            } else {
              setLocationStatus('prompt');
            }
          };
        } catch {
          // In Safari or browsers without query support
        }
      }
    }

    setHasChecked(true);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      checkPermissions();

      const handleFocus = () => {
        checkPermissions();
      };
      window.addEventListener('focus', handleFocus);
      document.addEventListener('visibilitychange', handleFocus);

      return () => {
        window.removeEventListener('focus', handleFocus);
        document.removeEventListener('visibilitychange', handleFocus);
      };
    }
  }, [isAuthenticated, checkPermissions]);

  // If both permissions are granted, call onAllGranted
  useEffect(() => {
    if (hasChecked && notificationStatus === 'granted' && locationStatus === 'granted') {
      if (onAllGranted) onAllGranted();
    }
  }, [hasChecked, notificationStatus, locationStatus, onAllGranted]);

  // Request Notifications specifically
  const handleRequestNotification = async () => {
    setIsRequestingNotif(true);
    try {
      const res = await requestNotificationPermissionUniversal();
      if (res === 'granted') {
        setNotificationStatus('granted');
        initializePushNotifications().catch((err) =>
          console.warn('[MandatoryPermissions] FCM push init error:', err)
        );
      } else if (res === 'denied') {
        setNotificationStatus('denied');
      } else {
        setNotificationStatus('prompt');
      }
    } finally {
      setIsRequestingNotif(false);
    }
  };

  // Request Geolocation specifically
  const handleRequestLocation = async () => {
    setIsRequestingLoc(true);
    setLocationError(null);
    try {
      const result = await requestLocationPermissionUniversal();
      if (result.status === 'granted') {
        setLocationStatus('granted');
        setLocationError(null);
      } else if (result.status === 'denied') {
        setLocationStatus('denied');
        setLocationError('Location access was denied in browser permissions.');
      } else if (result.status === 'device_disabled') {
        setLocationStatus('device_disabled');
        setLocationError(result.error || 'Device Location / GPS is turned off.');
      } else {
        setLocationStatus('prompt');
      }
    } finally {
      setIsRequestingLoc(false);
    }
  };

  // Request both sequentially
  const handleRequestAll = async () => {
    setIsRequestingAll(true);
    try {
      if (notificationStatus !== 'granted') {
        await handleRequestNotification();
      }
      if (locationStatus !== 'granted') {
        await handleRequestLocation();
      }
    } finally {
      setIsRequestingAll(false);
    }
  };

  // Handle forced logout if user refuses or cancels
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

  // If user is not authenticated or both permissions are already granted, do not render modal
  if (!isAuthenticated || !hasChecked) return null;
  if (notificationStatus === 'granted' && locationStatus === 'granted') return null;

  const isNotifMissing = notificationStatus !== 'granted';
  const isLocMissing = locationStatus !== 'granted';

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
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 25px rgba(59, 130, 246, 0.25); }
          50% { box-shadow: 0 0 45px rgba(59, 130, 246, 0.45); }
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
              background: notificationStatus === 'granted' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(30, 41, 59, 0.65)',
              border: `1px solid ${notificationStatus === 'granted' ? 'rgba(16, 185, 129, 0.35)' : 'rgba(59, 130, 246, 0.3)'}`,
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
                    background: notificationStatus === 'granted' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: notificationStatus === 'granted' ? '#34D399' : '#60A5FA',
                    flexShrink: 0,
                  }}
                >
                  <Bell size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#F8FAFC' }}>
                    Browser Push Notifications
                  </div>
                  <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px' }}>
                    Real-time alerts for orders, QC status, dispatch, and approvals.
                  </div>
                </div>
              </div>
              <div>
                {notificationStatus === 'granted' ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600, color: '#34D399', background: 'rgba(16, 185, 129, 0.15)', padding: '4px 10px', borderRadius: '20px' }}>
                    <CheckCircle2 size={14} /> Allowed
                  </span>
                ) : notificationStatus === 'denied' ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600, color: '#F87171', background: 'rgba(239, 68, 68, 0.15)', padding: '4px 10px', borderRadius: '20px' }}>
                    <AlertTriangle size={14} /> Blocked
                  </span>
                ) : (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600, color: '#FBBF24', background: 'rgba(245, 158, 11, 0.15)', padding: '4px 10px', borderRadius: '20px' }}>
                    Required
                  </span>
                )}
              </div>
            </div>

            {/* Individual Action Button for Notification */}
            {notificationStatus !== 'granted' && (
              <button
                type="button"
                onClick={handleRequestNotification}
                disabled={isRequestingNotif}
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
                  cursor: isRequestingNotif ? 'not-allowed' : 'pointer',
                  boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)',
                }}
              >
                {isRequestingNotif ? (
                  <>
                    <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} />
                    Prompting Browser...
                  </>
                ) : (
                  <>
                    <Bell size={14} />
                    Allow Browser Notifications
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
              background: locationStatus === 'granted' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(30, 41, 59, 0.65)',
              border: `1px solid ${locationStatus === 'granted' ? 'rgba(16, 185, 129, 0.35)' : 'rgba(59, 130, 246, 0.3)'}`,
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
                    background: locationStatus === 'granted' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: locationStatus === 'granted' ? '#34D399' : '#60A5FA',
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
                {locationStatus === 'granted' ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600, color: '#34D399', background: 'rgba(16, 185, 129, 0.15)', padding: '4px 10px', borderRadius: '20px' }}>
                    <CheckCircle2 size={14} /> Allowed
                  </span>
                ) : locationStatus === 'denied' ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600, color: '#F87171', background: 'rgba(239, 68, 68, 0.15)', padding: '4px 10px', borderRadius: '20px' }}>
                    <AlertTriangle size={14} /> Blocked
                  </span>
                ) : locationStatus === 'device_disabled' ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600, color: '#F87171', background: 'rgba(239, 68, 68, 0.15)', padding: '4px 10px', borderRadius: '20px' }}>
                    <AlertTriangle size={14} /> GPS Off
                  </span>
                ) : (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600, color: '#FBBF24', background: 'rgba(245, 158, 11, 0.15)', padding: '4px 10px', borderRadius: '20px' }}>
                    Required
                  </span>
                )}
              </div>
            </div>

            {/* Location Error / Device Alert */}
            {locationError && (
              <div style={{ fontSize: '12px', color: '#FCA5A5', background: 'rgba(239, 68, 68, 0.15)', padding: '8px 12px', borderRadius: '6px', border: '1px solid rgba(239, 68, 68, 0.25)' }}>
                {locationError}
              </div>
            )}

            {/* Individual Action Button for Location */}
            {locationStatus !== 'granted' && (
              <button
                type="button"
                onClick={handleRequestLocation}
                disabled={isRequestingLoc}
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
                  cursor: isRequestingLoc ? 'not-allowed' : 'pointer',
                  boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)',
                }}
              >
                {isRequestingLoc ? (
                  <>
                    <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} />
                    Detecting GPS Location...
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

        {/* Insecure HTTP Context Alert (if on mobile network IP without HTTPS) */}
        {isInsecureContext && (
          <div
            style={{
              padding: '12px 14px',
              background: 'rgba(245, 158, 11, 0.12)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: '10px',
              marginBottom: '16px',
              fontSize: '12px',
              lineHeight: '1.45',
              color: '#FDE68A',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
            }}
          >
            <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '2px', color: '#FBBF24' }} />
            <div>
              <strong>Insecure Network Notice:</strong> Web permissions require HTTPS on mobile network IPs. Enable Location & Notifications in your mobile Chrome address bar settings (🔒).
            </div>
          </div>
        )}

        {/* Step-by-Step Chrome/Mobile Address Bar Guide if prompt doesn't appear */}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#60A5FA', fontWeight: 600 }}>
              <Smartphone size={16} />
              <span>How to allow in mobile / desktop browser:</span>
            </div>
            <div style={{ paddingLeft: '4px', color: '#94A3B8' }}>
              1. Tap the <strong>tune/lock icon (🔒 or ⚙️)</strong> in your address bar at the top.<br />
              2. Tap <strong>Permissions</strong> → Set both <strong>Location</strong> and <strong>Notifications</strong> to <strong>Allow</strong>.<br />
              3. Make sure your phone&apos;s master <strong>Location / GPS</strong> toggle is turned ON in phone settings.
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
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
              cursor: isLoggingOut ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <LogOut size={15} />
            {isLoggingOut ? 'Logging out...' : 'Decline & Logout'}
          </button>

          <button
            type="button"
            onClick={handleRequestAll}
            disabled={isRequestingAll || isRequestingNotif || isRequestingLoc}
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
              cursor: (isRequestingAll || isRequestingNotif || isRequestingLoc) ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
              transition: 'all 0.2s',
            }}
          >
            {isRequestingAll ? (
              <>
                <RefreshCw size={15} style={{ animation: 'spin 1s linear infinite' }} />
                Requesting...
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
