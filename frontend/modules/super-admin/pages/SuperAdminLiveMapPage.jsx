'use client';

import { loadGoogleMaps } from '../../../lib/loadGoogleMaps';
import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { io } from 'socket.io-client';
import { backendFetch } from '../../../lib/backendFetch';
import { useAuthStore } from '@/store/authStore';
import * as Lucide from 'lucide-react';

const getLocalDateString = (daysOffset = 0) => {
  const d = new Date();
  d.setDate(d.getDate() - daysOffset);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dateStr = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dateStr}`;
};

// ─── ROLE CATEGORIZATION & CONFIGURATION ──────────────────────────────────────
export const getCategoryForRole = (roleStr) => {
  const r = (roleStr || '').toUpperCase().replace(/[\s-]+/g, '_');
  
  if (r.includes('PLANT_HEAD') || r.includes('PLANTHEAD') || r.includes('FACTORY_HEAD') || r.includes('WORKS_MANAGER')) {
    return 'Plant Head';
  }
  if (r.includes('HR') || r.includes('HUMAN_RESOURCE') || r.includes('RECRUITMENT')) {
    return 'HR';
  }
  if (r.includes('SALES') || r.includes('FIELD_STAFF') || r.includes('BDM') || r.includes('MARKETING')) {
    return 'Sales';
  }
  if (r.includes('DISPATCH') || r.includes('DELIVERY') || r.includes('LOGISTICS') || r.includes('DRIVER')) {
    return 'Dispatch';
  }
  if (r.includes('PRODUCTION') || r.includes('PLANNER') || r.includes('OPERATOR') || r.includes('MANUFACTURING') || r.includes('SUPERVISOR')) {
    return 'Production';
  }
  if (r.includes('QC') || r.includes('QUALITY') || r.includes('INSPECTOR') || r.includes('QA')) {
    return 'QC';
  }
  if (r.includes('STORE') || r.includes('WAREHOUSE') || r.includes('INVENTORY')) {
    return 'Store';
  }
  if (r.includes('FINANCE') || r.includes('ACCOUNT') || r.includes('BILLING')) {
    return 'Finance';
  }
  if (r.includes('PURCHASE') || r.includes('PROCUREMENT') || r.includes('SOURCING')) {
    return 'Procurement';
  }
  if (r.includes('SUPER_ADMIN') || r.includes('ADMIN') || r.includes('DIRECTOR') || r.includes('MANAGEMENT') || r.includes('OWNER')) {
    return 'Admin';
  }
  return 'Other';
};

export const ROLE_CONFIG = {
  'Sales': {
    name: 'Sales Staff',
    shortName: 'Sales',
    color: '#2563EB', // Blue
    accentColor: '#1D4ED8',
    lightBg: '#EFF6FF',
    borderColor: '#93C5FD',
    textColor: '#1D4ED8',
    glowColor: 'rgba(37, 99, 235, 0.5)',
    iconType: 'bike',
    emoji: '🛵',
    description: 'Sales Executive, Manager & Field Staff (Bike Icon)',
  },
  'Plant Head': {
    name: 'Plant Head',
    shortName: 'Plant Head',
    color: '#10B981', // Emerald
    accentColor: '#047857',
    lightBg: '#ECFDF5',
    borderColor: '#6EE7B7',
    textColor: '#047857',
    glowColor: 'rgba(16, 185, 129, 0.5)',
    iconType: 'plant_head',
    emoji: '🏭',
    description: 'Plant Head & Factory Operations (Plant / Factory Icon)',
  },
  'HR': {
    name: 'HR Team',
    shortName: 'HR',
    color: '#EC4899', // Rose/Pink
    accentColor: '#BE185D',
    lightBg: '#FDF2F8',
    borderColor: '#F472B6',
    textColor: '#BE185D',
    glowColor: 'rgba(236, 72, 153, 0.5)',
    iconType: 'hr',
    emoji: '👥',
    description: 'HR Manager & Human Resources (People / Badge Icon)',
  },
  'Dispatch': {
    name: 'Dispatch & Delivery',
    shortName: 'Dispatch',
    color: '#8B5CF6', // Purple
    accentColor: '#6D28D9',
    lightBg: '#F5F3FF',
    borderColor: '#C4B5FD',
    textColor: '#6D28D9',
    glowColor: 'rgba(139, 92, 246, 0.5)',
    iconType: 'dispatch',
    emoji: '🚚',
    description: 'Dispatch Executives & Drivers (Truck Icon)',
  },
  'Production': {
    name: 'Production Team',
    shortName: 'Production',
    color: '#F59E0B', // Amber
    accentColor: '#B45309',
    lightBg: '#FFFBEB',
    borderColor: '#FCD34D',
    textColor: '#B45309',
    glowColor: 'rgba(245, 158, 11, 0.5)',
    iconType: 'production',
    emoji: '⚙️',
    description: 'Production Planner & Operators (Gears / Helmet Icon)',
  },
  'QC': {
    name: 'Quality Control',
    shortName: 'QC',
    color: '#E11D48', // Ruby Crimson
    accentColor: '#9F1239',
    lightBg: '#FFF1F2',
    borderColor: '#FDA4AF',
    textColor: '#BE123C',
    glowColor: 'rgba(225, 29, 72, 0.5)',
    iconType: 'qc',
    emoji: '🛡️',
    description: 'QC Inspector & Quality Assurance (Shield Check Icon)',
  },
  'Store': {
    name: 'Store & Warehouse',
    shortName: 'Store',
    color: '#F97316', // Orange
    accentColor: '#C2410C',
    lightBg: '#FFF7ED',
    borderColor: '#FDBA74',
    textColor: '#C2410C',
    glowColor: 'rgba(249, 115, 22, 0.5)',
    iconType: 'store',
    emoji: '📦',
    description: 'Store Manager & Warehouse (Package Box Icon)',
  },
  'Finance': {
    name: 'Finance & Accounts',
    shortName: 'Finance',
    color: '#0D9488', // Teal
    accentColor: '#0F766E',
    lightBg: '#F0FDFA',
    borderColor: '#99F6E4',
    textColor: '#0F766E',
    glowColor: 'rgba(13, 148, 136, 0.5)',
    iconType: 'finance',
    emoji: '💳',
    description: 'Finance & Accounting Staff (Ledger Icon)',
  },
  'Procurement': {
    name: 'Procurement',
    shortName: 'Purchase',
    color: '#6366F1', // Indigo
    accentColor: '#4338CA',
    lightBg: '#EEF2FF',
    borderColor: '#C7D2FE',
    textColor: '#4338CA',
    glowColor: 'rgba(99, 102, 241, 0.5)',
    iconType: 'procurement',
    emoji: '🛒',
    description: 'Purchase & Vendor Management (Cart Icon)',
  },
  'Admin': {
    name: 'Administration',
    shortName: 'Admin',
    color: '#0F172A', // Slate 900
    accentColor: '#0284C7',
    lightBg: '#F8FAFC',
    borderColor: '#CBD5E1',
    textColor: '#0F172A',
    glowColor: 'rgba(15, 23, 42, 0.5)',
    iconType: 'admin',
    emoji: '🏛️',
    description: 'Super Admin, Directors & Executives (Building / Star)',
  },
  'Other': {
    name: 'General Staff',
    shortName: 'Staff',
    color: '#64748B', // Slate
    accentColor: '#475569',
    lightBg: '#F8FAFC',
    borderColor: '#E2E8F0',
    textColor: '#475569',
    glowColor: 'rgba(100, 116, 139, 0.4)',
    iconType: 'other',
    emoji: '👤',
    description: 'Employees & Contractors (User Icon)',
  },
};

// ─── EXTRACT AUTHORITATIVE LIVE SESSION PER USER ─────────────────────────────
export const extractAuthoritativeSession = (user) => {
  if (!user || !user.sessions || user.sessions.length === 0) return null;
  const sessions = [...user.sessions];
  
  // Sort priority: ONLINE with GPS > ONLINE without GPS > RECENT with GPS > OFFLINE
  sessions.sort((a, b) => {
    const aOnline = a.status === 'ONLINE' ? 1 : 0;
    const bOnline = b.status === 'ONLINE' ? 1 : 0;
    if (aOnline !== bOnline) return bOnline - aOnline;

    const aHasGps = a.location?.latitude && a.location?.longitude ? 1 : 0;
    const bHasGps = b.location?.latitude && b.location?.longitude ? 1 : 0;
    if (aHasGps !== bHasGps) return bHasGps - aHasGps;

    const aTime = a.location?.capturedAt ? new Date(a.location.capturedAt).getTime() : 0;
    const bTime = b.location?.capturedAt ? new Date(b.location.capturedAt).getTime() : 0;
    return bTime - aTime;
  });

  return sessions[0];
};

// ─── HIGH-QUALITY SVG PIN MARKERS ─────────────────────────────────────────────
export const generatePinSvg = (category, isOnline = true, isHighlighted = false) => {
  const cfg = ROLE_CONFIG[category] || ROLE_CONFIG['Other'];
  const pinColor = cfg.color;
  const statusColor = isOnline ? '#10B981' : '#94A3B8';
  const strokeColor = isHighlighted ? '#F59E0B' : '#FFFFFF';
  const strokeWidth = isHighlighted ? '3' : '2';

  const iconPaths = {
    bike: '<path d="M13 18a2 2 0 1 0 4 0a2 2 0 1 0-4 0 M23 18a2 2 0 1 0 4 0a2 2 0 1 0-4 0 M15 18l3-6h4 M18 12l2 6 M17 9h3" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
    plant_head: '<path d="M12 21V9l4 4V9l4 4V9l4 4v8H12z" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
    hr: '<path d="M20 15a3 3 0 1 0 0-6a3 3 0 0 0 0 6z M14 21a6 6 0 0 1 12 0" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
    dispatch: '<rect x="11" y="11" width="11" height="8" rx="1" stroke="#FFFFFF" stroke-width="1.6" fill="none"/><path d="M22 14h4l2 3v2h-6v-5z" stroke="#FFFFFF" stroke-width="1.6" fill="none"/><circle cx="14" cy="20" r="1.5" fill="#FFFFFF"/><circle cx="25" cy="20" r="1.5" fill="#FFFFFF"/>',
    production: '<circle cx="20" cy="16" r="3" stroke="#FFFFFF" stroke-width="1.6" fill="none"/><path d="M20 10v2M20 20v2M14 16h2M24 16h2M15.5 11.5l1.5 1.5M23 19l1.5 1.5M15.5 20.5l1.5-1.5M23 13l1.5-1.5" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round"/>',
    qc: '<path d="M20 10l6 2.5v5c0 4-2.5 7-6 8.5c-3.5-1.5-6-4.5-6-8.5v-5l6-2.5z" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M18 17l1.5 1.5l3-3" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
    store: '<path d="M13 13l7-3l7 3v8l-7 3l-7-3v-8z M13 13l7 3l7-3 M20 16v8" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
    finance: '<rect x="12" y="11" width="16" height="11" rx="2" stroke="#FFFFFF" stroke-width="1.6" fill="none"/><line x1="12" y1="15" x2="28" y2="15" stroke="#FFFFFF" stroke-width="1.6"/><circle cx="16" cy="19" r="1" fill="#FFFFFF"/>',
    procurement: '<circle cx="16" cy="21" r="1.5" fill="#FFFFFF"/><circle cx="24" cy="21" r="1.5" fill="#FFFFFF"/><path d="M11 11h2.5l2 8h9l2-6H15" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
    admin: '<path d="M13 21V11l7-3l7 3v10 M17 21v-4h6v4 M16 14h1 M23 14h1" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
    other: '<circle cx="20" cy="14" r="3" stroke="#FFFFFF" stroke-width="1.6" fill="none"/><path d="M14 21c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round" fill="none"/>',
  };

  const chosenPath = iconPaths[cfg.iconType] || iconPaths.other;

  const pinSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="52" viewBox="0 0 40 52">
      <defs>
        <filter id="shadow" x="-20%" y="-10%" width="140%" height="130%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="rgba(0,0,0,0.35)"/>
        </filter>
      </defs>
      <path d="M20 2 C9 2 2 9 2 20 C2 31 16 48 20 50 C24 48 38 31 38 20 C38 9 31 2 20 2 Z"
            fill="${pinColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}" filter="url(#shadow)" />
      <circle cx="20" cy="17" r="12" fill="rgba(0,0,0,0.18)" />
      ${chosenPath}
      <circle cx="31" cy="9" r="4.5" fill="${statusColor}" stroke="#FFFFFF" stroke-width="1.8" />
    </svg>
  `;

  return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(pinSvg);
};

export const getStopPinSvg = (stopNumber) => {
  const pinSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="34" height="42" viewBox="0 0 34 42">
      <defs>
        <filter id="stopShadow" x="-20%" y="-10%" width="140%" height="130%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.3)"/>
        </filter>
      </defs>
      <path d="M17 1 C8 1 2 7 2 16 C2 26 14 39 17 41 C20 39 32 26 32 16 C32 7 26 1 17 1 Z"
            fill="#D97706" stroke="#FFFFFF" stroke-width="2" filter="url(#stopShadow)"/>
      <circle cx="17" cy="16" r="10" fill="#FFFFFF"/>
      <text x="17" y="20" font-size="11" font-weight="bold" fill="#92400E" text-anchor="middle" font-family="system-ui, sans-serif">${stopNumber}</text>
    </svg>
  `;
  return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(pinSvg);
};

export const getStartPinSvg = () => {
  const pinSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="46" viewBox="0 0 36 46">
      <defs>
        <filter id="startShadow" x="-20%" y="-10%" width="140%" height="130%">
          <feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-color="rgba(0,0,0,0.35)"/>
        </filter>
      </defs>
      <path d="M18 1 C8.5 1 2 7.5 2 17 C2 28 15 43 18 45 C21 43 34 28 34 17 C34 7.5 27.5 1 18 1 Z"
            fill="#16A34A" stroke="#FFFFFF" stroke-width="2" filter="url(#startShadow)"/>
      <circle cx="18" cy="17" r="10" fill="#FFFFFF"/>
      <text x="18" y="21" font-size="12" font-weight="bold" fill="#15803D" text-anchor="middle" font-family="system-ui, sans-serif">S</text>
    </svg>
  `;
  return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(pinSvg);
};

export const getEndPinSvg = () => {
  const pinSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="46" viewBox="0 0 36 46">
      <defs>
        <filter id="endShadow" x="-20%" y="-10%" width="140%" height="130%">
          <feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-color="rgba(0,0,0,0.35)"/>
        </filter>
      </defs>
      <path d="M18 1 C8.5 1 2 7.5 2 17 C2 28 15 43 18 45 C21 43 34 28 34 17 C34 7.5 27.5 1 18 1 Z"
            fill="#DC2626" stroke="#FFFFFF" stroke-width="2" filter="url(#endShadow)"/>
      <circle cx="18" cy="17" r="10" fill="#FFFFFF"/>
      <text x="18" y="21" font-size="12" font-weight="bold" fill="#991B1B" text-anchor="middle" font-family="system-ui, sans-serif">E</text>
    </svg>
  `;
  return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(pinSvg);
};

export default function SuperAdminLiveMapPage() {
  const { accessToken } = useAuthStore();

  // ─── 4 MAIN OPERATIONAL MODES ─────────────────────────────────────────────
  // 'LIVE_NOW': Active punch-in shift telemetry from /location/routes/live
  // 'TODAY': All sessions from today (active + completed) from /location/routes/sessions
  // 'HISTORY': Historical shift route viewer with timeline playback & stops
  // 'DEVICE_SESSIONS': Device presence & browser logins
  const [mode, setMode] = useState('LIVE_NOW');

  // Common UI & Connection States
  const [loading, setLoading] = useState(true);
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [mapsError, setMapsError] = useState(null);
  const [liveStatus, setLiveStatus] = useState('OFFLINE'); // 'LIVE' | 'RECONNECTING' | 'OFFLINE'
  const [lastRestSync, setLastRestSync] = useState(null);
  const [lastSocketEvent, setLastSocketEvent] = useState(null);
  const [showTraffic, setShowTraffic] = useState(false);
  const [showDrawer, setShowDrawer] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // 1. Live Shift Routes State (/location/routes/live)
  const [liveRoutes, setLiveRoutes] = useState([]);
  const [selectedLiveSessionId, setSelectedLiveSessionId] = useState(null);

  // 2. Today Sessions State (/location/routes/sessions?date=...)
  const [todaySessions, setTodaySessions] = useState([]);
  const [selectedTodaySessionId, setSelectedTodaySessionId] = useState(null);

  // 3. History Shift Route State (/location/routes/history)
  const [allEmployees, setAllEmployees] = useState([]);
  const [selectedHistoryEmployeeId, setSelectedHistoryEmployeeId] = useState('');
  const [historyDate, setHistoryDate] = useState(() => getLocalDateString());
  const [historyData, setHistoryData] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState(null);
  const [playbackIndex, setPlaybackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  // 4. Device Presence Sessions State (Legacy / Web sessions)
  const [usersData, setUsersData] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('All');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Google Maps Refs
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({}); // id -> LIVE Marker
  const liveStartMarkersRef = useRef({}); // sessionId -> Start Marker (S at Punch In)
  const stopMarkersRef = useRef([]); // Stop Markers
  const activePolylineRef = useRef(null); // Route Polyline
  const startMarkerRef = useRef(null);
  const endMarkerRef = useRef(null);
  const playbackMarkerRef = useRef(null);
  const accuracyCircleRef = useRef(null);
  const trafficLayerRef = useRef(null);
  const infoWindowRef = useRef(null);
  const socketRef = useRef(null);
  const geocodeCacheRef = useRef({});

  const apiKey =
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
    'AIzaSyC2ISdvD-9mXT5RevQEyHfTio1Mtb6cZpg';

  // Responsive mobile drawer
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleResize = () => {
        const mobile = window.innerWidth < 768;
        setIsMobile(mobile);
        if (mobile) setShowDrawer(false);
      };
      handleResize();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  // ── Accuracy Circle Indicator ──────────────────────────────────────────────
  const showAccuracyCircle = (lat, lng, accuracy, color = '#2563EB') => {
    if (!mapInstanceRef.current || !window.google?.maps) return;
    if (accuracyCircleRef.current) {
      accuracyCircleRef.current.setMap(null);
      accuracyCircleRef.current = null;
    }
    if (!accuracy || accuracy > 10000) return;

    accuracyCircleRef.current = new window.google.maps.Circle({
      strokeColor: color,
      strokeOpacity: 0.7,
      strokeWeight: 1.5,
      fillColor: color,
      fillOpacity: 0.15,
      map: mapInstanceRef.current,
      center: { lat, lng },
      radius: Math.max(accuracy, 12),
      clickable: false,
    });
  };

  const clearAccuracyCircle = () => {
    if (accuracyCircleRef.current) {
      accuracyCircleRef.current.setMap(null);
      accuracyCircleRef.current = null;
    }
  };

  // Clear all overlays (routes, pins, stops, playback)
  const clearAllOverlays = useCallback(() => {
    if (activePolylineRef.current) {
      activePolylineRef.current.setMap(null);
      activePolylineRef.current = null;
    }
    if (startMarkerRef.current) {
      startMarkerRef.current.setMap(null);
      startMarkerRef.current = null;
    }
    if (endMarkerRef.current) {
      endMarkerRef.current.setMap(null);
      endMarkerRef.current = null;
    }
    if (playbackMarkerRef.current) {
      playbackMarkerRef.current.setMap(null);
      playbackMarkerRef.current = null;
    }
    if (stopMarkersRef.current && stopMarkersRef.current.length > 0) {
      stopMarkersRef.current.forEach((m) => m.setMap(null));
      stopMarkersRef.current = [];
    }
    clearAccuracyCircle();
    setIsPlaying(false);
    setPlaybackIndex(0);
  }, []);

  // Clear live markers dictionary
  const clearLiveMarkers = useCallback(() => {
    Object.values(markersRef.current).forEach((m) => m.setMap(null));
    markersRef.current = {};
    Object.values(liveStartMarkersRef.current).forEach((m) => m.setMap(null));
    liveStartMarkersRef.current = {};
  }, []);

  // ─── 1. FETCH LIVE SHIFT ROUTES (/location/routes/live) ──────────────────────
  const fetchLiveRoutes = useCallback(async () => {
    try {
      const raw = await backendFetch('/location/routes/live');
      const data = Array.isArray(raw) ? raw : (raw?.data || []);
      setLiveRoutes(data);
      setLastRestSync(new Date().toLocaleTimeString());
      return data;
    } catch (err) {
      console.warn('[LiveMap] Error fetching live shift routes:', err?.message || err);
      return [];
    }
  }, []);

  // ─── 2. FETCH TODAY'S SESSIONS (/location/routes/sessions) ───────────────────
  const fetchTodaySessions = useCallback(async () => {
    try {
      const todayStr = getLocalDateString(0);
      const raw = await backendFetch(`/location/routes/sessions?date=${todayStr}`);
      const data = Array.isArray(raw) ? raw : (raw?.data || []);
      setTodaySessions(data);
      return data;
    } catch (err) {
      console.warn('[LiveMap] Error fetching today sessions:', err?.message || err);
      return [];
    }
  }, []);

  // ─── 3. FETCH ALL EMPLOYEES FOR DROPDOWN (/employees) ───────────────────────
  const fetchEmployeesList = useCallback(async () => {
    try {
      const raw = await backendFetch('/employees');
      const list = Array.isArray(raw) ? raw : (raw?.data || []);
      setAllEmployees(list);
    } catch (err) {
      console.warn('[LiveMap] Error fetching employees list:', err?.message || err);
    }
  }, []);

  // ─── 4. FETCH LEGACY DEVICE PRESENCE (/super-admin/live-users) ──────────────
  const fetchDeviceUsersSnapshot = useCallback(async () => {
    try {
      let raw = await backendFetch('/super-admin/live-users');
      let data = Array.isArray(raw) ? raw : (raw?.data || []);
      if (!data || data.length === 0) {
        raw = await backendFetch('/location/live-users');
        data = Array.isArray(raw) ? raw : (raw?.data || []);
      }
      const rawUsers = Array.isArray(data) ? data : [];
      const normalizedUsers = rawUsers.map((u) => {
        const uId = u.userId || u.id;
        return {
          ...u,
          userId: uId,
          sessions: (u.sessions || []).map((s) => ({
            ...s,
            userId: s.userId || uId,
            userName: u.name,
            userRole: u.role,
          })),
        };
      });
      setUsersData(normalizedUsers);
      return normalizedUsers;
    } catch (err) {
      console.warn('[LiveMap] Error fetching device users snapshot:', err?.message || err);
      return [];
    }
  }, []);

  // Master Initial Load
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    await Promise.allSettled([
      fetchLiveRoutes(),
      fetchTodaySessions(),
      fetchEmployeesList(),
      fetchDeviceUsersSnapshot(),
    ]);
    setLoading(false);
  }, [fetchLiveRoutes, fetchTodaySessions, fetchEmployeesList, fetchDeviceUsersSnapshot]);

  // Periodic background refresh (5s)
  useEffect(() => {
    fetchAllData();
    const interval = setInterval(() => {
      if (mode === 'LIVE_NOW') fetchLiveRoutes();
      else if (mode === 'TODAY') fetchTodaySessions();
      else if (mode === 'DEVICE_SESSIONS') fetchDeviceUsersSnapshot();
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchAllData, mode, fetchLiveRoutes, fetchTodaySessions, fetchDeviceUsersSnapshot]);

  // ─── 5. GOOGLE MAPS LOADER & INITIALIZATION ─────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    loadGoogleMaps(apiKey)
      .then(() => {
        if (!cancelled) {
          setMapsError(null);
          setMapsLoaded(true);
        }
      })
      .catch((error) => {
        if (!cancelled) setMapsError(error.message);
      });
    return () => {
      cancelled = true;
    };
  }, [apiKey]);

  useEffect(() => {
    if (!mapsLoaded || !mapContainerRef.current || mapInstanceRef.current) return;

    try {
      const mapOptions = {
        center: { lat: 23.0225, lng: 72.5714 }, // Ahmedabad / Gujarat Center
        zoom: 12,
        styles: [
          { elementType: 'geometry', stylers: [{ color: '#f8fafc' }] },
          { elementType: 'labels.text.stroke', stylers: [{ color: '#ffffff' }] },
          { elementType: 'labels.text.fill', stylers: [{ color: '#334155' }] },
          { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
          { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#e2e8f0' }] },
          { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#bae6fd' }] },
          { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#dcfce7' }] },
        ],
        mapTypeControl: true,
        mapTypeControlOptions: {
          style: window.google.maps.MapTypeControlStyle.DROPDOWN_MENU,
          position: window.google.maps.ControlPosition.TOP_RIGHT,
        },
        fullscreenControl: true,
        streetViewControl: false,
        zoomControl: true,
      };

      const map = new window.google.maps.Map(mapContainerRef.current, mapOptions);
      mapInstanceRef.current = map;
      infoWindowRef.current = new window.google.maps.InfoWindow();
    } catch (err) {
      console.error('Failed to initialize Google Maps:', err);
      setMapsError('Failed to initialize Google Maps instance.');
    }
  }, [mapsLoaded]);

  // ─── 6. SOCKET.IO REALTIME BROADCAST LISTENER ───────────────────────────────
  useEffect(() => {
    if (!accessToken) return;
    const cleanToken = (accessToken || '').replace(/^Bearer\s+/i, '').trim();

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
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setLiveStatus('LIVE');
      setLastSocketEvent({ name: 'connect', time: new Date().toLocaleTimeString() });
      fetchAllData();
    });

    socket.on('connect_error', (err) => {
      setLiveStatus('RECONNECTING');
    });

    socket.on('disconnect', () => {
      setLiveStatus('OFFLINE');
      setLastSocketEvent({ name: 'disconnect', time: new Date().toLocaleTimeString() });
    });

    // Real-time telemetry broadcast from LocationTrackingService
    socket.on('employee:route:update', (data) => {
      setLastSocketEvent({ name: 'employee:route:update', time: new Date().toLocaleTimeString() });

      setLiveRoutes((prev) => {
        return prev.map((s) => {
          if (s.employeeId !== data.employeeId && s.sessionId !== data.sessionId) return s;
          const newPoint = {
            id: `rt-${Date.now()}`,
            latitude: Number(data.latitude),
            longitude: Number(data.longitude),
            accuracy: data.accuracy,
            speed: data.speed,
            heading: data.heading,
            batteryLevel: data.batteryLevel,
            recordedAt: data.recordedAt,
            serverReceivedAt: data.serverReceivedAt || new Date().toISOString(),
          };
          const updatedPoints = [...(s.routePoints || []), newPoint];

          // If this session is currently active and selected, update polyline immediately
          if (selectedLiveSessionId === s.sessionId && mapInstanceRef.current && window.google?.maps) {
            if (activePolylineRef.current) {
              const polyPath = activePolylineRef.current.getPath();
              polyPath.push(new window.google.maps.LatLng(newPoint.latitude, newPoint.longitude));
            }
            showAccuracyCircle(newPoint.latitude, newPoint.longitude, newPoint.accuracy || 15, '#2563EB');
          }

          return {
            ...s,
            latestLocation: newPoint,
            currentLocation: newPoint,
            hasGpsFix: true,
            routePoints: updatedPoints,
            totalDistanceKm: data.totalDistanceKm != null ? data.totalDistanceKm : s.totalDistanceKm,
            totalPointsCount: data.totalPointsCount != null ? data.totalPointsCount : (s.totalPointsCount || 0) + 1,
            status: data.status || 'LIVE',
            minutesSinceLastGps: 0,
          };
        });
      });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [accessToken, fetchAllData, selectedLiveSessionId]);

  // ─── 7. DRAW LIVE ROUTE POLYLINE & STOP PINS ───────────────────────────────
  const drawLiveRouteOnMap = useCallback((session) => {
    if (!mapsLoaded || !mapInstanceRef.current || !window.google?.maps || !session) return;

    clearAllOverlays();

    const points = session.routePoints || [];
    const cat = getCategoryForRole(session.role);
    const cfg = ROLE_CONFIG[cat] || ROLE_CONFIG['Other'];

    // Construct continuous path: starts from Punch In (S) coordinates, connects through all accepted points
    const path = [];
    const punchLat = session.punchInCoordinates?.latitude || session.punchIn?.latitude;
    const punchLng = session.punchInCoordinates?.longitude || session.punchIn?.longitude;
    if (punchLat && punchLng) {
      path.push(new window.google.maps.LatLng(punchLat, punchLng));
    }
    points.forEach((p) => {
      if (p.latitude && p.longitude) {
        path.push(new window.google.maps.LatLng(p.latitude, p.longitude));
      }
    });

    if (path.length === 0) return;

    if (path.length === 1) {
      mapInstanceRef.current.panTo(path[0]);
      mapInstanceRef.current.setZoom(16);
      return;
    }

    // Path has 2 or more coordinates (e.g. S -> GPS 1 -> GPS 2 -> ... -> Latest)
    const polyline = new window.google.maps.Polyline({
      path,
      geodesic: true,
      strokeColor: '#0284C7',
      strokeOpacity: 0.9,
      strokeWeight: 5,
      map: mapInstanceRef.current,
    });
    activePolylineRef.current = polyline;

    // Render Stop Pins
    if (session.stops && session.stops.length > 0) {
      session.stops.forEach((st) => {
        const stopMarker = new window.google.maps.Marker({
          position: new window.google.maps.LatLng(st.latitude, st.longitude),
          map: mapInstanceRef.current,
          title: `Stop #${st.stopNumber} (${st.durationMinutes} min)`,
          icon: {
            url: getStopPinSvg(st.stopNumber),
            scaledSize: new window.google.maps.Size(30, 36),
            anchor: new window.google.maps.Point(15, 36),
          },
        });

        stopMarker.addListener('click', () => {
          if (!infoWindowRef.current) return;
          const html = `
            <div style="font-family: system-ui, sans-serif; padding: 6px; min-width: 180px;">
              <div style="font-weight: 700; color: #B45309; font-size: 13px; margin-bottom: 4px;">
                🛑 Stop #${st.stopNumber} (${st.durationMinutes} mins)
              </div>
              <div style="font-size: 11px; color: #475569; margin-bottom: 4px;">
                <strong>Arrived:</strong> ${new Date(st.arrivedAt).toLocaleTimeString()}<br/>
                <strong>Departed:</strong> ${new Date(st.departedAt).toLocaleTimeString()}
              </div>
              <div style="font-size: 11px; color: #64748B;">
                ${st.address || st.locationName || 'Field stationary stop'}
              </div>
            </div>
          `;
          infoWindowRef.current.setContent(html);
          infoWindowRef.current.open(mapInstanceRef.current, stopMarker);
        });

        stopMarkersRef.current.push(stopMarker);
      });
    }

    // Fit bounds to polyline
    const bounds = new window.google.maps.LatLngBounds();
    path.forEach((p) => bounds.extend(p));
    mapInstanceRef.current.fitBounds(bounds, { top: 60, bottom: 60, left: 60, right: 60 });

    const latest = session.latestLocation || (points.length > 0 ? points[points.length - 1] : null);
    if (latest?.latitude && latest?.longitude) {
      showAccuracyCircle(latest.latitude, latest.longitude, latest.accuracy || 15, cfg.color);
    }
  }, [mapsLoaded, clearAllOverlays]);

  // ─── 8. DRAW HISTORICAL SHIFT ROUTE & STOPS ─────────────────────────────────
  const drawHistoryRoute = useCallback((points, stops, session) => {
    if (!mapsLoaded || !mapInstanceRef.current || !window.google?.maps) return;

    clearAllOverlays();

    const path = [];
    const punchInLat = session?.punchInCoordinates?.latitude || session?.punchIn?.latitude;
    const punchInLng = session?.punchInCoordinates?.longitude || session?.punchIn?.longitude;
    if (punchInLat && punchInLng) {
      path.push(new window.google.maps.LatLng(punchInLat, punchInLng));
    }
    (points || []).forEach((p) => {
      if (p.latitude && p.longitude) {
        path.push(new window.google.maps.LatLng(p.latitude, p.longitude));
      }
    });
    const punchOutLat = session?.punchOutCoordinates?.latitude || session?.punchOut?.latitude;
    const punchOutLng = session?.punchOutCoordinates?.longitude || session?.punchOut?.longitude;
    if (punchOutLat && punchOutLng && session?.status === 'COMPLETED') {
      path.push(new window.google.maps.LatLng(punchOutLat, punchOutLng));
    }

    if (path.length === 0) return;

    if (path.length >= 2) {
      const polyline = new window.google.maps.Polyline({
        path,
        geodesic: true,
        strokeColor: '#0284C7',
        strokeOpacity: 0.85,
        strokeWeight: 5,
        map: mapInstanceRef.current,
      });
      activePolylineRef.current = polyline;
    }

    const bounds = new window.google.maps.LatLngBounds();
    path.forEach((p) => bounds.extend(p));
    mapInstanceRef.current.fitBounds(bounds, { top: 60, bottom: 60, left: 60, right: 60 });

    // 1. START Marker (Punch In)
    const startLat = punchInLat || (points && points[0] ? points[0].latitude : null);
    const startLng = punchInLng || (points && points[0] ? points[0].longitude : null);
    if (startLat && startLng) {
      const startMarker = new window.google.maps.Marker({
        position: new window.google.maps.LatLng(startLat, startLng),
        map: mapInstanceRef.current,
        title: 'Shift Punch In (Start)',
        icon: {
          url: getStartPinSvg(),
          scaledSize: new window.google.maps.Size(34, 42),
          anchor: new window.google.maps.Point(17, 42),
        },
      });
      startMarker.addListener('click', () => {
        if (!infoWindowRef.current) return;
        infoWindowRef.current.setContent(`
          <div style="font-family: system-ui, sans-serif; padding: 6px;">
            <div style="font-weight: 700; color: #16A34A; font-size: 13px;">🟢 Shift Punch In (START)</div>
            <div style="font-size: 11.5px; color: #475569; margin-top: 3px;">
              <strong>Time:</strong> ${new Date(session?.punchInAt || (points[0] ? points[0].recordedAt : Date.now())).toLocaleTimeString()}<br/>
              ${session?.punchInAddress ? `<strong>Address:</strong> ${session.punchInAddress}` : ''}
            </div>
          </div>
        `);
        infoWindowRef.current.open(mapInstanceRef.current, startMarker);
      });
      startMarkerRef.current = startMarker;
    }

    // 2. STOP Markers
    if (stops && stops.length > 0) {
      stops.forEach((st) => {
        const stopMarker = new window.google.maps.Marker({
          position: new window.google.maps.LatLng(st.latitude, st.longitude),
          map: mapInstanceRef.current,
          title: `Stop #${st.stopNumber} (${st.durationMinutes} mins)`,
          icon: {
            url: getStopPinSvg(st.stopNumber),
            scaledSize: new window.google.maps.Size(30, 36),
            anchor: new window.google.maps.Point(15, 36),
          },
        });
        stopMarker.addListener('click', () => {
          if (!infoWindowRef.current) return;
          infoWindowRef.current.setContent(`
            <div style="font-family: system-ui, sans-serif; padding: 6px; min-width: 180px;">
              <div style="font-weight: 700; color: #B45309; font-size: 13px; margin-bottom: 4px;">
                🛑 Stop #${st.stopNumber} (${st.durationMinutes} mins)
              </div>
              <div style="font-size: 11px; color: #475569; margin-bottom: 4px;">
                <strong>Arrived:</strong> ${new Date(st.arrivedAt).toLocaleTimeString()}<br/>
                <strong>Departed:</strong> ${new Date(st.departedAt).toLocaleTimeString()}
              </div>
              <div style="font-size: 11px; color: #64748B;">
                ${st.address || st.locationName || 'Stationary stop'}
              </div>
            </div>
          `);
          infoWindowRef.current.open(mapInstanceRef.current, stopMarker);
        });
        stopMarkersRef.current.push(stopMarker);
      });
    }

    // 3. END Marker (Punch Out)
    const endLat = punchOutLat || (points && points.length > 0 ? points[points.length - 1].latitude : startLat);
    const endLng = punchOutLng || (points && points.length > 0 ? points[points.length - 1].longitude : startLng);
    if (endLat && endLng) {
      const isCompleted = session?.status === 'COMPLETED';
      const endMarker = new window.google.maps.Marker({
        position: new window.google.maps.LatLng(endLat, endLng),
        map: mapInstanceRef.current,
        title: isCompleted ? 'Shift Punch Out (End)' : 'Current Position',
        icon: {
          url: isCompleted ? getEndPinSvg() : getStartPinSvg(),
          scaledSize: new window.google.maps.Size(34, 42),
          anchor: new window.google.maps.Point(17, 42),
        },
      });
      endMarker.addListener('click', () => {
        if (!infoWindowRef.current) return;
        const endTime = session?.punchOutAt ? new Date(session.punchOutAt).toLocaleTimeString() : (points && points.length > 0 ? new Date(points[points.length - 1].recordedAt).toLocaleTimeString() : 'Recorded');
        infoWindowRef.current.setContent(`
          <div style="font-family: system-ui, sans-serif; padding: 6px;">
            <div style="font-weight: 700; color: ${isCompleted ? '#DC2626' : '#2563EB'}; font-size: 13px;">
              ${isCompleted ? '🔴 Shift Punch Out (END)' : '📍 Current Shift Position'}
            </div>
            <div style="font-size: 11.5px; color: #475569; margin-top: 3px;">
              <strong>Time:</strong> ${endTime}<br/>
              ${session?.punchOutAddress ? `<strong>Address:</strong> ${session.punchOutAddress}` : ''}
            </div>
          </div>
        `);
        infoWindowRef.current.open(mapInstanceRef.current, endMarker);
      });
      endMarkerRef.current = endMarker;
    }
  }, [mapsLoaded, clearAllOverlays]);

  // Load History for an employee and date
  const loadHistoryRoute = async (empId, dateStr) => {
    if (!empId || !dateStr) return;
    setHistoryLoading(true);
    setHistoryError(null);
    setHistoryData(null);
    clearAllOverlays();

    try {
      const raw = await backendFetch(`/location/routes/history?employeeId=${empId}&date=${dateStr}`);
      const data = raw?.data || raw;

      if (!data || !data.points || data.points.length === 0) {
        setHistoryError('No GPS route telemetry recorded for this employee shift.');
        setHistoryData(null);
        return;
      }

      setHistoryData(data);
      drawHistoryRoute(data.points, data.stops, data.session);
    } catch (err) {
      console.error('Error fetching historical route:', err);
      setHistoryError(err?.message || 'Failed to load historical route.');
    } finally {
      setHistoryLoading(false);
    }
  };

  // ─── 9. ANIMATED TIMELINE PLAYBACK CONTROLLER ──────────────────────────────
  const updatePlaybackMarker = useCallback((pt) => {
    if (!mapsLoaded || !mapInstanceRef.current || !window.google?.maps || !pt) return;

    const latLng = new window.google.maps.LatLng(pt.latitude, pt.longitude);

    if (!playbackMarkerRef.current) {
      playbackMarkerRef.current = new window.google.maps.Marker({
        position: latLng,
        map: mapInstanceRef.current,
        zIndex: 9999,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 9,
          fillColor: '#2563EB',
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 3,
        },
      });
    } else {
      playbackMarkerRef.current.setPosition(latLng);
    }

    showAccuracyCircle(pt.latitude, pt.longitude, pt.accuracy || 15, '#2563EB');
  }, [mapsLoaded]);

  // Playback timer ticker
  useEffect(() => {
    if (!isPlaying || !historyData?.points || historyData.points.length === 0) return;

    const delayMs = Math.max(100, Math.floor(1000 / playbackSpeed));
    const timer = setTimeout(() => {
      setPlaybackIndex((prev) => {
        const next = prev + 1;
        if (next >= historyData.points.length) {
          setIsPlaying(false);
          return prev;
        }
        updatePlaybackMarker(historyData.points[next]);
        return next;
      });
    }, delayMs);

    return () => clearTimeout(timer);
  }, [isPlaying, playbackIndex, playbackSpeed, historyData, updatePlaybackMarker]);

  // ─── 10. MAP MARKERS SYNC FOR LIVE_NOW & DEVICE_SESSIONS ────────────────────
  useEffect(() => {
    if (!mapsLoaded || !mapInstanceRef.current || !window.google?.maps) return;

    // Clear live pins when entering history mode
    if (mode === 'HISTORY') {
      clearLiveMarkers();
      return;
    }

    if (mode === 'LIVE_NOW') {
      const activeIds = new Set();

      liveRoutes.forEach((shift) => {
        const sId = shift.sessionId;
        activeIds.add(sId);

        const cat = getCategoryForRole(shift.role);
        const cfg = ROLE_CONFIG[cat] || ROLE_CONFIG['Other'];
        const isSelected = selectedLiveSessionId === sId;
        const isOnline = shift.status === 'LIVE';

        // ── 1. RENDER FIXED PUNCH-IN START MARKER ("S") ────────────────────────
        // Authoritative Attendance Punch-In location is the permanent START reference
        const punchLat = shift.punchInCoordinates?.latitude || shift.punchIn?.latitude;
        const punchLng = shift.punchInCoordinates?.longitude || shift.punchIn?.longitude;
        if (punchLat && punchLng) {
          const punchLatLng = new window.google.maps.LatLng(punchLat, punchLng);
          let startMarker = liveStartMarkersRef.current[sId];
          if (!startMarker) {
            startMarker = new window.google.maps.Marker({
              position: punchLatLng,
              map: mapInstanceRef.current,
              title: `Punch In (Shift Start): ${shift.employeeName} (${new Date(shift.punchInAt).toLocaleTimeString()})`,
              icon: {
                url: getStartPinSvg(),
                scaledSize: new window.google.maps.Size(32, 38),
                anchor: new window.google.maps.Point(16, 38),
              },
              zIndex: 90,
            });
            startMarker.addListener('click', () => {
              setSelectedLiveSessionId(sId);
              drawLiveRouteOnMap(shift);
              if (infoWindowRef.current) {
                infoWindowRef.current.setContent(`
                  <div style="font-family: system-ui, sans-serif; padding: 6px;">
                    <div style="font-weight: 700; color: #16A34A; font-size: 13px;">🟢 Shift Punch In (START)</div>
                    <div style="font-size: 11.5px; color: #475569; margin-top: 3px;">
                      <strong>Employee:</strong> ${shift.employeeName} (${shift.role})<br/>
                      <strong>Punch In:</strong> ${new Date(shift.punchInAt).toLocaleTimeString()}<br/>
                      ${shift.punchInAddress ? `<strong>Address:</strong> ${shift.punchInAddress}<br/>` : ''}
                      <strong>Tracking:</strong> ${shift.latestLocation ? '📱 Native background tracking ACTIVE' : '⚠️ Awaiting mobile GPS telemetry'}
                    </div>
                  </div>
                `);
                infoWindowRef.current.open(mapInstanceRef.current, startMarker);
              }
            });
            liveStartMarkersRef.current[sId] = startMarker;
          } else {
            startMarker.setPosition(punchLatLng);
          }
        }

        // ── 2. RENDER LIVE EMPLOYEE MARKER (🟢) ─────────────────────────────────
        // MANDATORY RULE: Marker MUST use latest accepted EmployeeLocationPoint (NOT Punch-In)
        // If employee has no accepted GPS points yet, DO NOT render live marker!
        const liveLocation = shift.latestLocation || (shift.hasGpsFix ? shift.currentLocation : null);
        const liveLat = liveLocation?.latitude;
        const liveLng = liveLocation?.longitude;

        if (liveLat != null && liveLng != null) {
          const latLng = new window.google.maps.LatLng(liveLat, liveLng);
          const iconUrl = generatePinSvg(cat, isOnline, isSelected);

          let marker = markersRef.current[sId];
          if (!marker) {
            marker = new window.google.maps.Marker({
              position: latLng,
              map: mapInstanceRef.current,
              title: `${shift.employeeName} - LIVE LOCATION (${shift.role})`,
              icon: {
                url: iconUrl,
                scaledSize: new window.google.maps.Size(40, 52),
                anchor: new window.google.maps.Point(20, 50),
              },
              zIndex: isSelected ? 999 : 100,
            });

            marker.addListener('click', () => {
              setSelectedLiveSessionId(sId);
              drawLiveRouteOnMap(shift);
              if (infoWindowRef.current) {
                const recordedTime = liveLocation.recordedAt ? new Date(liveLocation.recordedAt).toLocaleTimeString() : 'Recent';
                infoWindowRef.current.setContent(`
                  <div style="font-family: system-ui, sans-serif; padding: 6px;">
                    <div style="font-weight: 700; color: ${cfg.color}; font-size: 13px;">🟢 ${shift.employeeName} (LIVE)</div>
                    <div style="font-size: 11.5px; color: #475569; margin-top: 3px;">
                      <strong>Role:</strong> ${shift.role} (${cat})<br/>
                      <strong>Recorded:</strong> ${recordedTime}<br/>
                      <strong>Speed:</strong> ${liveLocation.speed != null ? `${Math.round(liveLocation.speed)} km/h` : '0 km/h'}<br/>
                      <strong>Accuracy:</strong> ±${Math.round(liveLocation.accuracy || 10)}m<br/>
                      <strong>Shift Distance:</strong> ${shift.totalDistanceKm || 0} km
                    </div>
                  </div>
                `);
                infoWindowRef.current.open(mapInstanceRef.current, marker);
              }
            });

            markersRef.current[sId] = marker;
          } else {
            marker.setPosition(latLng);
            marker.setIcon({
              url: iconUrl,
              scaledSize: new window.google.maps.Size(40, 52),
              anchor: new window.google.maps.Point(20, 50),
            });
            marker.setZIndex(isSelected ? 999 : 100);
          }
        } else {
          // If no GPS points have arrived yet, remove live marker if it exists.
          // Map shows ONLY the Punch-In 'S' marker!
          if (markersRef.current[sId]) {
            markersRef.current[sId].setMap(null);
            delete markersRef.current[sId];
          }
        }
      });

      // Remove obsolete markers for sessions that punched out
      Object.keys(markersRef.current).forEach((id) => {
        if (!activeIds.has(id)) {
          markersRef.current[id].setMap(null);
          delete markersRef.current[id];
        }
      });
      Object.keys(liveStartMarkersRef.current).forEach((id) => {
        if (!activeIds.has(id)) {
          liveStartMarkersRef.current[id].setMap(null);
          delete liveStartMarkersRef.current[id];
        }
      });
    } else if (mode === 'DEVICE_SESSIONS') {
      const activeUserIds = new Set();

      usersData.forEach((u) => {
        const uId = u.userId;
        const session = extractAuthoritativeSession(u);
        if (!session?.location?.latitude || !session?.location?.longitude) return;

        activeUserIds.add(uId);
        const cat = getCategoryForRole(u.role);
        const isOnline = session.status === 'ONLINE';
        const isSelected = selectedUserId === uId;
        const latLng = new window.google.maps.LatLng(session.location.latitude, session.location.longitude);
        const iconUrl = generatePinSvg(cat, isOnline, isSelected);

        let marker = markersRef.current[uId];
        if (!marker) {
          marker = new window.google.maps.Marker({
            position: latLng,
            map: mapInstanceRef.current,
            title: `${u.name} (${u.role})`,
            icon: {
              url: iconUrl,
              scaledSize: new window.google.maps.Size(40, 52),
              anchor: new window.google.maps.Point(20, 50),
            },
            zIndex: isSelected ? 999 : 100,
          });

          marker.addListener('click', () => {
            setSelectedUserId(uId);
            mapInstanceRef.current.panTo(latLng);
            showAccuracyCircle(session.location.latitude, session.location.longitude, session.location.accuracy || 20);
          });

          markersRef.current[uId] = marker;
        } else {
          marker.setPosition(latLng);
          marker.setIcon({
            url: iconUrl,
            scaledSize: new window.google.maps.Size(40, 52),
            anchor: new window.google.maps.Point(20, 50),
          });
          marker.setZIndex(isSelected ? 999 : 100);
        }
      });

      Object.keys(markersRef.current).forEach((id) => {
        if (!activeUserIds.has(id)) {
          markersRef.current[id].setMap(null);
          delete markersRef.current[id];
        }
      });
    }
  }, [mode, mapsLoaded, liveRoutes, selectedLiveSessionId, usersData, selectedUserId, drawLiveRouteOnMap, clearLiveMarkers]);

  // Fit all markers button
  const fitAllMarkers = (force = false) => {
    if (!mapsLoaded || !mapInstanceRef.current || !window.google?.maps) return;

    const bounds = new window.google.maps.LatLngBounds();
    let count = 0;

    if (mode === 'LIVE_NOW') {
      liveRoutes.forEach((s) => {
        const liveLat = s.latestLocation?.latitude || (s.hasGpsFix ? s.currentLocation?.latitude : null);
        const liveLng = s.latestLocation?.longitude || (s.hasGpsFix ? s.currentLocation?.longitude : null);
        if (liveLat && liveLng) {
          bounds.extend(new window.google.maps.LatLng(liveLat, liveLng));
          count++;
        }
        const punchLat = s.punchInCoordinates?.latitude || s.punchIn?.latitude;
        const punchLng = s.punchInCoordinates?.longitude || s.punchIn?.longitude;
        if (punchLat && punchLng) {
          bounds.extend(new window.google.maps.LatLng(punchLat, punchLng));
          count++;
        }
      });
    } else if (mode === 'DEVICE_SESSIONS') {
      usersData.forEach((u) => {
        const s = extractAuthoritativeSession(u);
        if (s?.location?.latitude && s?.location?.longitude) {
          bounds.extend(new window.google.maps.LatLng(s.location.latitude, s.location.longitude));
          count++;
        }
      });
    }

    if (count > 0) {
      mapInstanceRef.current.fitBounds(bounds, { top: 50, bottom: 50, left: 50, right: 50 });
    } else {
      mapInstanceRef.current.panTo({ lat: 23.0225, lng: 72.5714 });
      mapInstanceRef.current.setZoom(12);
    }
  };

  const centerOnHQ = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.panTo({ lat: 23.0225, lng: 72.5714 });
    mapInstanceRef.current.setZoom(13);
  };

  const toggleTraffic = () => {
    if (!mapInstanceRef.current || !window.google?.maps) return;
    if (!trafficLayerRef.current) {
      trafficLayerRef.current = new window.google.maps.TrafficLayer();
    }
    if (showTraffic) {
      trafficLayerRef.current.setMap(null);
      setShowTraffic(false);
    } else {
      trafficLayerRef.current.setMap(mapInstanceRef.current);
      setShowTraffic(true);
    }
  };

  // Filtered lists for Drawer
  const filteredLiveRoutes = useMemo(() => {
    return liveRoutes.filter((s) => {
      if (selectedRole !== 'All') {
        const cat = getCategoryForRole(s.role);
        if (cat !== selectedRole) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = (s.employeeName || '').toLowerCase().includes(q);
        const matchesCode = (s.employeeCode || '').toLowerCase().includes(q);
        const matchesDept = (s.department || '').toLowerCase().includes(q);
        const matchesAddr = (s.punchInAddress || '').toLowerCase().includes(q);
        if (!matchesName && !matchesCode && !matchesDept && !matchesAddr) return false;
      }
      if (statusFilter === 'LIVE' && s.status !== 'LIVE') return false;
      if (statusFilter === 'STALE' && s.status !== 'GPS_STALE' && s.status !== 'CONNECTION_DEGRADED') return false;
      return true;
    });
  }, [liveRoutes, selectedRole, searchQuery, statusFilter]);

  const selectedLiveSession = useMemo(() => {
    return liveRoutes.find((s) => s.sessionId === selectedLiveSessionId) || null;
  }, [liveRoutes, selectedLiveSessionId]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100vh - 72px)',
      background: '#F8FAFC',
      padding: '12px',
      gap: '10px',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      boxSizing: 'border-box',
    }}>
      {/* ── 1. HEADER BANNER & STATUS ────────────────────────────────────────── */}
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: isMobile ? 'stretch' : 'center',
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '12px',
        padding: '12px 18px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        gap: '12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #0284C7, #0369A1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            boxShadow: '0 4px 6px -1px rgba(2, 132, 199, 0.25)',
            flexShrink: 0,
          }}>
            <Lucide.MapPin size={22} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Employee Live Route Tracking
              <span style={{ fontSize: '10.5px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px', background: '#F1F5F9', color: '#0284C7' }}>
                PUNCH IN → PUNCH OUT
              </span>
            </h2>
            <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748B' }}>
              Real-time GPS telemetry, route lines, stop detection & historical playback
            </p>
          </div>
        </div>

        {/* Real-time Connection Indicator & Metrics */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '8px', padding: '5px 12px', fontSize: '12px', color: '#15803D', fontWeight: 600 }}>
            🟢 Active Shifts: <strong>{liveRoutes.length}</strong>
          </div>
          <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '8px', padding: '5px 12px', fontSize: '12px', color: '#1D4ED8', fontWeight: 600 }}>
            📅 Today: <strong>{todaySessions.length}</strong>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 12px',
            borderRadius: '20px',
            background: liveStatus === 'LIVE' ? '#F0FDF4' : liveStatus === 'RECONNECTING' ? '#FFFBEB' : '#FEF2F2',
            border: `1px solid ${liveStatus === 'LIVE' ? '#BBF7D0' : liveStatus === 'RECONNECTING' ? '#FDE68A' : '#FCA5A5'}`,
            fontSize: '11.5px',
            fontWeight: 700,
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: liveStatus === 'LIVE' ? '#16A34A' : liveStatus === 'RECONNECTING' ? '#F59E0B' : '#DC2626',
            }} />
            <span style={{ color: liveStatus === 'LIVE' ? '#15803D' : liveStatus === 'RECONNECTING' ? '#B45309' : '#B91C1C' }}>
              {liveStatus === 'LIVE' ? 'LIVE TELEMETRY' : liveStatus === 'RECONNECTING' ? 'RECONNECTING...' : 'OFFLINE'}
            </span>
          </div>
        </div>
      </div>

      {/* ── 2. MODE SWITCHER TABS ────────────────────────────────────────────── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '12px',
        padding: '6px',
        gap: '6px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        overflowX: 'auto',
      }}>
        {[
          { id: 'LIVE_NOW', label: 'LIVE NOW', icon: '🟢', badge: liveRoutes.length, desc: 'Real-time punch-in shift telemetry' },
          { id: 'TODAY', label: 'TODAY', icon: '📅', badge: todaySessions.length, desc: "Today's shifts & daily routes" },
          { id: 'HISTORY', label: 'HISTORY', icon: '📜', badge: null, desc: 'Shift route playback & stop detection' },
          { id: 'DEVICE_SESSIONS', label: 'DEVICE SESSIONS', icon: '💻', badge: usersData.length, desc: 'Web & browser sessions' },
        ].map((tab) => {
          const isActive = mode === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setMode(tab.id);
                clearAllOverlays();
                if (tab.id === 'LIVE_NOW') fetchLiveRoutes();
                if (tab.id === 'TODAY') fetchTodaySessions();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                background: isActive ? '#0F172A' : '#F8FAFC',
                color: isActive ? '#FFFFFF' : '#475569',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
                boxShadow: isActive ? '0 2px 6px rgba(15, 23, 42, 0.25)' : 'none',
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.badge !== null && (
                <span style={{
                  fontSize: '10.5px',
                  padding: '2px 7px',
                  borderRadius: '12px',
                  background: isActive ? 'rgba(255,255,255,0.25)' : '#E2E8F0',
                  color: isActive ? '#FFFFFF' : '#334155',
                  fontWeight: 700,
                }}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── 3. MAIN WORKSPACE SPLIT VIEW ────────────────────────────────────── */}
      <div style={{
        display: 'flex',
        flex: 1,
        gap: '12px',
        overflow: 'hidden',
        position: 'relative',
      }}>
        {/* Left Drawer */}
        <div style={{
          display: showDrawer ? 'flex' : 'none',
          flexDirection: 'column',
          width: isMobile ? 'calc(100% - 24px)' : '400px',
          position: isMobile ? 'absolute' : 'relative',
          top: isMobile ? '12px' : '0',
          left: isMobile ? '12px' : '0',
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
          padding: '14px',
          gap: '10px',
          zIndex: 100,
          height: isMobile ? 'calc(100% - 24px)' : '100%',
          boxShadow: isMobile
            ? '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)'
            : '0 2px 4px rgba(0,0,0,0.02)',
        }}>

          {/* ═════════════════════════════════════════════════════════════════════
              MODE 1: LIVE NOW (ACTIVE SHIFT TELEMETRY)
          ═════════════════════════════════════════════════════════════════════ */}
          {mode === 'LIVE_NOW' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>Active Shifts</h3>
                  <span style={{ fontSize: '11px', color: '#64748B' }}>
                    {filteredLiveRoutes.length} employee{filteredLiveRoutes.length !== 1 ? 's' : ''} currently on shift
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={() => fitAllMarkers(true)}
                    style={{
                      background: '#EFF6FF',
                      border: '1px solid #BFDBFE',
                      borderRadius: '6px',
                      padding: '4px 8px',
                      color: '#2563EB',
                      fontSize: '11px',
                      cursor: 'pointer',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Lucide.Crosshair size={13} /> Fit All
                  </button>
                  <button
                    onClick={fetchLiveRoutes}
                    style={{
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      borderRadius: '6px',
                      padding: '4px 8px',
                      color: '#475569',
                      fontSize: '11px',
                      cursor: 'pointer',
                    }}
                  >
                    <Lucide.RefreshCw size={13} />
                  </button>
                </div>
              </div>

              {/* Search Bar */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                background: '#F8FAFC',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                padding: '6px 10px',
                gap: '8px',
              }}>
                <Lucide.Search size={15} color="#64748B" />
                <input
                  type="text"
                  placeholder="Search staff, code, address..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    flex: 1,
                    border: 'none',
                    background: 'transparent',
                    outline: 'none',
                    fontSize: '12px',
                    color: '#0F172A',
                  }}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 0 }}
                  >
                    <Lucide.X size={13} />
                  </button>
                )}
              </div>

              {/* Status Filter Tabs */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '4px' }}>
                {[
                  { id: 'ALL', label: 'All', count: liveRoutes.length },
                  { id: 'LIVE', label: '🟢 Live (<5m)', count: liveRoutes.filter(s => s.status === 'LIVE').length },
                  { id: 'STALE', label: '🟡 Stale (>5m)', count: liveRoutes.filter(s => s.status !== 'LIVE').length },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setStatusFilter(tab.id)}
                    style={{
                      background: statusFilter === tab.id ? '#EFF6FF' : '#F8FAFC',
                      border: `1px solid ${statusFilter === tab.id ? '#3B82F6' : '#E2E8F0'}`,
                      borderRadius: '6px',
                      padding: '5px 2px',
                      fontSize: '11px',
                      fontWeight: statusFilter === tab.id ? 700 : 500,
                      color: statusFilter === tab.id ? '#1D4ED8' : '#64748B',
                      cursor: 'pointer',
                      textAlign: 'center',
                    }}
                  >
                    {tab.label} ({tab.count})
                  </button>
                ))}
              </div>

              {/* Active Shifts List */}
              <div style={{
                flex: 1,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                paddingRight: '2px',
              }}>
                {loading ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '40px', color: '#94A3B8' }}>
                    <Lucide.Loader2 className="animate-spin" size={24} />
                  </div>
                ) : filteredLiveRoutes.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '36px 12px', color: '#64748B', fontSize: '12.5px', background: '#F8FAFC', borderRadius: '10px', border: '1px dashed #CBD5E1' }}>
                    <Lucide.ShieldCheck size={36} color="#0284C7" style={{ margin: '0 auto 10px auto', opacity: 0.8 }} />
                    <div style={{ fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>No Active Punch-In Shifts</div>
                    Employees currently punched in will automatically appear here with real-time GPS telemetry.
                  </div>
                ) : (
                  filteredLiveRoutes.map((shift) => {
                    const isSelected = selectedLiveSessionId === shift.sessionId;
                    const cat = getCategoryForRole(shift.role);
                    const cfg = ROLE_CONFIG[cat] || ROLE_CONFIG['Other'];

                    return (
                      <div
                        key={shift.sessionId}
                        onClick={() => {
                          setSelectedLiveSessionId(shift.sessionId);
                          drawLiveRouteOnMap(shift);
                        }}
                        style={{
                          background: isSelected ? '#F0F9FF' : '#FFFFFF',
                          border: `1.5px solid ${isSelected ? '#0284C7' : '#E2E8F0'}`,
                          borderRadius: '10px',
                          padding: '10px 12px',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px',
                          transition: 'all 0.15s ease',
                          boxShadow: isSelected ? '0 4px 12px rgba(2, 132, 199, 0.15)' : 'none',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                              width: '34px',
                              height: '34px',
                              borderRadius: '8px',
                              background: cfg.lightBg,
                              border: `1px solid ${cfg.borderColor}`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '17px',
                            }}>
                              {cfg.emoji}
                            </div>
                            <div>
                              <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                                {shift.employeeName}
                              </div>
                              <div style={{ fontSize: '11px', color: '#64748B' }}>
                                {shift.employeeCode ? `${shift.employeeCode} • ` : ''}{shift.role}
                              </div>
                            </div>
                          </div>

                          {/* Staleness Badge */}
                          {(() => {
                            const hasGps = Boolean(shift.latestLocation?.latitude && shift.latestLocation?.longitude);
                            const lastRecordedAt = shift.latestLocation?.recordedAt || (shift.hasGpsFix ? shift.currentLocation?.recordedAt : null);
                            const gpsAgeSec = lastRecordedAt ? Math.max(0, Math.floor((Date.now() - new Date(lastRecordedAt).getTime()) / 1000)) : null;
                            const isLive = hasGps && gpsAgeSec != null && gpsAgeSec <= 300; // <= 5 min
                            const isStale = hasGps && gpsAgeSec != null && gpsAgeSec > 300 && gpsAgeSec <= 1800; // 5-30 min
                            const isDegraded = hasGps && gpsAgeSec != null && gpsAgeSec > 1800; // > 30 min

                            if (!hasGps) {
                              return (
                                <div style={{
                                  fontSize: '10px',
                                  fontWeight: 700,
                                  padding: '3px 8px',
                                  borderRadius: '12px',
                                  background: '#FEF3C7',
                                  color: '#B45309',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  whiteSpace: 'nowrap',
                                }}>
                                  <span>⚠️ NO CURRENT GPS</span>
                                </div>
                              );
                            }

                            if (isLive) {
                              return (
                                <div style={{
                                  fontSize: '10px',
                                  fontWeight: 700,
                                  padding: '3px 8px',
                                  borderRadius: '12px',
                                  background: '#DCFCE7',
                                  color: '#15803D',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  whiteSpace: 'nowrap',
                                }}>
                                  <span>🟢 LIVE ({new Date(lastRecordedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })})</span>
                                </div>
                              );
                            }

                            if (isStale) {
                              return (
                                <div style={{
                                  fontSize: '10px',
                                  fontWeight: 700,
                                  padding: '3px 8px',
                                  borderRadius: '12px',
                                  background: '#FEF3C7',
                                  color: '#B45309',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  whiteSpace: 'nowrap',
                                }}>
                                  <span>🟡 STALE ({Math.floor(gpsAgeSec / 60)}m ago)</span>
                                </div>
                              );
                            }

                            return (
                              <div style={{
                                fontSize: '10px',
                                fontWeight: 700,
                                padding: '3px 8px',
                                borderRadius: '12px',
                                background: '#FEE2E2',
                                color: '#B91C1C',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                whiteSpace: 'nowrap',
                              }}>
                                <span>🔴 DEGRADED ({Math.floor(gpsAgeSec / 60)}m ago)</span>
                              </div>
                            );
                          })()}
                        </div>

                        {/* Tracking Truth Indicator */}
                        {(() => {
                          const hasGps = Boolean(shift.latestLocation?.latitude && shift.latestLocation?.longitude);
                          const lastRecordedAt = shift.latestLocation?.recordedAt || (shift.hasGpsFix ? shift.currentLocation?.recordedAt : null);
                          const gpsAgeSec = lastRecordedAt ? Math.max(0, Math.floor((Date.now() - new Date(lastRecordedAt).getTime()) / 1000)) : null;

                          if (hasGps) {
                            return (
                              <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '3px',
                                padding: '5px 8px',
                                borderRadius: '6px',
                                fontSize: '10.5px',
                                fontWeight: 600,
                                background: '#F0FDF4',
                                border: '1px solid #BBF7D0',
                                color: '#15803D',
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                  <Lucide.Smartphone size={13} color="#16A34A" />
                                  <span>📱 Native background tracking ACTIVE</span>
                                </div>
                                <div style={{ fontSize: '9.5px', color: '#475569', display: 'flex', gap: '8px', fontWeight: 500 }}>
                                  <span><strong>GPS age:</strong> {gpsAgeSec != null ? (gpsAgeSec < 60 ? `${gpsAgeSec}s` : `${Math.floor(gpsAgeSec / 60)}m`) : 'N/A'}</span>
                                  <span><strong>Accuracy:</strong> {shift.latestLocation?.accuracy ? `±${Math.round(shift.latestLocation.accuracy)}m` : '8m'}</span>
                                  <span><strong>Speed:</strong> {shift.latestLocation?.speed != null ? `${Math.round(shift.latestLocation.speed)} km/h` : '0 km/h'}</span>
                                </div>
                              </div>
                            );
                          }

                          return (
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '5px 8px',
                              borderRadius: '6px',
                              fontSize: '10.5px',
                              fontWeight: 600,
                              background: '#FFFBEB',
                              border: '1px solid #FDE68A',
                              color: '#B45309',
                            }}>
                              <Lucide.AlertTriangle size={13} color="#D97706" />
                              <span>⚠️ BROWSER PRESENCE ONLY (Awaiting mobile GPS)</span>
                            </div>
                          );
                        })()}

                        {/* Shift Key Stats Row */}
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr 1fr 1fr',
                          gap: '4px',
                          background: isSelected ? '#E0F2FE' : '#F8FAFC',
                          borderRadius: '6px',
                          padding: '6px',
                          fontSize: '10.5px',
                          textAlign: 'center',
                        }}>
                          <div>
                            <span style={{ color: '#64748B', display: 'block', fontSize: '9px', fontWeight: 600 }}>SHIFT</span>
                            <strong style={{ color: '#0F172A' }}>{new Date(shift.punchInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>
                          </div>
                          <div>
                            <span style={{ color: '#64748B', display: 'block', fontSize: '9px', fontWeight: 600 }}>DISTANCE</span>
                            <strong style={{ color: '#0284C7' }}>{shift.totalDistanceKm || 0} km</strong>
                          </div>
                          <div>
                            <span style={{ color: '#64748B', display: 'block', fontSize: '9px', fontWeight: 600 }}>POINTS</span>
                            <strong style={{ color: '#0F172A' }}>{shift.totalPointsCount || (shift.routePoints?.length || 0)}</strong>
                          </div>
                          <div>
                            <span style={{ color: '#64748B', display: 'block', fontSize: '9px', fontWeight: 600 }}>STOPS</span>
                            <strong style={{ color: '#D97706' }}>{shift.totalStopsCount || (shift.stops?.length || 0)}</strong>
                          </div>
                        </div>

                        {/* Punch In / Current Location Snippet */}
                        <div style={{ fontSize: '11px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Lucide.MapPin size={12} color="#0284C7" />
                          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {shift.latestLocation ? 'Live GPS telemetry streaming' : (shift.punchInAddress ? `Start: ${shift.punchInAddress}` : 'Punch In location recorded')}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}

          {/* ═════════════════════════════════════════════════════════════════════
              MODE 2: TODAY (ALL SHIFTS FROM TODAY)
          ═════════════════════════════════════════════════════════════════════ */}
          {mode === 'TODAY' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>Today&apos;s Shifts</h3>
                  <span style={{ fontSize: '11px', color: '#64748B' }}>
                    {todaySessions.length} total shift{todaySessions.length !== 1 ? 's' : ''} recorded today
                  </span>
                </div>
                <button
                  onClick={fetchTodaySessions}
                  style={{
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '6px',
                    padding: '4px 8px',
                    color: '#475569',
                    fontSize: '11px',
                    cursor: 'pointer',
                  }}
                >
                  <Lucide.RefreshCw size={13} />
                </button>
              </div>

              <div style={{
                flex: 1,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                paddingRight: '2px',
              }}>
                {todaySessions.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '36px 12px', color: '#64748B', fontSize: '12.5px', background: '#F8FAFC', borderRadius: '10px', border: '1px dashed #CBD5E1' }}>
                    <Lucide.Calendar size={36} color="#64748B" style={{ margin: '0 auto 10px auto', opacity: 0.6 }} />
                    <div style={{ fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>No Shifts Recorded Today</div>
                    Shifts punched in today will be archived and reviewable here.
                  </div>
                ) : (
                  todaySessions.map((session) => {
                    const isSelected = selectedTodaySessionId === session.sessionId;
                    const isCompleted = session.status === 'COMPLETED';

                    return (
                      <div
                        key={session.sessionId}
                        onClick={() => {
                          setSelectedTodaySessionId(session.sessionId);
                          loadHistoryRoute(session.employeeId, getLocalDateString(0));
                        }}
                        style={{
                          background: isSelected ? '#F0F9FF' : '#FFFFFF',
                          border: `1.5px solid ${isSelected ? '#0284C7' : '#E2E8F0'}`,
                          borderRadius: '10px',
                          padding: '10px 12px',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                              {session.employeeName}
                            </div>
                            <div style={{ fontSize: '11px', color: '#64748B' }}>
                              {session.employeeCode ? `${session.employeeCode} • ` : ''}{session.department}
                            </div>
                          </div>
                          <span style={{
                            fontSize: '10.5px',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: '12px',
                            background: isCompleted ? '#F1F5F9' : '#DCFCE7',
                            color: isCompleted ? '#475569' : '#15803D',
                          }}>
                            {isCompleted ? '⚫ PUNCHED OUT' : '🟢 ACTIVE SHIFT'}
                          </span>
                        </div>

                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr 1fr',
                          gap: '4px',
                          background: '#F8FAFC',
                          borderRadius: '6px',
                          padding: '6px',
                          fontSize: '11px',
                        }}>
                          <div>
                            <span style={{ color: '#64748B', display: 'block', fontSize: '9.5px' }}>IN</span>
                            <strong style={{ color: '#0F172A' }}>{new Date(session.punchInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>
                          </div>
                          <div>
                            <span style={{ color: '#64748B', display: 'block', fontSize: '9.5px' }}>OUT</span>
                            <strong style={{ color: '#0F172A' }}>
                              {session.punchOutAt ? new Date(session.punchOutAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Ongoing'}
                            </strong>
                          </div>
                          <div>
                            <span style={{ color: '#64748B', display: 'block', fontSize: '9.5px' }}>KM</span>
                            <strong style={{ color: '#0284C7' }}>{session.totalDistanceKm} km</strong>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}

          {/* ═════════════════════════════════════════════════════════════════════
              MODE 3: HISTORY (HISTORICAL ROUTE & PLAYBACK)
          ═════════════════════════════════════════════════════════════════════ */}
          {mode === 'HISTORY' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>Shift Route History</h3>
                  <span style={{ fontSize: '11px', color: '#64748B' }}>
                    Select employee and date to inspect route and stops
                  </span>
                </div>
              </div>

              {/* Employee Selector */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>SELECT EMPLOYEE</label>
                <select
                  value={selectedHistoryEmployeeId}
                  onChange={(e) => {
                    setSelectedHistoryEmployeeId(e.target.value);
                    if (e.target.value && historyDate) {
                      loadHistoryRoute(e.target.value, historyDate);
                    }
                  }}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '12.5px',
                    color: '#0F172A',
                    background: '#FFFFFF',
                    outline: 'none',
                  }}
                >
                  <option value="">-- Choose Employee --</option>
                  {allEmployees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.fullName} ({emp.employeeCode || emp.jobTitle || 'Staff'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Selector */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>DATE</label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <input
                    type="date"
                    value={historyDate}
                    onChange={(e) => {
                      setHistoryDate(e.target.value);
                      if (selectedHistoryEmployeeId && e.target.value) {
                        loadHistoryRoute(selectedHistoryEmployeeId, e.target.value);
                      }
                    }}
                    style={{
                      flex: 1,
                      padding: '6px 10px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '12px',
                    }}
                  />
                  <button
                    onClick={() => {
                      const todayStr = getLocalDateString(0);
                      setHistoryDate(todayStr);
                      if (selectedHistoryEmployeeId) loadHistoryRoute(selectedHistoryEmployeeId, todayStr);
                    }}
                    style={{
                      padding: '6px 10px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      background: '#F8FAFC',
                      fontSize: '11.5px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Today
                  </button>
                  <button
                    onClick={() => {
                      const yestStr = getLocalDateString(1);
                      setHistoryDate(yestStr);
                      if (selectedHistoryEmployeeId) loadHistoryRoute(selectedHistoryEmployeeId, yestStr);
                    }}
                    style={{
                      padding: '6px 10px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      background: '#F8FAFC',
                      fontSize: '11.5px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Yesterday
                  </button>
                </div>
              </div>

              {/* Route Summary & Playback */}
              {historyLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '30px', color: '#94A3B8' }}>
                  <Lucide.Loader2 className="animate-spin" size={24} />
                </div>
              ) : historyError ? (
                <div style={{ padding: '16px', borderRadius: '8px', background: '#FEF2F2', border: '1px solid #FECDD3', color: '#991B1B', fontSize: '12px' }}>
                  <Lucide.AlertCircle size={16} style={{ display: 'inline', marginRight: '6px' }} />
                  {historyError}
                </div>
              ) : historyData && historyData.points?.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {/* Shift Stats Card */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    gap: '6px',
                    background: '#F0F9FF',
                    border: '1px solid #BAE6FD',
                    borderRadius: '8px',
                    padding: '8px',
                    fontSize: '11px',
                  }}>
                    <div>
                      <span style={{ color: '#0369A1', display: 'block', fontSize: '10px', fontWeight: 600 }}>DISTANCE</span>
                      <strong style={{ color: '#0F172A', fontSize: '13px' }}>{historyData.session?.totalDistanceKm || 0} km</strong>
                    </div>
                    <div>
                      <span style={{ color: '#0369A1', display: 'block', fontSize: '10px', fontWeight: 600 }}>DURATION</span>
                      <strong style={{ color: '#0F172A', fontSize: '13px' }}>{historyData.session?.durationFormatted || '—'}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#0369A1', display: 'block', fontSize: '10px', fontWeight: 600 }}>STOPS</span>
                      <strong style={{ color: '#D97706', fontSize: '13px' }}>{historyData.stops?.length || 0} stops</strong>
                    </div>
                  </div>

                  {/* Playback Controls */}
                  <div style={{
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    padding: '10px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#0F172A' }}>Shift Route Playback</span>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {[1, 2, 5, 10].map((spd) => (
                          <button
                            key={spd}
                            onClick={() => setPlaybackSpeed(spd)}
                            style={{
                              padding: '2px 6px',
                              borderRadius: '4px',
                              border: `1px solid ${playbackSpeed === spd ? '#2563EB' : '#E2E8F0'}`,
                              background: playbackSpeed === spd ? '#EFF6FF' : '#F8FAFC',
                              color: playbackSpeed === spd ? '#1D4ED8' : '#64748B',
                              fontSize: '10px',
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            {spd}x
                          </button>
                        ))}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        onClick={() => {
                          if (playbackIndex >= (historyData.points?.length || 1) - 1) {
                            setPlaybackIndex(0);
                          }
                          setIsPlaying(!isPlaying);
                        }}
                        style={{
                          background: isPlaying ? '#EF4444' : '#2563EB',
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '6px 12px',
                          fontSize: '11.5px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        {isPlaying ? <Lucide.Pause size={14} /> : <Lucide.Play size={14} />}
                        {isPlaying ? 'Pause' : 'Play'}
                      </button>

                      <input
                        type="range"
                        min={0}
                        max={historyData.points.length - 1}
                        value={playbackIndex}
                        onChange={(e) => {
                          const idx = Number(e.target.value);
                          setPlaybackIndex(idx);
                          updatePlaybackMarker(historyData.points[idx]);
                        }}
                        style={{ flex: 1 }}
                      />
                    </div>

                    {historyData.points[playbackIndex] && (
                      <div style={{ fontSize: '11px', color: '#64748B', display: 'flex', justifyContent: 'space-between' }}>
                        <span>
                          Time: <strong style={{ color: '#0F172A' }}>{new Date(historyData.points[playbackIndex].recordedAt).toLocaleTimeString()}</strong>
                        </span>
                        <span>
                          Speed: <strong style={{ color: '#0284C7' }}>{Math.round(historyData.points[playbackIndex].speed || 0)} km/h</strong>
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Detected Stops List */}
                  {historyData.stops && historyData.stops.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#0F172A' }}>Detected Field Stops</div>
                      {historyData.stops.map((st) => (
                        <div
                          key={st.stopNumber}
                          style={{
                            background: '#FFFBEB',
                            border: '1px solid #FCD34D',
                            borderRadius: '6px',
                            padding: '6px 10px',
                            fontSize: '11px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <div>
                            <strong style={{ color: '#B45309' }}>Stop #{st.stopNumber}</strong> ({st.durationMinutes} min)
                            <div style={{ color: '#64748B', fontSize: '10px' }}>
                              {new Date(st.arrivedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – {new Date(st.departedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              if (mapInstanceRef.current) {
                                mapInstanceRef.current.panTo({ lat: st.latitude, lng: st.longitude });
                                mapInstanceRef.current.setZoom(16);
                              }
                            }}
                            style={{
                              background: '#F59E0B',
                              color: '#FFFFFF',
                              border: 'none',
                              borderRadius: '4px',
                              padding: '3px 7px',
                              fontSize: '10px',
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            View
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '30px 10px', color: '#64748B', fontSize: '12px' }}>
                  Please choose an employee and date to view their historical GPS shift track.
                </div>
              )}
            </>
          )}

          {/* ═════════════════════════════════════════════════════════════════════
              MODE 4: DEVICE SESSIONS (LEGACY WEB / DESKTOP SESSIONS)
          ═════════════════════════════════════════════════════════════════════ */}
          {mode === 'DEVICE_SESSIONS' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>Device Sessions</h3>
                  <span style={{ fontSize: '11px', color: '#64748B' }}>
                    {usersData.length} total staff profiles
                  </span>
                </div>
                <button
                  onClick={fetchDeviceUsersSnapshot}
                  style={{
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '6px',
                    padding: '4px 8px',
                    color: '#475569',
                    fontSize: '11px',
                    cursor: 'pointer',
                  }}
                >
                  <Lucide.RefreshCw size={13} />
                </button>
              </div>

              <div style={{
                flex: 1,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                paddingRight: '2px',
              }}>
                {usersData.map((u) => {
                  const s = extractAuthoritativeSession(u);
                  const isSelected = selectedUserId === u.userId;
                  const cat = getCategoryForRole(u.role);
                  const cfg = ROLE_CONFIG[cat] || ROLE_CONFIG['Other'];

                  return (
                    <div
                      key={u.userId}
                      onClick={() => {
                        setSelectedUserId(u.userId);
                        if (s?.location?.latitude && s?.location?.longitude && mapInstanceRef.current) {
                          mapInstanceRef.current.panTo({ lat: s.location.latitude, lng: s.location.longitude });
                          showAccuracyCircle(s.location.latitude, s.location.longitude, s.location.accuracy || 20);
                        }
                      }}
                      style={{
                        background: isSelected ? '#F0F9FF' : '#FFFFFF',
                        border: `1.5px solid ${isSelected ? '#0284C7' : '#E2E8F0'}`,
                        borderRadius: '10px',
                        padding: '10px 12px',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>{u.name}</div>
                          <div style={{ fontSize: '11px', color: '#64748B' }}>{u.role}</div>
                        </div>
                        <span style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: '10px',
                          background: s?.status === 'ONLINE' ? '#DCFCE7' : '#F1F5F9',
                          color: s?.status === 'ONLINE' ? '#15803D' : '#64748B',
                        }}>
                          {s?.status || 'OFFLINE'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

        </div>

        {/* Right Map Canvas */}
        <div style={{
          flex: 1,
          position: 'relative',
          borderRadius: '12px',
          overflow: 'hidden',
          border: '1px solid #CBD5E1',
          background: '#E2E8F0',
        }}>
          {/* Quick Map Controls Overlay */}
          <div style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            zIndex: 10,
            display: 'flex',
            gap: '6px',
          }}>
            <button
              onClick={centerOnHQ}
              title="Center on HQ"
              style={{
                background: '#FFFFFF',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '11.5px',
                fontWeight: 600,
                color: '#0F172A',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <Lucide.Home size={14} /> HQ
            </button>
            <button
              onClick={toggleTraffic}
              title="Toggle Live Traffic"
              style={{
                background: showTraffic ? '#0F172A' : '#FFFFFF',
                color: showTraffic ? '#FFFFFF' : '#0F172A',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '11.5px',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <Lucide.Navigation size={14} /> Traffic
            </button>
            <button
              onClick={() => fitAllMarkers(true)}
              title="Fit Markers"
              style={{
                background: '#FFFFFF',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '11.5px',
                fontWeight: 600,
                color: '#0F172A',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <Lucide.Crosshair size={14} /> Fit
            </button>
          </div>

          {/* Maps Error or Container */}
          {mapsError ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '20px', color: '#DC2626' }}>
              <Lucide.AlertTriangle size={24} style={{ marginRight: '8px' }} />
              Failed to load Google Maps: {mapsError}
            </div>
          ) : (
            <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
          )}
        </div>
      </div>
    </div>
  );
}
