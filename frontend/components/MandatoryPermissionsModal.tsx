'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import { initializePushNotifications } from '@/shared/firebase/messaging';
import { Bell, MapPin, ShieldAlert, CheckCircle2, AlertTriangle, LogOut, ArrowRight, RefreshCw, Lock } from 'lucide-react';

interface MandatoryPermissionsModalProps {
  onAllGranted?: () => void;
}

export default function MandatoryPermissionsModal({ onAllGranted }: MandatoryPermissionsModalProps) {
  const { isAuthenticated, logout } = useAuthStore();

  const [notificationStatus, setNotificationStatus] = useState<'prompt' | 'granted' | 'denied' | 'unsupported'>('prompt');
  const [locationStatus, setLocationStatus] = useState<'prompt' | 'granted' | 'denied' | 'unsupported'>('prompt');
  const [isRequesting, setIsRequesting] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

  // Check current permission states from browser APIs
  const checkPermissions = useCallback(async () => {
    if (typeof window === 'undefined') return;

    // 1. Notification Permission Check
    if (!('Notification' in window)) {
      setNotificationStatus('unsupported');
    } else {
      const perm = Notification.permission;
      if (perm === 'granted') {
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
    } else if (navigator.permissions && navigator.permissions.query) {
      try {
        const geoPerm = await navigator.permissions.query({ name: 'geolocation' });
        if (geoPerm.state === 'granted') {
          setLocationStatus('granted');
        } else if (geoPerm.state === 'denied') {
          setLocationStatus('denied');
        } else {
          setLocationStatus('prompt');
        }

        // Listen for changes
        geoPerm.onchange = () => {
          if (geoPerm.state === 'granted') setLocationStatus('granted');
          else if (geoPerm.state === 'denied') setLocationStatus('denied');
          else setLocationStatus('prompt');
        };
      } catch {
        // Fallback if query fails
      }
    }

    setHasChecked(true);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      checkPermissions();
    }
  }, [isAuthenticated, checkPermissions]);

  // If both permissions are granted, call onAllGranted
  useEffect(() => {
    if (hasChecked && notificationStatus === 'granted' && locationStatus === 'granted') {
      if (onAllGranted) onAllGranted();
    }
  }, [hasChecked, notificationStatus, locationStatus, onAllGranted]);

  // Handle requesting both permissions sequentially
  const handleRequestPermissions = async () => {
    setIsRequesting(true);
    try {
      // 1. Request Notification Permission if needed
      if (notificationStatus !== 'granted' && 'Notification' in window) {
        try {
          const notifRes = await Notification.requestPermission();
          if (notifRes === 'granted') {
            setNotificationStatus('granted');
            // Trigger Firebase FCM token setup immediately
            initializePushNotifications().catch((err) =>
              console.warn('[MandatoryPermissions] FCM push init error:', err)
            );
          } else if (notifRes === 'denied') {
            setNotificationStatus('denied');
          } else {
            setNotificationStatus('prompt');
          }
        } catch (e) {
          console.warn('[MandatoryPermissions] Notification permission error:', e);
        }
      }

      // 2. Request Geolocation Permission if needed
      if (locationStatus !== 'granted' && 'geolocation' in navigator) {
        await new Promise<void>((resolve) => {
          navigator.geolocation.getCurrentPosition(
            () => {
              setLocationStatus('granted');
              resolve();
            },
            (err) => {
              if (err.code === err.PERMISSION_DENIED) {
                setLocationStatus('denied');
              } else {
                // If location is supported and was not denied by user (e.g. timeout or position unavailable), treat as granted
                setLocationStatus('granted');
              }
              resolve();
            },
            { enableHighAccuracy: true, timeout: 10000 }
          );
        });
      }

      // Re-check
      await checkPermissions();
    } finally {
      setIsRequesting(false);
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

  const isAnyBlocked = notificationStatus === 'denied' || locationStatus === 'denied';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        background: 'radial-gradient(ellipse at center, rgba(15, 23, 42, 0.95) 0%, rgba(2, 6, 23, 0.98) 100%)',
        backdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
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
          maxWidth: '560px',
          background: 'rgba(15, 23, 42, 0.96)',
          border: '1px solid rgba(59, 130, 246, 0.35)',
          borderRadius: '20px',
          padding: '32px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 40px rgba(30, 58, 138, 0.3)',
          color: '#F8FAFC',
          position: 'relative',
          animation: 'pulseGlow 4s infinite',
        }}
      >
        {/* Header Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(59, 130, 246, 0.2))',
              border: '1px solid rgba(59, 130, 246, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#60A5FA',
            }}
          >
            <ShieldAlert size={26} />
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#60A5FA' }}>
              Security & Operations Policy
            </div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#FFFFFF' }}>
              Mandatory Permissions Required
            </h2>
          </div>
        </div>

        {/* Description */}
        <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#94A3B8', margin: '0 0 24px 0' }}>
          To operate inside the <strong style={{ color: '#F1F5F9' }}>Himalaya ERP</strong> environment, real-time alerts and location verification are strictly mandatory. You must grant both permissions to access your workspace.
        </p>

        {/* Permission Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
          {/* Notifications Card */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px',
              background: notificationStatus === 'granted' ? 'rgba(16, 185, 129, 0.08)' : notificationStatus === 'denied' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(30, 41, 59, 0.6)',
              border: `1px solid ${notificationStatus === 'granted' ? 'rgba(16, 185, 129, 0.3)' : notificationStatus === 'denied' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(51, 65, 85, 0.6)'}`,
              borderRadius: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
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

          {/* Location Card */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px',
              background: locationStatus === 'granted' ? 'rgba(16, 185, 129, 0.08)' : locationStatus === 'denied' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(30, 41, 59, 0.6)',
              border: `1px solid ${locationStatus === 'granted' ? 'rgba(16, 185, 129, 0.3)' : locationStatus === 'denied' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(51, 65, 85, 0.6)'}`,
              borderRadius: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
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
              ) : (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600, color: '#FBBF24', background: 'rgba(245, 158, 11, 0.15)', padding: '4px 10px', borderRadius: '20px' }}>
                  Required
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Guidance if permissions are blocked in browser settings */}
        {isAnyBlocked && (
          <div
            style={{
              padding: '14px 16px',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '10px',
              marginBottom: '20px',
              fontSize: '13px',
              lineHeight: '1.5',
              color: '#FECACA',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
            }}
          >
            <Lock size={18} style={{ flexShrink: 0, marginTop: '2px', color: '#F87171' }} />
            <div>
              <strong>Permission is blocked in your browser:</strong>
              <div style={{ marginTop: '4px', color: '#FCA5A5' }}>
                1. Click the <strong>lock/settings icon (🔒)</strong> in your browser address bar.<br />
                2. Set <strong>Notifications</strong> and <strong>Location</strong> to <strong>"Allow"</strong>.<br />
                3. Click <strong>"Re-check Permissions"</strong> below.
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            style={{
              flex: '1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px 18px',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              borderRadius: '10px',
              color: '#F87171',
              fontSize: '14px',
              fontWeight: 600,
              cursor: isLoggingOut ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              if (!isLoggingOut) e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
            }}
            onMouseLeave={(e) => {
              if (!isLoggingOut) e.currentTarget.style.background = 'rgba(239, 68, 68, 0.12)';
            }}
          >
            <LogOut size={16} />
            {isLoggingOut ? 'Logging out...' : 'Decline & Logout'}
          </button>

          <button
            type="button"
            onClick={isAnyBlocked ? checkPermissions : handleRequestPermissions}
            disabled={isRequesting}
            style={{
              flex: '2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px 18px',
              background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
              border: '1px solid rgba(59, 130, 246, 0.5)',
              borderRadius: '10px',
              color: '#FFFFFF',
              fontSize: '14px',
              fontWeight: 600,
              cursor: isRequesting ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              if (!isRequesting) e.currentTarget.style.filter = 'brightness(1.1)';
            }}
            onMouseLeave={(e) => {
              if (!isRequesting) e.currentTarget.style.filter = 'brightness(1.0)';
            }}
          >
            {isRequesting ? (
              <>
                <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} />
                Requesting Permissions...
              </>
            ) : isAnyBlocked ? (
              <>
                <RefreshCw size={16} />
                Re-check Permissions
              </>
            ) : (
              <>
                Allow Permissions & Continue
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
