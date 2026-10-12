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

export const formatGpsAge = (seconds) => {
  if (seconds === null || seconds === undefined || isNaN(seconds)) return 'No GPS';
  if (seconds < 60) return `${Math.max(0, Math.round(seconds))}s ago`;
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  const remMins = mins % 60;
  return `${hours}h ${remMins}m ago`;
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
  Sales: {
    name: 'Sales Staff',
    shortName: 'Sales',
    color: '#2563EB',
    accentColor: '#1D4ED8',
    lightBg: '#EFF6FF',
    borderColor: '#93C5FD',
    textColor: '#1D4ED8',
    glowColor: 'rgba(37, 99, 235, 0.5)',
    iconType: 'bike',
    emoji: '🛵',
    description: 'Sales Executive, Manager & Field Staff',
  },
  'Plant Head': {
    name: 'Plant Head',
    shortName: 'Plant Head',
    color: '#10B981',
    accentColor: '#047857',
    lightBg: '#ECFDF5',
    borderColor: '#6EE7B7',
    textColor: '#047857',
    glowColor: 'rgba(16, 185, 129, 0.5)',
    iconType: 'plant_head',
    emoji: '🏭',
    description: 'Plant Head & Factory Operations',
  },
  HR: {
    name: 'HR Team',
    shortName: 'HR',
    color: '#EC4899',
    accentColor: '#BE185D',
    lightBg: '#FDF2F8',
    borderColor: '#F472B6',
    textColor: '#BE185D',
    glowColor: 'rgba(236, 72, 153, 0.5)',
    iconType: 'hr',
    emoji: '👥',
    description: 'HR Manager & Human Resources',
  },
  Dispatch: {
    name: 'Dispatch & Delivery',
    shortName: 'Dispatch',
    color: '#8B5CF6',
    accentColor: '#6D28D9',
    lightBg: '#F5F3FF',
    borderColor: '#C4B5FD',
    textColor: '#6D28D9',
    glowColor: 'rgba(139, 92, 246, 0.5)',
    iconType: 'dispatch',
    emoji: '🚚',
    description: 'Dispatch Executives & Drivers',
  },
  Production: {
    name: 'Production Team',
    shortName: 'Production',
    color: '#F59E0B',
    accentColor: '#B45309',
    lightBg: '#FFFBEB',
    borderColor: '#FCD34D',
    textColor: '#B45309',
    glowColor: 'rgba(245, 158, 11, 0.5)',
    iconType: 'production',
    emoji: '⚙️',
    description: 'Production Planner & Operators',
  },
  QC: {
    name: 'Quality Control',
    shortName: 'QC',
    color: '#E11D48',
    accentColor: '#9F1239',
    lightBg: '#FFF1F2',
    borderColor: '#FDA4AF',
    textColor: '#BE123C',
    glowColor: 'rgba(225, 29, 72, 0.5)',
    iconType: 'qc',
    emoji: '🛡️',
    description: 'QC Inspector & Quality Assurance',
  },
  Store: {
    name: 'Store & Warehouse',
    shortName: 'Store',
    color: '#F97316',
    accentColor: '#C2410C',
    lightBg: '#FFF7ED',
    borderColor: '#FDBA74',
    textColor: '#C2410C',
    glowColor: 'rgba(249, 115, 22, 0.5)',
    iconType: 'store',
    emoji: '📦',
    description: 'Store Manager & Warehouse Inventory',
  },
  Finance: {
    name: 'Finance & Accounts',
    shortName: 'Finance',
    color: '#0D9488',
    accentColor: '#0F766E',
    lightBg: '#F0FDFA',
    borderColor: '#99F6E4',
    textColor: '#0F766E',
    glowColor: 'rgba(13, 148, 136, 0.5)',
    iconType: 'finance',
    emoji: '💳',
    description: 'Finance & Accounting Staff',
  },
  Procurement: {
    name: 'Procurement',
    shortName: 'Purchase',
    color: '#6366F1',
    accentColor: '#4338CA',
    lightBg: '#EEF2FF',
    borderColor: '#C7D2FE',
    textColor: '#4338CA',
    glowColor: 'rgba(99, 102, 241, 0.5)',
    iconType: 'procurement',
    emoji: '🛒',
    description: 'Purchase & Vendor Management',
  },
  Admin: {
    name: 'Administration',
    shortName: 'Admin',
    color: '#0F172A',
    accentColor: '#0284C7',
    lightBg: '#F8FAFC',
    borderColor: '#CBD5E1',
    textColor: '#0F172A',
    glowColor: 'rgba(15, 23, 42, 0.5)',
    iconType: 'admin',
    emoji: '🏛️',
    description: 'Super Admin, Directors & Executives',
  },
  Other: {
    name: 'General Staff',
    shortName: 'Staff',
    color: '#64748B',
    accentColor: '#475569',
    lightBg: '#F8FAFC',
    borderColor: '#E2E8F0',
    textColor: '#475569',
    glowColor: 'rgba(100, 116, 139, 0.4)',
    iconType: 'other',
    emoji: '👤',
    description: 'Employees & Contractors',
  },
};

export const extractAuthoritativeSession = (user) => {
  if (!user || !user.sessions || user.sessions.length === 0) return null;
  const sessions = [...user.sessions];

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
export const generatePinSvg = (category, statusMode = 'OFFLINE', isHighlighted = false) => {
  const cfg = ROLE_CONFIG[category] || ROLE_CONFIG.Other;
  const pinColor = cfg.color;

  let statusColor = '#94A3B8'; // Offline gray
  if (statusMode === 'LIVE') statusColor = '#10B981'; // Green
  else if (statusMode === 'STALE') statusColor = '#F59E0B'; // Amber
  else if (statusMode === 'PERMISSION_DENIED') statusColor = '#EF4444'; // Red

  const strokeColor = isHighlighted ? '#F59E0B' : '#FFFFFF';
  const strokeWidth = isHighlighted ? '3.5' : '2';

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
      <circle cx="31" cy="9" r="5" fill="${statusColor}" stroke="#FFFFFF" stroke-width="2" />
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
  // 'ALL_USERS': Default Super Admin live map for ALL authorized employees & users
  // 'ACTIVE_SHIFTS': Focused attendance shift routes & distance
  // 'ROUTE_HISTORY': Historical shift route playback & detected stops
  // 'DEVICE_SESSIONS': Device hardware inventory & browser sessions
  const [mode, setMode] = useState('ALL_USERS');

  // Common UI & Connection States
  const [loading, setLoading] = useState(true);
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [mapsError, setMapsError] = useState(null);
  const [liveStatus, setLiveStatus] = useState('OFFLINE'); // 'LIVE' | 'RECONNECTING' | 'OFFLINE'
  const [lastRestSync, setLastRestSync] = useState(null);
  const [showTraffic, setShowTraffic] = useState(false);
  const [showDrawer, setShowDrawer] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [followUser, setFollowUser] = useState(false); // Follow selected user dynamically

  // Unified Users & Shifts State
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [liveRoutes, setLiveRoutes] = useState([]);

  // Route History Playback State
  const [allEmployees, setAllEmployees] = useState([]);
  const [selectedHistoryEmployeeId, setSelectedHistoryEmployeeId] = useState('');
  const [historyDate, setHistoryDate] = useState(() => getLocalDateString(0));
  const [historyData, setHistoryData] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState(null);
  const [playbackIndex, setPlaybackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL | LIVE | STALE | OFFLINE | NO_LOCATION
  const [shiftFilter, setShiftFilter] = useState('ALL'); // ALL | ON_SHIFT | OFF_SHIFT

  // Google Maps Refs
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({}); // userId -> Google Maps Marker
  const startMarkersRef = useRef({}); // userId/sessionId -> Punch-In Start Marker (S)
  const stopMarkersRef = useRef([]); // Stop Markers
  const activePolylineRef = useRef(null); // Active Route Polyline
  const startMarkerRef = useRef(null);
  const endMarkerRef = useRef(null);
  const playbackMarkerRef = useRef(null);
  const accuracyCircleRef = useRef(null);
  const trafficLayerRef = useRef(null);
  const infoWindowRef = useRef(null);
  const socketRef = useRef(null);
  const followUserRef = useRef(followUser);
  followUserRef.current = followUser;
  const selectedUserIdRef = useRef(selectedUserId);
  selectedUserIdRef.current = selectedUserId;

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
  const showAccuracyCircle = useCallback((lat, lng, accuracy, color = '#2563EB') => {
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
  }, []);

  const clearAccuracyCircle = useCallback(() => {
    if (accuracyCircleRef.current) {
      accuracyCircleRef.current.setMap(null);
      accuracyCircleRef.current = null;
    }
  }, []);

  // Clear overlays (polylines, stops, playback pins)
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
  }, [clearAccuracyCircle]);

  // Clear all map markers
  const clearAllMapMarkers = useCallback(() => {
    Object.values(markersRef.current).forEach((m) => m.setMap(null));
    markersRef.current = {};
    Object.values(startMarkersRef.current).forEach((m) => m.setMap(null));
    startMarkersRef.current = {};
  }, []);

  // ─── 1. AUTHORITATIVE DATA FETCHING (LIVE USERS + ACTIVE SHIFTS) ───────────
  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      // Pass cacheTtlMs: 0 to bypass Next.js 30s cache and fetch authoritative fresh telemetry
      const [usersRes, routesRes, empRes] = await Promise.allSettled([
        backendFetch('/super-admin/live-users', { cacheTtlMs: 0 }).catch(() =>
          backendFetch('/location/live-users', { cacheTtlMs: 0 })
        ),
        backendFetch('/location/routes/live', { cacheTtlMs: 0 }),
        backendFetch('/employees', { cacheTtlMs: 60000 }),
      ]);

      const rawUsers =
        usersRes.status === 'fulfilled'
          ? Array.isArray(usersRes.value)
            ? usersRes.value
            : usersRes.value?.data || []
          : [];

      const rawRoutes =
        routesRes.status === 'fulfilled'
          ? Array.isArray(routesRes.value)
            ? routesRes.value
            : routesRes.value?.data || []
          : [];

      const rawEmployees =
        empRes.status === 'fulfilled'
          ? Array.isArray(empRes.value)
            ? empRes.value
            : empRes.value?.data || []
          : [];

      // Create a map of active shift routes keyed by userId and employeeId
      const routesMapByUserId = {};
      const routesMapByEmpId = {};
      rawRoutes.forEach((r) => {
        if (r.userId) routesMapByUserId[r.userId] = r;
        if (r.employeeId) routesMapByEmpId[r.employeeId] = r;
      });

      // Normalize all users
      const normalized = rawUsers.map((u) => {
        const uId = u.userId || u.id;
        const shift = routesMapByUserId[uId] || (u.employeeId ? routesMapByEmpId[u.employeeId] : null) || u.activeShift || null;
        const cat = getCategoryForRole(u.role || u.jobTitle);

        // Authoritative coordinates: shift latest point OR device latest location
        const latestLoc = u.latestLocation || shift?.latestLocation || null;

        return {
          ...u,
          userId: uId,
          roleCategory: cat,
          activeShift: shift,
          latestLocation: latestLoc,
          overallStatus: u.overallStatus || (latestLoc ? (u.gpsFreshness === 'LIVE' ? 'LIVE' : 'STALE') : 'NO_LOCATION'),
          gpsFreshness: u.gpsFreshness || (latestLoc ? (u.latestLocation?.gpsAgeSeconds <= 120 ? 'LIVE' : 'STALE') : 'NO_LOCATION'),
          trackingStatus: u.trackingStatus || (shift ? 'ACTIVE_SHIFT' : (u.sessions?.some((s) => s.status === 'ONLINE') ? 'ACTIVE_DEVICE' : 'STOPPED')),
        };
      });

      setAllUsers(normalized);
      setLiveRoutes(rawRoutes);
      setAllEmployees(rawEmployees);
      setLastRestSync(new Date().toLocaleTimeString());
      return normalized;
    } catch (err) {
      console.warn('[SuperAdminMap] fetchAllData warning:', err?.message || err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Periodic resynchronization (every 10s)
  useEffect(() => {
    fetchAllData();
    const timer = setInterval(() => {
      fetchAllData();
    }, 10000);
    return () => clearInterval(timer);
  }, [fetchAllData]);

  // ─── 2. GOOGLE MAPS LOADER & INITIALIZATION ─────────────────────────────────
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
        center: { lat: 23.0225, lng: 72.5714 }, // Ahmedabad / Gujarat HQ
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

  // ─── 3. SOCKET.IO REAL-TIME TELEMETRY LISTENER ──────────────────────────────
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
      fetchAllData();
    });

    socket.on('connect_error', () => {
      setLiveStatus('RECONNECTING');
    });

    socket.on('disconnect', () => {
      setLiveStatus('OFFLINE');
    });

    // ── Helper to update single user coordinate smoothly ──
    const handleCoordinateEvent = (data) => {
      const targetUserId = data.userId;
      if (!targetUserId) return;

      const lat = Number(data.latitude);
      const lng = Number(data.longitude);
      if (isNaN(lat) || isNaN(lng)) return;

      const now = new Date();
      const updatedCoord = {
        latitude: lat,
        longitude: lng,
        accuracy: data.accuracy != null ? Number(data.accuracy) : null,
        speed: data.speed != null ? Number(data.speed) : null,
        heading: data.heading != null ? Number(data.heading) : null,
        batteryLevel: data.batteryLevel != null ? Number(data.batteryLevel) : null,
        capturedAt: data.capturedAt || data.recordedAt || now.toISOString(),
        receivedAt: data.serverReceivedAt || now.toISOString(),
        gpsAgeSeconds: 0,
        source: data.source || 'REALTIME_SOCKET',
      };

      // 1. Update React state
      setAllUsers((prev) =>
        prev.map((u) => {
          if (u.userId !== targetUserId) return u;
          return {
            ...u,
            latestLocation: updatedCoord,
            overallStatus: 'LIVE',
            gpsFreshness: 'LIVE',
            trackingStatus: u.activeShift ? 'ACTIVE_SHIFT' : 'ACTIVE_DEVICE',
          };
        })
      );

      // 2. Update Map Marker in-place (no flicker / recreation)
      if (mapInstanceRef.current && window.google?.maps) {
        const latLng = new window.google.maps.LatLng(lat, lng);
        const marker = markersRef.current[targetUserId];

        if (marker) {
          marker.setPosition(latLng);
        }

        // If this user is currently selected
        if (selectedUserIdRef.current === targetUserId) {
          // Dynamic Follow User recentering
          if (followUserRef.current) {
            mapInstanceRef.current.panTo(latLng);
          }
          showAccuracyCircle(lat, lng, data.accuracy || 15);

          // Extend polyline if active
          if (activePolylineRef.current) {
            const path = activePolylineRef.current.getPath();
            path.push(latLng);
          }
        }
      }
    };

    socket.on('user:location:update', (data) => {
      handleCoordinateEvent(data);
    });

    socket.on('employee:route:update', (data) => {
      handleCoordinateEvent(data);
    });

    socket.on('device:connected', (data) => {
      setAllUsers((prev) =>
        prev.map((u) => {
          if (u.userId !== data.userId) return u;
          return {
            ...u,
            trackingStatus: u.activeShift ? 'ACTIVE_SHIFT' : 'ACTIVE_DEVICE',
            overallStatus: u.latestLocation ? (u.gpsFreshness === 'LIVE' ? 'LIVE' : 'STALE') : 'NO_LOCATION',
          };
        })
      );
    });

    socket.on('device:disconnected', (data) => {
      setAllUsers((prev) =>
        prev.map((u) => {
          if (u.userId !== data.userId) return u;
          return {
            ...u,
            overallStatus: 'OFFLINE',
            trackingStatus: 'STOPPED',
          };
        })
      );
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [accessToken, fetchAllData, showAccuracyCircle]);

  // ─── 4. DRAW SHIFT ROUTE & STOPS ──────────────────────────────────────────
  const drawShiftRouteOnMap = useCallback(
    (user) => {
      if (!mapsLoaded || !mapInstanceRef.current || !window.google?.maps || !user) return;

      clearAllOverlays();

      const shift = user.activeShift;
      const path = [];

      // 1. Punch In coordinates
      const punchLat = shift?.punchInCoordinates?.latitude || shift?.punchInLatitude || shift?.punchIn?.latitude;
      const punchLng = shift?.punchInCoordinates?.longitude || shift?.punchInLongitude || shift?.punchIn?.longitude;
      if (punchLat && punchLng) {
        path.push(new window.google.maps.LatLng(punchLat, punchLng));
      }

      // 2. Intermediate points
      const points = shift?.routePoints || shift?.points || [];
      points.forEach((p) => {
        if (p.latitude && p.longitude) {
          path.push(new window.google.maps.LatLng(Number(p.latitude), Number(p.longitude)));
        }
      });

      // 3. Latest live location
      if (user.latestLocation?.latitude && user.latestLocation?.longitude) {
        path.push(new window.google.maps.LatLng(user.latestLocation.latitude, user.latestLocation.longitude));
      }

      if (path.length === 0) return;

      if (path.length >= 2) {
        const polyline = new window.google.maps.Polyline({
          path,
          geodesic: true,
          strokeColor: '#0284C7',
          strokeOpacity: 0.9,
          strokeWeight: 5,
          map: mapInstanceRef.current,
        });
        activePolylineRef.current = polyline;
      }

      // Draw stops
      if (shift?.stops && shift.stops.length > 0) {
        shift.stops.forEach((st) => {
          const stopMarker = new window.google.maps.Marker({
            position: new window.google.maps.LatLng(Number(st.latitude), Number(st.longitude)),
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
            infoWindowRef.current.setContent(`
              <div style="font-family: system-ui, sans-serif; padding: 6px; min-width: 180px;">
                <div style="font-weight: 700; color: #B45309; font-size: 13px; margin-bottom: 4px;">
                  🛑 Stop #${st.stopNumber} (${st.durationMinutes} mins)
                </div>
                <div style="font-size: 11px; color: #475569;">
                  <strong>Arrived:</strong> ${new Date(st.arrivedAt).toLocaleTimeString()}<br/>
                  <strong>Departed:</strong> ${new Date(st.departedAt).toLocaleTimeString()}<br/>
                  ${st.address ? `<strong>Address:</strong> ${st.address}` : ''}
                </div>
              </div>
            `);
            infoWindowRef.current.open(mapInstanceRef.current, stopMarker);
          });

          stopMarkersRef.current.push(stopMarker);
        });
      }

      // Fit bounds
      const bounds = new window.google.maps.LatLngBounds();
      path.forEach((p) => bounds.extend(p));
      mapInstanceRef.current.fitBounds(bounds, { top: 60, bottom: 60, left: 60, right: 60 });

      if (user.latestLocation?.latitude && user.latestLocation?.longitude) {
        showAccuracyCircle(user.latestLocation.latitude, user.latestLocation.longitude, user.latestLocation.accuracy || 15);
      }
    },
    [mapsLoaded, clearAllOverlays, showAccuracyCircle]
  );

  // ─── 5. HISTORICAL ROUTE LOADER & PLAYBACK ─────────────────────────────────
  const drawHistoryRoute = useCallback(
    (points, stops, session) => {
      if (!mapsLoaded || !mapInstanceRef.current || !window.google?.maps) return;

      clearAllOverlays();

      const path = [];
      const punchInLat = session?.punchInCoordinates?.latitude || session?.punchInLatitude;
      const punchInLng = session?.punchInCoordinates?.longitude || session?.punchInLongitude;
      if (punchInLat && punchInLng) {
        path.push(new window.google.maps.LatLng(punchInLat, punchInLng));
      }
      (points || []).forEach((p) => {
        if (p.latitude && p.longitude) {
          path.push(new window.google.maps.LatLng(Number(p.latitude), Number(p.longitude)));
        }
      });
      const punchOutLat = session?.punchOutCoordinates?.latitude || session?.punchOutLatitude;
      const punchOutLng = session?.punchOutCoordinates?.longitude || session?.punchOutLongitude;
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

      // Start Pin
      const startLat = punchInLat || (points && points[0] ? Number(points[0].latitude) : null);
      const startLng = punchInLng || (points && points[0] ? Number(points[0].longitude) : null);
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
        startMarkerRef.current = startMarker;
      }

      // End Pin
      const endLat = punchOutLat || (points && points.length > 0 ? Number(points[points.length - 1].latitude) : startLat);
      const endLng = punchOutLng || (points && points.length > 0 ? Number(points[points.length - 1].longitude) : startLng);
      if (endLat && endLng) {
        const endMarker = new window.google.maps.Marker({
          position: new window.google.maps.LatLng(endLat, endLng),
          map: mapInstanceRef.current,
          title: session?.status === 'COMPLETED' ? 'Shift Punch Out (End)' : 'Last Recorded Position',
          icon: {
            url: session?.status === 'COMPLETED' ? getEndPinSvg() : getStartPinSvg(),
            scaledSize: new window.google.maps.Size(34, 42),
            anchor: new window.google.maps.Point(17, 42),
          },
        });
        endMarkerRef.current = endMarker;
      }

      // Stop Pins
      if (stops && stops.length > 0) {
        stops.forEach((st) => {
          const stopMarker = new window.google.maps.Marker({
            position: new window.google.maps.LatLng(Number(st.latitude), Number(st.longitude)),
            map: mapInstanceRef.current,
            title: `Stop #${st.stopNumber} (${st.durationMinutes} mins)`,
            icon: {
              url: getStopPinSvg(st.stopNumber),
              scaledSize: new window.google.maps.Size(30, 36),
              anchor: new window.google.maps.Point(15, 36),
            },
          });
          stopMarkersRef.current.push(stopMarker);
        });
      }
    },
    [mapsLoaded, clearAllOverlays]
  );

  const loadHistoryRoute = async (empId, dateStr) => {
    if (!empId || !dateStr) return;
    setHistoryLoading(true);
    setHistoryError(null);
    setHistoryData(null);
    clearAllOverlays();

    try {
      const raw = await backendFetch(`/location/routes/history?employeeId=${empId}&date=${dateStr}`, { cacheTtlMs: 0 });
      const data = raw?.data || raw;

      if (!data || !data.points || data.points.length === 0) {
        setHistoryError('No GPS route telemetry recorded for this employee on the selected date.');
        setHistoryData(null);
        return;
      }

      setHistoryData(data);
      drawHistoryRoute(data.points, data.stops, data.session);
    } catch (err) {
      setHistoryError(err?.message || 'Failed to load historical route.');
    } finally {
      setHistoryLoading(false);
    }
  };

  const updatePlaybackMarker = useCallback(
    (pt) => {
      if (!mapsLoaded || !mapInstanceRef.current || !window.google?.maps || !pt) return;
      const latLng = new window.google.maps.LatLng(Number(pt.latitude), Number(pt.longitude));

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

      showAccuracyCircle(Number(pt.latitude), Number(pt.longitude), pt.accuracy || 15, '#2563EB');
    },
    [mapsLoaded, showAccuracyCircle]
  );

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

  // ─── 6. SYNCHRONIZE MAP MARKERS FOR ALL USERS ──────────────────────────────
  useEffect(() => {
    if (!mapsLoaded || !mapInstanceRef.current || !window.google?.maps) return;

    if (mode === 'ROUTE_HISTORY') {
      clearAllMapMarkers();
      return;
    }

    const activeUserIds = new Set();

    allUsers.forEach((u) => {
      const uId = u.userId;
      const lat = u.latestLocation?.latitude;
      const lng = u.latestLocation?.longitude;

      // If user has no coordinates, remove marker if present
      if (lat == null || lng == null) {
        if (markersRef.current[uId]) {
          markersRef.current[uId].setMap(null);
          delete markersRef.current[uId];
        }
        return;
      }

      activeUserIds.add(uId);

      const latLng = new window.google.maps.LatLng(Number(lat), Number(lng));
      const cat = u.roleCategory || getCategoryForRole(u.role);
      const isSelected = selectedUserId === uId;
      const pinStatus = u.overallStatus;
      const iconUrl = generatePinSvg(cat, pinStatus, isSelected);

      let marker = markersRef.current[uId];
      if (!marker) {
        marker = new window.google.maps.Marker({
          position: latLng,
          map: mapInstanceRef.current,
          title: `${u.name} - ${u.role} (${pinStatus})`,
          icon: {
            url: iconUrl,
            scaledSize: new window.google.maps.Size(40, 52),
            anchor: new window.google.maps.Point(20, 50),
          },
          zIndex: isSelected ? 999 : pinStatus === 'LIVE' ? 200 : 100,
        });

        marker.addListener('click', () => {
          setSelectedUserId(uId);
          mapInstanceRef.current.panTo(latLng);
          showAccuracyCircle(lat, lng, u.latestLocation?.accuracy || 15);

          if (u.activeShift) {
            drawShiftRouteOnMap(u);
          }

          if (infoWindowRef.current) {
            const gpsAgeText = formatGpsAge(u.latestLocation?.gpsAgeSeconds);
            const recordedTime = u.latestLocation?.capturedAt
              ? new Date(u.latestLocation.capturedAt).toLocaleTimeString()
              : 'N/A';

            infoWindowRef.current.setContent(`
              <div style="font-family: system-ui, sans-serif; padding: 6px; min-width: 220px;">
                <div style="font-weight: 700; color: #0F172A; font-size: 13.5px; display: flex; align-items: center; justify-content: space-between;">
                  <span>${u.name}</span>
                  <span style="font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 8px; background: ${pinStatus === 'LIVE' ? '#DCFCE7' : pinStatus === 'STALE' ? '#FEF3C7' : '#F1F5F9'}; color: ${pinStatus === 'LIVE' ? '#15803D' : pinStatus === 'STALE' ? '#B45309' : '#64748B'};">
                    ${pinStatus}
                  </span>
                </div>
                <div style="font-size: 11.5px; color: #475569; margin-top: 5px; line-height: 1.5;">
                  <strong>Role:</strong> ${u.role} (${cat})<br/>
                  <strong>Department:</strong> ${u.department || 'Operations'}<br/>
                  <strong>GPS Age:</strong> ${gpsAgeText}<br/>
                  <strong>Captured:</strong> ${recordedTime}<br/>
                  <strong>Accuracy:</strong> ±${Math.round(u.latestLocation?.accuracy || 10)}m<br/>
                  ${u.latestLocation?.speed != null ? `<strong>Speed:</strong> ${Math.round(u.latestLocation.speed)} km/h<br/>` : ''}
                  ${u.activeShift ? `<strong>Shift Distance:</strong> ${u.activeShift.totalDistanceKm || 0} km` : ''}
                </div>
              </div>
            `);
            infoWindowRef.current.open(mapInstanceRef.current, marker);
          }
        });

        markersRef.current[uId] = marker;
      } else {
        marker.setPosition(latLng);
        marker.setIcon({
          url: iconUrl,
          scaledSize: new window.google.maps.Size(40, 52),
          anchor: new window.google.maps.Point(20, 50),
        });
        marker.setZIndex(isSelected ? 999 : pinStatus === 'LIVE' ? 200 : 100);
      }

      // Render Fixed Punch-In 'S' pin if on active shift
      const shift = u.activeShift;
      const punchLat = shift?.punchInCoordinates?.latitude || shift?.punchInLatitude;
      const punchLng = shift?.punchInCoordinates?.longitude || shift?.punchInLongitude;
      if (punchLat && punchLng) {
        const punchLatLng = new window.google.maps.LatLng(Number(punchLat), Number(punchLng));
        let startMarker = startMarkersRef.current[uId];
        if (!startMarker) {
          startMarker = new window.google.maps.Marker({
            position: punchLatLng,
            map: mapInstanceRef.current,
            title: `Shift Punch-In (Start): ${u.name}`,
            icon: {
              url: getStartPinSvg(),
              scaledSize: new window.google.maps.Size(32, 38),
              anchor: new window.google.maps.Point(16, 38),
            },
            zIndex: 90,
          });
          startMarker.addListener('click', () => {
            setSelectedUserId(uId);
            drawShiftRouteOnMap(u);
          });
          startMarkersRef.current[uId] = startMarker;
        } else {
          startMarker.setPosition(punchLatLng);
        }
      } else if (startMarkersRef.current[uId]) {
        startMarkersRef.current[uId].setMap(null);
        delete startMarkersRef.current[uId];
      }
    });

    // Clean obsolete markers
    Object.keys(markersRef.current).forEach((id) => {
      if (!activeUserIds.has(id)) {
        markersRef.current[id].setMap(null);
        delete markersRef.current[id];
      }
    });
    Object.keys(startMarkersRef.current).forEach((id) => {
      if (!activeUserIds.has(id)) {
        startMarkersRef.current[id].setMap(null);
        delete startMarkersRef.current[id];
      }
    });
  }, [mode, mapsLoaded, allUsers, selectedUserId, drawShiftRouteOnMap, clearAllMapMarkers, showAccuracyCircle]);

  // ─── 7. MAP TOOLBAR CONTROLS ───────────────────────────────────────────────
  const fitAllMarkers = useCallback(() => {
    if (!mapsLoaded || !mapInstanceRef.current || !window.google?.maps) return;
    const bounds = new window.google.maps.LatLngBounds();
    let count = 0;

    allUsers.forEach((u) => {
      if (u.latestLocation?.latitude && u.latestLocation?.longitude) {
        bounds.extend(new window.google.maps.LatLng(Number(u.latestLocation.latitude), Number(u.latestLocation.longitude)));
        count++;
      }
      const punchLat = u.activeShift?.punchInCoordinates?.latitude || u.activeShift?.punchInLatitude;
      const punchLng = u.activeShift?.punchInCoordinates?.longitude || u.activeShift?.punchInLongitude;
      if (punchLat && punchLng) {
        bounds.extend(new window.google.maps.LatLng(Number(punchLat), Number(punchLng)));
        count++;
      }
    });

    if (count > 0) {
      mapInstanceRef.current.fitBounds(bounds, { top: 60, bottom: 60, left: 60, right: 60 });
    } else {
      mapInstanceRef.current.panTo({ lat: 23.0225, lng: 72.5714 });
      mapInstanceRef.current.setZoom(12);
    }
  }, [mapsLoaded, allUsers]);

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

  // ─── 8. FILTERED USERS & SUMMARY METRICS ───────────────────────────────────
  const summaryMetrics = useMemo(() => {
    let live = 0;
    let stale = 0;
    let offline = 0;
    let noLocation = 0;
    let permissionDenied = 0;
    let onShift = 0;

    allUsers.forEach((u) => {
      if (u.activeShift) onShift++;
      if (u.overallStatus === 'LIVE') live++;
      else if (u.overallStatus === 'STALE') stale++;
      else if (u.overallStatus === 'OFFLINE') offline++;
      else if (u.overallStatus === 'PERMISSION_DENIED') permissionDenied++;
      else if (u.overallStatus === 'NO_LOCATION') noLocation++;
    });

    return {
      total: allUsers.length,
      live,
      stale,
      offline,
      noLocation,
      permissionDenied,
      onShift,
    };
  }, [allUsers]);

  const filteredUsers = useMemo(() => {
    return allUsers.filter((u) => {
      // Department / Role Filter
      if (selectedDepartment !== 'All') {
        const cat = u.roleCategory || getCategoryForRole(u.role);
        if (cat !== selectedDepartment && u.department !== selectedDepartment) return false;
      }

      // Status Filter
      if (statusFilter !== 'ALL' && u.overallStatus !== statusFilter) return false;

      // Shift Filter
      if (shiftFilter === 'ON_SHIFT' && !u.activeShift) return false;
      if (shiftFilter === 'OFF_SHIFT' && u.activeShift) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = (u.name || '').toLowerCase().includes(q);
        const matchesCode = (u.employeeCode || '').toLowerCase().includes(q);
        const matchesRole = (u.role || '').toLowerCase().includes(q);
        const matchesDept = (u.department || '').toLowerCase().includes(q);
        const matchesAddr = (u.activeShift?.punchInAddress || '').toLowerCase().includes(q);
        if (!matchesName && !matchesCode && !matchesRole && !matchesDept && !matchesAddr) return false;
      }

      return true;
    });
  }, [allUsers, selectedDepartment, statusFilter, shiftFilter, searchQuery]);

  const selectedUser = useMemo(() => {
    return allUsers.find((u) => u.userId === selectedUserId) || null;
  }, [allUsers, selectedUserId]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 72px)',
        background: '#F8FAFC',
        padding: '12px',
        gap: '10px',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        boxSizing: 'border-box',
      }}
    >
      {/* ── 1. HEADER BANNER & SUMMARY METRICS ─────────────────────────────────── */}
      <div
        style={{
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
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
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
            }}
          >
            <Lucide.MapPin size={22} />
          </div>
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: '18px',
                fontWeight: 700,
                color: '#0F172A',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              Super Admin Map — Real-Time Tracking
              <span
                style={{
                  fontSize: '10.5px',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '10px',
                  background: '#EFF6FF',
                  color: '#0284C7',
                }}
              >
                ALL AUTHORIZED USERS
              </span>
            </h2>
            <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748B' }}>
              Authoritative live GPS telemetry, device presence, verified freshness & movement history
            </p>
          </div>
        </div>

        {/* Real-time Connection Indicator & Summary Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '5px 10px', fontSize: '11.5px', color: '#0F172A', fontWeight: 600 }}>
            👥 Trackable Users: <strong>{summaryMetrics.total}</strong>
          </div>
          <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '8px', padding: '5px 10px', fontSize: '11.5px', color: '#15803D', fontWeight: 600 }}>
            🟢 Live (&lt;2m): <strong>{summaryMetrics.live}</strong>
          </div>
          <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '8px', padding: '5px 10px', fontSize: '11.5px', color: '#B45309', fontWeight: 600 }}>
            🟡 Stale (&gt;2m): <strong>{summaryMetrics.stale}</strong>
          </div>
          <div style={{ background: '#FEF2F2', border: '1px solid #FECDD3', borderRadius: '8px', padding: '5px 10px', fontSize: '11.5px', color: '#991B1B', fontWeight: 600 }}>
            🔴 Offline: <strong>{summaryMetrics.offline}</strong>
          </div>
          <div style={{ background: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '5px 10px', fontSize: '11.5px', color: '#475569', fontWeight: 600 }}>
            ⚪ No GPS: <strong>{summaryMetrics.noLocation}</strong>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 12px',
              borderRadius: '20px',
              background: liveStatus === 'LIVE' ? '#F0FDF4' : liveStatus === 'RECONNECTING' ? '#FFFBEB' : '#FEF2F2',
              border: `1px solid ${liveStatus === 'LIVE' ? '#BBF7D0' : liveStatus === 'RECONNECTING' ? '#FDE68A' : '#FCA5A5'}`,
              fontSize: '11px',
              fontWeight: 700,
            }}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: liveStatus === 'LIVE' ? '#16A34A' : liveStatus === 'RECONNECTING' ? '#F59E0B' : '#DC2626',
              }}
            />
            <span style={{ color: liveStatus === 'LIVE' ? '#15803D' : liveStatus === 'RECONNECTING' ? '#B45309' : '#B91C1C' }}>
              {liveStatus === 'LIVE' ? 'LIVE SOCKET' : liveStatus === 'RECONNECTING' ? 'RECONNECTING...' : 'SOCKET OFFLINE'}
            </span>
          </div>

          <button
            onClick={fetchAllData}
            title="Manual sync"
            style={{
              background: '#F8FAFC',
              border: '1px solid #CBD5E1',
              borderRadius: '8px',
              padding: '6px 10px',
              color: '#0F172A',
              fontSize: '11.5px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontWeight: 600,
            }}
          >
            <Lucide.RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            <span>{lastRestSync || 'Sync'}</span>
          </button>
        </div>
      </div>

      {/* ── 2. MODE SWITCHER TABS ────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
          padding: '6px',
          gap: '6px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          overflowX: 'auto',
        }}
      >
        {[
          { id: 'ALL_USERS', label: 'ALL USERS MAP', icon: '🗺️', badge: summaryMetrics.total, desc: 'Real-time tracking for every authorized user' },
          { id: 'ACTIVE_SHIFTS', label: 'ACTIVE SHIFTS', icon: '🟢', badge: summaryMetrics.onShift, desc: 'Punched-in staff shift paths & distance' },
          { id: 'ROUTE_HISTORY', label: 'ROUTE HISTORY', icon: '📜', badge: null, desc: 'Historical playback & detected field stops' },
          { id: 'DEVICE_SESSIONS', label: 'DEVICE SESSIONS', icon: '💻', badge: allUsers.reduce((acc, u) => acc + (u.sessions?.length || 0), 0), desc: 'Hardware presence & browser sessions' },
        ].map((tab) => {
          const isActive = mode === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setMode(tab.id);
                clearAllOverlays();
                if (tab.id === 'ROUTE_HISTORY') {
                  clearAllMapMarkers();
                }
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
                fontSize: '12px',
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
                <span
                  style={{
                    fontSize: '10.5px',
                    padding: '2px 7px',
                    borderRadius: '12px',
                    background: isActive ? 'rgba(255,255,255,0.25)' : '#E2E8F0',
                    color: isActive ? '#FFFFFF' : '#334155',
                    fontWeight: 700,
                  }}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── 3. MAIN WORKSPACE SPLIT VIEW ────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          flex: 1,
          gap: '12px',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Left Drawer */}
        <div
          style={{
            display: showDrawer ? 'flex' : 'none',
            flexDirection: 'column',
            width: isMobile ? 'calc(100% - 24px)' : '420px',
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
            overflow: 'hidden',
          }}
        >
          {/* ═══════════════════════════════════════════════════════════════════
              MODE: ALL_USERS or ACTIVE_SHIFTS
          ═══════════════════════════════════════════════════════════════════ */}
          {(mode === 'ALL_USERS' || mode === 'ACTIVE_SHIFTS') && (
            <>
              {/* Header Title & Actions */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>
                    {mode === 'ALL_USERS' ? 'Authorized Users Directory' : 'Active Shift Routes'}
                  </h3>
                  <span style={{ fontSize: '11px', color: '#64748B' }}>
                    Showing {filteredUsers.length} of {allUsers.length} employees
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={fitAllMarkers}
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
                    onClick={fetchAllData}
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
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: '#F8FAFC',
                  border: '1px solid #CBD5E1',
                  borderRadius: '8px',
                  padding: '6px 10px',
                  gap: '8px',
                }}
              >
                <Lucide.Search size={15} color="#64748B" />
                <input
                  type="text"
                  placeholder="Search by name, employee code, role, dept..."
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

              {/* Department Pills Bar */}
              <div
                style={{
                  display: 'flex',
                  gap: '4px',
                  overflowX: 'auto',
                  paddingBottom: '2px',
                }}
              >
                {['All', 'Sales', 'Plant Head', 'HR', 'Dispatch', 'Production', 'QC', 'Store', 'Finance', 'Procurement', 'Admin'].map((dept) => {
                  const isDeptActive = selectedDepartment === dept;
                  return (
                    <button
                      key={dept}
                      onClick={() => setSelectedDepartment(dept)}
                      style={{
                        padding: '3px 8px',
                        borderRadius: '12px',
                        fontSize: '10.5px',
                        fontWeight: isDeptActive ? 700 : 500,
                        border: `1px solid ${isDeptActive ? '#0284C7' : '#E2E8F0'}`,
                        background: isDeptActive ? '#0284C7' : '#F8FAFC',
                        color: isDeptActive ? '#FFFFFF' : '#475569',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {dept}
                    </button>
                  );
                })}
              </div>

              {/* Status Filter Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px' }}>
                {[
                  { id: 'ALL', label: 'All', count: allUsers.length },
                  { id: 'LIVE', label: '🟢 Live', count: summaryMetrics.live },
                  { id: 'STALE', label: '🟡 Stale', count: summaryMetrics.stale },
                  { id: 'OFFLINE', label: '🔴 Off', count: summaryMetrics.offline },
                  { id: 'NO_LOCATION', label: '⚪ No GPS', count: summaryMetrics.noLocation },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setStatusFilter(tab.id)}
                    style={{
                      background: statusFilter === tab.id ? '#EFF6FF' : '#F8FAFC',
                      border: `1px solid ${statusFilter === tab.id ? '#3B82F6' : '#E2E8F0'}`,
                      borderRadius: '6px',
                      padding: '4px 2px',
                      fontSize: '10.5px',
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

              {/* User List */}
              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  paddingRight: '2px',
                }}
              >
                {loading ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '40px', color: '#94A3B8' }}>
                    <Lucide.Loader2 className="animate-spin" size={24} />
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '36px 12px',
                      color: '#64748B',
                      fontSize: '12px',
                      background: '#F8FAFC',
                      borderRadius: '10px',
                      border: '1px dashed #CBD5E1',
                    }}
                  >
                    <Lucide.Users size={32} color="#0284C7" style={{ margin: '0 auto 10px auto', opacity: 0.8 }} />
                    <div style={{ fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>No Employees Match Filter</div>
                    Try choosing a different department or status filter.
                  </div>
                ) : (
                  filteredUsers.map((u) => {
                    const isSelected = selectedUserId === u.userId;
                    const cat = u.roleCategory || getCategoryForRole(u.role);
                    const cfg = ROLE_CONFIG[cat] || ROLE_CONFIG.Other;
                    const hasCoord = Boolean(u.latestLocation?.latitude && u.latestLocation?.longitude);
                    const status = u.overallStatus;
                    const gpsAgeSec = u.latestLocation?.gpsAgeSeconds;

                    return (
                      <div
                        key={u.userId}
                        onClick={() => {
                          setSelectedUserId(u.userId);
                          if (hasCoord && mapInstanceRef.current) {
                            mapInstanceRef.current.panTo({
                              lat: Number(u.latestLocation.latitude),
                              lng: Number(u.latestLocation.longitude),
                            });
                            showAccuracyCircle(
                              Number(u.latestLocation.latitude),
                              Number(u.latestLocation.longitude),
                              u.latestLocation.accuracy || 15
                            );
                          }
                          if (u.activeShift) {
                            drawShiftRouteOnMap(u);
                          }
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
                          boxShadow: isSelected ? '0 2px 6px rgba(2, 132, 199, 0.15)' : 'none',
                        }}
                      >
                        {/* Top Identity & Status Row */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div
                              style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '50%',
                                background: cfg.lightBg,
                                border: `1px solid ${cfg.borderColor}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '13px',
                              }}
                            >
                              {cfg.emoji}
                            </div>
                            <div>
                              <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                                {u.name}
                                {u.employeeCode && (
                                  <span style={{ fontSize: '10px', color: '#64748B', fontWeight: 500, marginLeft: '6px' }}>
                                    ({u.employeeCode})
                                  </span>
                                )}
                              </div>
                              <div style={{ fontSize: '11px', color: '#64748B', display: 'flex', gap: '6px' }}>
                                <span>{u.role}</span>
                                <span>•</span>
                                <span style={{ color: cfg.textColor, fontWeight: 600 }}>{cat}</span>
                              </div>
                            </div>
                          </div>

                          {/* Status Badge */}
                          <div
                            style={{
                              fontSize: '10px',
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: '10px',
                              background:
                                status === 'LIVE'
                                  ? '#DCFCE7'
                                  : status === 'STALE'
                                  ? '#FEF3C7'
                                  : status === 'PERMISSION_DENIED'
                                  ? '#FEE2E2'
                                  : '#F1F5F9',
                              color:
                                status === 'LIVE'
                                  ? '#15803D'
                                  : status === 'STALE'
                                  ? '#B45309'
                                  : status === 'PERMISSION_DENIED'
                                  ? '#DC2626'
                                  : '#64748B',
                              border: `1px solid ${
                                status === 'LIVE'
                                  ? '#BBF7D0'
                                  : status === 'STALE'
                                  ? '#FDE68A'
                                  : status === 'PERMISSION_DENIED'
                                  ? '#FECDD3'
                                  : '#E2E8F0'
                              }`,
                            }}
                          >
                            {status === 'LIVE'
                              ? '🟢 LIVE'
                              : status === 'STALE'
                              ? '🟡 STALE'
                              : status === 'PERMISSION_DENIED'
                              ? '⛔ DENIED'
                              : status === 'NO_LOCATION'
                              ? '⚪ NO GPS'
                              : '🔴 OFFLINE'}
                          </div>
                        </div>

                        {/* Telemetry & Truth Details */}
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            fontSize: '11px',
                            color: '#475569',
                            background: isSelected ? '#E0F2FE' : '#F8FAFC',
                            padding: '4px 8px',
                            borderRadius: '6px',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <Lucide.Clock size={12} color="#64748B" />
                            <span>GPS: {formatGpsAge(gpsAgeSec)}</span>
                          </div>
                          <div>
                            {u.activeShift ? (
                              <span style={{ color: '#0284C7', fontWeight: 600 }}>
                                🟢 Shift: {u.activeShift.totalDistanceKm || 0} km ({u.activeShift.totalStopsCount || 0} stops)
                              </span>
                            ) : (
                              <span style={{ color: '#64748B' }}>
                                {u.trackingStatus === 'ACTIVE_DEVICE' ? '💻 Web Active' : 'Off-Shift'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}

          {/* ═══════════════════════════════════════════════════════════════════
              MODE: ROUTE_HISTORY
          ═══════════════════════════════════════════════════════════════════ */}
          {mode === 'ROUTE_HISTORY' && (
            <>
              <div>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>Shift Route Playback</h3>
                <span style={{ fontSize: '11px', color: '#64748B' }}>
                  Select an employee and date to inspect movement timeline and detected stops
                </span>
              </div>

              {/* Employee Selector */}
              <div>
                <label style={{ fontSize: '11.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Select Staff Member:
                </label>
                <select
                  value={selectedHistoryEmployeeId}
                  onChange={(e) => {
                    setSelectedHistoryEmployeeId(e.target.value);
                    if (e.target.value && historyDate) {
                      loadHistoryRoute(e.target.value, historyDate);
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '7px 10px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '12.5px',
                    color: '#0F172A',
                    background: '#FFFFFF',
                  }}
                >
                  <option value="">-- Choose Employee --</option>
                  {allEmployees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.fullName || emp.name} ({emp.employeeCode || emp.jobTitle || 'Staff'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Selector */}
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
                    fontSize: '11px',
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
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Yesterday
                </button>
              </div>

              {/* History Content */}
              {historyLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '30px', color: '#94A3B8' }}>
                  <Lucide.Loader2 className="animate-spin" size={24} />
                </div>
              ) : historyError ? (
                <div style={{ padding: '14px', borderRadius: '8px', background: '#FEF2F2', border: '1px solid #FECDD3', color: '#991B1B', fontSize: '12px' }}>
                  <Lucide.AlertCircle size={15} style={{ display: 'inline', marginRight: '6px' }} />
                  {historyError}
                </div>
              ) : historyData && historyData.points?.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', flex: 1 }}>
                  {/* Shift Stats Card */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr 1fr',
                      gap: '6px',
                      background: '#F0F9FF',
                      border: '1px solid #BAE6FD',
                      borderRadius: '8px',
                      padding: '8px',
                      fontSize: '11px',
                    }}
                  >
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
                  <div
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px',
                      padding: '10px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#0F172A' }}>Playback Controls</span>
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
                      <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#0F172A' }}>Field Stationary Stops</div>
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
                              {new Date(st.arrivedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} –{' '}
                              {new Date(st.departedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              if (mapInstanceRef.current) {
                                mapInstanceRef.current.panTo({ lat: Number(st.latitude), lng: Number(st.longitude) });
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
                            Zoom
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '30px 10px', color: '#64748B', fontSize: '12px' }}>
                  Please select an employee and date to inspect recorded GPS shift telemetry.
                </div>
              )}
            </>
          )}

          {/* ═══════════════════════════════════════════════════════════════════
              MODE: DEVICE_SESSIONS
          ═══════════════════════════════════════════════════════════════════ */}
          {mode === 'DEVICE_SESSIONS' && (
            <>
              <div>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>Hardware & Web Presence</h3>
                <span style={{ fontSize: '11px', color: '#64748B' }}>
                  Inventory of active browser sessions, mobile devices & last seen heartbeats
                </span>
              </div>

              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  paddingRight: '2px',
                }}
              >
                {allUsers.map((u) => {
                  const s = extractAuthoritativeSession(u);
                  return (
                    <div
                      key={u.userId}
                      onClick={() => {
                        setSelectedUserId(u.userId);
                        if (u.latestLocation?.latitude && u.latestLocation?.longitude && mapInstanceRef.current) {
                          mapInstanceRef.current.panTo({
                            lat: Number(u.latestLocation.latitude),
                            lng: Number(u.latestLocation.longitude),
                          });
                          showAccuracyCircle(
                            Number(u.latestLocation.latitude),
                            Number(u.latestLocation.longitude),
                            u.latestLocation.accuracy || 20
                          );
                        }
                      }}
                      style={{
                        background: selectedUserId === u.userId ? '#F0F9FF' : '#FFFFFF',
                        border: `1.5px solid ${selectedUserId === u.userId ? '#0284C7' : '#E2E8F0'}`,
                        borderRadius: '10px',
                        padding: '10px 12px',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>{u.name}</div>
                          <div style={{ fontSize: '11px', color: '#64748B' }}>
                            {u.role} • {s?.deviceType || 'WEB'} ({s?.browser || s?.operatingSystem || 'Client'})
                          </div>
                        </div>
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: '10px',
                            background: s?.status === 'ONLINE' ? '#DCFCE7' : '#F1F5F9',
                            color: s?.status === 'ONLINE' ? '#15803D' : '#64748B',
                          }}
                        >
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

        {/* ── 4. RIGHT MAP CANVAS & DETAIL CARD OVERLAY ───────────────────────── */}
        <div
          style={{
            flex: 1,
            position: 'relative',
            borderRadius: '12px',
            overflow: 'hidden',
            border: '1px solid #CBD5E1',
            background: '#E2E8F0',
          }}
        >
          {/* Quick Map Controls Overlay */}
          <div
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              zIndex: 10,
              display: 'flex',
              gap: '6px',
            }}
          >
            {/* Follow User Toggle */}
            <button
              onClick={() => setFollowUser(!followUser)}
              title={followUser ? 'Stop following user' : 'Continuously center on selected user'}
              style={{
                background: followUser ? '#2563EB' : '#FFFFFF',
                color: followUser ? '#FFFFFF' : '#0F172A',
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
              <Lucide.Target size={14} /> Follow: {followUser ? 'ON' : 'OFF'}
            </button>

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
              onClick={fitAllMarkers}
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
              <Lucide.Crosshair size={14} /> Fit All
            </button>

            {/* Toggle Drawer button */}
            <button
              onClick={() => setShowDrawer(!showDrawer)}
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
              {showDrawer ? <Lucide.ChevronLeft size={14} /> : <Lucide.ChevronRight size={14} />}
              {showDrawer ? 'Hide Panel' : 'Show Panel'}
            </button>
          </div>

          {/* Selected User Detail Card Float Overlay */}
          {selectedUser && (
            <div
              style={{
                position: 'absolute',
                bottom: '16px',
                left: '16px',
                zIndex: 20,
                maxWidth: '440px',
                width: 'calc(100% - 32px)',
                background: '#FFFFFF',
                border: '1.5px solid #0284C7',
                borderRadius: '12px',
                padding: '14px',
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.15)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: ROLE_CONFIG[selectedUser.roleCategory]?.lightBg || '#EFF6FF',
                      border: `1px solid ${ROLE_CONFIG[selectedUser.roleCategory]?.borderColor || '#93C5FD'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '15px',
                    }}
                  >
                    {ROLE_CONFIG[selectedUser.roleCategory]?.emoji || '👤'}
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>
                      {selectedUser.name}
                      {selectedUser.employeeCode && (
                        <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 500, marginLeft: '6px' }}>
                          ({selectedUser.employeeCode})
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748B' }}>
                      {selectedUser.role} • {selectedUser.department || 'Operations'}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedUserId(null)}
                  style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '2px' }}
                >
                  <Lucide.X size={16} />
                </button>
              </div>

              {/* Stale Warning Banner if position exceeds freshness threshold */}
              {selectedUser.overallStatus === 'STALE' && (
                <div
                  style={{
                    background: '#FFFBEB',
                    border: '1.5px solid #FCD34D',
                    borderRadius: '8px',
                    padding: '8px 10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#92400E',
                    fontSize: '11.5px',
                    fontWeight: 600,
                  }}
                >
                  <Lucide.AlertTriangle size={16} color="#D97706" style={{ flexShrink: 0 }} />
                  <div>
                    <div>STALE GPS POSITION ({formatGpsAge(selectedUser.latestLocation?.gpsAgeSeconds)})</div>
                    <div style={{ fontSize: '10.5px', color: '#B45309', fontWeight: 400, marginTop: '2px' }}>
                      Device has not transmitted fresh telemetry. Displayed coordinate is the last verified recording.
                    </div>
                  </div>
                </div>
              )}

              {/* Coordinates & Accuracy Row */}
              {selectedUser.latestLocation ? (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    gap: '6px',
                    background: '#F8FAFC',
                    padding: '8px',
                    borderRadius: '8px',
                    fontSize: '11px',
                  }}
                >
                  <div>
                    <span style={{ color: '#64748B', display: 'block', fontSize: '9.5px', fontWeight: 600 }}>COORDINATES</span>
                    <strong style={{ color: '#0F172A' }}>
                      {Number(selectedUser.latestLocation.latitude).toFixed(4)}, {Number(selectedUser.latestLocation.longitude).toFixed(4)}
                    </strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748B', display: 'block', fontSize: '9.5px', fontWeight: 600 }}>ACCURACY</span>
                    <strong style={{ color: '#0284C7' }}>
                      ±{Math.round(selectedUser.latestLocation.accuracy || 10)}m
                    </strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748B', display: 'block', fontSize: '9.5px', fontWeight: 600 }}>SPEED</span>
                    <strong style={{ color: '#16A34A' }}>
                      {selectedUser.latestLocation.speed != null ? `${Math.round(selectedUser.latestLocation.speed)} km/h` : '0 km/h'}
                    </strong>
                  </div>
                </div>
              ) : (
                <div style={{ padding: '8px', background: '#F8FAFC', borderRadius: '8px', fontSize: '11.5px', color: '#64748B', textAlign: 'center' }}>
                  No GPS coordinates recorded for this account.
                </div>
              )}

              {/* Actions Footer */}
              <div style={{ display: 'flex', gap: '6px', marginTop: '2px' }}>
                {selectedUser.activeShift && (
                  <button
                    onClick={() => drawShiftRouteOnMap(selectedUser)}
                    style={{
                      flex: 1,
                      background: '#EFF6FF',
                      border: '1px solid #BFDBFE',
                      borderRadius: '6px',
                      padding: '6px',
                      color: '#1D4ED8',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                    }}
                  >
                    <Lucide.Route size={13} /> View Shift Route
                  </button>
                )}
                {selectedUser.employeeId && (
                  <button
                    onClick={() => {
                      setMode('ROUTE_HISTORY');
                      setSelectedHistoryEmployeeId(selectedUser.employeeId);
                      loadHistoryRoute(selectedUser.employeeId, historyDate);
                    }}
                    style={{
                      flex: 1,
                      background: '#F8FAFC',
                      border: '1px solid #CBD5E1',
                      borderRadius: '6px',
                      padding: '6px',
                      color: '#0F172A',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                    }}
                  >
                    <Lucide.History size={13} /> History Playback
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Maps Error or Google Maps Container */}
          {mapsError ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                padding: '20px',
                color: '#DC2626',
              }}
            >
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
