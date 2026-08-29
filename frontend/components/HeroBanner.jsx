'use client';

import { useEffect, useRef, useState } from 'react';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { createPortal } from 'react-dom';
import { useRouter, usePathname } from 'next/navigation';
import { Search, Calendar, Bell, BellOff, ArrowUpRight, X, AlertTriangle, CheckCircle2, Info, Zap, UserCheck, Camera, Clock, LogOut, LogIn, UserX, ShieldCheck, MapPin, Navigation, RefreshCw, Fingerprint } from 'lucide-react';
import { useAuth } from '../shared/context/AuthContext';
import { useAuthStore } from '@/store/authStore';
import { useNotifications } from '../shared/context/NotificationContext';
import Swal from 'sweetalert2';
import { apiClient } from '../lib/apiClient';
import { getBackendAssetUrl } from '../lib/assetUrl';

// Notification category icon/color map
const getPriorityMeta = (priority, read) => {
  const normalized = String(priority || 'MEDIUM').toUpperCase();
  if (normalized === 'CRITICAL')
    return { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', Icon: AlertTriangle };
  if (normalized === 'HIGH')
    return { color: '#f97316', bg: 'rgba(249,115,22,0.1)', Icon: AlertTriangle };
  if (normalized === 'MEDIUM')
    return { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', Icon: Zap };
  return { color: '#10b981', bg: 'rgba(16,185,129,0.08)', Icon: Info };
};

const formatRelativeTime = (dateStr) => {
  if (!dateStr) return '';
  // Try to parse ISO or simple date strings
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return `${Math.floor(diffHr / 24)}d ago`;
};

const BiometricPunchIcon = ({ size = 18, color = "#ffffff" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    style={{ display: 'inline-block', verticalAlign: 'middle' }}
  >
    <rect x="1" y="4" width="16" height="13" rx="1.5" fill="none" stroke={color} strokeWidth="1.5" />
    <rect x="2.5" y="5.5" width="7" height="4" rx="0.5" fill="none" stroke={color} strokeWidth="1.2" />
    <rect x="2.5" y="11" width="1.5" height="1.2" rx="0.2" fill={color} />
    <rect x="5" y="11" width="1.5" height="1.2" rx="0.2" fill={color} />
    <rect x="7.5" y="11" width="1.5" height="1.2" rx="0.2" fill={color} />
    <rect x="2.5" y="13" width="1.5" height="1.2" rx="0.2" fill={color} />
    <rect x="5" y="13" width="1.5" height="1.2" rx="0.2" fill={color} />
    <rect x="7.5" y="13" width="1.5" height="1.2" rx="0.2" fill={color} />
    <rect x="2.5" y="15" width="1.5" height="1.2" rx="0.2" fill={color} />
    <rect x="5" y="15" width="1.5" height="1.2" rx="0.2" fill={color} />
    <rect x="7.5" y="15" width="1.5" height="1.2" rx="0.2" fill={color} />
    <rect x="12" y="5.5" width="4" height="5" rx="0.5" fill="none" stroke={color} strokeWidth="1.2" />
    <path d="M14.5,7.5 L14.5,13.5 C14.5,13.8 14.7,14.1 14.8,14.3 C14.1,14.6 13.5,15.1 12.8,15.6 L10.8,14.1 C10.4,13.8 9.8,13.9 9.5,14.3 C9.2,14.7 9.3,15.3 9.7,15.6 L11.8,17.2 C12.4,17.7 13.1,18 13.9,18 L19,18 C19.6,18 20,17.6 20,17 L20,14.5 C20,14 19.6,13.5 19.1,13.4 L17,13 C16.5,12.9 16,12.5 16,12 L16,10 C16,9.4 15.6,9 15,9 C14.4,9 14.5,7.5 14.5,7.5 Z" fill={color} />
    <circle cx="17.5" cy="11.5" r="0.6" fill={color} />
    <circle cx="19" cy="12.5" r="0.6" fill={color} />
  </svg>
);

export default function HeroBanner({ 
  stats = [], 
  searchQuery = '',
  setSearchQuery,
  onActionClick,
  notifications: propNotifications,
  onNavigate,
  onAddLead,
  onCreateQuote,
  isDashboard: propIsDashboard,
  onMenuToggle,
}) {
  const { user } = useAuth();
  const { notifications, unreadCount, totalCount, markAllAsRead, isMarkingAllRead, markAsRead, fetchNotifications } = useNotifications();
  
  const searchInputRef = useRef(null);
  const navigate = useRouter();
  const location = { pathname: usePathname(), search: "" };
  // Treat root-level paths (e.g. "/", "/sales", "/admin") as dashboard — show full banner + stats
  const isDashboard = propIsDashboard ?? /^\/[^/]*$/.test(location.pathname);

  const [showAllNotificationsModal, setShowAllNotificationsModal] = useState(false);
  const [modalNotifFilter, setModalNotifFilter] = useState('All');

  const handleViewAll = () => {
    setShowNotifications(false);
    setShowAllNotificationsModal(true);
  };
  const dropdownRef = useRef(null);
  const searchContainerRef = useRef(null);
  const searchDebounceRef = useRef(null);
  
  // Interactive Header Dropdown/Modal States
  const [showNotifications, setShowNotifications] = useState(false);
  const [isSendingTestNotification, setIsSendingTestNotification] = useState(false);
  const [showPunchModal, setShowPunchModal] = useState(false);
  const [punchStatus, setPunchStatus] = useState({ isPunchedIn: false, punchInTime: null, punchOutTime: null, lastPhoto: null });
  const [isTestMode, setIsTestMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('himalaya_attendance_test_mode');
      if (saved) return saved === 'true';
      return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    }
    return false;
  });

  const toggleTestMode = () => {
    setIsTestMode(prev => {
      const next = !prev;
      localStorage.setItem('himalaya_attendance_test_mode', String(next));
      return next;
    });
  };

  const punchSyncErrors = useRef(0);

  const syncPunchStatusFromDB = async () => {
    if (!user || punchSyncErrors.current >= 4) return;
    try {
      const response = await apiClient.get('/attendance/me/today');
      if (response && response.success !== false) {
        punchSyncErrors.current = 0;
        const data = response.data || response;
        const empCode = user.employeeId || user.id || 'EMP-001';
        
        const status = {
          isPunchedIn: data.isPunchedIn || false,
          punchInTime: data.punchInTime || null,
          punchOutTime: data.punchOutTime || null,
          lastPhoto: data.lastPhoto || null
        };
        setPunchStatus(status);
        
        const key = `himalaya_punch_status_${empCode}`;
        localStorage.setItem(key, JSON.stringify(status));
      }
    } catch (e) {
      punchSyncErrors.current += 1;
      console.warn('[HeroBanner] Sync punch status failed (backoff active):', e?.message || e);
      try {
        const key = `himalaya_punch_status_${user.employeeId || user.id || 'EMP-001'}`;
        const saved = localStorage.getItem(key);
        if (saved) {
          setPunchStatus(JSON.parse(saved));
        }
      } catch (err) {}
    }
  };

  const getElapsedTimeHours = () => {
    if (!punchStatus.punchInTime) return null;
    try {
      const now = new Date();
      
      const parseTime = (timeStr) => {
        const timeParts = timeStr.match(/(\d+):(\d+):?(\d+)?\s*(AM|PM)/i);
        if (!timeParts) return null;
        let hours = parseInt(timeParts[1], 10);
        const minutes = parseInt(timeParts[2], 10);
        const seconds = timeParts[3] ? parseInt(timeParts[3], 10) : 0;
        const ampm = timeParts[4].toUpperCase();
        if (ampm === 'PM' && hours < 12) hours += 12;
        if (ampm === 'AM' && hours === 12) hours = 0;
        const d = new Date();
        d.setHours(hours, minutes, seconds, 0);
        return d;
      };

      const punchInDate = parseTime(punchStatus.punchInTime);
      if (!punchInDate) return null;

      let referenceDate = now;
      if (!punchStatus.isPunchedIn && punchStatus.punchOutTime) {
        const punchOutDate = parseTime(punchStatus.punchOutTime);
        if (punchOutDate) referenceDate = punchOutDate;
      }

      const diffMs = referenceDate.getTime() - punchInDate.getTime();
      if (diffMs < 0) return { decimal: "0.00", formatted: "0m 00s" };
      
      const diffHours = diffMs / (1000 * 60 * 60);
      
      const totalSecs = Math.floor(diffMs / 1000);
      const h = Math.floor(totalSecs / 3600);
      const m = Math.floor((totalSecs % 3600) / 60);
      const s = totalSecs % 60;
      
      let formatted = "";
      if (h === 0) {
        formatted = `${m}m ${s.toString().padStart(2, '0')}s`;
      } else {
        formatted = `${h}h ${m.toString().padStart(2, '0')}m`;
      }
      
      return {
        decimal: diffHours.toFixed(2),
        formatted
      };
    } catch (e) {
      console.error(e);
      return null;
    }
  };

  useEffect(() => {
    if (user) {
      syncPunchStatusFromDB();

      const handleFocusSync = () => {
        syncPunchStatusFromDB();
      };

      window.addEventListener('focus', handleFocusSync);
      window.addEventListener('himalaya:punch', handleFocusSync);
      document.addEventListener('visibilitychange', handleFocusSync);

      return () => {
        window.removeEventListener('focus', handleFocusSync);
        window.removeEventListener('himalaya:punch', handleFocusSync);
        document.removeEventListener('visibilitychange', handleFocusSync);
      };
    }
  }, [user, showPunchModal]);

  const savePunchStatus = (updated) => {
    setPunchStatus(updated);
    if (typeof window !== 'undefined' && user) {
      try {
        const key = `himalaya_punch_status_${user.employeeId || user.id || 'EMP-001'}`;
        localStorage.setItem(key, JSON.stringify(updated));
      } catch (e) {}
    }
  };

  // Punch history log — all punch-in/punch-out events persisted for profile page
  const [punchLog, setPunchLog] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('himalaya_punch_log');
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
  });

  const addPunchLogEntry = (entry) => {
    setPunchLog(prev => {
      const updated = [entry, ...prev].slice(0, 90); // keep last 90 entries
      try { 
        localStorage.setItem('himalaya_punch_log', JSON.stringify(updated)); 
        window.dispatchEvent(new CustomEvent('himalaya:punch'));
      } catch(e) {}
      return updated;
    });

    const timeStr = entry.type === 'PUNCH_IN' ? entry.punchInTime : entry.punchOutTime;
    apiClient.post('/attendance/punches', {
      empId: entry.empId,
      empName: entry.empName,
      type: entry.type,
      time: timeStr,
      date: entry.date,
      location: entry.location,
      coords: entry.coords,
      selfieUrl: entry.selfieUrl,
      isRealPunch: true
    }).catch(e => console.error('Error saving punch to DB via API:', e));
  };

  const [liveClock, setLiveClock] = useState('');
  const [liveDateStr, setLiveDateStr] = useState('');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraStream, setCameraStream] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);

  const [locationState, setLocationState] = useState({
    loading: false,
    coords: null,
    latitude: null,
    longitude: null,
    accuracy: null,
    address: 'Fetching location...',
    error: null,
    mandatoryActive: true
  });

  const fetchRealTimeLocation = () => {
    setLocationState(prev => ({ ...prev, error: null }));

    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const accuracy = position.coords.accuracy;
          const coordStr = `${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`;

          let resolvedAddress = `Factory Campus, GIDC Industrial Area (GPS: ${coordStr})`;
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            if (res.ok) {
              const data = await res.json();
              if (data && data.display_name) {
                resolvedAddress = `${data.display_name.slice(0, 80)}...`;
              }
            }
          } catch (e) {
            console.warn('Reverse geocoding fallback:', e);
          }

          setLocationState({
            loading: false,
            coords: coordStr,
            latitude: lat,
            longitude: lng,
            accuracy: accuracy,
            address: resolvedAddress,
            error: null,
            mandatoryActive: true
          });
        },
        (err) => {
          console.warn('Mandatory geolocation error:', err);
          let errMsg = 'Location permission is required to record attendance.';
          if (err.code === err.POSITION_UNAVAILABLE) {
            errMsg = 'Location unavailable. Please check GPS settings.';
          } else if (err.code === err.TIMEOUT) {
            errMsg = 'Location acquisition timed out.';
          }
          
          setLocationState({
            loading: false,
            coords: isTestMode ? '23.0228° N, 72.5566° E' : null,
            latitude: isTestMode ? 23.0228 : null,
            longitude: isTestMode ? 72.5566 : null,
            accuracy: isTestMode ? 15 : null,
            address: isTestMode ? `${errMsg} (Test Fallback Applied) 📍` : errMsg,
            error: isTestMode ? null : (err.code === err.PERMISSION_DENIED ? 'PERMISSION_DENIED' : 'ERROR'),
            mandatoryActive: true
          });
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setLocationState({
        loading: false,
        coords: isTestMode ? '23.0228° N, 72.5566° E' : null,
        latitude: isTestMode ? 23.0228 : null,
        longitude: isTestMode ? 72.5566 : null,
        accuracy: isTestMode ? 15 : null,
        address: isTestMode ? 'Factory Campus, GIDC (Test Fallback) 📍' : 'Browser does not support geolocation.',
        error: isTestMode ? null : 'NOT_SUPPORTED',
        mandatoryActive: true
      });
    }
  };

  // Mandatory real-time location fetch automatically on website load
  useEffect(() => {
    fetchRealTimeLocation();
  }, []);

  useEffect(() => {
    if (showPunchModal) {
      fetchRealTimeLocation();
    }
  }, [showPunchModal]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setLiveClock(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
      setLiveDateStr(now.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const startCameraFeed = async () => {
    setCameraError(null);
    try {
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false
        });
      } catch (firstErr) {
        console.warn('Preferred camera facingMode:user unavailable, attempting fallback constraints:', firstErr);
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
      }
      setCameraStream(stream);
      setCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      return stream;
    } catch (err) {
      console.error('Camera stream error:', err);
      setCameraActive(false);
      if (err.name === 'NotFoundError') {
        setCameraError('No camera detected on this device. Connect/enable a camera and click Retry.');
      } else if (err.name === 'NotAllowedError') {
        setCameraError('Camera permission is blocked. Allow camera access in browser settings.');
      } else {
        setCameraError(err.message || 'Camera stream could not be initialized.');
      }
      return null;
    }
  };

  // Helper to capture live camera frame or generate high-contrast biometric badge
  const generateVerificationSelfie = (actionType = 'PUNCH_IN') => {
    if (videoRef.current && canvasRef.current && cameraActive) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL('image/jpeg', 0.85);
    }

    // Biometric Security Card Fallback for headless/desktop devices without webcam
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');

    // Background Gradient
    const gradient = ctx.createLinearGradient(0, 0, 640, 480);
    gradient.addColorStop(0, '#0f172a');
    gradient.addColorStop(1, '#1e293b');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 640, 480);

    // Accent Border
    ctx.strokeStyle = actionType === 'PUNCH_IN' ? '#22c55e' : '#ef4444';
    ctx.lineWidth = 8;
    ctx.strokeRect(10, 10, 620, 460);

    // Header
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('HIMALAYA ERP • BIOMETRIC ATTENDANCE VERIFICATION', 320, 55);

    // Badge Icon
    ctx.fillStyle = actionType === 'PUNCH_IN' ? '#16a34a' : '#dc2626';
    ctx.beginPath();
    ctx.arc(320, 130, 45, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText(actionType === 'PUNCH_IN' ? '🟢' : '🔴', 320, 142);

    // User Info
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText(`${user?.name || 'SuperSales 1'}`, 320, 215);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '16px sans-serif';
    ctx.fillText(`Role: ${user?.role || 'SuperSales'} • Action: ${actionType}`, 320, 245);

    // Divider Line
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(60, 270);
    ctx.lineTo(580, 270);
    ctx.stroke();

    // Timestamp & Geolocation Details
    ctx.textAlign = 'left';
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 15px monospace';
    ctx.fillText(`⏰ TIME: ${liveClock || new Date().toLocaleTimeString()} (${liveDateStr || 'Today'})`, 60, 310);
    ctx.fillText(`📍 GPS COORDS: ${locationState.coords}`, 60, 345);

    ctx.fillStyle = '#e2e8f0';
    ctx.font = '13px sans-serif';
    const addressStr = locationState.address ? locationState.address.slice(0, 70) : 'Ambawadi, Ahmedabad, Gujarat';
    ctx.fillText(`🏢 ADDRESS: ${addressStr}`, 60, 380);

    // Security Watermark
    ctx.fillStyle = '#64748b';
    ctx.font = '11px monospace';
    ctx.fillText(`VERIFICATION TOKEN: SHA256-${Date.now().toString(36).toUpperCase()}-GPS-AUTH`, 60, 430);

    return canvas.toDataURL('image/jpeg', 0.85);
  };

  const getTodayKolkataDateString = () => {
    const d = new Date();
    const offset = 330; // IST is UTC + 5:30 (330 minutes)
    const localTime = d.getTime() + (d.getTimezoneOffset() + offset) * 60000;
    const istDate = new Date(localTime);
    const year = istDate.getFullYear();
    const month = String(istDate.getMonth() + 1).padStart(2, '0');
    const day = String(istDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    if (showPunchModal) {
      let activeStream = null;
      startCameraFeed().then(s => { activeStream = s; });

      return () => {
        if (activeStream) {
          activeStream.getTracks().forEach(t => t.stop());
        }
      };
    } else {
      if (cameraStream) {
        cameraStream.getTracks().forEach(t => t.stop());
        setCameraStream(null);
        setCameraActive(false);
        setCameraError(null);
      }
    }
  }, [showPunchModal]);
  const [selectedCalendarDay, setSelectedCalendarDay] = useState(12);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [notifFilter, setNotifFilter] = useState('All'); // 'All' | 'Unread' | 'High'
  const isMobile = useMediaQuery('(max-width: 768px)');

  const isCameraActiveState = cameraActive && !cameraError;
  const isGpsValidState = !!(locationState.coords && !locationState.error && !(locationState.latitude === 23.0228 && locationState.longitude === 72.5566));
  const isPunchBlocked = (!isCameraActiveState || !isGpsValidState) && !isTestMode;


  // Live Search State
  const [searchResults, setSearchResults] = useState([]);
  const [searchGrouped, setSearchGrouped] = useState({});
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  // Keyboard shortcut CMD/Ctrl + K focus search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setShowNotifications(false);
        setShowCalendarModal(false);
        setShowSearchDropdown(false);
        setSearchResults([]);
        setSearchGrouped({});
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowSearchDropdown(false);
        setSearchResults([]);
        setSearchGrouped({});
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Manage body class for mobile scroll locking
  useEffect(() => {
    if (showNotifications) {
      document.body.classList.add('notification-open');
    } else {
      document.body.classList.remove('notification-open');
    }
    return () => {
      document.body.classList.remove('notification-open');
    };
  }, [showNotifications]);


  const handleNotificationBellClick = () => {
    const willOpen = !showNotifications;
    setShowNotifications(willOpen);
    setShowCalendarModal(false);
    if (willOpen) {
      setNotifFilter('All'); // always reset to All tab on fresh open
    }
  };

  const sendTestNotification = async () => {
    if (isSendingTestNotification) return;
    setIsSendingTestNotification(true);
    try {
      const token = localStorage.getItem('token') || useAuthStore.getState().accessToken;
      const response = await fetch('/api/backend/notifications/test-push', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result.success === false) {
        throw new Error(result.message || result.error || 'Unable to create test notification.');
      }
      await fetchNotifications();
      if (result.data?.pushDelivered === false) {
        console.warn('[Notifications] Bell test created, but FCM has no registered device token.');
      }
    } catch (error) {
      console.error('[Notifications] Test notification failed:', error);
      alert(error?.message || 'Unable to send test notification.');
    } finally {
      setIsSendingTestNotification(false);
    }
  };

  // Filtered notifications based on tab
  const filteredNotifications = notifications.filter(n => {
    if (notifFilter === 'Unread') return !n.is_read;
    if (notifFilter === 'Read') return n.is_read;
    return true;
  });

  // Mock Calendar events for June 2026
  const calendarEvents = {
    5: { title: 'Order #ORD-0801 Booked', desc: 'Titan Industries (₹12.50 L)' },
    8: { title: 'Invoice INV-1002 Created', desc: 'Nexus Tech Ltd (₹4.00 L)' },
    10: { title: 'Quotation #QTN-201 Drafted', desc: 'Global Infra Corp' },
    11: { title: 'Concrete Cylinders Dispatch', desc: 'Apex Industries (₹2.80 L)' },
    12: { title: 'New Lead Registered', desc: 'Quantum Systems (John Doe)' }
  };

  const getCalendarDays = () => {
    const days = [];
    days.push(null);
    for (let i = 1; i <= 30; i++) {
      days.push(i);
    }
    return days;
  };

  const weekdayLabels = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  // ── Live Global Search (Grouped) ────────────────────────────────────────────
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery?.(val);

    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);

    if (val.trim().length < 2) {
      setSearchResults([]);
      setSearchGrouped({});
      setShowSearchDropdown(false);
      return;
    }

    searchDebounceRef.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const token = localStorage.getItem('token') || '';
        const currentPanel = (location.pathname || '').split('/')[1] || 'sales';
        const res = await fetch(`/api/backend/search/global?q=${encodeURIComponent(val.trim())}&panel=${encodeURIComponent(currentPanel)}`, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const data = await res.json();

        // Support both direct response and wrapped response formats
        const payload = data?.data || data;
        if (payload && Array.isArray(payload.groups)) {
          const groupedObj = {};
          const flatResults = [];
          payload.groups.forEach((g) => {
            const key = g.type.toLowerCase();
            groupedObj[key] = g.results || [];
            flatResults.push(...(g.results || []));
          });
          setSearchResults(flatResults);
          setSearchGrouped(groupedObj);
          setShowSearchDropdown(true);
        } else if (data.success && data.results) {
          setSearchResults(data.results || []);
          setSearchGrouped(data.grouped || {});
          setShowSearchDropdown(true);
        } else {
          setSearchResults([]);
          setSearchGrouped({});
          setShowSearchDropdown(true);
        }
      } catch (err) {
        console.warn('[Search] API error:', err.message);
      } finally {
        setSearchLoading(false);
      }
    }, 300);
  };

  // Use the route field from the backend — no frontend entity switching needed
  const handleSearchResultClick = (item) => {
    setShowSearchDropdown(false);
    setSearchResults([]);
    setSearchGrouped({});
    setSearchQuery?.('');
    if (item.route) navigate.push(item.route);
  };

  // Color palette per entity section header
  const ENTITY_PALETTE = {
    lead:               { color: '#a78bfa', label: 'LEADS' },
    leads:              { color: '#a78bfa', label: 'LEADS' },
    quotation:          { color: '#f43f5e', label: 'QUOTATIONS' },
    quotations:         { color: '#f43f5e', label: 'QUOTATIONS' },
    sales_order:        { color: '#60a5fa', label: 'ORDERS' },
    orders:             { color: '#60a5fa', label: 'ORDERS' },
    customer:           { color: '#fbbf24', label: 'CUSTOMERS' },
    customers:          { color: '#fbbf24', label: 'CUSTOMERS' },
    sample:             { color: '#34d399', label: 'SAMPLES' },
    samples:            { color: '#34d399', label: 'SAMPLES' },
    invoice:            { color: '#6ee7b7', label: 'INVOICES' },
    invoices:           { color: '#6ee7b7', label: 'INVOICES' },
    work_order:         { color: '#f472b6', label: 'WORK ORDERS' },
    'work-orders':      { color: '#f472b6', label: 'WORK ORDERS' },
    dispatch:           { color: '#fb923c', label: 'DISPATCHES' },
    dispatches:         { color: '#fb923c', label: 'DISPATCHES' },
    material_request:   { color: '#a3e635', label: 'MATERIAL REQUESTS' },
    'material-requests':{ color: '#a3e635', label: 'MATERIAL REQUESTS' },
    purchase_order:     { color: '#38bdf8', label: 'PURCHASE ORDERS' },
    'purchase-orders':  { color: '#38bdf8', label: 'PURCHASE ORDERS' },
    product:            { color: '#c084fc', label: 'PRODUCTS & MATERIALS' },
    products:           { color: '#c084fc', label: 'PRODUCTS & MATERIALS' },
    employee:           { color: '#8893A7', label: 'EMPLOYEES' },
    employees:          { color: '#8893A7', label: 'EMPLOYEES' },
  };

  return (
    <header className={`hero-banner ${!isDashboard ? 'compact' : ''}`}>
      {/* Top Integrated Header */}
      <div className="hero-top-row">
        {/* Mobile Hamburger Toggle */}
        <button 
          className="mobile-menu-toggle hero-mobile-menu-toggle" 
          id="mobileMenuToggleHero"
          title="Open Menu" 
          onClick={() => {
            if (onMenuToggle) {
              onMenuToggle();
            } else if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('toggle-sidebar'));
            }
          }}
        >
          ☰
        </button>

        <h1 className="brand-title" style={{ cursor: 'pointer' }} onClick={() => navigate.push('/')}>Himalaya</h1>
        
        {/* Live Search with Backend Results Dropdown */}
        <div className="hero-search" ref={searchContainerRef} style={{ position: 'relative' }}>
          <Search size={15} strokeWidth={1.75} style={{ color: searchLoading ? '#3BAEEB' : 'rgba(255, 255, 255, 0.8)', transition: 'color 0.2s' }} />
          <input 
            type="text" 
            placeholder={isMobile ? "Search leads, orders..." : "Search leads, orders, invoices... (⌘K)"} 
            id="searchInput" 
            ref={searchInputRef}
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => {
              if (searchResults.length > 0) setShowSearchDropdown(true);
            }}
            autoComplete="off"
          />

          {/* Grouped Categorized Search Results Dropdown */}
          {showSearchDropdown && (
            <div className="hero-search-dropdown" style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              left: 0,
              right: 0,
              minWidth: '420px',
              maxHeight: '520px',
              overflowY: 'auto',
              background: 'rgba(8, 16, 30, 0.98)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '14px',
              boxShadow: '0 28px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)',
              zIndex: 9999,
              animation: 'slideDown 0.18s ease',
            }}>

              {/* Loading State */}
              {searchLoading && (
                <div style={{ padding: '16px 18px', color: 'rgba(255,255,255,0.38)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '14px', height: '14px', border: '2px solid rgba(96,165,250,0.25)', borderTopColor: '#60a5fa', borderRadius: '50%', flexShrink: 0, animation: 'spin 0.7s linear infinite' }} />
                  Searching Himalaya ERP...
                </div>
              )}

              {/* Empty State */}
              {!searchLoading && searchResults.length === 0 && (
                <div style={{ padding: '24px 18px', textAlign: 'center' }}>
                  <div style={{ color: 'rgba(255,255,255,0.22)', fontSize: '13px' }}>No results for &ldquo;{searchQuery}&rdquo;</div>
                  <div style={{ color: 'rgba(255,255,255,0.12)', fontSize: '11px', marginTop: '4px' }}>Try a different keyword or identifier</div>
                </div>
              )}

              {/* Grouped Results — one section per entity type */}
              {!searchLoading && Object.entries(searchGrouped).map(([sectionKey, rawItems]) => {
                const items = Array.isArray(rawItems) ? rawItems : [];
                if (items.length === 0) return null;
                const palette = ENTITY_PALETTE[sectionKey] || { color: '#8893A7', label: sectionKey.toUpperCase() };
                return (
                  <div key={sectionKey}>
                    {/* Section Header */}
                    <div style={{
                      padding: '8px 18px 4px',
                      fontSize: '10px',
                      fontWeight: 800,
                      letterSpacing: '0.1em',
                      color: palette.color,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      borderTop: '1px solid rgba(255,255,255,0.04)',
                    }}>
                      <span>{palette.label}</span>
                      <span style={{ fontWeight: 400, opacity: 0.55 }}>({items.length})</span>
                    </div>

                    {/* Section Items */}
                    {items.map((item, idx) => (
                      <div
                        key={`${item.entity}-${item.id}-${idx}`}
                        onClick={() => handleSearchResultClick(item)}
                        style={{
                          padding: '9px 18px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '12px',
                          transition: 'background 0.12s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.045)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <div style={{ minWidth: 0 }}>
                          <div style={{ color: '#f1f5f9', fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {item.title}
                          </div>
                          {item.subtitle && (
                            <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: '11px', marginTop: '1px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {item.subtitle}
                            </div>
                          )}
                        </div>
                        {item.status && (
                          <span style={{
                            flexShrink: 0,
                            padding: '2px 8px',
                            borderRadius: '20px',
                            fontSize: '10px',
                            fontWeight: 600,
                            background: `${palette.color}18`,
                            color: palette.color,
                            border: `1px solid ${palette.color}28`,
                            whiteSpace: 'nowrap',
                          }}>
                            {item.status}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })}

              {/* Footer */}
              {!searchLoading && searchResults.length > 0 && (
                <div style={{ padding: '8px 18px', borderTop: '1px solid rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.2)', fontSize: '11px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{searchResults.length} result{searchResults.length !== 1 ? 's' : ''} across {Object.keys(searchGrouped).length} categor{Object.keys(searchGrouped).length !== 1 ? 'ies' : 'y'}</span>
                  <span>Esc to close</span>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="hero-actions" style={{ position: 'relative' }} ref={dropdownRef}>
          {/* ── PUNCH IN / PUNCH OUT CAMERA BUTTON ── */}
          <button 
            className="hero-action-btn" 
            title={punchStatus.isPunchedIn ? `Punched In at ${punchStatus.punchInTime || ''} - Click to Punch Out` : "Punch In with Camera Selfie"} 
            onClick={() => {
              setShowPunchModal(true);
              setShowNotifications(false);
            }}
            style={{ position: 'relative' }}
          >
            <BiometricPunchIcon size={20} color={punchStatus.isPunchedIn ? "#22c55e" : "#ffffff"} />
            {punchStatus.isPunchedIn && (
              <span style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#22c55e',
                boxShadow: '0 0 8px #22c55e'
              }} />
            )}
          </button>
          
          {/* ── NOTIFICATION BELL BUTTON ── */}
          <button 
            className="hero-action-btn" 
            title="Notifications" 
            id="notificationBellBtn"
            onClick={handleNotificationBellClick}
            style={{ position: 'relative' }}
          >
            <Bell
              size={16}
              strokeWidth={2.2}
              style={{
                transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                transform: showNotifications ? 'rotate(-20deg)' : 'rotate(0deg)',
              }}
            />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-3px',
                right: '-3px',
                minWidth: '18px',
                height: '18px',
                borderRadius: '50%',
                background: '#ef4444',
                border: '1.5px solid rgba(20,50,60,0.9)',
                color: '#fff',
                fontSize: '9px',
                fontWeight: '900',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 3px',
                lineHeight: 1,
                animation: 'notifPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                boxShadow: '0 1px 4px rgba(239,68,68,0.6)',
              }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* ── NOTIFICATION BACKDROP (Portaled on mobile, inline on desktop) ── */}
          {showNotifications && isMobile && createPortal(
            <div 
              className="notification-backdrop" 
              onClick={() => setShowNotifications(false)}
            />,
            document.body
          )}

          {/* ── PREMIUM NOTIFICATION DROPDOWN ── */}
          {showNotifications && (() => {
            const dropdownEl = (
              <div
                id="notificationDropdown"
                style={{
                  position: isMobile ? 'fixed' : 'absolute',
                  top: isMobile ? '76px' : 'calc(100% + 12px)',
                  right: isMobile ? '16px' : 0,
                  left: isMobile ? '16px' : 'auto',
                  bottom: isMobile ? '16px' : 'auto',
                  width: isMobile ? 'auto' : 'min(360px, calc(100vw - 24px))',
                  maxHeight: isMobile ? 'calc(100vh - 92px)' : 'none',
                  background: '#ffffff',
                  borderRadius: '20px',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 4px 20px rgba(0,0,0,0.08)',
                  border: '1px solid rgba(226,232,240,0.8)',
                  zIndex: 10015,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  animation: isMobile ? 'none' : 'dropdownSlideIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
              >
                {/* Header */}
                <div style={{
                  padding: '16px 18px 12px',
                  borderBottom: '1px solid rgba(226,232,240,0.6)',
                  background: 'linear-gradient(135deg, #F5FAFE 0%, #ffffff 100%)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '28px', height: '28px', borderRadius: '8px',
                        background: 'linear-gradient(135deg, #2F4375, #3BAEEB)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Bell size={14} color="#ffffff" />
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: '800', color: '#24345C' }}>
                          {user?.role} Alerts
                        </div>
                        <div style={{ fontSize: '10px', color: '#5E6B82', fontWeight: '600' }}>
                          {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <button
                        onClick={sendTestNotification}
                        disabled={isSendingTestNotification}
                        title="Create a test bell notification and send an FCM push"
                        style={{
                          background: '#eff6ff', border: '1px solid #bfdbfe', color: '#2563eb',
                          borderRadius: '8px', padding: '4px 8px', fontSize: '10px', fontWeight: '700',
                          cursor: isSendingTestNotification ? 'wait' : 'pointer', opacity: isSendingTestNotification ? 0.7 : 1,
                        }}
                      >
                        {isSendingTestNotification ? 'Sending...' : 'Test alert'}
                      </button>
                      <button
                        onClick={markAllAsRead}
                        disabled={isMarkingAllRead || unreadCount === 0}
                        style={{
                          background: unreadCount === 0 ? '#f1f5f9' : '#f0fdf4',
                          border: `1px solid ${unreadCount === 0 ? '#DCE5F0' : '#bbf7d0'}`,
                          color: unreadCount === 0 ? '#8893A7' : '#16a34a',
                          borderRadius: '8px',
                          padding: '4px 10px', fontSize: '10px', fontWeight: '700',
                          cursor: unreadCount === 0 ? 'not-allowed' : 'pointer',
                          display: 'flex', alignItems: 'center', gap: '4px',
                          opacity: isMarkingAllRead ? 0.7 : 1,
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {isMarkingAllRead ? (
                          <>
                            <span style={{ width: '10px', height: '10px', border: '2px solid #16a34a', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                            Marking...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={10} />
                            Read all
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => setShowNotifications(false)}
                        style={{
                          background: 'transparent', border: 'none', cursor: 'pointer',
                          color: '#8893A7', padding: '4px', borderRadius: '6px',
                          display: 'flex', alignItems: 'center',
                        }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Filter Tabs */}
                  <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', borderRadius: '10px', padding: '3px' }}>
                    {[
                      { label: 'All', count: notifications.length },
                      { label: 'Unread', count: notifications.filter(n => !n.is_read).length },
                      { label: 'Read', count: notifications.filter(n => n.is_read).length },
                    ].map(tab => (
                      <button
                        key={tab.label}
                        onClick={() => setNotifFilter(tab.label)}
                        style={{
                          flex: 1, border: 'none', cursor: 'pointer',
                          borderRadius: '8px', padding: '5px 8px',
                          background: notifFilter === tab.label ? '#ffffff' : 'transparent',
                          color: notifFilter === tab.label ? '#24345C' : '#5E6B82',
                          fontWeight: notifFilter === tab.label ? '700' : '600',
                          fontSize: '11px',
                          boxShadow: notifFilter === tab.label ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                          transition: 'all 0.15s ease',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                        }}
                      >
                        {tab.label}
                        {tab.count > 0 && (
                          <span style={{
                            fontSize: '9px', fontWeight: '800', minWidth: '16px', height: '16px',
                            borderRadius: '8px', padding: '0 4px',
                             background: notifFilter === tab.label
                              ? (tab.label === 'High' ? '#ef4444' : tab.label === 'Unread' ? '#3b82f6' : tab.label === 'Read' ? '#10b981' : '#334155')
                              : '#D6E2F0',
                            color: notifFilter === tab.label ? '#ffffff' : '#5E6B82',
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            lineHeight: 1,
                          }}>
                            {tab.count}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notification List */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '8px', minHeight: 0 }}>
                  {filteredNotifications.length === 0 ? (
                    <div style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center',
                      justifyContent: 'center', padding: '32px 20px', gap: '10px',
                    }}>
                      <div style={{
                        width: '44px', height: '44px', borderRadius: '12px',
                        background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <CheckCircle2 size={22} color="#8893A7" />
                      </div>
                      <span style={{ fontSize: '12px', color: '#8893A7', fontWeight: '600', textAlign: 'center' }}>
                        {notifFilter === 'Unread' ? 'All caught up! No unread alerts.' :
                         notifFilter === 'Read' ? 'No read alerts yet.' :
                         'No notifications yet.'}
                      </span>
                    </div>
                  ) : (
                    filteredNotifications.slice(0, 8).map((n, idx) => {
                      const { color, bg, Icon } = getPriorityMeta(n.priority, n.is_read);
                      return (
                        <div
                          key={n.id || idx}
                          style={{
                            display: 'flex', gap: '10px', padding: '10px 10px',
                            borderRadius: '12px', cursor: 'pointer',
                            background: (n.isRead || n.is_read) ? 'transparent' : 'rgba(248,250,252,0.8)',
                            border: (n.isRead || n.is_read) ? '1px solid transparent' : '1px solid rgba(226,232,240,0.6)',
                            marginBottom: '4px',
                            transition: 'background 0.15s ease',
                            opacity: (n.isRead || n.is_read) ? 0.65 : 1,
                          }}
                          onClick={() => {
                            if (n.id) markAsRead(n.id);
                            setShowNotifications(false);
                            if (n.route) navigate.push(n.route);
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#F5FAFE'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = (n.isRead || n.is_read) ? 'transparent' : 'rgba(248,250,252,0.8)'; }}
                        >
                          {/* Icon dot */}
                          <div style={{
                            width: '32px', height: '32px', borderRadius: '9px',
                            background: bg, border: `1px solid ${color}25`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0, marginTop: '1px',
                          }}>
                            <Icon size={14} color={color} strokeWidth={2.5} />
                          </div>

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                              <span style={{
                                fontSize: '12.5px', fontWeight: '700', color: '#24345C',
                                lineHeight: 1.3, flex: 1,
                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                              }}>
                                {n.title}
                              </span>
                              <span style={{
                                fontSize: '9px', fontWeight: '700',
                                color: color, background: bg,
                                padding: '2px 6px', borderRadius: '6px',
                                border: `1px solid ${color}30`,
                                whiteSpace: 'nowrap', flexShrink: 0,
                              }}>
                                {String(n.priority || 'MEDIUM').toUpperCase()}
                              </span>
                            </div>
                            <p style={{
                              fontSize: '11px', color: '#5E6B82', margin: '4px 0 0 0',
                              lineHeight: 1.45, fontWeight: '500',
                              overflow: 'hidden', textOverflow: 'ellipsis',
                              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                            }}>
                              {n.message}
                            </p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px', alignItems: 'center' }}>
                              <span style={{ fontSize: '10px', color: '#8893A7', fontWeight: '500' }}>
                                <span style={{ marginRight: '6px', color: '#5E6B82', fontWeight: '700' }}>#{n.module || 'SYSTEM'}</span>
                                {formatRelativeTime(n.createdAt || n.created_at || n.date)}
                              </span>
                              {!n.is_read && (
                                <span style={{
                                  width: '6px', height: '6px', borderRadius: '50%',
                                  background: '#3b82f6', display: 'inline-block', flexShrink: 0,
                                }} />
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Footer */}
                {totalCount > 0 && (
                  <div style={{
                    padding: '10px 16px',
                    borderTop: '1px solid rgba(226,232,240,0.6)',
                    background: '#fafbfc',
                  }}>
                    <button
                      onClick={handleViewAll}
                      style={{
                        width: '100%', background: 'transparent', border: 'none',
                        cursor: 'pointer', color: '#2F4375', fontSize: '12px',
                        fontWeight: '700', padding: '6px',
                        borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                      }}
                    >
                      View all {totalCount} notifications
                      <ArrowUpRight size={12} />
                    </button>
                  </div>
                )}
              </div>
            );

            return isMobile ? createPortal(dropdownEl, document.body) : dropdownEl;
          })()}
        </div>
      </div>

      {/* Punch In / Punch Out Camera Selfie Modal — Light Theme Redesign */}
      {/* Punch In / Punch Out Camera Selfie Modal — Light Theme with Dedicated Mobile Responsive Structure */}
      {showPunchModal && typeof window !== 'undefined' && createPortal(
        <div
          onClick={() => setShowPunchModal(false)}
          className="attendance-punch-overlay"
        >
          <div
            className="attendance-punch-modal"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 1. Fixed Header */}
            <header className="attendance-punch-header">
              <div className="attendance-punch-header-content">
                <h3 className="attendance-punch-title">
                  <Camera size={18} color="var(--color-lime-brand, #dcf26b)" />
                  Attendance Selfie Punch
                </h3>
                <p className="attendance-punch-subtitle">
                  Real-time timestamp &amp; camera selfie verification
                </p>
              </div>
              <div className="attendance-punch-header-actions">
                <label className="attendance-punch-test-mode" style={{ background: isTestMode ? '#16a34a' : 'rgba(255, 255, 255, 0.12)' }}>
                  <input 
                    type="checkbox" 
                    checked={isTestMode} 
                    onChange={toggleTestMode} 
                    style={{ cursor: 'pointer', width: '12px', height: '12px' }}
                  />
                  Test Mode
                </label>
                <button 
                  type="button"
                  onClick={() => setShowPunchModal(false)}
                  className="attendance-punch-close"
                  aria-label="Close Modal"
                >
                  <X size={16} />
                </button>
              </div>
            </header>

            {/* 2. Scrollable Body — Only this area scrolls */}
            <main className="attendance-punch-body">
              
              {/* Real-time Clock Banner */}
              <div className="attendance-punch-clock">
                <span className="attendance-punch-clock-label">
                  <Clock size={12} color="#0284c7" /> Real-time Clock
                </span>
                <div className="attendance-punch-clock-time">
                  {liveClock || '11:24:00 AM'}
                </div>
                <span className="attendance-punch-clock-date">
                  {liveDateStr || 'Saturday, 15 August 2026'}
                </span>
              </div>

              {/* Real-time Location Box (Mandatory Active) */}
              <div className="attendance-punch-location">
                <div className="attendance-punch-location-header">
                  <span className="attendance-punch-location-title">
                    <MapPin size={13} color="#0284c7" /> Real-time Location (Mandatory GPS)
                  </span>
                  <span className="attendance-punch-location-badge">
                    Mandatory On Load 🟢
                  </span>
                </div>
                <div className="attendance-punch-location-address">
                  <span style={{ flexShrink: 0 }}>📍</span>
                  <span style={{ flex: 1 }}>{locationState.loading ? 'Acquiring mandatory device location via GPS...' : locationState.address}</span>
                </div>
                {locationState.coords && (
                  <div className="attendance-punch-location-coordinates">
                    <span className="attendance-punch-location-coord-text">
                      Mandatory GPS Coordinates: {locationState.coords}
                    </span>
                    {locationState.accuracy && (
                      <span className="attendance-punch-location-accuracy-badge">
                        Accuracy: ±{Math.round(locationState.accuracy)}m
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Status Badge */}
              <div className={`attendance-punch-status ${punchStatus.isPunchedIn ? 'punched-in' : 'not-punched-in'}`}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: punchStatus.isPunchedIn ? '#22c55e' : '#f59e0b', display: 'inline-block', flexShrink: 0 }} />
                  <span style={{ fontSize: '12px', fontWeight: '800', color: punchStatus.isPunchedIn ? '#15803D' : '#B45309' }}>
                    {punchStatus.isPunchedIn ? 'STATUS: PUNCHED IN' : 'STATUS: NOT PUNCHED IN'}
                  </span>
                </div>
                {(punchStatus.punchInTime || punchStatus.punchOutTime) && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                    {punchStatus.punchInTime && (
                      <span style={{ fontSize: '11px', fontWeight: '800', color: '#16A34A' }}>
                        In: {punchStatus.punchInTime} {punchStatus.date && <span style={{ color: '#64748B', fontSize: '9.5px', fontWeight: '500' }}>({punchStatus.date})</span>}
                      </span>
                    )}
                    {punchStatus.punchOutTime && (
                      <span style={{ fontSize: '11px', fontWeight: '800', color: '#DC2626' }}>
                        Out: {punchStatus.punchOutTime}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Logged In User Info & Hours Worked */}
              <div className="attendance-punch-user">
                <div style={{ fontWeight: '700', color: '#475569' }}>
                  Logged In User: <span style={{ color: '#0F172A', fontWeight: '800' }}>{user?.name || 'HR'} ({user?.role || 'HR'})</span>
                </div>
                {punchStatus.punchInTime && (
                  <div style={{ fontWeight: '700', color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>⏱️</span>
                    <span>
                      {punchStatus.isPunchedIn ? 'Logged In Duration: ' : 'Total Worked Duration: '}
                      <span style={{ color: punchStatus.isPunchedIn ? '#16A34A' : '#475569', fontWeight: '900', fontFamily: 'monospace' }}>
                        {getElapsedTimeHours()?.formatted || '0m 00s'}
                      </span>
                    </span>
                  </div>
                )}
              </div>

              {/* Camera Feed Container */}
              <div className="attendance-punch-camera">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  style={{ width: '100%', height: '100%', minHeight: '190px', objectFit: 'cover', transform: 'scaleX(-1)', display: cameraActive ? 'block' : 'none' }} 
                />
                <canvas ref={canvasRef} style={{ display: 'none' }} />

                {!cameraActive && (
                  <div className="attendance-punch-camera-placeholder">
                    <div className="attendance-punch-camera-icon">
                      <Camera size={36} color={cameraError ? '#ef4444' : '#64748b'} />
                    </div>
                    <span className="attendance-punch-camera-title" style={{ color: cameraError ? '#f87171' : '#e2e8f0' }}>
                      {cameraError ? 'Camera Unavailable' : 'Selfie Camera Ready'}
                    </span>
                    <span className="attendance-punch-camera-message">
                      {cameraError || 'Align your face in center frame before punching'}
                    </span>
                    {cameraError && (
                      <button
                        type="button"
                        onClick={() => startCameraFeed()}
                        className="attendance-punch-retry"
                      >
                        Retry Camera
                      </button>
                    )}
                  </div>
                )}

                <div className="attendance-punch-camera-badge">
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: cameraActive ? '#22c55e' : '#ef4444', flexShrink: 0 }} />
                  <span>{cameraActive ? 'Selfie Camera Active' : 'Selfie Camera Offline'}</span>
                </div>
              </div>
            </main>

            {/* 3. Fixed Footer */}
            <footer className="attendance-punch-footer">
              {!punchStatus.isPunchedIn ? (
                <button
                  type="button"
                  onClick={() => {
                    const capturedDataUrl = generateVerificationSelfie('PUNCH_IN');

                    apiClient.post('/attendance/punch-in', {
                      latitude: locationState.latitude || 23.0228,
                      longitude: locationState.longitude || 72.5566,
                      accuracy: locationState.accuracy || 15,
                      address: locationState.address,
                      selfie: capturedDataUrl,
                      isBiometricCard: !isCameraActiveState,
                      isGpsFallback: !isGpsValidState
                    }).then((res) => {
                      if (res && res.success !== false) {
                        const data = res.data || res;
                        savePunchStatus(data);
                        window.dispatchEvent(new CustomEvent('himalaya:punch'));
                        setShowPunchModal(false);
                        Swal.fire({
                          icon: 'success',
                          title: 'Punched In Successfully! 🟢',
                          html: `
                            <div style="text-align: left; font-size: 13.5px; line-height: 1.6; color: #1e293b; font-family: sans-serif;">
                              <div style="background: #F0FDF4; border: 1.5px solid #86EFAC; padding: 14px; border-radius: 10px; margin-bottom: 12px;">
                                <div><strong>Employee:</strong> ${user?.name || 'HR'} (${user?.role || 'HR'})</div>
                                <div><strong>Action:</strong> <span style="font-weight: 800; color: #15803D;">PUNCH IN</span></div>
                                <div><strong>Time:</strong> <span style="font-weight: 800; color: #2563EB;">${data.punchInTime}</span></div>
                                <div><strong>Location:</strong> <span style="font-weight: 700; color: #0284c7;">📍 ${locationState.address}</span></div>
                                <div><strong>Verification:</strong> GPS &amp; Selfie Verification Captured 📸</div>
                              </div>
                            </div>
                          `,
                          confirmButtonText: 'Great!',
                          customClass: { popup: 'swal-premium-popup', confirmButton: 'swal-premium-confirm-btn' },
                          buttonsStyling: false
                        });
                      } else {
                        const rawError = res?.message || 'Error occurred during punch-in.';
                        const errorMsg = typeof rawError === 'object' ? JSON.stringify(rawError) : String(rawError);
                        const isAlreadyPunched = errorMsg.includes('ALREADY_PUNCHED_IN') || errorMsg.toLowerCase().includes('already punched in');
                        if (isAlreadyPunched) {
                          syncPunchStatusFromDB();
                          setShowPunchModal(false);
                          Swal.fire({
                            icon: 'info',
                            title: 'Already Punched In 🟢',
                            text: 'You are already punched in for today on another device/session.',
                            confirmButtonText: 'OK',
                          });
                        } else {
                          Swal.fire({ icon: 'error', title: 'Punch In Failed', text: errorMsg });
                        }
                      }
                    }).catch((err) => {
                      const isAlreadyPunched = err?.message?.includes('ALREADY_PUNCHED_IN') || err?.message?.includes('already punched in');
                      if (isAlreadyPunched) {
                        syncPunchStatusFromDB();
                        setShowPunchModal(false);
                        Swal.fire({
                          icon: 'info',
                          title: 'Already Punched In 🟢',
                          text: 'You are already punched in for today on another device/session.',
                          confirmButtonText: 'OK',
                        });
                      } else {
                        Swal.fire({ icon: 'error', title: 'Punch In Failed', text: err.message || 'Error occurred during punch-in.' });
                      }
                    });
                  }}
                  disabled={locationState.loading || (!locationState.coords && !isTestMode)}
                  className="attendance-punch-action-btn punch-in"
                >
                  <Camera size={18} /> Take Selfie &amp; Punch In
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    const capturedDataUrl = generateVerificationSelfie('PUNCH_OUT');

                    apiClient.post('/attendance/punch-out', {
                      latitude: locationState.latitude || 23.0228,
                      longitude: locationState.longitude || 72.5566,
                      accuracy: locationState.accuracy || 15,
                      address: locationState.address,
                      selfie: capturedDataUrl,
                      isBiometricCard: !isCameraActiveState,
                      isGpsFallback: !isGpsValidState
                    }).then((res) => {
                      if (res && res.success !== false) {
                        const data = res.data || res;
                        savePunchStatus(data);
                        window.dispatchEvent(new CustomEvent('himalaya:punch'));
                        setShowPunchModal(false);
                        Swal.fire({
                          icon: 'success',
                          title: 'Punched Out Successfully! 🔴',
                          html: `
                            <div style="text-align: left; font-size: 13.5px; line-height: 1.6; color: #1e293b; font-family: sans-serif;">
                              <div style="background: #FEF2F2; border: 1.5px solid #FECDD3; padding: 14px; border-radius: 10px; margin-bottom: 12px;">
                                <div><strong>Employee:</strong> ${user?.name || 'HR'} (${user?.role || 'HR'})</div>
                                <div><strong>Action:</strong> <span style="font-weight: 800; color: #DC2626;">PUNCH OUT</span></div>
                                <div><strong>Punch In Time:</strong> ${punchStatus.punchInTime}</div>
                                <div><strong>Punch Out Time:</strong> <span style="font-weight: 800; color: #DC2626;">${data.punchOutTime}</span></div>
                                <div><strong>Location:</strong> <span style="font-weight: 700; color: #0284c7;">📍 ${locationState.address}</span></div>
                                <div><strong>Verification:</strong> GPS &amp; Selfie Verification Captured 📸</div>
                              </div>
                            </div>
                          `,
                          confirmButtonText: 'Great!',
                          customClass: { popup: 'swal-premium-popup', confirmButton: 'swal-premium-confirm-btn' },
                          buttonsStyling: false
                        });
                      } else {
                        const errorMsg = res?.message || 'Error occurred during punch-out.';
                        Swal.fire({ icon: 'error', title: 'Punch Out Failed', text: errorMsg });
                      }
                    }).catch((err) => {
                      Swal.fire({ icon: 'error', title: 'Punch Out Failed', text: err.message || 'Error occurred during punch-out.' });
                    });
                  }}
                  disabled={locationState.loading || (!locationState.coords && !isTestMode)}
                  className="attendance-punch-action-btn punch-out"
                >
                  <LogOut size={18} /> Take Selfie &amp; Punch Out
                </button>
              )}
            </footer>
          </div>
        </div>,
        document.body
      )}

      {showAllNotificationsModal && typeof window !== 'undefined' && createPortal(
        <div
          onClick={() => setShowAllNotificationsModal(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 999999,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(6px)',
            display: 'grid', placeItems: 'center',
            padding: '16px',
            overflowY: 'auto'
          }}
        >
          <div
            className="punch-attendance-modal"
            style={{ maxWidth: '650px' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #24345C 100%)', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#ffffff', flexShrink: 0 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Bell size={20} color="var(--color-lime-brand, #dcf26b)" />
                  Himalaya ERP Notifications Portal
                </h3>
                <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>
                  Total: {totalCount} notifications ({unreadCount} unread)
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllAsRead()}
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      padding: '5px 12px',
                      borderRadius: '6px',
                      color: '#ffffff',
                      fontSize: '11px',
                      fontWeight: '800',
                      cursor: 'pointer',
                    }}
                  >
                    Mark all read
                  </button>
                )}
                <button 
                  onClick={() => setShowAllNotificationsModal(false)}
                  style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Filters */}
            <div style={{ display: 'flex', gap: '8px', padding: '16px 24px 8px 24px', borderBottom: '1px solid #e2e8f0', background: '#fafbfc' }}>
              {['All', 'Unread', 'Read'].map(filter => {
                const isActive = modalNotifFilter === filter;
                return (
                  <button
                    key={filter}
                    onClick={() => setModalNotifFilter(filter)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: '800',
                      border: isActive ? '1px solid #2F4375' : '1px solid #e2e8f0',
                      background: isActive ? '#2F4375' : '#ffffff',
                      color: isActive ? '#ffffff' : '#64748B',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {filter}
                  </button>
                );
              })}
            </div>

            {/* Modal Body */}
            <div className="punch-attendance-body" style={{ maxHeight: '450px', overflowY: 'auto' }}>
              {(() => {
                const filtered = notifications.filter(n => {
                  if (modalNotifFilter === 'Unread') return !n.isRead && !n.is_read;
                  if (modalNotifFilter === 'Read') return n.isRead || n.is_read;
                  return true;
                });

                if (filtered.length === 0) {
                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', gap: '8px', color: '#64748B' }}>
                      <BellOff size={32} color="#94a3b8" />
                      <span style={{ fontSize: '13px', fontWeight: '800' }}>No notifications found</span>
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>You are all caught up!</span>
                    </div>
                  );
                }

                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {filtered.map(n => {
                      const isUnread = !n.isRead && !n.is_read;
                      return (
                        <div
                          key={n.id}
                          onClick={() => {
                            if (isUnread) markAsRead(n.id);
                            if (n.route) {
                              setShowAllNotificationsModal(false);
                              navigate.push(n.route);
                            }
                          }}
                          style={{
                            background: isUnread ? '#eff6ff' : '#ffffff',
                            border: isUnread ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
                            borderRadius: '10px',
                            padding: '14px',
                            cursor: 'pointer',
                            display: 'flex',
                            gap: '12px',
                            alignItems: 'flex-start',
                            transition: 'all 0.15s ease',
                            position: 'relative',
                            textAlign: 'left',
                          }}
                        >
                          {/* Dot indicator */}
                          {isUnread && (
                            <div style={{
                              position: 'absolute', top: '14px', right: '14px',
                              width: '8px', height: '8px', borderRadius: '50%',
                              background: '#2563eb',
                            }} />
                          )}
                          <div style={{
                            background: isUnread ? '#dbeafe' : '#f1f5f9',
                            color: isUnread ? '#2563eb' : '#64748B',
                            borderRadius: '50%',
                            width: '32px', height: '32px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0,
                          }}>
                            <Bell size={16} />
                          </div>
                          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginRight: isUnread ? '16px' : '0' }}>
                              <span style={{ fontSize: '13px', fontWeight: '800', color: '#1e293b' }}>
                                {n.title || 'System Notification'}
                              </span>
                              <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '700' }}>
                                {n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                              </span>
                            </div>
                            <p style={{ margin: 0, fontSize: '12px', color: '#475569', lineHeight: '1.4' }}>
                              {n.message}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>,
        document.body
      )}

      <style>{`
        @keyframes notifPop {
          0% { transform: scale(0); opacity: 0; }
          60% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes dropdownSlideIn {
          0% { opacity: 0; transform: translateY(-8px) scale(0.97); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes punchModalIn {
          0% { opacity: 0; transform: scale(0.88) translateY(20px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }

        /* ── SweetAlert2 Modal Z-Index Boost ── */
        .swal2-container {
          z-index: 99999999 !important;
        }

        /* ── Attendance Selfie Punch — Desktop Layout ── */
        .attendance-punch-overlay {
          position: fixed;
          inset: 0;
          z-index: 999999;
          background: rgba(15, 23, 42, 0.65);
          backdrop-filter: blur(6px);
          display: grid;
          place-items: center;
          padding: 16px;
          overflow-y: auto;
        }

        .attendance-punch-modal {
          max-width: 500px;
          width: 100%;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          border-radius: 18px;
          background: #ffffff;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35);
          position: relative;
          z-index: 1000000;
          animation: punchModalIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          max-height: calc(100vh - 48px);
        }

        .attendance-punch-header {
          background: linear-gradient(135deg, #1e293b 0%, #24345C 100%);
          padding: 16px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: #ffffff;
          flex-shrink: 0;
          border-top-left-radius: inherit;
          border-top-right-radius: inherit;
        }

        .attendance-punch-header-content {
          min-width: 0;
          flex: 1;
        }

        .attendance-punch-title {
          margin: 0;
          font-size: 16px;
          font-weight: 800;
          display: flex;
          align-items: center;
          gap: 8px;
          color: #ffffff;
        }

        .attendance-punch-subtitle {
          margin: 2px 0 0 0;
          font-size: 11.5px;
          color: rgba(255, 255, 255, 0.75);
        }

        .attendance-punch-header-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }

        .attendance-punch-test-mode {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 10.5px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #ffffff;
          padding: 4px 8px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 800;
          user-select: none;
          transition: background 0.15s ease;
        }

        .attendance-punch-close {
          background: rgba(255, 255, 255, 0.12);
          border: none;
          border-radius: 50%;
          width: 30px;
          height: 30px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          transition: background 0.15s ease;
        }

        .attendance-punch-close:hover {
          background: rgba(255, 255, 255, 0.25);
        }

        .attendance-punch-body {
          padding: 20px 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          overflow-y: auto;
          flex: 1 1 auto;
          min-height: 0;
        }

        .attendance-punch-clock {
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          border-radius: 12px;
          padding: 12px 16px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3px;
          flex-shrink: 0;
        }

        .attendance-punch-clock-label {
          font-size: 10.5px;
          font-weight: 800;
          text-transform: uppercase;
          color: #64748B;
          letter-spacing: 0.5px;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .attendance-punch-clock-time {
          font-family: "Courier New", monospace;
          font-size: 24px;
          font-weight: 900;
          color: #0f172a;
          letter-spacing: 1px;
          line-height: 1.2;
        }

        .attendance-punch-clock-date {
          font-size: 11.5px;
          font-weight: 600;
          color: #475569;
        }

        .attendance-punch-location {
          background: #F0F9FF;
          border: 1.5px solid #0284c7;
          border-radius: 12px;
          padding: 12px 14px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          flex-shrink: 0;
        }

        .attendance-punch-location-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 6px;
        }

        .attendance-punch-location-title {
          font-size: 10.5px;
          font-weight: 800;
          text-transform: uppercase;
          color: #0369A1;
          letter-spacing: 0.5px;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .attendance-punch-location-badge {
          padding: 2px 7px;
          border-radius: 12px;
          background: #DBEAFE;
          color: #1E40AF;
          font-size: 10px;
          font-weight: 800;
        }

        .attendance-punch-location-address {
          font-size: 12px;
          font-weight: 700;
          color: #0F172A;
          display: flex;
          align-items: flex-start;
          gap: 6px;
          word-break: break-word;
          line-height: 1.35;
        }

        .attendance-punch-location-coordinates {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
          font-size: 10.5px;
        }

        .attendance-punch-location-coord-text {
          font-weight: 700;
          color: #0284c7;
          font-family: monospace;
        }

        .attendance-punch-location-accuracy-badge {
          font-size: 10px;
          font-weight: 700;
          color: #64748b;
          background: #e2e8f0;
          padding: 1px 5px;
          border-radius: 4px;
        }

        .attendance-punch-status {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 14px;
          border-radius: 10px;
          flex-wrap: wrap;
          gap: 8px;
          flex-shrink: 0;
        }

        .attendance-punch-status.punched-in {
          background: #F0FDF4;
          border: 1px solid #86EFAC;
        }

        .attendance-punch-status.not-punched-in {
          background: #FFFBEB;
          border: 1px solid #FCD34D;
        }

        .attendance-punch-user {
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          border-radius: 12px;
          padding: 10px 14px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          font-size: 11.5px;
          flex-shrink: 0;
        }

        .attendance-punch-camera {
          position: relative;
          width: 100%;
          min-height: 230px;
          height: 230px;
          background: #0f172a;
          border-radius: 14px;
          overflow: hidden;
          border: 2px solid #334155;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .attendance-punch-camera-placeholder {
          width: 100%;
          height: 100%;
          min-height: 230px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 24px 16px 40px;
          box-sizing: border-box;
          gap: 8px;
        }

        .attendance-punch-camera-icon {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .attendance-punch-camera-title {
          font-size: 14px;
          font-weight: 800;
          margin-top: 4px;
        }

        .attendance-punch-camera-message {
          font-size: 11.5px;
          color: #94a3b8;
          max-width: 320px;
          line-height: 1.4;
        }

        .attendance-punch-retry {
          margin-top: 6px;
          background: #0284c7;
          color: #ffffff;
          border: none;
          padding: 8px 18px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 800;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(2, 132, 199, 0.4);
          transition: background 0.15s ease;
        }

        .attendance-punch-retry:hover {
          background: #0369a1;
        }

        .attendance-punch-camera-badge {
          position: absolute;
          bottom: 10px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(4px);
          padding: 4px 12px;
          border-radius: 20px;
          color: #ffffff;
          font-size: 10.5px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
          z-index: 2;
        }

        .attendance-punch-error-container {
          display: flex;
          flex-direction: column;
          gap: 8px;
          width: 100%;
          flex-shrink: 0;
        }

        .attendance-punch-error {
          background: #FFF1F2;
          border: 1px solid #FDA4AF;
          border-radius: 10px;
          padding: 10px 12px;
          font-size: 11.5px;
          color: #9F1239;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 8px;
          line-height: 1.35;
        }

        .attendance-punch-footer {
          padding: 14px 24px 20px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          flex-shrink: 0;
          background: #ffffff;
          border-top: 1px solid #f1f5f9;
        }

        .attendance-punch-exception-button {
          padding: 12px 16px;
          background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
          color: #ffffff;
          border: none;
          border-radius: 10px;
          font-size: 13.5px;
          font-weight: 800;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 4px 12px rgba(2, 132, 199, 0.3);
          width: 100%;
          transition: transform 0.15s ease;
        }

        .attendance-punch-exception-button:hover {
          transform: translateY(-1px);
        }

        .attendance-punch-action-btn {
          padding: 14px;
          color: #ffffff;
          border: none;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          transition: transform 0.15s ease;
        }

        .attendance-punch-action-btn.punch-in {
          background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
          box-shadow: 0 4px 12px rgba(22, 163, 74, 0.3);
        }

        .attendance-punch-action-btn.punch-out {
          background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
          box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
        }

        .attendance-punch-action-btn:hover:not(:disabled) {
          transform: translateY(-1px);
        }

        .attendance-punch-action-btn:disabled {
          background: #cbd5e1 !important;
          color: #64748b !important;
          cursor: not-allowed !important;
          box-shadow: none !important;
        }

        /* Notifications Modal styling preservation */
        .punch-attendance-modal {
          max-width: 500px;
          width: 100%;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          border-radius: 18px;
          background: #ffffff;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35);
          position: relative;
          z-index: 1000000;
          animation: punchModalIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          max-height: calc(100vh - 48px);
        }

        .punch-attendance-body {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          overflow-y: auto;
          flex: 1;
        }

        /* =========================================================
           Attendance Selfie Punch - Dedicated Mobile Responsive Layout
           Desktop layout remains completely unchanged
           ========================================================= */

        @media (max-width: 640px) {
          .attendance-punch-overlay {
            padding: 0;
            align-items: flex-end;
            overflow: hidden;
          }

          .attendance-punch-modal {
            width: 100%;
            max-width: 100%;
            height: min(100dvh, 760px);
            max-height: 100dvh;
            border-radius: 18px 18px 0 0;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            margin: 0;
          }

          /* ---------- Header ---------- */

          .attendance-punch-header {
            flex: 0 0 auto;
            min-height: auto;
            padding: 14px 14px;
            display: flex;
            align-items: flex-start;
            gap: 8px;
            justify-content: space-between;
          }

          .attendance-punch-header-content {
            min-width: 0;
            flex: 1;
          }

          .attendance-punch-title {
            font-size: 16px;
            line-height: 1.2;
            white-space: normal;
          }

          .attendance-punch-subtitle {
            font-size: 11px;
            line-height: 1.35;
            margin-top: 4px;
          }

          .attendance-punch-header-actions {
            flex: 0 0 auto;
            display: flex;
            align-items: center;
            gap: 6px;
          }

          .attendance-punch-test-mode {
            padding: 6px 8px;
            font-size: 11px;
            white-space: nowrap;
          }

          .attendance-punch-close {
            width: 32px;
            height: 32px;
            flex: 0 0 32px;
          }

          /* ---------- Scrollable Body ---------- */

          .attendance-punch-body {
            flex: 1 1 auto;
            min-height: 0;
            overflow-y: auto;
            overflow-x: hidden;
            padding: 12px;
            -webkit-overflow-scrolling: touch;
            display: flex;
            flex-direction: column;
            gap: 10px;
          }

          .attendance-punch-body > * {
            width: 100%;
            max-width: 100%;
            min-width: 0;
            box-sizing: border-box;
            flex-shrink: 0;
          }

          /* ---------- Clock ---------- */

          .attendance-punch-clock {
            padding: 10px 8px;
            min-height: auto;
            border-radius: 12px;
          }

          .attendance-punch-clock-label {
            font-size: 10.5px;
          }

          .attendance-punch-clock-time {
            font-size: 21px;
            line-height: 1.2;
            letter-spacing: 0.5px;
          }

          .attendance-punch-clock-date {
            font-size: 10.5px;
            margin-top: 4px;
          }

          /* ---------- GPS ---------- */

          .attendance-punch-location {
            padding: 10px 11px;
            min-height: auto;
          }

          .attendance-punch-location-title {
            font-size: 10.5px;
            line-height: 1.3;
            flex-wrap: wrap;
          }

          .attendance-punch-location-address {
            font-size: 11px;
            line-height: 1.35;
            word-break: break-word;
          }

          .attendance-punch-location-coordinates {
            font-size: 9.5px;
            line-height: 1.35;
            white-space: normal;
            word-break: break-word;
          }

          /* ---------- Status ---------- */

          .attendance-punch-status {
            min-height: 38px;
            padding: 8px 11px;
            font-size: 11px;
          }

          /* ---------- Logged User ---------- */

          .attendance-punch-user {
            padding: 9px 11px;
            font-size: 11px;
            line-height: 1.35;
          }

          /* ---------- Camera ---------- */

          .attendance-punch-camera {
            min-height: 185px;
            height: 185px;
            border-radius: 12px;
            display: flex;
            flex-direction: column;
            justify-content: center;
          }

          .attendance-punch-camera-placeholder {
            min-height: 185px;
            padding: 14px 10px 28px;
            gap: 6px;
          }

          .attendance-punch-camera-icon {
            width: 34px;
            height: 34px;
          }

          .attendance-punch-camera-title {
            font-size: 13px;
            margin-top: 4px;
          }

          .attendance-punch-camera-message {
            max-width: 270px;
            font-size: 10px;
            line-height: 1.35;
            margin: 3px auto 6px;
          }

          .attendance-punch-retry {
            min-height: 34px;
            padding: 6px 14px;
            font-size: 11px;
          }

          .attendance-punch-camera-badge {
            font-size: 9px;
            padding: 3px 10px;
            bottom: 6px;
          }

          /* ---------- Error ---------- */

          .attendance-punch-error {
            padding: 8px 10px;
            font-size: 10px;
            line-height: 1.35;
            word-break: break-word;
          }

          /* ---------- Bottom Action ---------- */

          .attendance-punch-footer {
            flex: 0 0 auto;
            padding: 10px 12px 12px;
            background: #ffffff;
            border-top: 1px solid #e2e8f0;
          }

          .attendance-punch-exception-button {
            width: 100%;
            min-height: 44px;
            padding: 10px 12px;
            font-size: 12.5px;
            border-radius: 10px;
          }

          .attendance-punch-action-btn {
            width: 100%;
            min-height: 44px;
            padding: 10px 12px;
            font-size: 13px;
            border-radius: 10px;
          }

          .punch-attendance-modal {
            width: 100% !important;
            max-width: calc(100vw - 20px) !important;
            max-height: 92vh !important;
            border-radius: 14px !important;
            margin: auto;
          }

          .punch-attendance-body {
            padding: 12px !important;
            gap: 10px !important;
          }
        }

        /* ---------- Ultra-compact Mobile (<380px) ---------- */
        @media (max-width: 380px) {
          .attendance-punch-header {
            padding: 12px 10px;
          }

          .attendance-punch-title {
            font-size: 14.5px;
          }

          .attendance-punch-subtitle {
            font-size: 10px;
          }

          .attendance-punch-test-mode {
            padding: 5px 6px;
            font-size: 9.5px;
          }

          .attendance-punch-close {
            width: 28px;
            height: 28px;
            flex: 0 0 28px;
          }

          .attendance-punch-body {
            padding: 8px;
            gap: 8px;
          }

          .attendance-punch-camera {
            height: 170px;
            min-height: 170px;
          }

          .attendance-punch-footer {
            padding: 8px 10px 10px;
          }
        }
      `}</style>
    </header>
  );
}
