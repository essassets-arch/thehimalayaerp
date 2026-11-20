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

export const getLeadPinSvg = () => {
  const pinSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
      <defs>
        <filter id="leadShadow" x="-20%" y="-10%" width="140%" height="130%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.3)"/>
        </filter>
      </defs>
      <path d="M16 1 C7.5 1 2 6.8 2 15 C2 24.5 13.5 37 16 39 C18.5 37 30 24.5 30 15 C30 6.8 24.5 1 16 1 Z"
            fill="#7C3AED" stroke="#FFFFFF" stroke-width="2" filter="url(#leadShadow)"/>
      <circle cx="16" cy="15" r="9" fill="#FFFFFF"/>
      <text x="16" y="19" font-size="10.5" font-weight="bold" fill="#5B21B6" text-anchor="middle" font-family="system-ui, sans-serif">L</text>
    </svg>
  `;
  return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(pinSvg);
};

const DAY_ROUTE_COLORS = [
  '#2563EB', // Blue
  '#059669', // Emerald
  '#D97706', // Amber
  '#7C3AED', // Violet
  '#DC2626', // Red
  '#0891B2', // Cyan
  '#DB2777', // Pink
];

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
  const [overview7d, setOverview7d] = useState({});
  const [selectedUserAddress, setSelectedUserAddress] = useState('');

  // 7-Day Route History & Playback State
  const [allEmployees, setAllEmployees] = useState([]);
  const [selectedHistoryEmployeeId, setSelectedHistoryEmployeeId] = useState('');
  const [historyDate, setHistoryDate] = useState(() => getLocalDateString(0));
  const [historyFromDate, setHistoryFromDate] = useState(() => getLocalDateString(6));
  const [historyToDate, setHistoryToDate] = useState(() => getLocalDateString(0));
  const [historyRangeMode, setHistoryRangeMode] = useState('7D'); // '7D' | '14D' | 'CUSTOM'
  const [history7dData, setHistory7dData] = useState(null);
  const [activeHistoryDayDate, setActiveHistoryDayDate] = useState('ALL'); // 'ALL' | 'YYYY-MM-DD'
  const [historyData, setHistoryData] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState(null);
  const [playbackIndex, setPlaybackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [routeRenderMode, setRouteRenderMode] = useState('GPS'); // 'GPS' | 'ROADS'
  const [roadRouteInfo, setRoadRouteInfo] = useState(null); // { km, duration, loading, error }

  // Filters & Search (Sales Team focused by default, All Staff 1 click away)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('Sales');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL | LIVE | STALE | OFFLINE | NO_LOCATION
  const [shiftFilter, setShiftFilter] = useState('ALL'); // ALL | ON_SHIFT | OFF_SHIFT

  // Google Maps Refs
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({}); // userId -> Google Maps Marker
  const startMarkersRef = useRef({}); // userId/sessionId -> Punch-In Start Marker (S)
  const stopMarkersRef = useRef([]); // Stop Markers
  const leadMarkersRef = useRef([]); // CRM Lead Check-in Markers
  const multiPolylinesRef = useRef([]); // Multi-Day 7d Polylines
  const activePolylineRef = useRef(null); // Active Route Polyline
  const directionsRendererRef = useRef(null); // Optional Google Roads DirectionsRenderer
  const startMarkerRef = useRef(null);
  const endMarkerRef = useRef(null);
  const playbackMarkerRef = useRef(null);
  const accuracyCircleRef = useRef(null);
  const trafficLayerRef = useRef(null);
  const infoWindowRef = useRef(null);
  const socketRef = useRef(null);
  const addressCacheRef = useRef(new Map());
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

  // Clear overlays (polylines, stops, leads, playback pins)
  const clearAllOverlays = useCallback(() => {
    if (activePolylineRef.current) {
      activePolylineRef.current.setMap(null);
      activePolylineRef.current = null;
    }
    if (directionsRendererRef.current) {
      directionsRendererRef.current.setMap(null);
      directionsRendererRef.current = null;
    }
    setRoadRouteInfo(null);
    if (multiPolylinesRef.current && multiPolylinesRef.current.length > 0) {
      multiPolylinesRef.current.forEach((p) => p.setMap(null));
      multiPolylinesRef.current = [];
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
    if (leadMarkersRef.current && leadMarkersRef.current.length > 0) {
      leadMarkersRef.current.forEach((m) => m.setMap(null));
      leadMarkersRef.current = [];
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
      const [usersRes, routesRes, empRes, overviewRes] = await Promise.allSettled([
        backendFetch('/super-admin/live-users', { cacheTtlMs: 0 }).catch(() =>
          backendFetch('/location/live-users', { cacheTtlMs: 0 })
        ),
        backendFetch('/location/routes/live', { cacheTtlMs: 0 }),
        backendFetch('/hr/employees', { cacheTtlMs: 60000 }),
        backendFetch('/location/overview-7d?days=7', { cacheTtlMs: 30000 }),
      ]);

      const rawOverview =
        overviewRes.status === 'fulfilled'
          ? overviewRes.value?.byUserId || overviewRes.value?.data?.byUserId || {}
          : {};
      if (rawOverview && Object.keys(rawOverview).length > 0) {
        setOverview7d(rawOverview);
      }

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
            : empRes.value?.items || empRes.value?.data?.items || empRes.value?.data || []
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

  // ─── 5. 7-DAY & SINGLE-DAY HISTORICAL ROUTE LOADER & PLAYBACK ──────────────
  const drawHistoryRoute = useCallback(
    (points, stops, session, leads = [], strokeColor = '#0284C7', renderMode = 'GPS') => {
      if (!mapsLoaded || !mapInstanceRef.current || !window.google?.maps) return;

      clearAllOverlays();

      const path = [];
      const punchInLat = session?.punchInCoordinates?.latitude || session?.punchInLatitude || session?.punchIn?.latitude;
      const punchInLng = session?.punchInCoordinates?.longitude || session?.punchInLongitude || session?.punchIn?.longitude;
      if (punchInLat != null && punchInLng != null) {
        path.push(new window.google.maps.LatLng(Number(punchInLat), Number(punchInLng)));
      }
      (points || []).forEach((p) => {
        if (p.latitude != null && p.longitude != null) {
          path.push(new window.google.maps.LatLng(Number(p.latitude), Number(p.longitude)));
        }
      });
      const punchOutLat = session?.punchOutCoordinates?.latitude || session?.punchOutLatitude || session?.punchOut?.latitude;
      const punchOutLng = session?.punchOutCoordinates?.longitude || session?.punchOutLongitude || session?.punchOut?.longitude;
      if (punchOutLat != null && punchOutLng != null && session?.status === 'COMPLETED') {
        path.push(new window.google.maps.LatLng(Number(punchOutLat), Number(punchOutLng)));
      }

      if (path.length === 0) return;

      // Always draw directional GPS polyline (arrows show exact day circle travel direction)
      const arrowSymbol = {
        path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
        scale: 3,
        strokeColor: '#FFFFFF',
        strokeWeight: 1.2,
        fillColor: strokeColor,
        fillOpacity: 1,
      };

      if (path.length >= 2) {
        const polyline = new window.google.maps.Polyline({
          path,
          geodesic: true,
          strokeColor,
          strokeOpacity: renderMode === 'ROADS' ? 0.35 : 0.92,
          strokeWeight: renderMode === 'ROADS' ? 3 : 5,
          icons:
            renderMode === 'ROADS'
              ? []
              : [
                  {
                    icon: arrowSymbol,
                    offset: '24px',
                    repeat: '85px',
                  },
                ],
          map: mapInstanceRef.current,
        });
        activePolylineRef.current = polyline;
      }

      // Optional Google Maps Road-Following Mode (Punch-In -> Chronological Checkpoints -> Punch-Out)
      if (renderMode === 'ROADS' && path.length >= 2 && window.google.maps.DirectionsService) {
        setRoadRouteInfo({ loading: true, km: null, duration: null, error: null });
        const origin = path[0];
        const destination = path[path.length - 1];

        // Build up to 20 ordered waypoints prioritizing stops + evenly sampled GPS points
        const midCandidates = [];
        if (stops && stops.length > 0) {
          stops.forEach((st) => {
            midCandidates.push({
              lat: Number(st.latitude),
              lng: Number(st.longitude),
              t: new Date(st.arrivedAt).getTime(),
            });
          });
        }
        // Sample GPS breadcrumbs separated by >= 600m to capture the actual loop even without stops
        const approxMeters = (a, b) => {
          const dLat = ((b.lat - a.lat) * Math.PI) / 180;
          const dLng = ((b.lng - a.lng) * Math.PI) / 180;
          const x = Math.sin(dLat / 2) ** 2 + Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
          return 6371000 * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
        };
        let lastKept = { lat: origin.lat(), lng: origin.lng() };
        (points || []).forEach((p) => {
          const cand = { lat: Number(p.latitude), lng: Number(p.longitude), t: new Date(p.recordedAt).getTime() };
          if (approxMeters(lastKept, cand) >= 800) {
            midCandidates.push(cand);
            lastKept = cand;
          }
        });
        midCandidates.sort((a, b) => a.t - b.t);
        const dedupWaypoints = [];
        for (const c of midCandidates) {
          const prevW = dedupWaypoints[dedupWaypoints.length - 1];
          if (!prevW || approxMeters(prevW, c) >= 400) {
            dedupWaypoints.push(c);
          }
        }
        const maxWp = 20;
        let finalWp = dedupWaypoints;
        if (dedupWaypoints.length > maxWp) {
          const step = dedupWaypoints.length / maxWp;
          finalWp = Array.from({ length: maxWp }, (_, i) => dedupWaypoints[Math.floor(i * step)]);
        }

        const dirService = new window.google.maps.DirectionsService();
        dirService.route(
          {
            origin,
            destination,
            waypoints: finalWp.map((w) => ({
              location: new window.google.maps.LatLng(w.lat, w.lng),
              stopover: false,
            })),
            travelMode: window.google.maps.TravelMode.DRIVING,
            optimizeWaypoints: false,
          },
          (result, status) => {
            if (status === 'OK' && result && mapInstanceRef.current) {
              const renderer = new window.google.maps.DirectionsRenderer({
                map: mapInstanceRef.current,
                suppressMarkers: true,
                preserveViewport: true,
                polylineOptions: {
                  strokeColor,
                  strokeOpacity: 0.92,
                  strokeWeight: 5,
                  icons: [
                    {
                      icon: arrowSymbol,
                      offset: '30px',
                      repeat: '95px',
                    },
                  ],
                },
              });
              renderer.setDirections(result);
              directionsRendererRef.current = renderer;

              const legs = result.routes?.[0]?.legs || [];
              const totalMeters = legs.reduce((acc, l) => acc + (l.distance?.value || 0), 0);
              const totalSec = legs.reduce((acc, l) => acc + (l.duration?.value || 0), 0);
              const hrs = Math.floor(totalSec / 3600);
              const mins = Math.round((totalSec % 3600) / 60);
              setRoadRouteInfo({
                loading: false,
                km: Math.round((totalMeters / 1000) * 100) / 100,
                duration: hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`,
                error: null,
              });
            } else {
              // Gracefully restore crisp GPS arrows if Directions API is restricted or returns no route
              if (activePolylineRef.current) {
                activePolylineRef.current.setOptions({
                  strokeOpacity: 0.92,
                  strokeWeight: 5,
                  icons: [{ icon: arrowSymbol, offset: '24px', repeat: '85px' }],
                });
              }
              setRoadRouteInfo({
                loading: false,
                km: null,
                duration: null,
                error: 'Road snapping unavailable for this API key/route — showing exact GPS path.',
              });
            }
          }
        );
      }

      const bounds = new window.google.maps.LatLngBounds();
      path.forEach((p) => bounds.extend(p));

      // Start Pin (S)
      const startLat = punchInLat || (points && points[0] ? Number(points[0].latitude) : null);
      const startLng = punchInLng || (points && points[0] ? Number(points[0].longitude) : null);
      if (startLat != null && startLng != null) {
        const startMarker = new window.google.maps.Marker({
          position: new window.google.maps.LatLng(Number(startLat), Number(startLng)),
          map: mapInstanceRef.current,
          title: 'Day Start / Punch In',
          icon: {
            url: getStartPinSvg(),
            scaledSize: new window.google.maps.Size(34, 42),
            anchor: new window.google.maps.Point(17, 42),
          },
        });
        startMarker.addListener('click', () => {
          if (!infoWindowRef.current) return;
          const startTime = session?.punchInAt || points?.[0]?.recordedAt;
          infoWindowRef.current.setContent(`
            <div style="font-family: system-ui, sans-serif; padding: 6px; max-width: 240px;">
              <div style="font-weight: 700; color: #15803D; font-size: 13px;">🟢 Start / Punch In</div>
              <div style="font-size: 11px; color: #475569; margin-top: 4px;">
                <strong>Time:</strong> ${startTime ? new Date(startTime).toLocaleString() : 'N/A'}<br/>
                ${session?.punchInAddress ? `<strong>Address:</strong> ${session.punchInAddress}` : ''}
              </div>
            </div>
          `);
          infoWindowRef.current.open(mapInstanceRef.current, startMarker);
        });
        startMarkerRef.current = startMarker;
      }

      // End Pin (E)
      const endLat = punchOutLat || (points && points.length > 0 ? Number(points[points.length - 1].latitude) : startLat);
      const endLng = punchOutLng || (points && points.length > 0 ? Number(points[points.length - 1].longitude) : startLng);
      if (endLat != null && endLng != null) {
        const endMarker = new window.google.maps.Marker({
          position: new window.google.maps.LatLng(Number(endLat), Number(endLng)),
          map: mapInstanceRef.current,
          title: session?.status === 'COMPLETED' ? 'Shift Punch Out (End)' : 'Last Recorded Position',
          icon: {
            url: getEndPinSvg(),
            scaledSize: new window.google.maps.Size(34, 42),
            anchor: new window.google.maps.Point(17, 42),
          },
        });
        endMarker.addListener('click', () => {
          if (!infoWindowRef.current) return;
          const endTime = session?.punchOutAt || points?.[points.length - 1]?.recordedAt;
          infoWindowRef.current.setContent(`
            <div style="font-family: system-ui, sans-serif; padding: 6px; max-width: 240px;">
              <div style="font-weight: 700; color: #B91C1C; font-size: 13px;">🔴 ${session?.status === 'COMPLETED' ? 'Punch Out' : 'Last Position'}</div>
              <div style="font-size: 11px; color: #475569; margin-top: 4px;">
                <strong>Time:</strong> ${endTime ? new Date(endTime).toLocaleString() : 'N/A'}<br/>
                ${session?.punchOutAddress ? `<strong>Address:</strong> ${session.punchOutAddress}` : ''}
              </div>
            </div>
          `);
          infoWindowRef.current.open(mapInstanceRef.current, endMarker);
        });
        endMarkerRef.current = endMarker;
      }

      // Numbered Stop Pins with clickable address InfoWindow
      if (stops && stops.length > 0) {
        stops.forEach((st) => {
          const pos = new window.google.maps.LatLng(Number(st.latitude), Number(st.longitude));
          bounds.extend(pos);
          const stopMarker = new window.google.maps.Marker({
            position: pos,
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
              <div style="font-family: system-ui, sans-serif; padding: 6px; max-width: 250px;">
                <div style="font-weight: 700; color: #B45309; font-size: 13px;">🛑 Stop #${st.stopNumber} (${st.durationMinutes} mins)</div>
                <div style="font-size: 11px; color: #475569; margin-top: 4px; line-height: 1.45;">
                  <strong>Arrived:</strong> ${new Date(st.arrivedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}<br/>
                  <strong>Departed:</strong> ${new Date(st.departedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}<br/>
                  <strong>Location:</strong> ${st.address || `${Number(st.latitude).toFixed(4)}, ${Number(st.longitude).toFixed(4)}`}
                </div>
              </div>
            `);
            infoWindowRef.current.open(mapInstanceRef.current, stopMarker);
          });
          stopMarkersRef.current.push(stopMarker);
        });
      }

      // CRM Lead / Customer Visit Pins (Purple 'L')
      if (leads && leads.length > 0) {
        leads.forEach((lead) => {
          if (lead.latitude == null || lead.longitude == null) return;
          const pos = new window.google.maps.LatLng(Number(lead.latitude), Number(lead.longitude));
          bounds.extend(pos);
          const leadMarker = new window.google.maps.Marker({
            position: pos,
            map: mapInstanceRef.current,
            title: `Lead: ${lead.companyName}`,
            icon: {
              url: getLeadPinSvg(),
              scaledSize: new window.google.maps.Size(30, 38),
              anchor: new window.google.maps.Point(15, 38),
            },
          });
          leadMarker.addListener('click', () => {
            if (!infoWindowRef.current) return;
            infoWindowRef.current.setContent(`
              <div style="font-family: system-ui, sans-serif; padding: 6px; max-width: 250px;">
                <div style="font-weight: 700; color: #5B21B6; font-size: 13px;">🏢 Lead: ${lead.companyName}</div>
                <div style="font-size: 11px; color: #475569; margin-top: 4px; line-height: 1.45;">
                  <strong>Ref:</strong> ${lead.leadNumber || '—'}<br/>
                  <strong>Contact:</strong> ${lead.contactPerson || '—'}<br/>
                  <strong>Captured:</strong> ${new Date(lead.createdAt).toLocaleString()}<br/>
                  ${lead.address ? `<strong>Address:</strong> ${lead.address}` : ''}
                </div>
              </div>
            `);
            infoWindowRef.current.open(mapInstanceRef.current, leadMarker);
          });
          leadMarkersRef.current.push(leadMarker);
        });
      }

      mapInstanceRef.current.fitBounds(bounds, { top: 60, bottom: 60, left: 60, right: 60 });
    },
    [mapsLoaded, clearAllOverlays]
  );

  // Draw ALL 7 days simultaneously on Google Maps with color-coded polylines per day
  const drawAll7DaysCombined = useCallback(
    (payload) => {
      if (!mapsLoaded || !mapInstanceRef.current || !window.google?.maps || !payload?.days) return;
      clearAllOverlays();

      const bounds = new window.google.maps.LatLngBounds();
      let pointTotal = 0;

      payload.days.forEach((day, dayIdx) => {
        if (!day.hasData) return;
        const color = DAY_ROUTE_COLORS[dayIdx % DAY_ROUTE_COLORS.length];
        const path = [];

        if (day.punchIn?.latitude != null && day.punchIn?.longitude != null) {
          path.push(new window.google.maps.LatLng(Number(day.punchIn.latitude), Number(day.punchIn.longitude)));
        }
        (day.points || []).forEach((p) => {
          if (p.latitude != null && p.longitude != null) {
            path.push(new window.google.maps.LatLng(Number(p.latitude), Number(p.longitude)));
          }
        });

        path.forEach((pt) => {
          bounds.extend(pt);
          pointTotal++;
        });

        if (path.length >= 2) {
          const poly = new window.google.maps.Polyline({
            path,
            geodesic: true,
            strokeColor: color,
            strokeOpacity: 0.85,
            strokeWeight: 4,
            map: mapInstanceRef.current,
          });
          multiPolylinesRef.current.push(poly);
        }

        // Render stops for each day in combined view
        (day.stops || []).forEach((st) => {
          const pos = new window.google.maps.LatLng(Number(st.latitude), Number(st.longitude));
          bounds.extend(pos);
          pointTotal++;
          const m = new window.google.maps.Marker({
            position: pos,
            map: mapInstanceRef.current,
            title: `${day.dayLabel} — Stop #${st.stopNumber} (${st.durationMinutes} min)`,
            icon: {
              url: getStopPinSvg(st.stopNumber),
              scaledSize: new window.google.maps.Size(26, 32),
              anchor: new window.google.maps.Point(13, 32),
            },
          });
          m.addListener('click', () => {
            if (!infoWindowRef.current) return;
            infoWindowRef.current.setContent(`
              <div style="font-family: system-ui, sans-serif; padding: 6px; max-width: 250px;">
                <div style="font-weight: 700; color: ${color}; font-size: 12px;">${day.dayLabel}</div>
                <div style="font-weight: 700; color: #B45309; font-size: 13px; margin-top: 2px;">🛑 Stop #${st.stopNumber} (${st.durationMinutes} mins)</div>
                <div style="font-size: 11px; color: #475569; margin-top: 4px;">
                  <strong>Time:</strong> ${new Date(st.arrivedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – ${new Date(st.departedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}<br/>
                  <strong>Location:</strong> ${st.address || `${Number(st.latitude).toFixed(4)}, ${Number(st.longitude).toFixed(4)}`}
                </div>
              </div>
            `);
            infoWindowRef.current.open(mapInstanceRef.current, m);
          });
          stopMarkersRef.current.push(m);
        });

        // Render CRM leads with coordinates
        (day.leads || []).forEach((lead) => {
          if (lead.latitude == null || lead.longitude == null) return;
          const pos = new window.google.maps.LatLng(Number(lead.latitude), Number(lead.longitude));
          bounds.extend(pos);
          pointTotal++;
          const lm = new window.google.maps.Marker({
            position: pos,
            map: mapInstanceRef.current,
            title: `${day.dayLabel} — Lead: ${lead.companyName}`,
            icon: {
              url: getLeadPinSvg(),
              scaledSize: new window.google.maps.Size(26, 34),
              anchor: new window.google.maps.Point(13, 34),
            },
          });
          lm.addListener('click', () => {
            if (!infoWindowRef.current) return;
            infoWindowRef.current.setContent(`
              <div style="font-family: system-ui, sans-serif; padding: 6px; max-width: 250px;">
                <div style="font-weight: 700; color: #5B21B6; font-size: 13px;">🏢 ${lead.companyName}</div>
                <div style="font-size: 11px; color: #475569; margin-top: 4px;">
                  <strong>Date:</strong> ${day.dayLabel}<br/>
                  <strong>Contact:</strong> ${lead.contactPerson || '—'}<br/>
                  ${lead.address ? `<strong>Address:</strong> ${lead.address}` : ''}
                </div>
              </div>
            `);
            infoWindowRef.current.open(mapInstanceRef.current, lm);
          });
          leadMarkersRef.current.push(lm);
        });
      });

      if (pointTotal > 0) {
        mapInstanceRef.current.fitBounds(bounds, { top: 60, bottom: 60, left: 60, right: 60 });
      }
    },
    [mapsLoaded, clearAllOverlays]
  );

  // Focus a specific day inside the loaded 7-day dataset
  const selectHistoryDay = useCallback(
    (dayDate, payloadOverride = null, renderModeOverride = null) => {
      const source = payloadOverride || history7dData;
      if (!source) return;
      setActiveHistoryDayDate(dayDate);

      if (dayDate === 'ALL') {
        setHistoryData(null);
        drawAll7DaysCombined(source);
        return;
      }

      const dayIdx = source.days.findIndex((d) => d.date === dayDate);
      const dayObj = dayIdx >= 0 ? source.days[dayIdx] : null;
      if (!dayObj || (!dayObj.hasData && (!dayObj.points || dayObj.points.length === 0))) {
        clearAllOverlays();
        setHistoryData(null);
        return;
      }

      const sessionObj = {
        sessionId: dayObj.sessionId || `day-${dayObj.date}`,
        punchInAt: dayObj.punchIn?.at || dayObj.firstPingAt,
        punchInAddress: dayObj.punchIn?.address || null,
        punchInCoordinates: dayObj.punchIn ? { latitude: dayObj.punchIn.latitude, longitude: dayObj.punchIn.longitude } : null,
        punchOutAt: dayObj.punchOut?.at || dayObj.lastPingAt,
        punchOutAddress: dayObj.punchOut?.address || null,
        punchOutCoordinates: dayObj.punchOut ? { latitude: dayObj.punchOut.latitude, longitude: dayObj.punchOut.longitude } : null,
        status: dayObj.status,
        totalDistanceKm: dayObj.distanceKm,
        durationFormatted: dayObj.durationFormatted,
        totalPointsCount: dayObj.pointsCount,
        totalStopsCount: dayObj.stopsCount,
      };

      const color = DAY_ROUTE_COLORS[dayIdx % DAY_ROUTE_COLORS.length];
      const activeMode = renderModeOverride || routeRenderMode;

      setHistoryData({
        date: dayObj.date,
        dayLabel: dayObj.dayLabel,
        color,
        session: sessionObj,
        points: dayObj.points || [],
        stops: dayObj.stops || [],
        leads: dayObj.leads || [],
        roadmapSteps: dayObj.roadmapSteps || [],
        dayCircle: dayObj.dayCircle || null,
        accuracyMetrics: dayObj.accuracyMetrics || null,
      });

      drawHistoryRoute(dayObj.points || [], dayObj.stops || [], sessionObj, dayObj.leads || [], color, activeMode);
    },
    [history7dData, drawAll7DaysCombined, drawHistoryRoute, clearAllOverlays, routeRenderMode]
  );

  // Load 7-Day (or 14-Day / Custom) unified history from backend
  const load7DayHistory = useCallback(
    async (userIdOrEmpId, rangeOpts = {}) => {
      if (!userIdOrEmpId) return;
      setHistoryLoading(true);
      setHistoryError(null);
      setHistoryData(null);
      setHistory7dData(null);
      clearAllOverlays();

      try {
        const rangeMode = rangeOpts.mode || historyRangeMode;
        const fromStr = rangeOpts.from || historyFromDate;
        const toStr = rangeOpts.to || historyToDate;

        let url = `/location/users/${userIdOrEmpId}/history-7d?days=7`;
        if (rangeMode === '14D') {
          url = `/location/users/${userIdOrEmpId}/history-7d?days=14`;
        } else if (rangeMode === 'CUSTOM' && fromStr && toStr) {
          url = `/location/users/${userIdOrEmpId}/history-7d?from=${fromStr}&to=${toStr}`;
        }

        const raw = await backendFetch(url, { cacheTtlMs: 0 });
        const data = raw?.data || raw;

        if (!data || !Array.isArray(data.days)) {
          setHistoryError('Unable to load 7-day movement history for this user.');
          return;
        }

        setHistory7dData(data);

        if (data.totals?.daysTracked === 0) {
          setHistoryError('No GPS telemetry or punch-in records found in the selected date window for this account.');
          setActiveHistoryDayDate('ALL');
          return;
        }

        // Default directly onto the most recent tracked day's complete Day Circle Roadmap (Punch-In -> Punch-Out)
        const trackedDays = data.days.filter((d) => d.hasData && (d.points?.length > 0 || d.punchIn));
        if (trackedDays.length > 0) {
          const latestTracked = trackedDays[trackedDays.length - 1];
          selectHistoryDay(latestTracked.date, data);
        } else {
          setActiveHistoryDayDate('ALL');
          drawAll7DaysCombined(data);
        }
      } catch (err) {
        setHistoryError(err?.message || 'Failed to load 7-day history.');
      } finally {
        setHistoryLoading(false);
      }
    },
    [historyRangeMode, historyFromDate, historyToDate, clearAllOverlays, drawAll7DaysCombined, selectHistoryDay]
  );

  // Backward-compatible shortcut to jump straight into a user's Last 7 Days
  const openUser7DayHistory = useCallback(
    (targetId) => {
      if (!targetId) return;
      setMode('ROUTE_HISTORY');
      setSelectedHistoryEmployeeId(targetId);
      setHistoryRangeMode('7D');
      setShowDrawer(true);
      void load7DayHistory(targetId, { mode: '7D' });
    },
    [load7DayHistory]
  );

  // Export 7-Day Movement & Stops CSV Report
  const export7DayCsv = useCallback(() => {
    if (!history7dData?.days) return;
    const u = history7dData.user || {};
    const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const lines = [
      ['Date (IST)', 'Day', 'Status', 'Punch In', 'Punch In Address', 'Punch Out', 'Distance (km)', 'Active Duration', 'GPS Points', 'Stops Count', 'CRM Leads', 'Detected Stops Detail'].map(esc).join(','),
    ];

    history7dData.days.forEach((d) => {
      const stopSummary = (d.stops || [])
        .map(
          (s) =>
            `#${s.stopNumber} (${s.durationMinutes}m @ ${new Date(s.arrivedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}): ${s.address || `${s.latitude},${s.longitude}`}`
        )
        .join(' | ');
      lines.push(
        [
          d.date,
          d.dayLabel,
          d.status,
          d.punchIn?.at ? new Date(d.punchIn.at).toLocaleTimeString() : '—',
          d.punchIn?.address || '—',
          d.punchOut?.at ? new Date(d.punchOut.at).toLocaleTimeString() : '—',
          d.distanceKm,
          d.durationFormatted,
          d.pointsCount,
          d.stopsCount,
          d.leadsCount,
          stopSummary || '—',
        ]
          .map(esc)
          .join(',')
      );
    });

    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const dlUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = dlUrl;
    const safeName = (u.name || 'sales-user').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    a.download = `himalaya-7day-location-${safeName}-${history7dData.range?.from}-to-${history7dData.range?.to}.csv`;
    a.click();
    URL.revokeObjectURL(dlUrl);
  }, [history7dData]);

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
      // Enforce Active Shift tab filter cleanly
      if (mode === 'ACTIVE_SHIFTS' && !u.activeShift) return false;

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
  }, [allUsers, mode, selectedDepartment, statusFilter, shiftFilter, searchQuery]);

  const selectedUser = useMemo(() => {
    return allUsers.find((u) => u.userId === selectedUserId) || null;
  }, [allUsers, selectedUserId]);

  // Smart grouped user list for the 7-Day History dropdown (Sales with telemetry first!)
  const groupedHistoryUsers = useMemo(() => {
    const withStats = allUsers.map((u) => {
      const ov = overview7d[u.userId] || { daysTracked: 0, pointsCount: 0, punchInsCount: 0 };
      const isSales = (u.roleCategory || getCategoryForRole(u.role)) === 'Sales';
      return { ...u, ov, isSales };
    });

    const sortByActivity = (a, b) =>
      b.ov.pointsCount - a.ov.pointsCount ||
      b.ov.daysTracked - a.ov.daysTracked ||
      (a.name || '').localeCompare(b.name || '');

    return {
      salesActive: withStats.filter((u) => u.isSales && (u.ov.pointsCount > 0 || u.ov.daysTracked > 0)).sort(sortByActivity),
      otherActive: withStats.filter((u) => !u.isSales && (u.ov.pointsCount > 0 || u.ov.daysTracked > 0)).sort(sortByActivity),
      noData: withStats.filter((u) => u.ov.pointsCount === 0 && u.ov.daysTracked === 0).sort(sortByActivity),
    };
  }, [allUsers, overview7d]);

  // Resolve human-readable address for the currently selected live user (cached)
  useEffect(() => {
    const lat = selectedUser?.latestLocation?.latitude;
    const lng = selectedUser?.latestLocation?.longitude;
    if (lat == null || lng == null) {
      setSelectedUserAddress('');
      return;
    }

    const key = `${Number(lat).toFixed(4)},${Number(lng).toFixed(4)}`;
    if (addressCacheRef.current.has(key)) {
      setSelectedUserAddress(addressCacheRef.current.get(key));
      return;
    }

    let cancelled = false;
    setSelectedUserAddress('Resolving address...');
    backendFetch(`/location/reverse-geocode?lat=${lat}&lng=${lng}`, { cacheTtlMs: 300000 })
      .then((res) => {
        if (cancelled) return;
        const addr = res?.formattedAddress || res?.data?.formattedAddress || '';
        if (addr) {
          addressCacheRef.current.set(key, addr);
          setSelectedUserAddress(addr);
        } else {
          setSelectedUserAddress('');
        }
      })
      .catch(() => {
        if (!cancelled) setSelectedUserAddress('');
      });

    return () => {
      cancelled = true;
    };
  }, [selectedUser?.latestLocation?.latitude, selectedUser?.latestLocation?.longitude]);

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
          { id: 'ALL_USERS', label: 'LIVE MAP', icon: '🗺️', badge: summaryMetrics.total, desc: 'Real-time tracking for every authorized user' },
          { id: 'ACTIVE_SHIFTS', label: 'ACTIVE SHIFTS', icon: '🟢', badge: summaryMetrics.onShift, desc: 'Punched-in staff shift paths & distance' },
          { id: 'ROUTE_HISTORY', label: 'LAST 7 DAYS HISTORY', icon: '📅', badge: '7D', desc: '7-day sales movement timeline, stops & playback' },
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

                        {/* Telemetry & Truth Details + 1-Click 7-Day History Button */}
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '11px',
                            color: '#475569',
                            background: isSelected ? '#E0F2FE' : '#F8FAFC',
                            padding: '5px 8px',
                            borderRadius: '6px',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
                            <Lucide.Clock size={12} color="#64748B" />
                            <span>{formatGpsAge(gpsAgeSec)}</span>
                            {overview7d[u.userId]?.daysTracked > 0 && (
                              <span
                                style={{
                                  fontSize: '10px',
                                  fontWeight: 700,
                                  color: '#1D4ED8',
                                  background: '#DBEAFE',
                                  padding: '1px 5px',
                                  borderRadius: '6px',
                                }}
                              >
                                7d: {overview7d[u.userId].daysTracked}d • {overview7d[u.userId].pointsCount} pts
                              </span>
                            )}
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openUser7DayHistory(u.userId);
                            }}
                            title="Inspect Last 7 Days Route & Stops"
                            style={{
                              background: '#EFF6FF',
                              border: '1px solid #93C5FD',
                              borderRadius: '6px',
                              padding: '2px 7px',
                              color: '#1D4ED8',
                              fontSize: '10.5px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              whiteSpace: 'nowrap',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '3px',
                            }}
                          >
                            <Lucide.Calendar size={11} /> 7-Day
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}

          {/* ═══════════════════════════════════════════════════════════════════
              MODE: ROUTE_HISTORY (LAST 7 DAYS / 14 DAYS / CUSTOM RANGE)
          ═══════════════════════════════════════════════════════════════════ */}
          {mode === 'ROUTE_HISTORY' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>
                    Last 7 Days Sales Movement &amp; Stops
                  </h3>
                  <span style={{ fontSize: '11px', color: '#64748B' }}>
                    Unified IST timeline across GPS pings, shifts, stops &amp; CRM leads
                  </span>
                </div>
                {history7dData && history7dData.totals?.daysTracked > 0 && (
                  <button
                    onClick={export7DayCsv}
                    title="Export 7-Day Report as CSV"
                    style={{
                      background: '#ECFDF5',
                      border: '1px solid #6EE7B7',
                      borderRadius: '6px',
                      padding: '5px 8px',
                      color: '#047857',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <Lucide.Download size={12} /> CSV
                  </button>
                )}
              </div>

              {/* Smart Grouped Staff Selector (Sales with active telemetry at top!) */}
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Select Sales / Staff Member:
                </label>
                <select
                  value={selectedHistoryEmployeeId}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedHistoryEmployeeId(val);
                    if (val) {
                      void load7DayHistory(val);
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '7px 10px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '12px',
                    color: '#0F172A',
                    background: '#FFFFFF',
                    fontWeight: 600,
                  }}
                >
                  <option value="">-- Choose Sales / Staff Member --</option>
                  {groupedHistoryUsers.salesActive.length > 0 && (
                    <optgroup label="🛵 Sales Team (Active 7-Day Telemetry)">
                      {groupedHistoryUsers.salesActive.map((u) => (
                        <option key={u.userId} value={u.userId}>
                          {u.name} {u.employeeCode ? `(${u.employeeCode})` : ''} — {u.ov.daysTracked}d • {u.ov.pointsCount} pts
                        </option>
                      ))}
                    </optgroup>
                  )}
                  {groupedHistoryUsers.otherActive.length > 0 && (
                    <optgroup label="👥 Other Staff (Active 7-Day Telemetry)">
                      {groupedHistoryUsers.otherActive.map((u) => (
                        <option key={u.userId} value={u.userId}>
                          {u.name} ({u.role}) — {u.ov.daysTracked}d • {u.ov.pointsCount} pts
                        </option>
                      ))}
                    </optgroup>
                  )}
                  {groupedHistoryUsers.noData.length > 0 && (
                    <optgroup label="⚪ Accounts Without 7-Day GPS Data">
                      {groupedHistoryUsers.noData.map((u) => (
                        <option key={u.userId} value={u.userId}>
                          {u.name} {u.employeeCode ? `(${u.employeeCode})` : ''} — 0 pts
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>

              {/* Range Mode Pills: Last 7 Days | Last 14 Days | Custom */}
              <div style={{ display: 'flex', gap: '5px' }}>
                {[
                  { id: '7D', label: 'Last 7 Days' },
                  { id: '14D', label: 'Last 14 Days' },
                  { id: 'CUSTOM', label: 'Custom Range' },
                ].map((r) => (
                  <button
                    key={r.id}
                    onClick={() => {
                      setHistoryRangeMode(r.id);
                      if (selectedHistoryEmployeeId && r.id !== 'CUSTOM') {
                        void load7DayHistory(selectedHistoryEmployeeId, { mode: r.id });
                      }
                    }}
                    style={{
                      flex: 1,
                      padding: '5px 8px',
                      borderRadius: '7px',
                      border: `1px solid ${historyRangeMode === r.id ? '#1D4ED8' : '#CBD5E1'}`,
                      background: historyRangeMode === r.id ? '#EFF6FF' : '#F8FAFC',
                      color: historyRangeMode === r.id ? '#1D4ED8' : '#475569',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {r.label}
                  </button>
                ))}
              </div>

              {historyRangeMode === 'CUSTOM' && (
                <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                  <input
                    type="date"
                    value={historyFromDate}
                    onChange={(e) => setHistoryFromDate(e.target.value)}
                    style={{ flex: 1, padding: '5px 6px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '11px' }}
                  />
                  <span style={{ fontSize: '11px', color: '#64748B' }}>to</span>
                  <input
                    type="date"
                    value={historyToDate}
                    onChange={(e) => setHistoryToDate(e.target.value)}
                    style={{ flex: 1, padding: '5px 6px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '11px' }}
                  />
                  <button
                    onClick={() => {
                      if (selectedHistoryEmployeeId) {
                        void load7DayHistory(selectedHistoryEmployeeId, {
                          mode: 'CUSTOM',
                          from: historyFromDate,
                          to: historyToDate,
                        });
                      }
                    }}
                    style={{
                      background: '#2563EB',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '5px 10px',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Go
                  </button>
                </div>
              )}

              {/* 7-Day Content Body */}
              {historyLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px', color: '#64748B', gap: '8px', fontSize: '12px' }}>
                  <Lucide.Loader2 className="animate-spin" size={24} color="#2563EB" />
                  <span>Loading 7-day telemetry, stops &amp; addresses...</span>
                </div>
              ) : historyError ? (
                <div style={{ padding: '14px', borderRadius: '8px', background: '#FEF2F2', border: '1px solid #FECDD3', color: '#991B1B', fontSize: '12px' }}>
                  <Lucide.AlertCircle size={15} style={{ display: 'inline', marginRight: '6px' }} />
                  {historyError}
                </div>
              ) : history7dData ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', flex: 1, paddingRight: '2px' }}>
                  {/* 7-Day Summary KPI Strip */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(4, 1fr)',
                      gap: '5px',
                      background: 'linear-gradient(135deg, #EFF6FF, #F0F9FF)',
                      border: '1px solid #BAE6FD',
                      borderRadius: '8px',
                      padding: '8px',
                      textAlign: 'center',
                    }}
                  >
                    <div>
                      <span style={{ color: '#0369A1', display: 'block', fontSize: '9.5px', fontWeight: 700 }}>TOTAL KM</span>
                      <strong style={{ color: '#0F172A', fontSize: '13px' }}>{history7dData.totals?.totalDistanceKm || 0}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#0369A1', display: 'block', fontSize: '9.5px', fontWeight: 700 }}>TRACKED</span>
                      <strong style={{ color: '#15803D', fontSize: '13px' }}>
                        {history7dData.totals?.daysTracked || 0}/{history7dData.range?.daysCount || 7}d
                      </strong>
                    </div>
                    <div>
                      <span style={{ color: '#0369A1', display: 'block', fontSize: '9.5px', fontWeight: 700 }}>STOPS</span>
                      <strong style={{ color: '#D97706', fontSize: '13px' }}>{history7dData.totals?.totalStops || 0}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#0369A1', display: 'block', fontSize: '9.5px', fontWeight: 700 }}>LEADS</span>
                      <strong style={{ color: '#6D28D9', fontSize: '13px' }}>{history7dData.totals?.totalLeadsCaptured || 0}</strong>
                    </div>
                  </div>

                  {/* All Days Combined Toggle */}
                  <button
                    onClick={() => selectHistoryDay('ALL')}
                    style={{
                      width: '100%',
                      padding: '6px 10px',
                      borderRadius: '7px',
                      border: `1.5px solid ${activeHistoryDayDate === 'ALL' ? '#1E3A8A' : '#CBD5E1'}`,
                      background: activeHistoryDayDate === 'ALL' ? '#1E3A8A' : '#FFFFFF',
                      color: activeHistoryDayDate === 'ALL' ? '#FFFFFF' : '#0F172A',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                    }}
                  >
                    <Lucide.Layers size={13} />
                    Show All {history7dData.range?.daysCount || 7} Days Combined (Color-Coded)
                  </button>

                  {/* Interactive 7-Day Calendar Cards (newest day first for quick access) */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    {[...history7dData.days].reverse().map((day) => {
                      const origIdx = history7dData.days.findIndex((d) => d.date === day.date);
                      const dayColor = DAY_ROUTE_COLORS[origIdx % DAY_ROUTE_COLORS.length];
                      const isDaySelected = activeHistoryDayDate === day.date;
                      return (
                        <div
                          key={day.date}
                          onClick={() => {
                            if (day.hasData) selectHistoryDay(day.date);
                          }}
                          style={{
                            border: `1.5px solid ${isDaySelected ? dayColor : '#E2E8F0'}`,
                            borderLeft: `4px solid ${day.hasData ? dayColor : '#CBD5E1'}`,
                            background: isDaySelected ? '#F0F9FF' : day.hasData ? '#FFFFFF' : '#F8FAFC',
                            borderRadius: '8px',
                            padding: '7px 10px',
                            cursor: day.hasData ? 'pointer' : 'default',
                            opacity: day.hasData ? 1 : 0.65,
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A' }}>{day.dayLabel}</span>
                              {day.punchIn && (
                                <span style={{ fontSize: '9.5px', fontWeight: 700, background: '#DCFCE7', color: '#166534', padding: '1px 5px', borderRadius: '6px' }}>
                                  In {new Date(day.punchIn.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              )}
                              {day.punchOut && (
                                <span style={{ fontSize: '9.5px', fontWeight: 700, background: '#FEE2E2', color: '#991B1B', padding: '1px 5px', borderRadius: '6px' }}>
                                  Out {new Date(day.punchOut.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              )}
                            </div>
                            <span style={{ fontSize: '11.5px', fontWeight: 800, color: day.hasData ? '#0F172A' : '#94A3B8' }}>
                              {day.hasData ? `${day.distanceKm} km` : 'No Activity'}
                            </span>
                          </div>
                          {day.hasData && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: '#64748B', marginTop: '3px' }}>
                              <span>⏱ {day.durationFormatted} • 📍 {day.pointsCount} pts</span>
                              <span>
                                {day.stopsCount > 0 && <strong style={{ color: '#B45309', marginRight: '6px' }}>🛑 {day.stopsCount} stops</strong>}
                                {day.leadsCount > 0 && <strong style={{ color: '#6D28D9' }}>🏢 {day.leadsCount} leads</strong>}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Single-Day Complete Roadmap Circle (Punch-In -> Stops & Leads -> Punch-Out) + Playback */}
                  {historyData && (historyData.points?.length > 0 || historyData.roadmapSteps?.length > 0) && (
                    <div
                      style={{
                        background: '#FFFFFF',
                        border: '1.5px solid #93C5FD',
                        borderRadius: '10px',
                        padding: '10px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '9px',
                      }}
                    >
                      {/* Day Roadmap Header + Accuracy Quality Badge */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
                        <div>
                          <div style={{ fontSize: '12px', fontWeight: 800, color: '#0F172A' }}>
                            🔄 Day Roadmap — {historyData.dayLabel}
                          </div>
                          <div style={{ fontSize: '10px', color: '#64748B', marginTop: '1px' }}>
                            {historyData.session?.totalDistanceKm || 0} km GPS
                            {roadRouteInfo?.km != null ? ` • 🛣️ ${roadRouteInfo.km} km Road (${roadRouteInfo.duration})` : ''}
                            {' • '}
                            {historyData.session?.durationFormatted || '00h 00m'}
                          </div>
                        </div>

                        {historyData.accuracyMetrics && (
                          <span
                            title={`Median GPS accuracy: ±${historyData.accuracyMetrics.medianAccuracyMeters ?? '?'}m • High-accuracy fixes: ${historyData.accuracyMetrics.highAccuracyPercent}%${historyData.accuracyMetrics.filteredCoarsePoints > 0 ? ` • Filtered ${historyData.accuracyMetrics.filteredCoarsePoints} coarse IP pings` : ''}`}
                            style={{
                              fontSize: '9.5px',
                              fontWeight: 700,
                              padding: '2px 7px',
                              borderRadius: '10px',
                              background:
                                historyData.accuracyMetrics.qualityLabel === 'HIGH_GPS'
                                  ? '#DCFCE7'
                                  : historyData.accuracyMetrics.qualityLabel === 'MODERATE'
                                    ? '#FEF3C7'
                                    : '#F1F5F9',
                              color:
                                historyData.accuracyMetrics.qualityLabel === 'HIGH_GPS'
                                  ? '#166534'
                                  : historyData.accuracyMetrics.qualityLabel === 'MODERATE'
                                    ? '#92400E'
                                    : '#475569',
                            }}
                          >
                            {historyData.accuracyMetrics.qualityLabel === 'HIGH_GPS'
                              ? `🎯 GPS ±${historyData.accuracyMetrics.medianAccuracyMeters}m`
                              : historyData.accuracyMetrics.qualityLabel === 'MODERATE'
                                ? `📡 ±${historyData.accuracyMetrics.medianAccuracyMeters}m`
                                : '📍 Checkpoints'}
                          </span>
                        )}
                      </div>

                      {/* Circle Closure / Shift Summary Pill */}
                      {historyData.dayCircle && (
                        <div
                          style={{
                            fontSize: '10.5px',
                            padding: '5px 8px',
                            borderRadius: '7px',
                            background: historyData.dayCircle.circleClosed ? '#ECFDF5' : '#F8FAFC',
                            border: `1px solid ${historyData.dayCircle.circleClosed ? '#A7F3D0' : '#E2E8F0'}`,
                            color: historyData.dayCircle.circleClosed ? '#065F46' : '#334155',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: '6px',
                          }}
                        >
                          <span>
                            {historyData.dayCircle.circleClosed
                              ? `✅ Full Day Circle Closed (returned within ${historyData.dayCircle.returnDistanceFromStartKm} km of Punch-In)`
                              : historyData.session?.status === 'ACTIVE'
                                ? '🟢 Shift In Progress (Punch-Out pending)'
                                : historyData.dayCircle.returnDistanceFromStartKm != null
                                  ? `📍 Ended ${historyData.dayCircle.returnDistanceFromStartKm} km from Punch-In`
                                  : '📍 Single-location / Punch-In only'}
                          </span>
                        </div>
                      )}

                      {/* Path Mode Toggle: Exact GPS Arrows vs Google Follow Roads */}
                      {historyData.points?.length >= 2 && (
                        <div style={{ display: 'flex', gap: '5px' }}>
                          <button
                            onClick={() => {
                              setRouteRenderMode('GPS');
                              selectHistoryDay(historyData.date, null, 'GPS');
                            }}
                            style={{
                              flex: 1,
                              padding: '5px 6px',
                              borderRadius: '6px',
                              border: `1px solid ${routeRenderMode === 'GPS' ? '#2563EB' : '#CBD5E1'}`,
                              background: routeRenderMode === 'GPS' ? '#2563EB' : '#F8FAFC',
                              color: routeRenderMode === 'GPS' ? '#FFFFFF' : '#334155',
                              fontSize: '10.5px',
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            📍 Exact GPS Arrows
                          </button>
                          <button
                            onClick={() => {
                              setRouteRenderMode('ROADS');
                              selectHistoryDay(historyData.date, null, 'ROADS');
                            }}
                            style={{
                              flex: 1,
                              padding: '5px 6px',
                              borderRadius: '6px',
                              border: `1px solid ${routeRenderMode === 'ROADS' ? '#0F766E' : '#CBD5E1'}`,
                              background: routeRenderMode === 'ROADS' ? '#0F766E' : '#F8FAFC',
                              color: routeRenderMode === 'ROADS' ? '#FFFFFF' : '#334155',
                              fontSize: '10.5px',
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            🛣️ Follow Roads {roadRouteInfo?.loading ? '...' : ''}
                          </button>
                        </div>
                      )}

                      {roadRouteInfo?.error && (
                        <div style={{ fontSize: '10px', color: '#92400E', background: '#FFFBEB', padding: '4px 7px', borderRadius: '5px' }}>
                          {roadRouteInfo.error}
                        </div>
                      )}

                      {/* Playback Bar */}
                      {historyData.points?.length > 1 && (
                        <div style={{ background: '#F8FAFC', borderRadius: '7px', padding: '7px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#1E3A8A' }}>▶ Route Replay</span>
                            <div style={{ display: 'flex', gap: '3px' }}>
                              {[1, 2, 5, 10].map((spd) => (
                                <button
                                  key={spd}
                                  onClick={() => setPlaybackSpeed(spd)}
                                  style={{
                                    padding: '1px 5px',
                                    borderRadius: '4px',
                                    border: `1px solid ${playbackSpeed === spd ? '#2563EB' : '#CBD5E1'}`,
                                    background: playbackSpeed === spd ? '#EFF6FF' : '#FFFFFF',
                                    color: playbackSpeed === spd ? '#1D4ED8' : '#64748B',
                                    fontSize: '9.5px',
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
                                padding: '5px 10px',
                                fontSize: '11px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              {isPlaying ? <Lucide.Pause size={12} /> : <Lucide.Play size={12} />}
                              {isPlaying ? 'Pause' : 'Play'}
                            </button>

                            <input
                              type="range"
                              min={0}
                              max={Math.max(0, historyData.points.length - 1)}
                              value={Math.min(playbackIndex, Math.max(0, historyData.points.length - 1))}
                              onChange={(e) => {
                                const idx = Number(e.target.value);
                                setPlaybackIndex(idx);
                                updatePlaybackMarker(historyData.points[idx]);
                              }}
                              style={{ flex: 1 }}
                            />
                          </div>

                          {historyData.points[playbackIndex] && (
                            <div style={{ fontSize: '10px', color: '#64748B', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px' }}>
                              <span>
                                🕒 <strong style={{ color: '#0F172A' }}>{new Date(historyData.points[playbackIndex].recordedAt).toLocaleTimeString()}</strong>
                              </span>
                              <span>
                                🚀 <strong style={{ color: '#0284C7' }}>{Math.round(historyData.points[playbackIndex].speed || 0)} km/h</strong>
                              </span>
                              <span>
                                🎯 <strong style={{ color: '#475569' }}>±{Math.round(historyData.points[playbackIndex].accuracy || 15)}m</strong>
                              </span>
                              {historyData.points[playbackIndex].batteryLevel != null && (
                                <span>
                                  🔋 <strong style={{ color: '#15803D' }}>{Math.round(historyData.points[playbackIndex].batteryLevel)}%</strong>
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Chronological Vertical Day-Circle Stepper: Punch-In -> Stops & Leads -> Punch-Out */}
                      {historyData.roadmapSteps && historyData.roadmapSteps.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0px', marginTop: '2px' }}>
                          <div style={{ fontSize: '11px', fontWeight: 800, color: '#0F172A', marginBottom: '6px' }}>
                            🧭 Day Circle Timeline ({historyData.roadmapSteps.length} Checkpoints)
                          </div>
                          {historyData.roadmapSteps.map((step, idx) => {
                            const isLast = idx === historyData.roadmapSteps.length - 1;
                            const badgeStyle =
                              step.type === 'PUNCH_IN'
                                ? { bg: '#16A34A', light: '#F0FDF4', border: '#86EFAC', label: 'IN', text: '#166534' }
                                : step.type === 'PUNCH_OUT'
                                  ? { bg: '#DC2626', light: '#FEF2F2', border: '#FCA5A5', label: 'OUT', text: '#991B1B' }
                                  : step.type === 'LAST_POSITION'
                                    ? { bg: '#2563EB', light: '#EFF6FF', border: '#93C5FD', label: 'NOW', text: '#1E40AF' }
                                    : step.type === 'LEAD'
                                      ? { bg: '#7C3AED', light: '#F5F3FF', border: '#C4B5FD', label: 'L', text: '#5B21B6' }
                                      : { bg: '#D97706', light: '#FFFBEB', border: '#FCD34D', label: String(step.stopNumber || idx), text: '#92400E' };

                            const hasCoord = step.latitude != null && step.longitude != null;

                            return (
                              <div key={`${step.type}-${step.stepNumber}`} style={{ display: 'flex', gap: '8px', alignItems: 'stretch' }}>
                                {/* Vertical Spine & Circle Node */}
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '26px', flexShrink: 0 }}>
                                  <div
                                    style={{
                                      width: '24px',
                                      height: '24px',
                                      borderRadius: '50%',
                                      background: badgeStyle.bg,
                                      color: '#FFFFFF',
                                      fontSize: '9px',
                                      fontWeight: 800,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                                      flexShrink: 0,
                                    }}
                                  >
                                    {badgeStyle.label}
                                  </div>
                                  {!isLast && (
                                    <div
                                      style={{
                                        width: '2px',
                                        flex: 1,
                                        minHeight: '14px',
                                        background: '#CBD5E1',
                                        margin: '2px 0',
                                      }}
                                    />
                                  )}
                                </div>

                                {/* Step Detail Card */}
                                <div
                                  onClick={() => {
                                    if (hasCoord && mapInstanceRef.current) {
                                      const pos = { lat: Number(step.latitude), lng: Number(step.longitude) };
                                      mapInstanceRef.current.panTo(pos);
                                      mapInstanceRef.current.setZoom(16);
                                      if (infoWindowRef.current) {
                                        infoWindowRef.current.setPosition(pos);
                                        infoWindowRef.current.setContent(`
                                          <div style="font-family: system-ui, sans-serif; padding: 6px; max-width: 240px;">
                                            <div style="font-weight: 700; color: ${badgeStyle.text}; font-size: 13px;">${step.title}</div>
                                            <div style="font-size: 11px; color: #475569; margin-top: 3px; line-height: 1.4;">
                                              <strong>Time:</strong> ${new Date(step.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}${step.endTime ? ` – ${new Date(step.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}<br/>
                                              ${step.address ? `<strong>Location:</strong> ${step.address}` : `<strong>GPS:</strong> ${Number(step.latitude).toFixed(4)}, ${Number(step.longitude).toFixed(4)}`}
                                            </div>
                                          </div>
                                        `);
                                        infoWindowRef.current.open(mapInstanceRef.current);
                                      }
                                    }
                                  }}
                                  style={{
                                    flex: 1,
                                    minWidth: 0,
                                    background: badgeStyle.light,
                                    border: `1px solid ${badgeStyle.border}`,
                                    borderRadius: '7px',
                                    padding: '6px 8px',
                                    marginBottom: isLast ? '0px' : '6px',
                                    cursor: hasCoord ? 'pointer' : 'default',
                                  }}
                                >
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '4px' }}>
                                    <span style={{ fontSize: '11px', fontWeight: 700, color: badgeStyle.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                      {step.title}
                                    </span>
                                    <span style={{ fontSize: '10px', fontWeight: 700, color: '#0F172A', flexShrink: 0 }}>
                                      {new Date(step.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                      {step.endTime ? `–${new Date(step.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
                                    </span>
                                  </div>
                                  {step.address && (
                                    <div
                                      style={{
                                        fontSize: '9.8px',
                                        color: '#475569',
                                        marginTop: '2px',
                                        lineHeight: 1.35,
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                      }}
                                      title={step.address}
                                    >
                                      📍 {step.address}
                                    </div>
                                  )}
                                  {step.legDistanceKm != null && step.legDistanceKm > 0 && (
                                    <div style={{ fontSize: '9.5px', color: '#64748B', marginTop: '2px', fontWeight: 600 }}>
                                      ↳ Moved ~{step.legDistanceKm} km from previous checkpoint
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '28px 12px', color: '#64748B', fontSize: '12px', background: '#F8FAFC', borderRadius: '8px', border: '1px dashed #CBD5E1' }}>
                  <Lucide.Calendar size={28} color="#2563EB" style={{ margin: '0 auto 8px auto', opacity: 0.85 }} />
                  <div style={{ fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>Select a Sales Executive</div>
                  Pick any employee above (or click <strong>7-Day</strong> on any card) to inspect their last 7 days of routes, distances, field stops &amp; CRM leads.
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

              {/* Resolved Human-Readable Address Banner */}
              {selectedUserAddress && (
                <div
                  style={{
                    background: '#F0F9FF',
                    border: '1px solid #BAE6FD',
                    borderRadius: '7px',
                    padding: '6px 9px',
                    fontSize: '11px',
                    color: '#0C4A6E',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '6px',
                    lineHeight: 1.35,
                  }}
                >
                  <Lucide.MapPin size={13} color="#0284C7" style={{ flexShrink: 0, marginTop: '1px' }} />
                  <span>{selectedUserAddress}</span>
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
                    <Lucide.Route size={13} /> Today&apos;s Shift
                  </button>
                )}
                <button
                  onClick={() => openUser7DayHistory(selectedUser.userId)}
                  style={{
                    flex: 1,
                    background: '#1E3A8A',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '6px 10px',
                    color: '#FFFFFF',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                  }}
                >
                  <Lucide.Calendar size={13} /> View Last 7 Days
                </button>
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
