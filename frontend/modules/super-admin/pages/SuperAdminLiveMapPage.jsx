'use client';

import 'leaflet/dist/leaflet.css';
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

const formatAccuracyBadge = (accuracy) => {
  if (accuracy === null || accuracy === undefined || isNaN(Number(accuracy))) return null;
  const m = Math.round(Number(accuracy));
  if (m <= 50) return { label: `GPS ±${m}m`, bg: '#DCFCE7', color: '#166534', border: '#86EFAC', icon: '🎯' };
  if (m <= 150) return { label: `GPS ±${m}m`, bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE', icon: '📍' };
  if (m <= 1000) return { label: `Wi-Fi ±${m}m`, bg: '#FEF3C7', color: '#92400E', border: '#FCD34D', icon: '📡' };
  const km = (m / 1000).toFixed(1);
  return { label: `IP ~${km}km`, bg: '#FEE2E2', color: '#991B1B', border: '#FCA5A5', icon: '⚠️' };
};

const haversineMeters = (lat1, lng1, lat2, lng2) => {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const calcBearingDeg = (lat1, lng1, lat2, lng2) => {
  const y = Math.sin(((lng2 - lng1) * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180);
  const x =
    Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
    Math.sin((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.cos(((lng2 - lng1) * Math.PI) / 180);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
};

const escapeHtml = (v) =>
  String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

// ─── FREE OPENSTREETMAP / CARTO / SATELLITE TILE LAYERS ──────────────────────
const MAP_TILE_LAYERS = {
  clean: {
    id: 'clean',
    label: 'Clean Map',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    maxZoom: 19,
  },
  osm: {
    id: 'osm',
    label: 'OSM Street',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19,
  },
  satellite: {
    id: 'satellite',
    label: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri',
    maxZoom: 18,
  },
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
  if (r.includes('BACK_OFFICE') || r.includes('BACKOFFICE') || r.includes('DATA_ANALYTICS') || r.includes('COORDINATOR')) {
    return 'Back Office';
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
  'Back Office': {
    name: 'Back Office',
    shortName: 'Back Office',
    color: '#0891B2',
    accentColor: '#0E7490',
    lightBg: '#ECFEFF',
    borderColor: '#67E8F9',
    textColor: '#0E7490',
    glowColor: 'rgba(8, 145, 178, 0.5)',
    iconType: 'back_office',
    emoji: '🖥️',
    description: 'Back Office & Operations Coordination',
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

    const aAcc = a.location?.accuracy ?? 999999;
    const bAcc = b.location?.accuracy ?? 999999;
    const aGoodGps = a.location?.latitude && aAcc <= 150 ? 1 : 0;
    const bGoodGps = b.location?.latitude && bAcc <= 150 ? 1 : 0;
    if (aGoodGps !== bGoodGps) return bGoodGps - aGoodGps;

    const aTime = a.lastSeenAt ? new Date(a.lastSeenAt).getTime() : 0;
    const bTime = b.lastSeenAt ? new Date(b.lastSeenAt).getTime() : 0;
    return bTime - aTime;
  });

  return sessions[0];
};

// ─── HIGH-QUALITY SVG PIN MARKERS ─────────────────────────────────────────────
const buildPinSvgMarkup = (category, statusMode = 'OFFLINE', isHighlighted = false) => {
  const cfg = ROLE_CONFIG[category] || ROLE_CONFIG.Other;
  const pinColor = cfg.color;

  let statusColor = '#94A3B8';
  if (statusMode === 'LIVE') statusColor = '#10B981';
  else if (statusMode === 'STALE') statusColor = '#F59E0B';
  else if (statusMode === 'PERMISSION_DENIED') statusColor = '#EF4444';

  const strokeColor = isHighlighted ? '#F59E0B' : '#FFFFFF';
  const strokeWidth = isHighlighted ? '3.5' : '2';

  const iconPaths = {
    bike: '<path d="M13 18a2 2 0 1 0 4 0a2 2 0 1 0-4 0 M23 18a2 2 0 1 0 4 0a2 2 0 1 0-4 0 M15 18l3-6h4 M18 12l2 6 M17 9h3" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
    plant_head: '<path d="M12 21V9l4 4V9l4 4V9l4 4v8H12z" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
    hr: '<path d="M20 15a3 3 0 1 0 0-6a3 3 0 0 0 0 6z M14 21a6 6 0 0 1 12 0" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
    dispatch: '<rect x="11" y="11" width="11" height="8" rx="1" stroke="#FFFFFF" stroke-width="1.6" fill="none"/><path d="M22 14h4l2 3v2h-6v-5z" stroke="#FFFFFF" stroke-width="1.6" fill="none"/><circle cx="14" cy="20" r="1.5" fill="#FFFFFF"/><circle cx="25" cy="20" r="1.5" fill="#FFFFFF"/>',
    production: '<circle cx="20" cy="16" r="3" stroke="#FFFFFF" stroke-width="1.6" fill="none"/><path d="M20 10v2M20 20v2M14 16h2M24 16h2M15.5 11.5l1.5 1.5M23 19l1.5 1.5M15.5 20.5l1.5-1.5M23 13l1.5-1.5" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round"/>',
    back_office: '<rect x="12" y="11" width="16" height="10" rx="1.5" stroke="#FFFFFF" stroke-width="1.6" fill="none"/><path d="M17 24h6M20 21v3" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round"/>',
    qc: '<path d="M20 10l6 2.5v5c0 4-2.5 7-6 8.5c-3.5-1.5-6-4.5-6-8.5v-5l6-2.5z" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M18 17l1.5 1.5l3-3" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
    store: '<path d="M13 13l7-3l7 3v8l-7 3l-7-3v-8z M13 13l7 3l7-3 M20 16v8" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
    finance: '<rect x="12" y="11" width="16" height="11" rx="2" stroke="#FFFFFF" stroke-width="1.6" fill="none"/><line x1="12" y1="15" x2="28" y2="15" stroke="#FFFFFF" stroke-width="1.6"/><circle cx="16" cy="19" r="1" fill="#FFFFFF"/>',
    procurement: '<circle cx="16" cy="21" r="1.5" fill="#FFFFFF"/><circle cx="24" cy="21" r="1.5" fill="#FFFFFF"/><path d="M11 11h2.5l2 8h9l2-6H15" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
    admin: '<path d="M13 21V11l7-3l7 3v10 M17 21v-4h6v4 M16 14h1 M23 14h1" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
    other: '<circle cx="20" cy="14" r="3" stroke="#FFFFFF" stroke-width="1.6" fill="none"/><path d="M14 21c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round" fill="none"/>',
  };

  const chosenPath = iconPaths[cfg.iconType] || iconPaths.other;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="38" height="48" viewBox="0 0 40 52" style="filter:drop-shadow(0 3px 4px rgba(15,23,42,0.35));display:block;">
    <path d="M20 2 C9 2 2 9 2 20 C2 31 16 48 20 50 C24 48 38 31 38 20 C38 9 31 2 20 2 Z"
          fill="${pinColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}" />
    <circle cx="20" cy="17" r="12" fill="rgba(0,0,0,0.18)" />
    ${chosenPath}
    <circle cx="31" cy="9" r="5" fill="${statusColor}" stroke="#FFFFFF" stroke-width="2" />
  </svg>`;
};

export const generatePinSvg = (category, statusMode = 'OFFLINE', isHighlighted = false) =>
  'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(buildPinSvgMarkup(category, statusMode, isHighlighted));

const buildBadgePinMarkup = (bg, fg, label, w = 32, h = 40) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 36 46" style="filter:drop-shadow(0 2px 3px rgba(0,0,0,0.3));display:block;">
  <path d="M18 1 C8.5 1 2 7.5 2 17 C2 28 15 43 18 45 C21 43 34 28 34 17 C34 7.5 27.5 1 18 1 Z" fill="${bg}" stroke="#FFFFFF" stroke-width="2"/>
  <circle cx="18" cy="17" r="10" fill="#FFFFFF"/>
  <text x="18" y="21" font-size="11.5" font-weight="bold" fill="${fg}" text-anchor="middle" font-family="system-ui, sans-serif">${escapeHtml(label)}</text>
</svg>`;

export const getStopPinSvg = (stopNumber) =>
  'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(buildBadgePinMarkup('#D97706', '#92400E', stopNumber));

export const getStartPinSvg = () =>
  'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(buildBadgePinMarkup('#16A34A', '#15803D', 'S'));

export const getEndPinSvg = () =>
  'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(buildBadgePinMarkup('#DC2626', '#991B1B', 'E'));

export const getLeadPinSvg = () =>
  'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(buildBadgePinMarkup('#7C3AED', '#5B21B6', 'L'));

const DAY_ROUTE_COLORS = [
  '#2563EB', // Blue
  '#059669', // Emerald
  '#D97706', // Amber
  '#7C3AED', // Violet
  '#DC2626', // Red
  '#0891B2', // Cyan
  '#DB2777', // Pink
];

const DEPARTMENT_PILLS = [
  'All',
  'Sales',
  'Plant Head',
  'HR',
  'Dispatch',
  'Production',
  'Back Office',
  'QC',
  'Store',
  'Finance',
  'Procurement',
  'Admin',
];

export default function SuperAdminLiveMapPage({ portalMode = 'SUPER_ADMIN' } = {}) {
  const isHrPortal = portalMode === 'HR';
  const { accessToken } = useAuthStore();

  // ─── 4 OPERATIONAL MODES ───────────────────────────────────────────────────
  const [mode, setMode] = useState('ALL_USERS'); // ALL_USERS | ACTIVE_SHIFTS | ROUTE_HISTORY | DEVICE_SESSIONS

  // UI & Connection States (initialLoading is ONLY true before first load — never wipes list on refresh!)
  const [initialLoading, setInitialLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [mapsError, setMapsError] = useState(null);
  const [tileLayerKey, setTileLayerKey] = useState('clean'); // clean | osm | satellite
  const [liveStatus, setLiveStatus] = useState('OFFLINE'); // LIVE | RECONNECTING | OFFLINE
  const [lastRestSync, setLastRestSync] = useState(null);
  const [showDrawer, setShowDrawer] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [followUser, setFollowUser] = useState(false);
  const [expandedClusterKey, setExpandedClusterKey] = useState(null);
  const [expandedDeviceUserId, setExpandedDeviceUserId] = useState(null);
  const [zoomVersion, setZoomVersion] = useState(0);
  const [nowTick, setNowTick] = useState(() => Date.now());

  // Unified Users & Shifts State
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [overview7d, setOverview7d] = useState({});
  const [selectedUserAddress, setSelectedUserAddress] = useState('');

  // 7-Day Route History & Playback State
  const [selectedHistoryEmployeeId, setSelectedHistoryEmployeeId] = useState('');
  const [historyFromDate, setHistoryFromDate] = useState(() => getLocalDateString(6));
  const [historyToDate, setHistoryToDate] = useState(() => getLocalDateString(0));
  const [historyRangeMode, setHistoryRangeMode] = useState('7D'); // 7D | 14D | CUSTOM
  const [history7dData, setHistory7dData] = useState(null);
  const [activeHistoryDayDate, setActiveHistoryDayDate] = useState('ALL');
  const [historyData, setHistoryData] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState(null);
  const [playbackIndex, setPlaybackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [routeRenderMode, setRouteRenderMode] = useState('GPS'); // GPS | ROADS
  const [roadRouteInfo, setRoadRouteInfo] = useState(null);

  // Filters & Search (Default 'All' so no department looks missing on open)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL | LIVE | STALE | OFFLINE | NO_LOCATION

  // Leaflet & Runtime Refs
  const mapContainerRef = useRef(null);
  const leafletRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const userLayerRef = useRef(null);
  const overlayLayerRef = useRef(null);
  const accuracyCircleRef = useRef(null);
  const playbackMarkerRef = useRef(null);
  const activePolylineRef = useRef(null);
  const socketRef = useRef(null);
  const addressCacheRef = useRef(new Map());
  const lastOverviewFetchRef = useRef(0);
  const hasLoadedOnceRef = useRef(false);
  const fetchInFlightRef = useRef(false);
  const usersByIdRef = useRef(new Map());
  const followUserRef = useRef(followUser);
  followUserRef.current = followUser;
  const selectedUserIdRef = useRef(selectedUserId);
  selectedUserIdRef.current = selectedUserId;
  const liveStatusRef = useRef(liveStatus);
  liveStatusRef.current = liveStatus;

  // Keep fresh user lookup map for click popups (eliminates stale closures!)
  useEffect(() => {
    const map = new Map();
    allUsers.forEach((u) => map.set(u.userId, u));
    usersByIdRef.current = map;
  }, [allUsers]);

  // Live 15s clock tick so GPS age counters advance smoothly without flickering the DOM
  useEffect(() => {
    const id = setInterval(() => setNowTick(Date.now()), 15000);
    return () => clearInterval(id);
  }, []);

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

  // Re-invalidate Leaflet map container size when drawer toggles
  useEffect(() => {
    if (mapInstanceRef.current) {
      const t = setTimeout(() => {
        mapInstanceRef.current?.invalidateSize?.();
      }, 150);
      return () => clearTimeout(t);
    }
  }, [showDrawer, isMobile]);

  // Helper: live GPS age in seconds using capturedAt + nowTick
  const getLiveGpsAgeSeconds = useCallback(
    (u) => {
      const cap = u?.latestLocation?.capturedAt;
      if (cap) {
        const ms = new Date(cap).getTime();
        if (!isNaN(ms)) return Math.max(0, Math.round((nowTick - ms) / 1000));
      }
      return u?.latestLocation?.gpsAgeSeconds ?? null;
    },
    [nowTick]
  );

  // ── Accuracy Circle Helper ─────────────────────────────────────────────────
  const clearAccuracyCircle = useCallback(() => {
    if (accuracyCircleRef.current && mapInstanceRef.current) {
      accuracyCircleRef.current.remove();
      accuracyCircleRef.current = null;
    }
  }, []);

  const showAccuracyCircle = useCallback(
    (lat, lng, accuracy, color = '#2563EB') => {
      const L = leafletRef.current;
      const map = mapInstanceRef.current;
      if (!L || !map) return;
      clearAccuracyCircle();
      if (!accuracy || Number(accuracy) > 10000) return;

      accuracyCircleRef.current = L.circle([Number(lat), Number(lng)], {
        color,
        opacity: 0.65,
        weight: 1.5,
        fillColor: color,
        fillOpacity: 0.14,
        radius: Math.max(Number(accuracy), 12),
        interactive: false,
      }).addTo(map);
    },
    [clearAccuracyCircle]
  );

  // Clear overlays (polylines, stops, leads, playback pins, accuracy circle)
  const clearAllOverlays = useCallback(() => {
    if (overlayLayerRef.current) {
      overlayLayerRef.current.clearLayers();
    }
    activePolylineRef.current = null;
    playbackMarkerRef.current = null;
    setRoadRouteInfo(null);
    clearAccuracyCircle();
    setIsPlaying(false);
    setPlaybackIndex(0);
  }, [clearAccuracyCircle]);

  const clearAllMapMarkers = useCallback(() => {
    if (userLayerRef.current) {
      userLayerRef.current.clearLayers();
    }
  }, []);

  // ─── 1. SILENT, SCROLL-PRESERVING AUTHORITATIVE DATA SYNC ──────────────────
  const fetchAllData = useCallback(
    async ({ forceOverview = false } = {}) => {
      if (fetchInFlightRef.current) return [];
      fetchInFlightRef.current = true;
      try {
        if (!hasLoadedOnceRef.current) {
          setInitialLoading(true);
        }
        setIsSyncing(true);

        const nowMs = Date.now();
        const shouldFetchOverview = forceOverview || nowMs - lastOverviewFetchRef.current > 5 * 60 * 1000;

        const requests = [
          isHrPortal
            ? backendFetch('/location/live-users', { cacheTtlMs: 0 })
            : backendFetch('/super-admin/live-users', { cacheTtlMs: 0 }).catch(() =>
                backendFetch('/location/live-users', { cacheTtlMs: 0 })
              ),
          backendFetch('/location/routes/live', { cacheTtlMs: 0 }),
        ];
        if (shouldFetchOverview) {
          requests.push(backendFetch('/location/overview-7d?days=7', { cacheTtlMs: 30000 }));
        }

        const results = await Promise.allSettled(requests);
        const usersRes = results[0];
        const routesRes = results[1];
        const overviewRes = shouldFetchOverview ? results[2] : null;

        if (overviewRes && overviewRes.status === 'fulfilled') {
          const rawOverview = overviewRes.value?.byUserId || overviewRes.value?.data?.byUserId || {};
          if (rawOverview && Object.keys(rawOverview).length > 0) {
            setOverview7d(rawOverview);
            lastOverviewFetchRef.current = nowMs;
          }
        }

        const rawUsers =
          usersRes.status === 'fulfilled'
            ? Array.isArray(usersRes.value)
              ? usersRes.value
              : usersRes.value?.data || []
            : null;

        const rawRoutes =
          routesRes.status === 'fulfilled'
            ? Array.isArray(routesRes.value)
              ? routesRes.value
              : routesRes.value?.data || []
            : [];

        // If transient network failure after initial load, preserve existing UI state silently
        if (!rawUsers) {
          return [];
        }

        const routesMapByUserId = {};
        const routesMapByEmpId = {};
        rawRoutes.forEach((r) => {
          if (r.userId) routesMapByUserId[r.userId] = r;
          if (r.employeeId) routesMapByEmpId[r.employeeId] = r;
        });

        const normalized = rawUsers.map((u) => {
          const uId = u.userId || u.id;
          const shift =
            routesMapByUserId[uId] ||
            (u.employeeId ? routesMapByEmpId[u.employeeId] : null) ||
            u.activeShift ||
            null;
          const cat = getCategoryForRole(u.role || u.jobTitle);
          const latestLoc = u.latestLocation || shift?.latestLocation || null;

          return {
            ...u,
            userId: uId,
            roleCategory: cat,
            activeShift: shift,
            latestLocation: latestLoc,
            overallStatus:
              u.overallStatus ||
              (latestLoc ? (u.gpsFreshness === 'LIVE' ? 'LIVE' : 'STALE') : 'NO_LOCATION'),
            gpsFreshness:
              u.gpsFreshness ||
              (latestLoc
                ? u.latestLocation?.gpsAgeSeconds <= 120
                  ? 'LIVE'
                  : 'STALE'
                : 'NO_LOCATION'),
            trackingStatus:
              u.trackingStatus ||
              (shift
                ? 'ACTIVE_SHIFT'
                : u.sessions?.some((s) => s.status === 'ONLINE')
                ? 'ACTIVE_DEVICE'
                : 'STOPPED'),
          };
        });

        setAllUsers(normalized);
        setLastRestSync(new Date().toLocaleTimeString());
        hasLoadedOnceRef.current = true;
        return normalized;
      } catch (err) {
        console.warn('[LiveMap] fetchAllData warning:', err?.message || err);
        return [];
      } finally {
        fetchInFlightRef.current = false;
        setInitialLoading(false);
        setIsSyncing(false);
      }
    },
    [isHrPortal]
  );

  // Smart adaptive background sync: 30s when socket LIVE, 12s when socket degraded (NEVER resets scroll!)
  useEffect(() => {
    void fetchAllData({ forceOverview: true });
    let timerId = null;
    const scheduleNext = () => {
      const intervalMs = liveStatusRef.current === 'LIVE' ? 30000 : 12000;
      timerId = setTimeout(async () => {
        if (typeof document === 'undefined' || document.visibilityState === 'visible') {
          await fetchAllData();
        }
        scheduleNext();
      }, intervalMs);
    };
    scheduleNext();
    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, [fetchAllData]);

  // ─── 2. LEAFLET + OPENSTREETMAP INITIALIZATION (ZERO API KEY / ZERO BILLING) ─
  useEffect(() => {
    let cancelled = false;
    let map = null;

    (async () => {
      try {
        const leafletMod = await import('leaflet');
        const L = leafletMod.default || leafletMod;
        if (cancelled || !mapContainerRef.current) return;

        leafletRef.current = L;

        map = L.map(mapContainerRef.current, {
          center: [23.0225, 72.5714], // Ahmedabad / Gujarat HQ
          zoom: 11,
          zoomControl: false,
          preferCanvas: true,
        });

        L.control.zoom({ position: 'bottomright' }).addTo(map);

        const cfg = MAP_TILE_LAYERS.clean;
        tileLayerRef.current = L.tileLayer(cfg.url, {
          attribution: cfg.attribution,
          maxZoom: cfg.maxZoom,
        }).addTo(map);

        userLayerRef.current = L.layerGroup().addTo(map);
        overlayLayerRef.current = L.layerGroup().addTo(map);

        map.on('zoomend', () => {
          setZoomVersion((v) => v + 1);
        });

        map.on('click', () => {
          setExpandedClusterKey(null);
        });

        mapInstanceRef.current = map;
        setMapsError(null);
        setMapsLoaded(true);
      } catch (err) {
        console.error('Failed to initialize OpenStreetMap/Leaflet:', err);
        if (!cancelled) setMapsError(err?.message || 'Failed to initialize map engine.');
      }
    })();

    return () => {
      cancelled = true;
      if (map) {
        map.remove();
        mapInstanceRef.current = null;
        tileLayerRef.current = null;
        userLayerRef.current = null;
        overlayLayerRef.current = null;
        accuracyCircleRef.current = null;
      }
      setMapsLoaded(false);
    };
  }, []);

  // Switch tile layer smoothly in-place
  useEffect(() => {
    const L = leafletRef.current;
    const map = mapInstanceRef.current;
    if (!L || !map) return;

    const cfg = MAP_TILE_LAYERS[tileLayerKey] || MAP_TILE_LAYERS.clean;
    if (tileLayerRef.current) {
      tileLayerRef.current.remove();
    }
    tileLayerRef.current = L.tileLayer(cfg.url, {
      attribution: cfg.attribution,
      maxZoom: cfg.maxZoom,
    }).addTo(map);
    tileLayerRef.current.bringToBack();
  }, [tileLayerKey, mapsLoaded]);

  // ─── 3. SOCKET.IO REAL-TIME TELEMETRY LISTENER ─────────────────────────────
  useEffect(() => {
    if (!accessToken) return;
    const cleanToken = (accessToken || '').replace(/^Bearer\s+/i, '').trim();

    let socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_BACKEND_SOCKET_URL || '';
    if (typeof window !== 'undefined') {
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      socketUrl = isLocalhost
        ? socketUrl || `${window.location.protocol}//${window.location.hostname}:4001`
        : socketUrl || window.location.origin;
    } else {
      socketUrl = socketUrl || 'http://localhost:4001';
    }

    const socket = io(socketUrl, {
      path: '/socket.io',
      auth: { token: cleanToken },
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1500,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setLiveStatus('LIVE');
      if (hasLoadedOnceRef.current) {
        void fetchAllData();
      }
    });

    socket.on('connect_error', () => setLiveStatus('RECONNECTING'));
    socket.on('disconnect', () => setLiveStatus('OFFLINE'));

    const handleCoordinateEvent = (data) => {
      const targetUserId = data.userId;
      if (!targetUserId) return;

      const lat = Number(data.latitude);
      const lng = Number(data.longitude);
      if (isNaN(lat) || isNaN(lng)) return;

      const incomingAcc = data.accuracy != null ? Number(data.accuracy) : null;
      // Drop ultra-coarse IP coordinates (>1000m) live
      if (incomingAcc != null && incomingAcc > 1000) return;

      const now = new Date();
      const updatedCoord = {
        latitude: lat,
        longitude: lng,
        accuracy: incomingAcc,
        speed: data.speed != null ? Number(data.speed) : null,
        heading: data.heading != null ? Number(data.heading) : null,
        batteryLevel: data.batteryLevel != null ? Number(data.batteryLevel) : null,
        capturedAt: data.capturedAt || data.recordedAt || now.toISOString(),
        receivedAt: data.serverReceivedAt || now.toISOString(),
        gpsAgeSeconds: 0,
        source: data.source || 'REALTIME_SOCKET',
      };

      let acceptedCoordinate = true;

      setAllUsers((prev) =>
        prev.map((u) => {
          if (u.userId !== targetUserId) return u;

          // Guard: never let a coarse desktop Wi-Fi ping (>=250m) overwrite a recent accurate GPS fix (<=150m within 12h)
          const prevAcc = u.latestLocation?.accuracy != null ? Number(u.latestLocation.accuracy) : null;
          const prevCapMs = u.latestLocation?.capturedAt ? new Date(u.latestLocation.capturedAt).getTime() : 0;
          const prevAgeHours = prevCapMs ? (now.getTime() - prevCapMs) / (1000 * 3600) : 999;
          if (
            incomingAcc != null &&
            incomingAcc >= 250 &&
            prevAcc != null &&
            prevAcc <= 150 &&
            prevAgeHours <= 12
          ) {
            acceptedCoordinate = false;
            return {
              ...u,
              trackingStatus: u.activeShift ? 'ACTIVE_SHIFT' : 'ACTIVE_DEVICE',
            };
          }

          return {
            ...u,
            latestLocation: updatedCoord,
            overallStatus: 'LIVE',
            gpsFreshness: 'LIVE',
            trackingStatus: u.activeShift ? 'ACTIVE_SHIFT' : 'ACTIVE_DEVICE',
          };
        })
      );

      if (acceptedCoordinate && selectedUserIdRef.current === targetUserId && mapInstanceRef.current) {
        if (followUserRef.current) {
          mapInstanceRef.current.panTo([lat, lng], { animate: true });
        }
        showAccuracyCircle(lat, lng, incomingAcc || 15);
        if (activePolylineRef.current && leafletRef.current) {
          activePolylineRef.current.addLatLng([lat, lng]);
        }
      }
    };

    socket.on('user:location:update', handleCoordinateEvent);
    socket.on('employee:route:update', handleCoordinateEvent);

    socket.on('device:connected', (data) => {
      setAllUsers((prev) =>
        prev.map((u) => {
          if (u.userId !== data.userId) return u;
          return {
            ...u,
            trackingStatus: u.activeShift ? 'ACTIVE_SHIFT' : 'ACTIVE_DEVICE',
            overallStatus: u.latestLocation
              ? u.gpsFreshness === 'LIVE'
                ? 'LIVE'
                : 'STALE'
              : 'NO_LOCATION',
          };
        })
      );
    });

    socket.on('device:disconnected', (data) => {
      // Only mark offline if this was the user's LAST live socket connection
      if (data?.remainingConnections && data.remainingConnections > 0) return;
      setAllUsers((prev) =>
        prev.map((u) => {
          if (u.userId !== data.userId) return u;
          return {
            ...u,
            overallStatus: u.latestLocation ? 'OFFLINE' : 'NO_LOCATION',
            trackingStatus: u.activeShift ? 'ACTIVE_SHIFT' : 'STOPPED',
          };
        })
      );
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [accessToken, fetchAllData, showAccuracyCircle]);

  // ── Helper: Draw directional arrowheads along a Leaflet polyline ───────────
  const drawDirectionalArrows = useCallback((L, layer, latLngs, color) => {
    if (!latLngs || latLngs.length < 2) return;
    let accumMeters = 0;
    // Pick step spacing proportional to route length so short and long routes both get ~6-12 crisp arrows
    let totalMeters = 0;
    for (let i = 1; i < latLngs.length; i++) {
      totalMeters += haversineMeters(latLngs[i - 1][0], latLngs[i - 1][1], latLngs[i][0], latLngs[i][1]);
    }
    const arrowSpacing = Math.max(250, Math.min(2500, totalMeters / 10));

    for (let i = 1; i < latLngs.length; i++) {
      const p1 = latLngs[i - 1];
      const p2 = latLngs[i];
      const seg = haversineMeters(p1[0], p1[1], p2[0], p2[1]);
      accumMeters += seg;
      if (accumMeters >= arrowSpacing && seg >= 15) {
        accumMeters = 0;
        const midLat = (p1[0] + p2[0]) / 2;
        const midLng = (p1[1] + p2[1]) / 2;
        const deg = calcBearingDeg(p1[0], p1[1], p2[0], p2[1]);
        const arrowIcon = L.divIcon({
          className: '',
          iconSize: [14, 14],
          iconAnchor: [7, 7],
          html: `<div style="transform:rotate(${deg}deg);width:14px;height:14px;display:flex;align-items:center;justify-content:center;">
            <svg width="12" height="12" viewBox="0 0 12 12">
              <path d="M6 1 L11 10 L6 8 L1 10 Z" fill="${color}" stroke="#FFFFFF" stroke-width="1.2"/>
            </svg>
          </div>`,
        });
        L.marker([midLat, midLng], { icon: arrowIcon, interactive: false }).addTo(layer);
      }
    }
  }, []);

  // ─── 4. DRAW ACTIVE SHIFT ROUTE & STOPS ────────────────────────────────────
  const drawShiftRouteOnMap = useCallback(
    (user) => {
      const L = leafletRef.current;
      const map = mapInstanceRef.current;
      const layer = overlayLayerRef.current;
      if (!mapsLoaded || !L || !map || !layer || !user) return;

      clearAllOverlays();

      const shift = user.activeShift;
      const latLngs = [];

      const punchLat = shift?.punchInCoordinates?.latitude || shift?.punchInLatitude || shift?.punchIn?.latitude;
      const punchLng = shift?.punchInCoordinates?.longitude || shift?.punchInLongitude || shift?.punchIn?.longitude;
      if (punchLat != null && punchLng != null) {
        latLngs.push([Number(punchLat), Number(punchLng)]);
      }

      const points = shift?.routePoints || shift?.points || [];
      points.forEach((p) => {
        if (p.latitude != null && p.longitude != null) {
          latLngs.push([Number(p.latitude), Number(p.longitude)]);
        }
      });

      if (user.latestLocation?.latitude != null && user.latestLocation?.longitude != null) {
        latLngs.push([Number(user.latestLocation.latitude), Number(user.latestLocation.longitude)]);
      }

      if (latLngs.length === 0) return;

      if (latLngs.length >= 2) {
        const poly = L.polyline(latLngs, {
          color: '#0284C7',
          opacity: 0.9,
          weight: 5,
        }).addTo(layer);
        activePolylineRef.current = poly;
        drawDirectionalArrows(L, layer, latLngs, '#0284C7');
      }

      if (shift?.stops && shift.stops.length > 0) {
        shift.stops.forEach((st) => {
          const stopIcon = L.divIcon({
            className: '',
            iconSize: [30, 36],
            iconAnchor: [15, 36],
            html: buildBadgePinMarkup('#D97706', '#92400E', st.stopNumber, 30, 36),
          });
          L.marker([Number(st.latitude), Number(st.longitude)], { icon: stopIcon })
            .bindPopup(`
              <div style="font-family:system-ui,sans-serif;min-width:190px;">
                <div style="font-weight:700;color:#B45309;font-size:13px;margin-bottom:4px;">
                  🛑 Stop #${escapeHtml(st.stopNumber)} (${escapeHtml(st.durationMinutes)} mins)
                </div>
                <div style="font-size:11px;color:#475569;line-height:1.45;">
                  <strong>Arrived:</strong> ${escapeHtml(new Date(st.arrivedAt).toLocaleTimeString())}<br/>
                  <strong>Departed:</strong> ${escapeHtml(new Date(st.departedAt).toLocaleTimeString())}<br/>
                  ${st.address ? `<strong>Address:</strong> ${escapeHtml(st.address)}` : ''}
                </div>
              </div>
            `)
            .addTo(layer);
        });
      }

      const bounds = L.latLngBounds(latLngs);
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 16 });

      if (user.latestLocation?.latitude != null && user.latestLocation?.longitude != null) {
        showAccuracyCircle(user.latestLocation.latitude, user.latestLocation.longitude, user.latestLocation.accuracy || 15);
      }
    },
    [mapsLoaded, clearAllOverlays, showAccuracyCircle, drawDirectionalArrows]
  );

  // ─── 5. 7-DAY & SINGLE-DAY HISTORICAL ROUTE LOADER & PLAYBACK (OSRM ROADS) ─
  const drawHistoryRoute = useCallback(
    (points, stops, session, leads = [], strokeColor = '#0284C7', renderMode = 'GPS') => {
      const L = leafletRef.current;
      const map = mapInstanceRef.current;
      const layer = overlayLayerRef.current;
      if (!mapsLoaded || !L || !map || !layer) return;

      clearAllOverlays();

      const latLngs = [];
      const punchInLat = session?.punchInCoordinates?.latitude || session?.punchInLatitude || session?.punchIn?.latitude;
      const punchInLng = session?.punchInCoordinates?.longitude || session?.punchInLongitude || session?.punchIn?.longitude;
      if (punchInLat != null && punchInLng != null) {
        latLngs.push([Number(punchInLat), Number(punchInLng)]);
      }
      (points || []).forEach((p) => {
        if (p.latitude != null && p.longitude != null) {
          latLngs.push([Number(p.latitude), Number(p.longitude)]);
        }
      });
      const punchOutLat = session?.punchOutCoordinates?.latitude || session?.punchOutLatitude || session?.punchOut?.latitude;
      const punchOutLng = session?.punchOutCoordinates?.longitude || session?.punchOutLongitude || session?.punchOut?.longitude;
      if (punchOutLat != null && punchOutLng != null && session?.status === 'COMPLETED') {
        latLngs.push([Number(punchOutLat), Number(punchOutLng)]);
      }

      if (latLngs.length === 0) return;

      if (latLngs.length >= 2) {
        const poly = L.polyline(latLngs, {
          color: strokeColor,
          opacity: renderMode === 'ROADS' ? 0.35 : 0.92,
          weight: renderMode === 'ROADS' ? 3 : 5,
        }).addTo(layer);
        activePolylineRef.current = poly;
        if (renderMode !== 'ROADS') {
          drawDirectionalArrows(L, layer, latLngs, strokeColor);
        }
      }

      // Free OSRM OpenStreetMap Road-Following Mode
      if (renderMode === 'ROADS' && latLngs.length >= 2) {
        setRoadRouteInfo({ loading: true, km: null, duration: null, error: null });

        const sampled = [latLngs[0]];
        let lastKept = latLngs[0];
        for (let i = 1; i < latLngs.length - 1; i++) {
          if (haversineMeters(lastKept[0], lastKept[1], latLngs[i][0], latLngs[i][1]) >= 450) {
            sampled.push(latLngs[i]);
            lastKept = latLngs[i];
          }
        }
        sampled.push(latLngs[latLngs.length - 1]);

        let finalWp = sampled;
        if (sampled.length > 24) {
          const step = (sampled.length - 1) / 23;
          finalWp = Array.from({ length: 24 }, (_, idx) => sampled[Math.round(idx * step)]);
        }

        const coordParam = finalWp.map(([la, ln]) => `${ln.toFixed(5)},${la.toFixed(5)}`).join(';');
        const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${coordParam}?overview=full&geometries=geojson`;

        fetch(osrmUrl, { signal: AbortSignal.timeout(7000) })
          .then((r) => (r.ok ? r.json() : Promise.reject(new Error('OSRM unavailable'))))
          .then((data) => {
            const route = data?.routes?.[0];
            if (route?.geometry?.coordinates?.length >= 2 && overlayLayerRef.current) {
              const roadPath = route.geometry.coordinates.map(([ln, la]) => [la, ln]);
              L.polyline(roadPath, {
                color: strokeColor,
                opacity: 0.92,
                weight: 5,
              }).addTo(overlayLayerRef.current);
              drawDirectionalArrows(L, overlayLayerRef.current, roadPath, strokeColor);

              const totalSec = Math.round(route.duration || 0);
              const hrs = Math.floor(totalSec / 3600);
              const mins = Math.round((totalSec % 3600) / 60);
              setRoadRouteInfo({
                loading: false,
                km: Math.round(((route.distance || 0) / 1000) * 100) / 100,
                duration: hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`,
                error: null,
              });
            } else {
              throw new Error('No road path found');
            }
          })
          .catch(() => {
            if (activePolylineRef.current) {
              activePolylineRef.current.setStyle({ opacity: 0.92, weight: 5 });
              drawDirectionalArrows(L, layer, latLngs, strokeColor);
            }
            setRoadRouteInfo({
              loading: false,
              km: null,
              duration: null,
              error: 'OSM road snapping temporarily unavailable — showing exact GPS path.',
            });
          });
      }

      const bounds = L.latLngBounds(latLngs);

      // Start Pin (S)
      const startLat = punchInLat ?? points?.[0]?.latitude ?? null;
      const startLng = punchInLng ?? points?.[0]?.longitude ?? null;
      if (startLat != null && startLng != null) {
        const startTime = session?.punchInAt || points?.[0]?.recordedAt;
        const startIcon = L.divIcon({
          className: '',
          iconSize: [34, 42],
          iconAnchor: [17, 42],
          html: buildBadgePinMarkup('#16A34A', '#15803D', 'S', 34, 42),
        });
        L.marker([Number(startLat), Number(startLng)], { icon: startIcon, zIndexOffset: 500 })
          .bindPopup(`
            <div style="font-family:system-ui,sans-serif;max-width:240px;">
              <div style="font-weight:700;color:#15803D;font-size:13px;">🟢 Start / Punch In</div>
              <div style="font-size:11px;color:#475569;margin-top:4px;">
                <strong>Time:</strong> ${escapeHtml(startTime ? new Date(startTime).toLocaleString() : 'N/A')}<br/>
                ${session?.punchInAddress ? `<strong>Address:</strong> ${escapeHtml(session.punchInAddress)}` : ''}
              </div>
            </div>
          `)
          .addTo(layer);
      }

      // End Pin (E)
      const endLat = punchOutLat ?? (points?.length > 0 ? points[points.length - 1].latitude : startLat);
      const endLng = punchOutLng ?? (points?.length > 0 ? points[points.length - 1].longitude : startLng);
      if (endLat != null && endLng != null) {
        const endTime = session?.punchOutAt || points?.[points.length - 1]?.recordedAt;
        const endIcon = L.divIcon({
          className: '',
          iconSize: [34, 42],
          iconAnchor: [17, 42],
          html: buildBadgePinMarkup('#DC2626', '#991B1B', 'E', 34, 42),
        });
        L.marker([Number(endLat), Number(endLng)], { icon: endIcon, zIndexOffset: 510 })
          .bindPopup(`
            <div style="font-family:system-ui,sans-serif;max-width:240px;">
              <div style="font-weight:700;color:#B91C1C;font-size:13px;">🔴 ${session?.status === 'COMPLETED' ? 'Punch Out' : 'Last Position'}</div>
              <div style="font-size:11px;color:#475569;margin-top:4px;">
                <strong>Time:</strong> ${escapeHtml(endTime ? new Date(endTime).toLocaleString() : 'N/A')}<br/>
                ${session?.punchOutAddress ? `<strong>Address:</strong> ${escapeHtml(session.punchOutAddress)}` : ''}
              </div>
            </div>
          `)
          .addTo(layer);
      }

      // Numbered Stop Pins
      (stops || []).forEach((st) => {
        const pos = [Number(st.latitude), Number(st.longitude)];
        bounds.extend(pos);
        const stopIcon = L.divIcon({
          className: '',
          iconSize: [30, 36],
          iconAnchor: [15, 36],
          html: buildBadgePinMarkup('#D97706', '#92400E', st.stopNumber, 30, 36),
        });
        L.marker(pos, { icon: stopIcon, zIndexOffset: 450 })
          .bindPopup(`
            <div style="font-family:system-ui,sans-serif;max-width:250px;">
              <div style="font-weight:700;color:#B45309;font-size:13px;">🛑 Stop #${escapeHtml(st.stopNumber)} (${escapeHtml(st.durationMinutes)} mins)</div>
              <div style="font-size:11px;color:#475569;margin-top:4px;line-height:1.45;">
                <strong>Arrived:</strong> ${escapeHtml(new Date(st.arrivedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))}<br/>
                <strong>Departed:</strong> ${escapeHtml(new Date(st.departedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))}<br/>
                <strong>Location:</strong> ${escapeHtml(st.address || `${Number(st.latitude).toFixed(4)}, ${Number(st.longitude).toFixed(4)}`)}
              </div>
            </div>
          `)
          .addTo(layer);
      });

      // CRM Lead Pins (Purple 'L')
      (leads || []).forEach((lead) => {
        if (lead.latitude == null || lead.longitude == null) return;
        const pos = [Number(lead.latitude), Number(lead.longitude)];
        bounds.extend(pos);
        const leadIcon = L.divIcon({
          className: '',
          iconSize: [30, 38],
          iconAnchor: [15, 38],
          html: buildBadgePinMarkup('#7C3AED', '#5B21B6', 'L', 30, 38),
        });
        L.marker(pos, { icon: leadIcon, zIndexOffset: 460 })
          .bindPopup(`
            <div style="font-family:system-ui,sans-serif;max-width:250px;">
              <div style="font-weight:700;color:#5B21B6;font-size:13px;">🏢 Lead: ${escapeHtml(lead.companyName)}</div>
              <div style="font-size:11px;color:#475569;margin-top:4px;line-height:1.45;">
                <strong>Ref:</strong> ${escapeHtml(lead.leadNumber || '—')}<br/>
                <strong>Contact:</strong> ${escapeHtml(lead.contactPerson || '—')}<br/>
                <strong>Captured:</strong> ${escapeHtml(new Date(lead.createdAt).toLocaleString())}<br/>
                ${lead.address ? `<strong>Address:</strong> ${escapeHtml(lead.address)}` : ''}
              </div>
            </div>
          `)
          .addTo(layer);
      });

      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 16 });
    },
    [mapsLoaded, clearAllOverlays, drawDirectionalArrows]
  );

  // Draw ALL 7 days simultaneously on Leaflet
  const drawAll7DaysCombined = useCallback(
    (payload) => {
      const L = leafletRef.current;
      const map = mapInstanceRef.current;
      const layer = overlayLayerRef.current;
      if (!mapsLoaded || !L || !map || !layer || !payload?.days) return;
      clearAllOverlays();

      const allPts = [];

      payload.days.forEach((day, dayIdx) => {
        if (!day.hasData) return;
        const color = DAY_ROUTE_COLORS[dayIdx % DAY_ROUTE_COLORS.length];
        const path = [];

        if (day.punchIn?.latitude != null && day.punchIn?.longitude != null) {
          path.push([Number(day.punchIn.latitude), Number(day.punchIn.longitude)]);
        }
        (day.points || []).forEach((p) => {
          if (p.latitude != null && p.longitude != null) {
            path.push([Number(p.latitude), Number(p.longitude)]);
          }
        });

        path.forEach((pt) => allPts.push(pt));

        if (path.length >= 2) {
          L.polyline(path, { color, opacity: 0.85, weight: 4 }).addTo(layer);
        }

        (day.stops || []).forEach((st) => {
          const pos = [Number(st.latitude), Number(st.longitude)];
          allPts.push(pos);
          const stopIcon = L.divIcon({
            className: '',
            iconSize: [26, 32],
            iconAnchor: [13, 32],
            html: buildBadgePinMarkup('#D97706', '#92400E', st.stopNumber, 26, 32),
          });
          L.marker(pos, { icon: stopIcon })
            .bindPopup(`
              <div style="font-family:system-ui,sans-serif;max-width:250px;">
                <div style="font-weight:700;color:${color};font-size:12px;">${escapeHtml(day.dayLabel)}</div>
                <div style="font-weight:700;color:#B45309;font-size:13px;margin-top:2px;">🛑 Stop #${escapeHtml(st.stopNumber)} (${escapeHtml(st.durationMinutes)} mins)</div>
                <div style="font-size:11px;color:#475569;margin-top:4px;">
                  <strong>Time:</strong> ${escapeHtml(new Date(st.arrivedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))} – ${escapeHtml(new Date(st.departedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))}<br/>
                  <strong>Location:</strong> ${escapeHtml(st.address || `${Number(st.latitude).toFixed(4)}, ${Number(st.longitude).toFixed(4)}`)}
                </div>
              </div>
            `)
            .addTo(layer);
        });

        (day.leads || []).forEach((lead) => {
          if (lead.latitude == null || lead.longitude == null) return;
          const pos = [Number(lead.latitude), Number(lead.longitude)];
          allPts.push(pos);
          const leadIcon = L.divIcon({
            className: '',
            iconSize: [26, 34],
            iconAnchor: [13, 34],
            html: buildBadgePinMarkup('#7C3AED', '#5B21B6', 'L', 26, 34),
          });
          L.marker(pos, { icon: leadIcon })
            .bindPopup(`
              <div style="font-family:system-ui,sans-serif;max-width:250px;">
                <div style="font-weight:700;color:#5B21B6;font-size:13px;">🏢 ${escapeHtml(lead.companyName)}</div>
                <div style="font-size:11px;color:#475569;margin-top:4px;">
                  <strong>Date:</strong> ${escapeHtml(day.dayLabel)}<br/>
                  <strong>Contact:</strong> ${escapeHtml(lead.contactPerson || '—')}<br/>
                  ${lead.address ? `<strong>Address:</strong> ${escapeHtml(lead.address)}` : ''}
                </div>
              </div>
            `)
            .addTo(layer);
        });
      });

      if (allPts.length > 0) {
        map.fitBounds(L.latLngBounds(allPts), { padding: [60, 60], maxZoom: 16 });
      }
    },
    [mapsLoaded, clearAllOverlays]
  );

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
      const L = leafletRef.current;
      const layer = overlayLayerRef.current;
      if (!mapsLoaded || !L || !layer || !pt) return;
      const pos = [Number(pt.latitude), Number(pt.longitude)];

      if (!playbackMarkerRef.current) {
        playbackMarkerRef.current = L.circleMarker(pos, {
          radius: 9,
          fillColor: '#2563EB',
          fillOpacity: 1,
          color: '#FFFFFF',
          weight: 3,
        }).addTo(layer);
      } else {
        playbackMarkerRef.current.setLatLng(pos);
      }

      showAccuracyCircle(pos[0], pos[1], pt.accuracy || 15, '#2563EB');
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

  // ─── 6. FILTERED USERS & TRUTHFUL SUMMARY METRICS ──────────────────────────
  const summaryMetrics = useMemo(() => {
    let live = 0;
    let stale = 0;
    let offline = 0;
    let noLocation = 0;
    let permissionDenied = 0;
    let onShift = 0;
    let onlineSessionsTotal = 0;
    let totalSessionsCount = 0;

    allUsers.forEach((u) => {
      if (u.activeShift) onShift++;
      const uSessions = u.sessions || [];
      totalSessionsCount += uSessions.length;
      onlineSessionsTotal += uSessions.filter((s) => s.status === 'ONLINE').length;

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
      onlineSessionsTotal,
      totalSessionsCount,
    };
  }, [allUsers]);

  const filteredUsers = useMemo(() => {
    return allUsers.filter((u) => {
      if (mode === 'ACTIVE_SHIFTS' && !u.activeShift) return false;

      if (selectedDepartment !== 'All') {
        const cat = u.roleCategory || getCategoryForRole(u.role);
        const deptLower = (u.department || '').toLowerCase();
        const selLower = selectedDepartment.toLowerCase();
        if (cat !== selectedDepartment && deptLower !== selLower && !deptLower.startsWith(selLower)) {
          return false;
        }
      }

      if (statusFilter !== 'ALL' && u.overallStatus !== statusFilter) return false;

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
  }, [allUsers, mode, selectedDepartment, statusFilter, searchQuery]);

  // Users strictly visible on the map right now (respects ALL filters & tabs!)
  const mapVisibleUsers = useMemo(() => {
    if (mode === 'DEVICE_SESSIONS') return allUsers;
    return filteredUsers;
  }, [mode, allUsers, filteredUsers]);

  const selectedUser = useMemo(() => {
    return allUsers.find((u) => u.userId === selectedUserId) || null;
  }, [allUsers, selectedUserId]);

  // Build popup HTML dynamically from fresh user state (never stale!)
  const buildUserPopupHtml = useCallback(
    (u) => {
      const cat = u.roleCategory || getCategoryForRole(u.role);
      const pinStatus = u.overallStatus;
      const gpsAgeText = formatGpsAge(getLiveGpsAgeSeconds(u));
      const recordedTime = u.latestLocation?.capturedAt
        ? new Date(u.latestLocation.capturedAt).toLocaleTimeString()
        : 'N/A';
      const accBadge = formatAccuracyBadge(u.latestLocation?.accuracy);
      const dev = u.latestLocation?.sourceDevice;
      const devStr = dev ? `${dev.deviceType} (${dev.operatingSystem || ''}${dev.browser ? ' / ' + dev.browser : ''})` : null;

      return `
        <div style="font-family:system-ui,sans-serif;min-width:225px;padding:2px;">
          <div style="font-weight:700;color:#0F172A;font-size:13.5px;display:flex;align-items:center;justify-content:space-between;gap:8px;">
            <span>${escapeHtml(u.name)}</span>
            <span style="font-size:10px;font-weight:800;padding:2px 6px;border-radius:8px;background:${pinStatus === 'LIVE' ? '#DCFCE7' : pinStatus === 'STALE' ? '#FEF3C7' : '#F1F5F9'};color:${pinStatus === 'LIVE' ? '#15803D' : pinStatus === 'STALE' ? '#B45309' : '#64748B'};">
              ${escapeHtml(pinStatus)}
            </span>
          </div>
          <div style="font-size:11.5px;color:#475569;margin-top:6px;line-height:1.55;">
            <strong>Role:</strong> ${escapeHtml(u.role)} (${escapeHtml(cat)})<br/>
            <strong>Department:</strong> ${escapeHtml(u.department || 'Operations')}<br/>
            <strong>GPS Age:</strong> ${escapeHtml(gpsAgeText)} (${escapeHtml(recordedTime)})<br/>
            <strong>Signal:</strong> ${accBadge ? `<span style="background:${accBadge.bg};color:${accBadge.color};padding:1px 5px;border-radius:5px;font-weight:700;font-size:10.5px;">${accBadge.icon} ${escapeHtml(accBadge.label)}</span>` : 'N/A'}<br/>
            ${devStr ? `<strong>Source:</strong> ${escapeHtml(devStr)}<br/>` : ''}
            ${u.latestLocation?.speed != null ? `<strong>Speed:</strong> ${Math.round(u.latestLocation.speed)} km/h<br/>` : ''}
            ${u.activeShift ? `<strong>Shift Distance:</strong> ${escapeHtml(u.activeShift.totalDistanceKm || 0)} km` : ''}
          </div>
        </div>
      `;
    },
    [getLiveGpsAgeSeconds]
  );

  // ─── 7. SYNCHRONIZE FILTERED MAP MARKERS WITH STACKED-PIN CLUSTERING & SPIDERFY ─
  useEffect(() => {
    const L = leafletRef.current;
    const map = mapInstanceRef.current;
    const layer = userLayerRef.current;
    if (!mapsLoaded || !L || !map || !layer) return;

    layer.clearLayers();

    if (mode === 'ROUTE_HISTORY') {
      return;
    }

    // 1. Cluster co-located users within 35 meters so stacked factory/office pins are never hidden
    const withCoords = mapVisibleUsers.filter(
      (u) => u.latestLocation?.latitude != null && u.latestLocation?.longitude != null
    );

    const clusters = [];
    for (const u of withCoords) {
      const lat = Number(u.latestLocation.latitude);
      const lng = Number(u.latestLocation.longitude);
      let placed = false;
      for (const cl of clusters) {
        if (haversineMeters(cl.centerLat, cl.centerLng, lat, lng) <= 35) {
          cl.members.push(u);
          placed = true;
          break;
        }
      }
      if (!placed) {
        clusters.push({ centerLat: lat, centerLng: lng, members: [u] });
      }
    }

    const renderSingleUserPin = (u, displayLat, displayLng) => {
      const uId = u.userId;
      const cat = u.roleCategory || getCategoryForRole(u.role);
      const isSelected = selectedUserId === uId;
      const pinStatus = u.overallStatus;

      const icon = L.divIcon({
        className: '',
        iconSize: [38, 48],
        iconAnchor: [19, 46],
        popupAnchor: [0, -44],
        html: buildPinSvgMarkup(cat, pinStatus, isSelected),
      });

      const marker = L.marker([displayLat, displayLng], {
        icon,
        zIndexOffset: isSelected ? 1000 : pinStatus === 'LIVE' ? 300 : 100,
        title: `${u.name} - ${u.role} (${pinStatus})`,
      }).addTo(layer);

      marker.on('click', (ev) => {
        L.DomEvent.stopPropagation(ev);
        const freshUser = usersByIdRef.current.get(uId) || u;
        setSelectedUserId(uId);
        showAccuracyCircle(
          Number(freshUser.latestLocation.latitude),
          Number(freshUser.latestLocation.longitude),
          freshUser.latestLocation?.accuracy || 15
        );
        if (freshUser.activeShift) {
          drawShiftRouteOnMap(freshUser);
        }
        marker.bindPopup(buildUserPopupHtml(freshUser), { maxWidth: 280 }).openPopup();
      });

      // Punch-in 'S' pin for active shift (only when user is selected or in ACTIVE_SHIFTS mode to keep map clean)
      const shift = u.activeShift;
      const punchLat = shift?.punchInCoordinates?.latitude || shift?.punchInLatitude;
      const punchLng = shift?.punchInCoordinates?.longitude || shift?.punchInLongitude;
      if (punchLat != null && punchLng != null && (isSelected || mode === 'ACTIVE_SHIFTS')) {
        const startIcon = L.divIcon({
          className: '',
          iconSize: [28, 34],
          iconAnchor: [14, 34],
          html: buildBadgePinMarkup('#16A34A', '#15803D', 'S', 28, 34),
        });
        L.marker([Number(punchLat), Number(punchLng)], {
          icon: startIcon,
          zIndexOffset: 80,
          title: `Shift Punch-In: ${u.name}`,
        })
          .on('click', (ev) => {
            L.DomEvent.stopPropagation(ev);
            const freshUser = usersByIdRef.current.get(uId) || u;
            setSelectedUserId(uId);
            drawShiftRouteOnMap(freshUser);
          })
          .addTo(layer);
      }
    };

    clusters.forEach((cl) => {
      if (cl.members.length === 1) {
        const u = cl.members[0];
        renderSingleUserPin(u, Number(u.latestLocation.latitude), Number(u.latestLocation.longitude));
        return;
      }

      const clusterKey = `${cl.centerLat.toFixed(4)},${cl.centerLng.toFixed(4)}`;
      const containsSelected = cl.members.some((m) => m.userId === selectedUserId);
      const isExpanded = expandedClusterKey === clusterKey || containsSelected;

      if (isExpanded) {
        // Center anchor dot showing exact shared coordinate
        L.circleMarker([cl.centerLat, cl.centerLng], {
          radius: 5,
          fillColor: '#0284C7',
          fillOpacity: 0.9,
          color: '#FFFFFF',
          weight: 2,
          interactive: false,
        }).addTo(layer);

        // Spiderfy pins cleanly in screen-pixel space (always crisp 48px–62px radius regardless of zoom!)
        const centerPt = map.latLngToContainerPoint([cl.centerLat, cl.centerLng]);
        const count = cl.members.length;
        const radiusPx = Math.min(72, 42 + count * 3.5);

        cl.members.forEach((member, idx) => {
          const angle = (2 * Math.PI * idx) / count - Math.PI / 2;
          const targetPt = L.point(
            centerPt.x + radiusPx * Math.cos(angle),
            centerPt.y + radiusPx * Math.sin(angle)
          );
          const targetLatLng = map.containerPointToLatLng(targetPt);

          // Dashed hairline leg from true coordinate to spiderfied pin
          L.polyline(
            [
              [cl.centerLat, cl.centerLng],
              [targetLatLng.lat, targetLatLng.lng],
            ],
            {
              color: '#0284C7',
              weight: 1.5,
              opacity: 0.65,
              dashArray: '4 4',
              interactive: false,
            }
          ).addTo(layer);

          renderSingleUserPin(member, targetLatLng.lat, targetLatLng.lng);
        });
      } else {
        // Collapsed Cluster Badge with count & live status ring
        const hasLive = cl.members.some((m) => m.overallStatus === 'LIVE');
        const hasStale = cl.members.some((m) => m.overallStatus === 'STALE');
        const ringColor = hasLive ? '#10B981' : hasStale ? '#F59E0B' : '#0284C7';
        const previewNames = cl.members
          .slice(0, 4)
          .map((m) => m.name)
          .join(', ');
        const moreText = cl.members.length > 4 ? ` +${cl.members.length - 4} more` : '';

        const clusterIcon = L.divIcon({
          className: '',
          iconSize: [44, 44],
          iconAnchor: [22, 22],
          html: `<div style="width:44px;height:44px;border-radius:50%;background:#0F172A;border:3.5px solid ${ringColor};color:#FFFFFF;font-weight:800;font-size:14px;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(15,23,42,0.4);cursor:pointer;">
            ${cl.members.length}
          </div>`,
        });

        const clusterMarker = L.marker([cl.centerLat, cl.centerLng], {
          icon: clusterIcon,
          zIndexOffset: hasLive ? 400 : 250,
          title: `${cl.members.length} employees here: ${previewNames}${moreText} (click to expand)`,
        }).addTo(layer);

        clusterMarker.bindTooltip(
          `<strong>${cl.members.length} employees at this spot</strong><br/>${escapeHtml(previewNames + moreText)}<br/><span style="color:#0284C7;font-size:10px;">Click to fan out pins</span>`,
          { direction: 'top', offset: [0, -22] }
        );

        clusterMarker.on('click', (ev) => {
          L.DomEvent.stopPropagation(ev);
          setExpandedClusterKey(clusterKey);
          const targetZoom = Math.max(map.getZoom(), 14);
          map.setView([cl.centerLat, cl.centerLng], targetZoom, { animate: true });
        });
      }
    });
  }, [
    mode,
    mapsLoaded,
    mapVisibleUsers,
    selectedUserId,
    expandedClusterKey,
    zoomVersion,
    drawShiftRouteOnMap,
    showAccuracyCircle,
    buildUserPopupHtml,
  ]);

  // ─── 8. MAP TOOLBAR CONTROLS (STRICTLY FILTERED FIT ALL!) ──────────────────
  const fitAllMarkers = useCallback(() => {
    const L = leafletRef.current;
    const map = mapInstanceRef.current;
    if (!mapsLoaded || !L || !map) return;

    const pts = [];
    mapVisibleUsers.forEach((u) => {
      if (u.latestLocation?.latitude != null && u.latestLocation?.longitude != null) {
        pts.push([Number(u.latestLocation.latitude), Number(u.latestLocation.longitude)]);
      }
      if (mode === 'ACTIVE_SHIFTS') {
        const punchLat = u.activeShift?.punchInCoordinates?.latitude || u.activeShift?.punchInLatitude;
        const punchLng = u.activeShift?.punchInCoordinates?.longitude || u.activeShift?.punchInLongitude;
        if (punchLat != null && punchLng != null) {
          pts.push([Number(punchLat), Number(punchLng)]);
        }
      }
    });

    if (pts.length > 0) {
      map.fitBounds(L.latLngBounds(pts), { padding: [60, 60], maxZoom: 15 });
    } else {
      map.setView([23.0225, 72.5714], 11);
    }
  }, [mapsLoaded, mapVisibleUsers, mode]);

  const centerOnHQ = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.setView([23.0225, 72.5714], 12, { animate: true });
  };

  // Smart grouped user list for the 7-Day History dropdown
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

  // Resolve human-readable address for selected user via backend OpenStreetMap Nominatim (cached)
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

  const handleSelectUserCard = (u) => {
    const hasCoord = u.latestLocation?.latitude != null && u.latestLocation?.longitude != null;
    setSelectedUserId(u.userId);
    if (hasCoord && mapInstanceRef.current) {
      const lat = Number(u.latestLocation.latitude);
      const lng = Number(u.latestLocation.longitude);
      const targetZoom = Math.max(mapInstanceRef.current.getZoom(), 14);
      mapInstanceRef.current.setView([lat, lng], targetZoom, { animate: true });
      showAccuracyCircle(lat, lng, u.latestLocation.accuracy || 15);
    }
    if (u.activeShift) {
      drawShiftRouteOnMap(u);
    }
  };

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
      {/* ── 1. HEADER BANNER & TRUTHFUL SUMMARY METRICS ─────────────────────── */}
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
                flexWrap: 'wrap',
              }}
            >
              {isHrPortal ? 'HR Live Map — Real-Time Tracking' : 'Super Admin Map — Real-Time Tracking'}
              <span
                style={{
                  fontSize: '10.5px',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '10px',
                  background: '#ECFDF5',
                  color: '#047857',
                  border: '1px solid #A7F3D0',
                }}
              >
                OPENSTREETMAP LIVE
              </span>
            </h2>
            <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748B' }}>
              Authoritative multi-device GPS telemetry, verified accuracy, stacked-pin spiderfy &amp; 7-day movement history
            </p>
          </div>
        </div>

        {/* Real-time Connection Indicator & Truthful Summary Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '5px 10px', fontSize: '11.5px', color: '#0F172A', fontWeight: 600 }}>
            👥 Staff: <strong>{summaryMetrics.total}</strong>
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
          <div style={{ background: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '5px 10px', fontSize: '11.5px', color: '#475569', fontWeight: 600 }}>
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
            onClick={() => void fetchAllData({ forceOverview: true })}
            title="Manual sync (scroll position preserved)"
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
            <Lucide.RefreshCw size={13} className={isSyncing ? 'animate-spin' : ''} />
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
          { id: 'ALL_USERS', label: 'LIVE MAP', icon: '🗺️', badge: summaryMetrics.total },
          { id: 'ACTIVE_SHIFTS', label: 'ACTIVE SHIFTS', icon: '🟢', badge: summaryMetrics.onShift },
          { id: 'ROUTE_HISTORY', label: 'LAST 7 DAYS HISTORY', icon: '📅', badge: '7D' },
          {
            id: 'DEVICE_SESSIONS',
            label: 'DEVICE SESSIONS',
            icon: '💻',
            badge: `${summaryMetrics.onlineSessionsTotal} live / ${summaryMetrics.totalSessionsCount}`,
          },
        ].map((tab) => {
          const isActive = mode === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setMode(tab.id);
                setExpandedClusterKey(null);
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
                    background: isActive ? 'rgba(255,255,255,0.22)' : '#E2E8F0',
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

      {/* ── 3. MAIN WORKSPACE SPLIT VIEW ─────────────────────────────────────── */}
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
            zIndex: 450,
            height: isMobile ? 'calc(100% - 24px)' : '100%',
            boxShadow: isMobile
              ? '0 10px 15px -3px rgba(0,0,0,0.1)'
              : '0 2px 4px rgba(0,0,0,0.02)',
            overflow: 'hidden',
          }}
        >
          {/* ═══ MODE: ALL_USERS or ACTIVE_SHIFTS ═══ */}
          {(mode === 'ALL_USERS' || mode === 'ACTIVE_SHIFTS') && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>
                    {mode === 'ALL_USERS' ? 'Authorized Users Directory' : 'Active Shift Routes'}
                  </h3>
                  <span style={{ fontSize: '11px', color: '#64748B' }}>
                    Showing {filteredUsers.length} of {allUsers.length} employees • Map synced to filter
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
                    <Lucide.Crosshair size={13} /> Fit Filtered
                  </button>
                  <button
                    onClick={() => void fetchAllData({ forceOverview: true })}
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
                    <Lucide.RefreshCw size={13} className={isSyncing ? 'animate-spin' : ''} />
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

              {/* Department Pills Bar (includes Back Office!) */}
              <div
                style={{
                  display: 'flex',
                  gap: '4px',
                  overflowX: 'auto',
                  paddingBottom: '2px',
                }}
              >
                {DEPARTMENT_PILLS.map((dept) => {
                  const isDeptActive = selectedDepartment === dept;
                  return (
                    <button
                      key={dept}
                      onClick={() => {
                        setSelectedDepartment(dept);
                        setExpandedClusterKey(null);
                      }}
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
                  { id: 'ALL', label: 'All', count: summaryMetrics.total },
                  { id: 'LIVE', label: '🟢 Live', count: summaryMetrics.live },
                  { id: 'STALE', label: '🟡 Stale', count: summaryMetrics.stale },
                  { id: 'OFFLINE', label: '🔴 Off', count: summaryMetrics.offline },
                  { id: 'NO_LOCATION', label: '⚪ No GPS', count: summaryMetrics.noLocation },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setStatusFilter(tab.id);
                      setExpandedClusterKey(null);
                    }}
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

              {/* Scroll-Stable User List (NEVER unmounted during background refresh!) */}
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
                {initialLoading ? (
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
                    const status = u.overallStatus;
                    const gpsAgeSec = getLiveGpsAgeSeconds(u);
                    const accBadge = formatAccuracyBadge(u.latestLocation?.accuracy);

                    return (
                      <div
                        key={u.userId}
                        onClick={() => handleSelectUserCard(u)}
                        style={{
                          background: isSelected ? '#F0F9FF' : '#FFFFFF',
                          border: `1.5px solid ${isSelected ? '#0284C7' : '#E2E8F0'}`,
                          borderRadius: '10px',
                          padding: '10px 12px',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px',
                          transition: 'border-color 0.15s ease, background 0.15s ease',
                          boxShadow: isSelected ? '0 2px 6px rgba(2, 132, 199, 0.15)' : 'none',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
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
                                flexShrink: 0,
                              }}
                            >
                              {cfg.emoji}
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {u.name}
                                {u.employeeCode && (
                                  <span style={{ fontSize: '10px', color: '#64748B', fontWeight: 500, marginLeft: '6px' }}>
                                    ({u.employeeCode})
                                  </span>
                                )}
                              </div>
                              <div style={{ fontSize: '11px', color: '#64748B', display: 'flex', gap: '5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                <span>{u.role}</span>
                                <span>•</span>
                                <span style={{ color: cfg.textColor, fontWeight: 600 }}>{u.department || cat}</span>
                              </div>
                            </div>
                          </div>

                          <div
                            style={{
                              fontSize: '10px',
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: '10px',
                              flexShrink: 0,
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
                            {accBadge && (
                              <span
                                style={{
                                  fontSize: '9.5px',
                                  fontWeight: 700,
                                  color: accBadge.color,
                                  background: accBadge.bg,
                                  border: `1px solid ${accBadge.border}`,
                                  padding: '0px 5px',
                                  borderRadius: '6px',
                                }}
                              >
                                {accBadge.icon} {accBadge.label}
                              </span>
                            )}
                            {overview7d[u.userId]?.daysTracked > 0 && (
                              <span
                                style={{
                                  fontSize: '9.5px',
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
                              flexShrink: 0,
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

          {/* ═══ MODE: ROUTE_HISTORY (LAST 7 DAYS / 14 DAYS / CUSTOM) ═══ */}
          {mode === 'ROUTE_HISTORY' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>
                    Last 7 Days Movement &amp; Stops
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

              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Select Sales / Staff Member:
                </label>
                <select
                  value={selectedHistoryEmployeeId}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedHistoryEmployeeId(val);
                    if (val) void load7DayHistory(val);
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

                      {historyData.dayCircle && (
                        <div
                          style={{
                            fontSize: '10.5px',
                            padding: '5px 8px',
                            borderRadius: '7px',
                            background: historyData.dayCircle.circleClosed ? '#ECFDF5' : '#F8FAFC',
                            border: `1px solid ${historyData.dayCircle.circleClosed ? '#A7F3D0' : '#E2E8F0'}`,
                            color: historyData.dayCircle.circleClosed ? '#065F46' : '#334155',
                          }}
                        >
                          {historyData.dayCircle.circleClosed
                            ? `✅ Full Day Circle Closed (returned within ${historyData.dayCircle.returnDistanceFromStartKm} km of Punch-In)`
                            : historyData.session?.status === 'ACTIVE'
                            ? '🟢 Shift In Progress (Punch-Out pending)'
                            : historyData.dayCircle.returnDistanceFromStartKm != null
                            ? `📍 Ended ${historyData.dayCircle.returnDistanceFromStartKm} km from Punch-In`
                            : '📍 Single-location / Punch-In only'}
                        </div>
                      )}

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
                            🛣️ Follow Roads (OSM) {roadRouteInfo?.loading ? '...' : ''}
                          </button>
                        </div>
                      )}

                      {roadRouteInfo?.error && (
                        <div style={{ fontSize: '10px', color: '#92400E', background: '#FFFBEB', padding: '4px 7px', borderRadius: '5px' }}>
                          {roadRouteInfo.error}
                        </div>
                      )}

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
                                if (playbackIndex >= (historyData.points?.length || 1) - 1) setPlaybackIndex(0);
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
                              <span>🕒 <strong style={{ color: '#0F172A' }}>{new Date(historyData.points[playbackIndex].recordedAt).toLocaleTimeString()}</strong></span>
                              <span>🚀 <strong style={{ color: '#0284C7' }}>{Math.round(historyData.points[playbackIndex].speed || 0)} km/h</strong></span>
                              <span>🎯 <strong style={{ color: '#475569' }}>±{Math.round(historyData.points[playbackIndex].accuracy || 15)}m</strong></span>
                            </div>
                          )}
                        </div>
                      )}

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
                                      flexShrink: 0,
                                    }}
                                  >
                                    {badgeStyle.label}
                                  </div>
                                  {!isLast && <div style={{ width: '2px', flex: 1, minHeight: '14px', background: '#CBD5E1', margin: '2px 0' }} />}
                                </div>

                                <div
                                  onClick={() => {
                                    if (hasCoord && mapInstanceRef.current && leafletRef.current) {
                                      const pos = [Number(step.latitude), Number(step.longitude)];
                                      mapInstanceRef.current.setView(pos, 16, { animate: true });
                                      leafletRef.current
                                        .popup()
                                        .setLatLng(pos)
                                        .setContent(`
                                          <div style="font-family:system-ui,sans-serif;max-width:240px;">
                                            <div style="font-weight:700;color:${badgeStyle.text};font-size:13px;">${escapeHtml(step.title)}</div>
                                            <div style="font-size:11px;color:#475569;margin-top:3px;line-height:1.4;">
                                              <strong>Time:</strong> ${escapeHtml(new Date(step.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))}${step.endTime ? ` – ${escapeHtml(new Date(step.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))}` : ''}<br/>
                                              ${step.address ? `<strong>Location:</strong> ${escapeHtml(step.address)}` : `<strong>GPS:</strong> ${Number(step.latitude).toFixed(4)}, ${Number(step.longitude).toFixed(4)}`}
                                            </div>
                                          </div>
                                        `)
                                        .openOn(mapInstanceRef.current);
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
                                    <div style={{ fontSize: '10px', color: '#475569', marginTop: '2px', lineHeight: 1.35 }} title={step.address}>
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
                  <div style={{ fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>Select an Employee</div>
                  Pick any employee above (or click <strong>7-Day</strong> on any card) to inspect their last 7 days of routes, distances, field stops &amp; CRM leads.
                </div>
              )}
            </>
          )}

          {/* ═══ MODE: DEVICE_SESSIONS (HONEST MULTI-DEVICE INVENTORY) ═══ */}
          {mode === 'DEVICE_SESSIONS' && (
            <>
              <div>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>Hardware &amp; Web Presence</h3>
                <span style={{ fontSize: '11px', color: '#64748B' }}>
                  {summaryMetrics.onlineSessionsTotal} online right now • {summaryMetrics.totalSessionsCount} total sessions across {allUsers.length} users (click a user to inspect all devices)
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
                  const onlineCount = (u.sessions || []).filter((x) => x.status === 'ONLINE').length;
                  const totalCount = (u.sessions || []).length;
                  const isExpanded = expandedDeviceUserId === u.userId;
                  return (
                    <div
                      key={u.userId}
                      onClick={() => {
                        setExpandedDeviceUserId(isExpanded ? null : u.userId);
                        handleSelectUserCard(u);
                      }}
                      style={{
                        background: selectedUserId === u.userId ? '#F0F9FF' : '#FFFFFF',
                        border: `1.5px solid ${selectedUserId === u.userId ? '#0284C7' : '#E2E8F0'}`,
                        borderRadius: '10px',
                        padding: '10px 12px',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                            {u.name}
                            <span style={{ fontSize: '10px', color: '#64748B', fontWeight: 500, marginLeft: '6px' }}>
                              ({totalCount} {totalCount === 1 ? 'device' : 'devices'})
                            </span>
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748B' }}>
                            {u.role} • {s ? `${s.deviceType} (${s.operatingSystem || 'OS'} / ${s.browser || 'Browser'})` : 'Never logged in'}
                          </div>
                        </div>
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 700,
                            padding: '2px 7px',
                            borderRadius: '10px',
                            flexShrink: 0,
                            background: onlineCount > 0 ? '#DCFCE7' : '#F1F5F9',
                            color: onlineCount > 0 ? '#15803D' : '#64748B',
                          }}
                        >
                          {onlineCount > 0 ? `🟢 ${onlineCount} ONLINE` : 'OFFLINE'}
                        </span>
                      </div>

                      {isExpanded && totalCount > 0 && (
                        <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                          {(u.sessions || []).slice(0, 6).map((sess) => {
                            const accB = formatAccuracyBadge(sess.location?.accuracy);
                            return (
                              <div
                                key={sess.sessionId}
                                style={{
                                  fontSize: '10.5px',
                                  background: '#F8FAFC',
                                  border: '1px solid #E2E8F0',
                                  borderRadius: '6px',
                                  padding: '5px 8px',
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  gap: '6px',
                                }}
                              >
                                <div style={{ color: '#334155' }}>
                                  <strong>{sess.deviceType}</strong> • {sess.operatingSystem || '?'} / {sess.browser || '?'}
                                  <div style={{ fontSize: '9.5px', color: '#64748B' }}>
                                    Seen {formatGpsAge(sess.heartbeatAgeSeconds)} • Perm: {sess.locationPermission}
                                  </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  {accB && (
                                    <span style={{ fontSize: '9.5px', fontWeight: 700, background: accB.bg, color: accB.color, padding: '1px 5px', borderRadius: '5px' }}>
                                      {accB.label}
                                    </span>
                                  )}
                                  <span style={{ fontSize: '9.5px', fontWeight: 700, color: sess.status === 'ONLINE' ? '#15803D' : '#94A3B8' }}>
                                    {sess.status}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* ── 4. RIGHT OPENSTREETMAP / LEAFLET CANVAS & DETAIL OVERLAY ────────── */}
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
              zIndex: 420,
              display: 'flex',
              gap: '6px',
              flexWrap: 'wrap',
              justifyContent: 'flex-end',
            }}
          >
            {/* Tile Layer Switcher (Clean / OSM Street / Satellite) */}
            <div
              style={{
                display: 'flex',
                background: '#FFFFFF',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                padding: '2px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
              }}
            >
              {Object.values(MAP_TILE_LAYERS).map((layerCfg) => (
                <button
                  key={layerCfg.id}
                  onClick={() => setTileLayerKey(layerCfg.id)}
                  style={{
                    background: tileLayerKey === layerCfg.id ? '#0F172A' : 'transparent',
                    color: tileLayerKey === layerCfg.id ? '#FFFFFF' : '#334155',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '6px 9px',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {layerCfg.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => setFollowUser(!followUser)}
              title={followUser ? 'Stop following user' : 'Continuously center on selected user'}
              style={{
                background: followUser ? '#2563EB' : '#FFFFFF',
                color: followUser ? '#FFFFFF' : '#0F172A',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                padding: '7px 11px',
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
              title="Center on Ahmedabad HQ"
              style={{
                background: '#FFFFFF',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                padding: '7px 11px',
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
              onClick={fitAllMarkers}
              title="Fit currently filtered pins"
              style={{
                background: '#FFFFFF',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                padding: '7px 11px',
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

            <button
              onClick={() => setShowDrawer(!showDrawer)}
              style={{
                background: '#FFFFFF',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                padding: '7px 11px',
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
                zIndex: 430,
                maxWidth: '440px',
                width: 'calc(100% - 32px)',
                background: '#FFFFFF',
                border: '1.5px solid #0284C7',
                borderRadius: '12px',
                padding: '14px',
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.18)',
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
                      {selectedUser.role} • {selectedUser.department || selectedUser.roleCategory || 'Operations'}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedUserId(null);
                    clearAccuracyCircle();
                  }}
                  style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '2px' }}
                >
                  <Lucide.X size={16} />
                </button>
              </div>

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
                    <div>STALE GPS POSITION ({formatGpsAge(getLiveGpsAgeSeconds(selectedUser))})</div>
                    <div style={{ fontSize: '10.5px', color: '#B45309', fontWeight: 400, marginTop: '2px' }}>
                      Device has not transmitted fresh telemetry. Showing last verified coordinate.
                    </div>
                  </div>
                </div>
              )}

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
                    <span style={{ color: '#64748B', display: 'block', fontSize: '9.5px', fontWeight: 600 }}>SIGNAL / ACCURACY</span>
                    {(() => {
                      const b = formatAccuracyBadge(selectedUser.latestLocation.accuracy);
                      return b ? (
                        <strong style={{ color: b.color }}>{b.icon} {b.label}</strong>
                      ) : (
                        <strong style={{ color: '#0284C7' }}>±10m</strong>
                      );
                    })()}
                  </div>
                  <div>
                    <span style={{ color: '#64748B', display: 'block', fontSize: '9.5px', fontWeight: 600 }}>LAST UPDATED</span>
                    <strong style={{ color: '#16A34A' }}>
                      {formatGpsAge(getLiveGpsAgeSeconds(selectedUser))}
                    </strong>
                  </div>
                </div>
              ) : (
                <div style={{ padding: '8px', background: '#F8FAFC', borderRadius: '8px', fontSize: '11.5px', color: '#64748B', textAlign: 'center' }}>
                  No GPS coordinates recorded for this account yet.
                </div>
              )}

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

          {/* OpenStreetMap / Leaflet Map Container */}
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
              Failed to load OpenStreetMap: {mapsError}
            </div>
          ) : (
            <div ref={mapContainerRef} style={{ width: '100%', height: '100%', zIndex: 1 }} />
          )}
        </div>
      </div>
    </div>
  );
}
