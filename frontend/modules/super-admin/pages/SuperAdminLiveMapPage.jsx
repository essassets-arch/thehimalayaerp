'use client';

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
    color: '#059669', // Forest Green
    accentColor: '#065F46',
    lightBg: '#F0FDF4',
    borderColor: '#86EFAC',
    textColor: '#15803D',
    glowColor: 'rgba(5, 150, 105, 0.5)',
    iconType: 'finance',
    emoji: '💼',
    description: 'Finance Manager & Accountants (Briefcase Icon)',
  },
  'Procurement': {
    name: 'Procurement',
    shortName: 'Procurement',
    color: '#06B6D4', // Cyan
    accentColor: '#0E7490',
    lightBg: '#ECFEFF',
    borderColor: '#67E8F9',
    textColor: '#0E7490',
    glowColor: 'rgba(6, 182, 212, 0.5)',
    iconType: 'procurement',
    emoji: '🛒',
    description: 'Purchase Manager & Sourcing (Shopping Cart Icon)',
  },
  'Admin': {
    name: 'Super Admin',
    shortName: 'Admin',
    color: '#0F172A', // Slate
    accentColor: '#020617',
    lightBg: '#F8FAFC',
    borderColor: '#CBD5E1',
    textColor: '#0F172A',
    glowColor: 'rgba(15, 23, 42, 0.5)',
    iconType: 'admin',
    emoji: '⭐',
    description: 'Super Admin & Executive Leadership (Crown / Shield Icon)',
  },
  'Other': {
    name: 'Other Staff',
    shortName: 'Other',
    color: '#64748B',
    accentColor: '#334155',
    lightBg: '#F1F5F9',
    borderColor: '#CBD5E1',
    textColor: '#475569',
    glowColor: 'rgba(100, 116, 139, 0.5)',
    iconType: 'other',
    emoji: '📍',
    description: 'Company Personnel (Pin Marker)',
  },
};

// ─── HIGH-QUALITY SVG PIN MARKER GENERATOR ────────────────────────────────────
export const getRoleSvgIcon = (role, heading, status, isHighlighted = false) => {
  const category = getCategoryForRole(role);
  const cfg = ROLE_CONFIG[category] || ROLE_CONFIG['Other'];
  const isOnline = status === 'ONLINE';
  const isRecent = status === 'RECENTLY_ACTIVE';

  let pinColor = cfg.color;
  if (!isOnline) {
    pinColor = isRecent ? '#F59E0B' : '#94A3B8';
  }

  // Heading calculation for moving vehicles
  const normalizedHeading = Number.isFinite(heading)
    ? ((heading % 360) + 360) % 360
    : 0;
  const shouldRotate = (category === 'Sales' || category === 'Dispatch') && heading !== null && heading !== undefined;
  const rotation = shouldRotate ? normalizedHeading : 0;

  // Center vector icon symbol
  let innerIcon = '';
  if (category === 'Sales') {
    // Motorcycle / Bike Icon
    innerIcon = `
      <g transform="translate(6.5, 5.5) scale(0.48)" fill="${pinColor}">
        <path d="M19.5 13.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zm-15 0a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zm12.5-3.5h-2.18l-1.63-3.26A1.5 1.5 0 0 0 11.85 6H8.5a1 1 0 0 0 0 2h2.85l1.5 3H6.5a1 1 0 0 0 0 2h6.86l2.14 3.86a1 1 0 0 0 .87.54h1.13a1 1 0 0 0 0-2h-.63L15.2 12H17a1 1 0 0 0 0-2z"/>
      </g>
    `;
  } else if (category === 'Plant Head') {
    // Factory with Smokestacks & Crown Accent
    innerIcon = `
      <g transform="translate(6.5, 5.5) scale(0.48)" fill="${pinColor}">
        <path d="M12 2l2.5 3.5 3.5-1-1.5 4.5h-9L6 4.5l3.5 1L12 2zm-8 8.5h16V19H4v-8.5zm3 2.5v3h2v-3H7zm5 0v3h2v-3h-2zm5 0v3h2v-3h-2z"/>
      </g>
    `;
  } else if (category === 'HR') {
    // People / Team / Identification Badge
    innerIcon = `
      <g transform="translate(6.5, 5.5) scale(0.48)" fill="${pinColor}">
        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
      </g>
    `;
  } else if (category === 'Dispatch') {
    // Delivery Cargo Truck
    innerIcon = `
      <g transform="translate(6.5, 5.5) scale(0.48)" fill="${pinColor}">
        <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm12 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6.5h-2.5V9.5h2.5v2.5z"/>
      </g>
    `;
  } else if (category === 'Production') {
    // Mechanical Gear & Hardhat
    innerIcon = `
      <g transform="translate(6.5, 5.5) scale(0.48)" fill="${pinColor}">
        <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.488.488 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54A.484.484 0 0 0 13.9 2h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.71 8.55c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
      </g>
    `;
  } else if (category === 'Store') {
    // Package Box
    innerIcon = `
      <g transform="translate(6.5, 5.5) scale(0.48)" fill="${pinColor}">
        <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-8 2.5l5 3-5 3-5-3 5-3zM4 8.25l7 4.2v6.55H4V8.25zm16 10.75h-7v-6.55l7-4.2v10.75z"/>
      </g>
    `;
  } else if (category === 'Finance') {
    // Briefcase / Currency
    innerIcon = `
      <g transform="translate(6.5, 5.5) scale(0.48)" fill="${pinColor}">
        <path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2zm-2 11c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"/>
      </g>
    `;
  } else if (category === 'QC') {
    // Shield Check
    innerIcon = `
      <g transform="translate(6.5, 5.5) scale(0.48)" fill="${pinColor}">
        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
      </g>
    `;
  } else if (category === 'Procurement') {
    // Shopping Cart
    innerIcon = `
      <g transform="translate(6.5, 5.5) scale(0.48)" fill="${pinColor}">
        <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1.003 1.003 0 0 0 20 4H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
      </g>
    `;
  } else if (category === 'Admin') {
    // Star Crown Shield
    innerIcon = `
      <g transform="translate(6.5, 5.5) scale(0.48)" fill="${pinColor}">
        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 6l1.76 3.57 3.94.57-2.85 2.78.67 3.92L12 16l-3.52 1.84.67-3.92-2.85-2.78 3.94-.57L12 7z"/>
      </g>
    `;
  } else {
    // Generic Pin Point
    innerIcon = `
      <g transform="translate(6.5, 5.5) scale(0.48)" fill="${pinColor}">
        <circle cx="12" cy="12" r="7"/>
      </g>
    `;
  }

  // Live Pulse Ring on top right
  const liveIndicator = isOnline
    ? `<circle cx="19" cy="5" r="3.5" fill="#10B981" stroke="#FFFFFF" stroke-width="1.2"/>`
    : isRecent
    ? `<circle cx="19" cy="5" r="3.5" fill="#F59E0B" stroke="#FFFFFF" stroke-width="1.2"/>`
    : '';

  // Highlight Halo if highlighted
  const highlightHalo = isHighlighted
    ? `<circle cx="12" cy="11" r="11" fill="none" stroke="${cfg.color}" stroke-width="2.5" opacity="0.8"/>`
    : '';

  const pinSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 28" width="44" height="50">
      ${highlightHalo}
      <path d="M12 2C7.58 2 4 5.58 4 10c0 5.8 8 15 8 15s8-9.2 8-15c0-4.42-3.58-8-8-8z" fill="${pinColor}" stroke="#FFFFFF" stroke-width="1.8" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.25))"/>
      <circle cx="12" cy="10" r="7" fill="#FFFFFF"/>
      <g transform="rotate(${rotation} 12 10)">
        ${innerIcon}
      </g>
      ${liveIndicator}
    </svg>
  `;

  return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(pinSvg);
};

export default function SuperAdminLiveMapPage() {
  const { accessToken, user } = useAuthStore();
  const [usersData, setUsersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [mapsError, setMapsError] = useState(null);
  const [liveStatus, setLiveStatus] = useState('OFFLINE'); // 'LIVE' | 'RECONNECTING' | 'OFFLINE'
  const [lastRestSync, setLastRestSync] = useState(null);
  const [lastSocketEvent, setLastSocketEvent] = useState(null);

  // Mode & Route History States
  const [mode, setMode] = useState('LIVE'); // 'LIVE' | 'HISTORY'
  const [selectedUserForHistory, setSelectedUserForHistory] = useState(null);
  const [historyPoints, setHistoryPoints] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState(null);
  const [selectedDateOption, setSelectedDateOption] = useState('today');
  const [customDateFrom, setCustomDateFrom] = useState(() => getLocalDateString());
  const [customDateTo, setCustomDateTo] = useState(() => getLocalDateString());
  const [playbackIndex, setPlaybackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [historyMetadata, setHistoryMetadata] = useState(null);
  const [initialBoundsFitDone, setInitialBoundsFitDone] = useState(false);
  
  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('All');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'ONLINE_GPS' | 'ONLINE' | 'HAS_LOCATION'
  const [selectedDevice, setSelectedDevice] = useState('All');
  const [selectedSessionId, setSelectedSessionId] = useState(null);

  // Layout Mobile Toggle
  const [showDrawer, setShowDrawer] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleResize = () => {
        const mobile = window.innerWidth < 768;
        setIsMobile(mobile);
        if (mobile) {
          setShowDrawer(false);
        }
      };
      handleResize();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  // Refs for Google Map & Markers
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({}); // sessionId -> google.maps.Marker
  const infoWindowRef = useRef(null);
  const socketRef = useRef(null);

  // Refs for Location History Overlays
  const historyPolylineRef = useRef(null);
  const historyStartMarkerRef = useRef(null);
  const historyEndMarkerRef = useRef(null);
  const playbackMarkerRef = useRef(null);
  
  // Geocoding cache: coordinates -> address string
  const geocodeCacheRef = useRef({});

  // Dynamic values derived from env
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  // 1. Fetch live users snapshot (Authoritative REST)
  const fetchSnapshot = useCallback(async () => {
    try {
      let data = await backendFetch('/super-admin/live-users');
      if (!data || !Array.isArray(data)) {
        data = await backendFetch('/location/live-users');
      }
      const rawUsers = data || [];
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
      setLastRestSync(new Date().toLocaleTimeString());
      setLoading(false);
      return normalizedUsers;
    } catch (err) {
      try {
        const data = await backendFetch('/location/live-users');
        const rawUsers = data || [];
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
        setLastRestSync(new Date().toLocaleTimeString());
        setLoading(false);
        return normalizedUsers;
      } catch (fallbackErr) {
        console.error('Error fetching live users snapshot:', fallbackErr);
        setLoading(false);
        return [];
      }
    }
  }, []);

  // 2. Load Google Maps Script
  useEffect(() => {
    if (!apiKey) {
      setMapsError(
        'Google Maps API key is not configured. Please define NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your environment configuration.'
      );
      return;
    }

    const loadScript = () => {
      if (window.google && window.google.maps) {
        setMapsLoaded(true);
        return;
      }
      const existing = document.getElementById('google-maps-api-script');
      if (existing) {
        existing.addEventListener('load', () => setMapsLoaded(true));
        existing.addEventListener('error', () => {
          setMapsError('Google Maps failed to load. Check API key and referrer restrictions.');
        });
        return;
      }
      const script = document.createElement('script');
      script.id = 'google-maps-api-script';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry,places`;
      script.async = true;
      script.defer = true;
      script.addEventListener('load', () => setMapsLoaded(true));
      script.addEventListener('error', () => {
        setMapsError('Google Maps failed to load. Check API key and referrer restrictions.');
      });
      document.body.appendChild(script);
    };

    loadScript();
  }, [apiKey]);

  // 3. Initialize Map once loaded
  useEffect(() => {
    if (!mapsLoaded || !mapContainerRef.current || mapInstanceRef.current) return;

    try {
      const mapOptions = {
        center: { lat: 23.0225, lng: 72.5714 }, // Default center: Ahmedabad
        zoom: 12,
        styles: [
          { elementType: 'geometry', stylers: [{ color: '#f8fafc' }] },
          { elementType: 'labels.text.stroke', stylers: [{ color: '#ffffff' }] },
          { elementType: 'labels.text.fill', stylers: [{ color: '#475569' }] },
          { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
          { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#e2e8f0' }] },
          { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#bae6fd' }] },
          { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#dcfce7' }] }
        ],
        mapTypeControl: false,
        fullscreenControl: true,
        streetViewControl: false,
      };

      const map = new window.google.maps.Map(mapContainerRef.current, mapOptions);
      mapInstanceRef.current = map;
      infoWindowRef.current = new window.google.maps.InfoWindow();

      fitAllMarkers(true);
    } catch (err) {
      console.error('Failed to initialize Google Maps:', err);
      setMapsError('Failed to initialize Google Maps instance.');
    }
  }, [mapsLoaded]);

  // 4. Connect to Socket.IO for realtime updates
  useEffect(() => {
    if (!accessToken) return;

    const cleanToken = (accessToken || '').replace(/^Bearer\s+/i, '').trim();

    // Connect to NestJS backend Socket.IO
    // Development: http://localhost:4000
    // Production: same-origin (https://thehimalaya.cloud) with /socket.io handled via Caddy reverse proxy
    let socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_BACKEND_SOCKET_URL || '';
    if (typeof window !== 'undefined') {
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      if (isLocalhost) {
        socketUrl = socketUrl || `${window.location.protocol}//${window.location.hostname}:4001`;
      } else {
        socketUrl = window.location.origin;
      }
    } else {
      socketUrl = socketUrl || 'http://localhost:4001';
    }

    const socket = io(socketUrl, {
      path: '/socket.io',
      auth: { token: cleanToken },
      query: { token: cleanToken },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setLiveStatus('LIVE');
      setLastSocketEvent({ name: 'connect', time: new Date().toLocaleTimeString() });
      fetchSnapshot();
    });

    socket.on('connect_error', (err) => {
      console.warn('[LiveMap] Socket connection notice (REST sync active):', err?.message || err);
      setLiveStatus('RECONNECTING');
    });

    socket.on('disconnect', (reason) => {
      console.warn('[LiveMap] Socket disconnected:', reason);
      setLiveStatus('OFFLINE');
      setLastSocketEvent({ name: 'disconnect', time: new Date().toLocaleTimeString() });
    });

    socket.on('device:connected', (data) => {
      setLastSocketEvent({ name: 'device:connected', time: new Date().toLocaleTimeString() });
      fetchSnapshot();
    });

    socket.on('device:disconnected', (data) => {
      setLastSocketEvent({ name: 'device:disconnected', time: new Date().toLocaleTimeString() });
      setUsersData((prev) =>
        prev.map((u) => {
          if (u.userId !== data.userId) return u;
          return {
            ...u,
            sessions: u.sessions.map((s) => {
              if (s.sessionId !== data.sessionId) return s;
              return { ...s, status: 'OFFLINE', lastSeenAt: new Date(data.disconnectedAt) };
            }),
          };
        })
      );
    });

    socket.on('device:heartbeat', (data) => {
      setLastSocketEvent({ name: 'device:heartbeat', time: new Date().toLocaleTimeString() });
      setUsersData((prev) => {
        const exists = prev.some((u) => u.userId === data.userId && u.sessions.some((s) => s.sessionId === data.sessionId));
        if (!exists) {
          fetchSnapshot();
          return prev;
        }
        return prev.map((u) => {
          if (u.userId !== data.userId) return u;
          return {
            ...u,
            sessions: u.sessions.map((s) => {
              if (s.sessionId !== data.sessionId) return s;
              return { ...s, status: 'ONLINE', lastSeenAt: new Date(data.lastSeenAt) };
            }),
          };
        });
      });
    });

    socket.on('user:location:update', (data) => {
      setLastSocketEvent({ name: 'user:location:update', time: new Date().toLocaleTimeString() });
      setUsersData((prev) =>
        prev.map((u) => {
          if (u.userId !== data.userId) return u;
          return {
            ...u,
            sessions: u.sessions.map((s) => {
              if (s.sessionId !== data.sessionId) return s;
              const newLocation = {
                latitude: data.latitude,
                longitude: data.longitude,
                accuracy: data.accuracy,
                speed: data.speed,
                heading: data.heading,
                batteryLevel: data.batteryLevel,
                capturedAt: new Date(data.capturedAt),
              };
              updateMarkerOnMap(s.sessionId, u.name, u.role, newLocation, s.deviceType, s.status, s.locationPermission);
              return { ...s, status: 'ONLINE', lastSeenAt: new Date(), location: newLocation };
            }),
          };
        })
      );
    });

    socket.on('device:permission:update', (data) => {
      setLastSocketEvent({ name: 'device:permission:update', time: new Date().toLocaleTimeString() });
      setUsersData((prev) =>
        prev.map((u) => {
          if (u.userId !== data.userId) return u;
          return {
            ...u,
            sessions: u.sessions.map((s) => {
              if (s.sessionId !== data.sessionId) return s;
              return { ...s, status: 'ONLINE', locationPermission: data.locationPermission, lastSeenAt: new Date() };
            }),
          };
        })
      );
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [accessToken, fetchSnapshot]);

  // Initial load and periodic background polling (authoritative 4s interval)
  useEffect(() => {
    fetchSnapshot();
    const interval = setInterval(() => {
      fetchSnapshot();
    }, 4000);
    return () => clearInterval(interval);
  }, [fetchSnapshot]);

  // 5. Synced Marker Management on Map
  useEffect(() => {
    if (!mapsLoaded || !mapInstanceRef.current) return;

    const activeSessionIds = new Set();

    usersData.forEach((u) => {
      const userCategory = getCategoryForRole(u.role);
      
      u.sessions.forEach((s) => {
        if (s.location) {
          activeSessionIds.add(s.sessionId);

          // 1. Role filter
          let matchesRole = true;
          if (selectedRole !== 'All') {
            matchesRole = (userCategory === selectedRole);
          }

          // 2. Status filter
          let matchesStatus = true;
          if (statusFilter === 'ONLINE_GPS') {
            matchesStatus = s.status === 'ONLINE' && !!s.location;
          } else if (statusFilter === 'ONLINE') {
            matchesStatus = s.status === 'ONLINE';
          } else if (statusFilter === 'HAS_LOCATION') {
            matchesStatus = !!s.location;
          }

          // 3. Device filter
          let matchesOS = true;
          if (selectedDevice !== 'All') {
            matchesOS = (s.operatingSystem === selectedDevice);
          }

          // 4. Search query filter
          let matchesSearch = true;
          if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const nameMatch = u.name.toLowerCase().includes(query);
            const roleMatch = u.role.toLowerCase().includes(query);
            const emailMatch = u.email?.toLowerCase().includes(query) || false;
            const osMatch = s.operatingSystem?.toLowerCase().includes(query) || false;
            matchesSearch = nameMatch || roleMatch || emailMatch || osMatch;
          }

          const visible = matchesRole && matchesStatus && matchesOS && matchesSearch;
          const isHighlighted = selectedRole !== 'All' && userCategory === selectedRole;
          updateMarkerOnMap(s.sessionId, u.name, u.role, s.location, s.deviceType, s.status, s.locationPermission, visible, isHighlighted);
        }
      });
    });

    // Remove stale markers
    Object.keys(markersRef.current).forEach((sid) => {
      if (!activeSessionIds.has(sid)) {
        markersRef.current[sid].setMap(null);
        delete markersRef.current[sid];
      }
    });
  }, [usersData, mapsLoaded, selectedRole, statusFilter, selectedDevice, searchQuery]);

  // Create or Update Marker in place
  const updateMarkerOnMap = (sessionId, name, role, loc, deviceType, status, locationPermission, visible = true, isHighlighted = false) => {
    if (!mapsLoaded || !mapInstanceRef.current) return;

    const latLng = new window.google.maps.LatLng(loc.latitude, loc.longitude);
    let marker = markersRef.current[sessionId];

    const iconUrl = getRoleSvgIcon(role, loc.heading, status, isHighlighted);

    if (marker) {
      marker.setPosition(latLng);
      marker.setIcon({
        url: iconUrl,
        scaledSize: new window.google.maps.Size(44, 50),
        anchor: new window.google.maps.Point(22, 50),
      });
      marker.setVisible(visible);
      marker.setZIndex(isHighlighted ? 999 : status === 'ONLINE' ? 100 : 10);
    } else {
      marker = new window.google.maps.Marker({
        position: latLng,
        map: mapInstanceRef.current,
        title: `${name} (${role})`,
        icon: {
          url: iconUrl,
          scaledSize: new window.google.maps.Size(44, 50),
          anchor: new window.google.maps.Point(22, 50),
        },
        visible: visible,
        zIndex: isHighlighted ? 999 : status === 'ONLINE' ? 100 : 10,
      });

      marker.addListener('click', () => {
        openInfoWindow(sessionId, name, role, loc, deviceType, status, locationPermission);
      });

      markersRef.current[sessionId] = marker;
    }
  };

  // Client-side Reverse Geocoding on-demand
  const geocodeAddress = (latitude, longitude, callback) => {
    const latStr = latitude.toFixed(4);
    const lngStr = longitude.toFixed(4);
    const cacheKey = `${latStr},${lngStr}`;

    if (geocodeCacheRef.current[cacheKey]) {
      callback(geocodeCacheRef.current[cacheKey]);
      return;
    }

    if (!window.google || !window.google.maps) {
      callback('Geocoding unavailable');
      return;
    }

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat: latitude, lng: longitude } }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const address = results[0].formatted_address;
        geocodeCacheRef.current[cacheKey] = address;
        callback(address);
      } else {
        callback('Address not found');
      }
    });
  };

  // Display Custom InfoWindow
  const openInfoWindow = (sessionId, name, role, loc, deviceType, status, locationPermission) => {
    const marker = markersRef.current[sessionId];
    const infoWindow = infoWindowRef.current;
    if (!marker || !infoWindow) return;

    setSelectedSessionId(sessionId);
    const category = getCategoryForRole(role);
    const cfg = ROLE_CONFIG[category] || ROLE_CONFIG['Other'];

    const updateContent = (address = '') => {
      const speedKmh = loc.speed !== null && loc.speed !== undefined ? Math.round(loc.speed * 3.6) : null;
      const accuracyStr = loc.accuracy ? `±${Math.round(loc.accuracy)} m` : null;
      const isCurrent = status === 'ONLINE' && locationPermission === 'GRANTED';

      infoWindow.setContent(`
        <div style="font-family:'Outfit',sans-serif; color:#0f172a; padding:6px; min-width:260px; font-size:13px; line-height:1.4;">
          <!-- Header Banner -->
          <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #e2e8f0; padding-bottom:8px; margin-bottom:8px;">
            <div>
              <div style="display:flex; align-items:center; gap:6px;">
                <span style="font-size:16px;">${cfg.emoji}</span>
                <strong style="font-size:15px; color:#0f172a;">${name}</strong>
              </div>
              <div style="display:inline-block; font-size:11px; padding:2px 8px; border-radius:12px; font-weight:600; margin-top:3px; background:${cfg.lightBg}; color:${cfg.textColor}; border:1px solid ${cfg.borderColor};">
                ${cfg.name} • ${role}
              </div>
            </div>
            <span style="font-size:10px; padding:3px 8px; border-radius:12px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px;
              ${status === 'ONLINE' ? 'background:#d1fae5; color:#065f46; border:1px solid #a7f3d0;' : status === 'RECENTLY_ACTIVE' ? 'background:#fef3c7; color:#92400e; border:1px solid #fde68a;' : 'background:#fee2e2; color:#991b1b; border:1px solid #fecaca;'}">
              ${status}
            </span>
          </div>

          <!-- Quick Stats Grid -->
          <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:8px; font-size:11px; color:#475569; display:grid; grid-template-columns:1fr 1fr; gap:6px; margin-bottom:8px;">
            <div><strong>Device:</strong> ${deviceType || 'Web'}</div>
            <div><strong>GPS:</strong> ${isCurrent ? '<span style="color:#10b981; font-weight:600;">Active Live</span>' : '<span style="color:#f59e0b; font-weight:600;">Last Known</span>'}</div>
            ${speedKmh !== null ? `<div><strong>Speed:</strong> ${speedKmh} km/h</div>` : ''}
            ${loc.heading !== null && loc.heading !== undefined ? `<div><strong>Heading:</strong> ${Math.round(loc.heading)}°</div>` : ''}
            ${accuracyStr ? `<div><strong>Accuracy:</strong> ${accuracyStr}</div>` : ''}
            ${loc.batteryLevel !== null && loc.batteryLevel !== undefined ? `<div><strong>Battery:</strong> 🔋 ${loc.batteryLevel}%</div>` : ''}
          </div>

          <!-- Address -->
          <div style="margin-bottom:8px; color:#334155; font-size:11px; background:#ffffff; border:1px solid #e2e8f0; padding:6px 8px; border-radius:6px;">
            <strong style="color:#64748B;">📍 Location:</strong><br/>
            ${address || 'Resolving address...'}
          </div>

          <!-- Buttons -->
          <button id="infowindow-route-history" data-session-id="${sessionId}" style="width:100%; background:linear-gradient(135deg, ${cfg.color}, ${cfg.accentColor}); border:none; border-radius:6px; color:#FFFFFF; padding:8px 12px; font-family:'Outfit',sans-serif; font-size:12px; font-weight:600; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:6px; box-shadow:0 2px 4px rgba(0,0,0,0.1);">
            <span>${cfg.emoji} View Route History</span>
          </button>
          
          <div style="text-align:right; font-size:10px; color:#94a3b8; margin-top:6px;">
            Captured: ${new Date(loc.capturedAt).toLocaleTimeString()}
          </div>
        </div>
      `);
    };

    updateContent('Fetching address...');

    geocodeAddress(loc.latitude, loc.longitude, (address) => {
      updateContent(address);
    });

    infoWindow.open(mapInstanceRef.current, marker);

    window.google.maps.event.clearListeners(infoWindow, 'domready');
    infoWindow.addListener('domready', () => {
      const btn = document.getElementById('infowindow-route-history');
      if (btn) {
        btn.onclick = () => {
          const sid = btn.getAttribute('data-session-id');
          let foundSession = null;
          let uId = '';
          let uName = '';
          let uRole = '';
          
          usersData.forEach((u) => {
            u.sessions.forEach((s) => {
              if (s.sessionId === sid) {
                foundSession = s;
                uId = u.userId || u.id;
                uName = u.name;
                uRole = u.role;
              }
            });
          });

          if (foundSession) {
            enterHistoryMode(foundSession, uName, uRole, uId || foundSession.userId);
          }
        };
      }
    });
  };

  // 5.5 Location History Management Logic
  const clearHistoryOverlays = () => {
    if (historyPolylineRef.current) {
      historyPolylineRef.current.setMap(null);
      historyPolylineRef.current = null;
    }
    if (historyStartMarkerRef.current) {
      historyStartMarkerRef.current.setMap(null);
      historyStartMarkerRef.current = null;
    }
    if (historyEndMarkerRef.current) {
      historyEndMarkerRef.current.setMap(null);
      historyEndMarkerRef.current = null;
    }
    if (playbackMarkerRef.current) {
      playbackMarkerRef.current.setMap(null);
      playbackMarkerRef.current = null;
    }
    setIsPlaying(false);
    setPlaybackIndex(0);
    setHistoryPoints([]);
    setHistoryError(null);
    setHistoryMetadata(null);
  };

  const enterHistoryMode = (session, userName, userRole, userId) => {
    setMode('HISTORY');
    const resolvedUserId = userId || session?.userId;
    const sessionInfo = {
      userId: resolvedUserId,
      userName,
      userRole,
      sessionId: session.sessionId,
      browser: session.browser,
      operatingSystem: session.operatingSystem,
      deviceType: session.deviceType,
      status: session.status,
    };
    setSelectedUserForHistory(sessionInfo);
    setSelectedDateOption('today');
    fetchRouteHistory(sessionInfo, 'today');
  };

  const fetchRouteHistory = async (sessionInfo, dateOption, customFrom, customTo) => {
    if (!sessionInfo) return;
    setHistoryLoading(true);
    setHistoryError(null);
    setHistoryPoints([]);
    clearHistoryOverlays();

    try {
      const targetUserId = sessionInfo.userId || 'me';
      let url = `/super-admin/live-users/${targetUserId}/location-history?deviceSessionId=${sessionInfo.sessionId}`;
      if (dateOption === 'custom') {
        if (!customFrom || !customTo) {
          throw new Error('Please select both From and To dates.');
        }
        url += `&from=${customFrom}&to=${customTo}`;
      } else {
        const offset = dateOption === 'today' ? 0 : dateOption === 'yesterday' ? 1 : 2;
        url += `&date=${getLocalDateString(offset)}`;
      }

      const res = await backendFetch(url);
      setHistoryPoints(res.points || []);
      setHistoryMetadata(res.summary || null);

      if (res.points && res.points.length > 0) {
        drawHistoryRoute(res.points, sessionInfo, dateOption);
      } else {
        setHistoryError('No GPS points recorded for the selected period.');
      }
    } catch (err) {
      console.error('Error fetching route history:', err);
      setHistoryError(err.message || 'Failed to fetch route history.');
    } finally {
      setHistoryLoading(false);
    }
  };

  const drawHistoryRoute = (points, sessionInfo, dateOption) => {
    if (!mapsLoaded || !mapInstanceRef.current) return;

    const path = points.map(p => new window.google.maps.LatLng(p.latitude, p.longitude));

    const polyline = new window.google.maps.Polyline({
      path,
      geodesic: true,
      strokeColor: '#0284C7',
      strokeOpacity: 0.85,
      strokeWeight: 5,
      map: mapInstanceRef.current,
    });
    historyPolylineRef.current = polyline;

    const bounds = new window.google.maps.LatLngBounds();
    path.forEach(p => bounds.extend(p));
    mapInstanceRef.current.fitBounds(bounds, { top: 60, bottom: 60, left: 60, right: 60 });

    // START marker
    const startLoc = points[0];
    const startTimeStr = new Date(startLoc.capturedAt).toLocaleTimeString();
    const startMarker = new window.google.maps.Marker({
      position: new window.google.maps.LatLng(startLoc.latitude, startLoc.longitude),
      map: mapInstanceRef.current,
      title: 'Start Location',
      label: { text: 'S', color: '#FFFFFF', fontWeight: 'bold' },
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 12,
        fillColor: '#10B981',
        fillOpacity: 1,
        strokeColor: '#FFFFFF',
        strokeWeight: 2,
      },
    });

    const startInfo = new window.google.maps.InfoWindow({
      content: `<div style="font-family:'Outfit',sans-serif;font-size:12px;padding:4px;color:#0F172A;"><strong>🟢 START TRIP</strong><br/>Time: ${startTimeStr}</div>`
    });
    startMarker.addListener('click', () => startInfo.open(mapInstanceRef.current, startMarker));
    historyStartMarkerRef.current = startMarker;

    // END marker
    const endLoc = points[points.length - 1];
    const endTimeStr = new Date(endLoc.capturedAt).toLocaleTimeString();
    const isTodayActive = dateOption === 'today' && sessionInfo.status === 'ONLINE';
    const endColor = isTodayActive ? '#3B82F6' : '#EF4444';
    const labelChar = isTodayActive ? 'C' : 'E';

    const endMarker = new window.google.maps.Marker({
      position: new window.google.maps.LatLng(endLoc.latitude, endLoc.longitude),
      map: mapInstanceRef.current,
      title: isTodayActive ? 'Current Location' : 'End Location',
      label: { text: labelChar, color: '#FFFFFF', fontWeight: 'bold' },
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 12,
        fillColor: endColor,
        fillOpacity: 1,
        strokeColor: '#FFFFFF',
        strokeWeight: 2,
      },
    });

    const endInfo = new window.google.maps.InfoWindow({
      content: `<div style="font-family:'Outfit',sans-serif;font-size:12px;padding:4px;color:#0F172A;"><strong>${isTodayActive ? '🔵 CURRENT' : '🔴 END'}</strong><br/>Time: ${endTimeStr}</div>`
    });
    endMarker.addListener('click', () => endInfo.open(mapInstanceRef.current, endMarker));
    historyEndMarkerRef.current = endMarker;

    updatePlaybackMarker(points[0]);
  };

  const updatePlaybackMarker = (point) => {
    if (!mapsLoaded || !mapInstanceRef.current) return;
    const latLng = new window.google.maps.LatLng(point.latitude, point.longitude);
    const icon = {
      path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
      scale: 6,
      fillColor: '#F59E0B',
      fillOpacity: 1,
      strokeColor: '#FFFFFF',
      strokeWeight: 1.5,
      rotation: point.heading || 0,
    };

    if (playbackMarkerRef.current) {
      playbackMarkerRef.current.setPosition(latLng);
      playbackMarkerRef.current.setIcon(icon);
    } else {
      playbackMarkerRef.current = new window.google.maps.Marker({
        position: latLng,
        map: mapInstanceRef.current,
        title: 'Playback Position',
        icon,
        zIndex: 999,
      });
    }
  };

  // Playback timer interval
  useEffect(() => {
    let interval = null;
    if (isPlaying && historyPoints.length > 0) {
      const ms = 1000 / playbackSpeed;
      interval = setInterval(() => {
        setPlaybackIndex((prev) => {
          if (prev >= historyPoints.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          const nextIndex = prev + 1;
          updatePlaybackMarker(historyPoints[nextIndex]);
          return nextIndex;
        });
      }, ms);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, historyPoints, playbackSpeed]);

  // Route statistics calculator
  const routeStats = useMemo(() => {
    if (historyPoints.length === 0) return null;

    let totalDistMeters = 0;
    let maxSpeed = 0;
    let speedSum = 0;
    let speedCount = 0;

    const startLoc = historyPoints[0];
    const endLoc = historyPoints[historyPoints.length - 1];

    const start = new Date(startLoc.capturedAt);
    const end = new Date(endLoc.capturedAt);
    const durationMs = end.getTime() - start.getTime();

    const durationHrs = Math.floor(durationMs / 3600000);
    const durationMins = Math.floor((durationMs % 3600000) / 60000);
    const durationStr = `${durationHrs}h ${durationMins}m`;

    for (let i = 1; i < historyPoints.length; i++) {
      const prev = historyPoints[i - 1];
      const curr = historyPoints[i];

      const dLat = (curr.latitude - prev.latitude) * Math.PI / 180;
      const dLon = (curr.longitude - prev.longitude) * Math.PI / 180;
      const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(prev.latitude * Math.PI / 180) * Math.cos(curr.latitude * Math.PI / 180) * 
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const dist = 6371000 * c;

      const timeSec = (new Date(curr.capturedAt).getTime() - new Date(prev.capturedAt).getTime()) / 1000;
      const impliedSpeedKmh = timeSec > 0 ? (dist / timeSec) * 3.6 : 0;

      if (impliedSpeedKmh <= 150) {
        totalDistMeters += dist;
      }

      if (curr.speed !== null && curr.speed !== undefined) {
        const speedKmh = curr.speed * 3.6;
        if (speedKmh > maxSpeed && speedKmh <= 150) {
          maxSpeed = speedKmh;
        }
        speedSum += speedKmh;
        speedCount++;
      }
    }

    const averageSpeed = speedCount > 0 ? speedSum / speedCount : (totalDistMeters / (durationMs / 1000)) * 3.6;

    return {
      distanceKm: (totalDistMeters / 1000).toFixed(2),
      startTime: start.toLocaleTimeString(),
      endTime: end.toLocaleTimeString(),
      durationStr,
      averageSpeedKmh: averageSpeed > 0 ? averageSpeed.toFixed(1) : '0',
      maxSpeedKmh: maxSpeed > 0 ? maxSpeed.toFixed(1) : '0',
    };
  }, [historyPoints]);

  // 6. Action handlers
  const handleSelectCard = (s, name, role) => {
    setSelectedSessionId(s.sessionId);
    if (!s.location) return;

    if (mapInstanceRef.current) {
      const latLng = new window.google.maps.LatLng(s.location.latitude, s.location.longitude);
      mapInstanceRef.current.panTo(latLng);
      mapInstanceRef.current.setZoom(16);
      openInfoWindow(s.sessionId, name, role, s.location, s.deviceType, s.status, s.locationPermission);
    }
  };

  const fitAllMarkers = (initial = false, targetRole = selectedRole) => {
    if (!mapsLoaded || !mapInstanceRef.current) return;

    const bounds = new window.google.maps.LatLngBounds();
    let hasCoords = false;

    usersData.forEach((u) => {
      const cat = getCategoryForRole(u.role);
      u.sessions.forEach((s) => {
        if (s.location) {
          let matchesRole = true;
          if (targetRole !== 'All') {
            matchesRole = (cat === targetRole);
          }

          let matchesStatus = true;
          if (statusFilter === 'ONLINE_GPS') {
            matchesStatus = s.status === 'ONLINE' && !!s.location;
          } else if (statusFilter === 'ONLINE') {
            matchesStatus = s.status === 'ONLINE';
          }

          let matchesOS = true;
          if (selectedDevice !== 'All') {
            matchesOS = (s.operatingSystem === selectedDevice);
          }

          let matchesSearch = true;
          if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const nameMatch = u.name.toLowerCase().includes(query);
            const roleMatch = u.role.toLowerCase().includes(query);
            const emailMatch = u.email?.toLowerCase().includes(query) || false;
            const osMatch = s.operatingSystem?.toLowerCase().includes(query) || false;
            matchesSearch = nameMatch || roleMatch || emailMatch || osMatch;
          }

          if (matchesRole && matchesStatus && matchesOS && matchesSearch) {
            bounds.extend(new window.google.maps.LatLng(s.location.latitude, s.location.longitude));
            hasCoords = true;
          }
        }
      });
    });

    if (hasCoords) {
      mapInstanceRef.current.fitBounds(bounds, { top: 60, bottom: 60, left: 60, right: 60 });
      if (initial && mapInstanceRef.current.getZoom() > 14) {
        mapInstanceRef.current.setZoom(12);
      }
    }
  };

  // Auto-fit bounds on initial data load
  useEffect(() => {
    if (mapsLoaded && usersData.length > 0 && !initialBoundsFitDone) {
      fitAllMarkers(true);
      setInitialBoundsFitDone(true);
    }
  }, [mapsLoaded, usersData, initialBoundsFitDone]);

  // Fit bounds on filter change
  useEffect(() => {
    if (initialBoundsFitDone) {
      fitAllMarkers(false, selectedRole);
    }
  }, [selectedRole, statusFilter, selectedDevice]);

  // 7. Computed Stats & Role Grouping
  const { stats, roleCounts, allStaffList } = useMemo(() => {
    let totalUsers = 0;
    let onlineUsersCount = 0;
    let onlineGpsCount = 0;
    let withLocation = 0;
    const allSessions = [];
    const staffList = [];

    // Grouping by category
    const counts = {};
    Object.keys(ROLE_CONFIG).forEach((cat) => {
      counts[cat] = { total: 0, online: 0, withLocation: 0 };
    });

    usersData.forEach((u) => {
      totalUsers++;
      const userCategory = getCategoryForRole(u.role);
      if (!counts[userCategory]) {
        counts[userCategory] = { total: 0, online: 0, withLocation: 0 };
      }
      counts[userCategory].total++;

      let userIsOnline = false;
      let userHasLoc = false;
      let userHasOnlineGps = false;

      if (u.sessions && u.sessions.length > 0) {
        u.sessions.forEach((s) => {
          allSessions.push({
            ...s,
            userId: u.userId,
            userName: u.name,
            userRole: u.role,
            userEmail: u.email,
            userCategory,
          });

          if (s.status === 'ONLINE') {
            userIsOnline = true;
            if (s.location) {
              userHasOnlineGps = true;
            }
          }
          if (s.location) {
            userHasLoc = true;
          }
        });
      }

      if (userIsOnline) {
        onlineUsersCount++;
        counts[userCategory].online++;
      }
      if (userHasOnlineGps) {
        onlineGpsCount++;
      }
      if (userHasLoc) {
        withLocation++;
        counts[userCategory].withLocation++;
      }

      // Safely select the most recently active session
      const activeSession = u.sessions?.find(s => s.status === 'ONLINE') || (u.sessions && u.sessions.length > 0 ? u.sessions[0] : null);

      staffList.push({
        userId: u.userId,
        name: u.name,
        email: u.email,
        role: u.role,
        category: userCategory,
        isOnline: userIsOnline,
        sessions: u.sessions || [],
        latestSession: activeSession,
      });
    });

    const onlineAwaitingGpsCount = Math.max(0, onlineUsersCount - onlineGpsCount);

    return {
      stats: {
        totalUsers,
        onlineUsersCount,
        onlineGpsCount,
        onlineAwaitingGpsCount,
        withLocation,
        allSessions,
      },
      roleCounts: counts,
      allStaffList: staffList,
    };
  }, [usersData]);

  // Derived filter collections
  const availableDevices = useMemo(() => {
    const devices = new Set(['All']);
    stats.allSessions.forEach((s) => {
      if (s.operatingSystem) devices.add(s.operatingSystem);
    });
    return Array.from(devices);
  }, [stats.allSessions]);

  // Filtered session / staff rows for the left drawer
  const filteredStaff = useMemo(() => {
    return allStaffList.filter((staff) => {
      // 1. Role filter
      if (selectedRole !== 'All' && staff.category !== selectedRole) return false;

      // 2. Status filter
      if (statusFilter === 'ONLINE_GPS') {
        const hasOnlineGps = staff.sessions.some(s => s.status === 'ONLINE' && !!s.location);
        if (!hasOnlineGps) return false;
      } else if (statusFilter === 'ONLINE') {
        if (!staff.isOnline) return false;
      } else if (statusFilter === 'HAS_LOCATION') {
        const hasLoc = staff.sessions.some(s => !!s.location);
        if (!hasLoc) return false;
      }

      // 3. Device filter
      if (selectedDevice !== 'All') {
        const hasDevice = staff.sessions.some(s => s.operatingSystem === selectedDevice);
        if (!hasDevice) return false;
      }

      // 4. Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const nameMatch = staff.name.toLowerCase().includes(query);
        const roleMatch = staff.role.toLowerCase().includes(query);
        const emailMatch = staff.email?.toLowerCase().includes(query) || false;
        const osMatch = staff.sessions.some(s => s.operatingSystem?.toLowerCase().includes(query));
        return nameMatch || roleMatch || emailMatch || osMatch;
      }

      return true;
    }).sort((a, b) => {
      // Sort: Live GPS first, then Online, then Has Location, then alphabetical
      const aGps = a.sessions.some(s => s.status === 'ONLINE' && s.location);
      const bGps = b.sessions.some(s => s.status === 'ONLINE' && s.location);
      if (aGps && !bGps) return -1;
      if (!aGps && bGps) return 1;

      if (a.isOnline && !b.isOnline) return -1;
      if (!a.isOnline && b.isOnline) return 1;

      return a.name.localeCompare(b.name);
    });
  }, [allStaffList, selectedRole, statusFilter, selectedDevice, searchQuery]);

  // Role Legend definition keys
  const roleLegendKeys = useMemo(() => {
    return ['Sales', 'Plant Head', 'HR', 'Dispatch', 'Production', 'QC', 'Store', 'Finance', 'Procurement', 'Admin'];
  }, []);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100vh - 80px)',
      background: '#F8FAFC',
      fontFamily: "'Outfit', sans-serif",
      color: '#0F172A',
      padding: '16px',
      gap: '12px',
      boxSizing: 'border-box',
    }}>
      
      {/* ── 1. HEADER BANNER & LIVE METRICS ─────────────────────────────────── */}
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: isMobile ? 'stretch' : 'center',
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '12px',
        padding: isMobile ? '12px 16px' : '12px 20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        gap: isMobile ? '12px' : '16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #0284C7, #0369A1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            boxShadow: '0 4px 6px -1px rgba(2, 132, 199, 0.25)',
          }}>
            <Lucide.MapPin size={22} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Live Staff & Field Map
              <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '10px', background: '#F1F5F9', color: '#475569' }}>
                Himalaya ERP
              </span>
            </h2>
            <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748B' }}>
              Real-time GPS tracking & authorized session monitor across departments
            </p>
          </div>
        </div>

        {/* Real-time Connection Indicator & Metrics */}
        <div style={{ 
          display: 'flex', 
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'stretch' : 'center', 
          gap: isMobile ? '10px' : '16px' 
        }}>
          {/* Quick Metrics */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '4px 10px', fontSize: '11px', color: '#475569' }}>
              Staff: <strong style={{ color: '#0F172A' }}>{stats.totalUsers}</strong>
            </div>
            <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '8px', padding: '4px 10px', fontSize: '11px', color: '#047857' }}>
              🟢 Live Online: <strong>{stats.onlineUsersCount}</strong>
            </div>
            <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '8px', padding: '4px 10px', fontSize: '11px', color: '#1D4ED8' }}>
              📍 Live GPS: <strong>{stats.onlineGpsCount}</strong>
            </div>
          </div>

          {/* Connection Status Pill */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            borderRadius: '20px',
            background: liveStatus === 'LIVE' ? '#F0FDF4' : liveStatus === 'RECONNECTING' ? '#FFFBEB' : '#FEF2F2',
            border: `1px solid ${liveStatus === 'LIVE' ? '#BBF7D0' : liveStatus === 'RECONNECTING' ? '#FDE68A' : '#FCA5A5'}`,
            fontSize: '12px',
            fontWeight: 700,
          }}>
            <span style={{
              display: 'block',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: liveStatus === 'LIVE' ? '#16A34A' : liveStatus === 'RECONNECTING' ? '#F59E0B' : '#DC2626',
              animation: liveStatus === 'LIVE' ? 'pulse 2s infinite' : 'none',
            }} />
            <style>{`
              @keyframes pulse {
                0% { box-shadow: 0 0 0 0 rgba(22, 163, 74, 0.5); }
                70% { box-shadow: 0 0 0 8px rgba(22, 163, 74, 0); }
                100% { box-shadow: 0 0 0 0 rgba(22, 163, 74, 0); }
              }
            `}</style>
            <span style={{ color: liveStatus === 'LIVE' ? '#15803D' : liveStatus === 'RECONNECTING' ? '#B45309' : '#B91C1C' }}>
              {liveStatus === 'LIVE' ? 'LIVE SYNC' : liveStatus === 'RECONNECTING' ? 'RECONNECTING...' : 'OFFLINE'}
            </span>
          </div>
        </div>
      </div>

      {/* ── 1.5 LIVE PIPELINE DIAGNOSTIC TELEMETRY BAR ───────────────────────── */}
      <div style={{
        background: '#0F172A',
        color: '#F8FAFC',
        border: '1px solid #1E293B',
        borderRadius: '10px',
        padding: '8px 14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px',
        fontSize: '11.5px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: liveStatus === 'LIVE' ? '#10B981' : liveStatus === 'RECONNECTING' ? '#F59E0B' : '#EF4444',
            boxShadow: liveStatus === 'LIVE' ? '0 0 8px #10B981' : 'none',
          }} />
          <span style={{ fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', color: '#94A3B8', fontSize: '10.5px' }}>
            Pipeline Telemetry
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ color: '#94A3B8' }}>Live Staff:</span>
            <strong style={{ color: '#FFFFFF' }}>{stats.totalUsers}</strong>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(16, 185, 129, 0.15)', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            <span style={{ color: '#6EE7B7' }}>🟢 Online:</span>
            <strong style={{ color: '#FFFFFF' }}>{stats.onlineUsersCount}</strong>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(59, 130, 246, 0.15)', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
            <span style={{ color: '#93C5FD' }}>📍 With GPS:</span>
            <strong style={{ color: '#FFFFFF' }}>{stats.onlineGpsCount}</strong>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: stats.onlineAwaitingGpsCount > 0 ? 'rgba(245, 158, 11, 0.15)' : 'rgba(148, 163, 184, 0.1)',
            padding: '2px 6px',
            borderRadius: '4px',
            border: stats.onlineAwaitingGpsCount > 0 ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(148, 163, 184, 0.2)',
          }}>
            <span style={{ color: stats.onlineAwaitingGpsCount > 0 ? '#FCD34D' : '#94A3B8' }}>⚪ Awaiting GPS:</span>
            <strong style={{ color: '#FFFFFF' }}>{stats.onlineAwaitingGpsCount}</strong>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '2px 6px',
            borderRadius: '4px',
            background: liveStatus === 'LIVE' ? 'rgba(16, 185, 129, 0.2)' : liveStatus === 'RECONNECTING' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)',
            color: liveStatus === 'LIVE' ? '#6EE7B7' : liveStatus === 'RECONNECTING' ? '#FCD34D' : '#FCA5A5',
            fontWeight: 600,
            fontSize: '10.5px',
          }}>
            🔌 Socket: <strong>{liveStatus === 'LIVE' ? 'CONNECTED' : liveStatus}</strong>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10.5px', color: '#CBD5E1' }}>
            <span style={{ color: '#64748B' }}>🔄 REST:</span>
            <span style={{ fontFamily: 'monospace', color: '#E2E8F0' }}>{lastRestSync || 'Syncing...'}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10.5px', color: '#CBD5E1' }}>
            <span style={{ color: '#64748B' }}>⚡ Socket:</span>
            <span style={{ fontFamily: 'monospace', color: '#38BDF8' }}>
              {lastSocketEvent ? `${lastSocketEvent.name} (${lastSocketEvent.time})` : 'Listening...'}
            </span>
          </div>
        </div>
      </div>

      {/* ── 2. TOP ROLE DEFINITION & QUICK HIGHLIGHT BAR ("in top define sales man this icon plant head this for all") ── */}
      <div style={{
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '12px',
        padding: '10px 14px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        overflowX: 'auto',
        whiteSpace: 'nowrap',
      }}>
        <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', paddingRight: '6px', borderRight: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Lucide.Layers size={14} />
          Role Icons
        </div>

        {/* All Roles Button */}
        <button
          onClick={() => {
            setSelectedRole('All');
            fitAllMarkers(false, 'All');
          }}
          style={{
            background: selectedRole === 'All' ? '#0F172A' : '#F8FAFC',
            color: selectedRole === 'All' ? '#FFFFFF' : '#334155',
            border: `1px solid ${selectedRole === 'All' ? '#0F172A' : '#E2E8F0'}`,
            borderRadius: '20px',
            padding: '5px 12px',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.15s',
            flexShrink: 0,
            boxShadow: selectedRole === 'All' ? '0 2px 6px rgba(15, 23, 42, 0.25)' : 'none',
          }}
        >
          <span>🌐</span>
          <span>All Roles</span>
          <span style={{
            fontSize: '10px',
            padding: '1px 6px',
            borderRadius: '10px',
            background: selectedRole === 'All' ? 'rgba(255,255,255,0.25)' : '#E2E8F0',
            color: selectedRole === 'All' ? '#FFFFFF' : '#475569',
            fontWeight: 700,
          }}>
            {stats.totalUsers}
          </span>
        </button>

        {/* Individual Role Definition Chips */}
        {roleLegendKeys.map((catKey) => {
          const cfg = ROLE_CONFIG[catKey];
          const isSelected = selectedRole === catKey;
          const roleStat = roleCounts[catKey] || { total: 0, online: 0 };

          return (
            <button
              key={catKey}
              onClick={() => {
                const nextRole = isSelected ? 'All' : catKey;
                setSelectedRole(nextRole);
                fitAllMarkers(false, nextRole);
              }}
              title={cfg.description}
              style={{
                background: isSelected ? cfg.color : cfg.lightBg,
                color: isSelected ? '#FFFFFF' : cfg.textColor,
                border: `1.5px solid ${isSelected ? cfg.color : cfg.borderColor}`,
                borderRadius: '20px',
                padding: '5px 12px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s',
                flexShrink: 0,
                boxShadow: isSelected ? `0 3px 8px ${cfg.glowColor}` : 'none',
              }}
            >
              <span style={{ fontSize: '14px' }}>{cfg.emoji}</span>
              <span>{cfg.shortName}</span>
              
              {/* Online Count Badge */}
              <span style={{
                fontSize: '10px',
                padding: '1px 6px',
                borderRadius: '10px',
                background: isSelected
                  ? 'rgba(255,255,255,0.25)'
                  : roleStat.online > 0
                  ? '#10B981'
                  : '#E2E8F0',
                color: isSelected
                  ? '#FFFFFF'
                  : roleStat.online > 0
                  ? '#FFFFFF'
                  : '#64748B',
                fontWeight: 700,
              }}>
                {roleStat.online > 0 ? `🟢 ${roleStat.online}` : roleStat.total}
              </span>
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
        
        {/* Left Filter & Staff Drawer List */}
        <div style={{
          display: showDrawer ? 'flex' : 'none',
          flexDirection: 'column',
          width: isMobile ? 'calc(100% - 24px)' : '380px',
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
          
          {mode === 'HISTORY' ? (
            <>
              {/* Route History Mode Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0', paddingBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={() => {
                      setMode('LIVE');
                      clearHistoryOverlays();
                    }}
                    style={{
                      background: '#F1F5F9',
                      border: '1px solid #CBD5E1',
                      borderRadius: '6px',
                      color: '#0F172A',
                      cursor: 'pointer',
                      padding: '5px',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <Lucide.ArrowLeft size={16} />
                  </button>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>Route History</h3>
                    <span style={{ fontSize: '11px', color: '#64748B' }}>Historical GPS Trail & Playback</span>
                  </div>
                </div>
                <button
                  onClick={() => setShowDrawer(false)}
                  style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: '4px' }}
                >
                  <Lucide.X size={16} />
                </button>
              </div>

              {/* User Detail Card in History Mode */}
              <div style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                padding: '10px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: ROLE_CONFIG[getCategoryForRole(selectedUserForHistory?.userRole)]?.lightBg || '#EFF6FF',
                  border: `1px solid ${ROLE_CONFIG[getCategoryForRole(selectedUserForHistory?.userRole)]?.borderColor || '#BFDBFE'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                }}>
                  {ROLE_CONFIG[getCategoryForRole(selectedUserForHistory?.userRole)]?.emoji || '👤'}
                </div>
                <div style={{ flex: 1 }}>
                  <strong style={{ fontSize: '14px', color: '#0F172A' }}>{selectedUserForHistory?.userName}</strong>
                  <div style={{ fontSize: '11px', color: '#475569' }}>{selectedUserForHistory?.userRole}</div>
                  <div style={{ fontSize: '10px', color: '#94A3B8' }}>
                    {selectedUserForHistory?.browser} • {selectedUserForHistory?.operatingSystem}
                  </div>
                </div>
              </div>

              {/* Date Selector Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                {['today', 'yesterday', '2days', 'custom'].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setSelectedDateOption(opt);
                      if (opt !== 'custom') {
                        fetchRouteHistory(selectedUserForHistory, opt);
                      }
                    }}
                    style={{
                      background: selectedDateOption === opt ? '#EFF6FF' : '#FFFFFF',
                      border: `1px solid ${selectedDateOption === opt ? '#3B82F6' : '#CBD5E1'}`,
                      borderRadius: '6px',
                      padding: '6px',
                      fontSize: '11px',
                      fontWeight: selectedDateOption === opt ? 700 : 500,
                      color: selectedDateOption === opt ? '#1D4ED8' : '#475569',
                      cursor: 'pointer',
                    }}
                  >
                    {opt === 'today' ? 'Today' : opt === 'yesterday' ? 'Yesterday' : opt === '2days' ? '2 Days Ago' : 'Custom'}
                  </button>
                ))}
              </div>

              {/* Custom Date Pickers */}
              {selectedDateOption === 'custom' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '10px', color: '#64748B', marginBottom: '2px' }}>From</label>
                    <input
                      type="date"
                      value={customDateFrom}
                      onChange={(e) => setCustomDateFrom(e.target.value)}
                      style={{
                        width: '100%',
                        background: '#F8FAFC',
                        border: '1px solid #CBD5E1',
                        borderRadius: '6px',
                        padding: '4px 6px',
                        fontSize: '11px',
                        color: '#0F172A',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '10px', color: '#64748B', marginBottom: '2px' }}>To</label>
                    <input
                      type="date"
                      value={customDateTo}
                      onChange={(e) => setCustomDateTo(e.target.value)}
                      style={{
                        width: '100%',
                        background: '#F8FAFC',
                        border: '1px solid #CBD5E1',
                        borderRadius: '6px',
                        padding: '4px 6px',
                        fontSize: '11px',
                        color: '#0F172A',
                      }}
                    />
                  </div>
                  <button
                    onClick={() => fetchRouteHistory(selectedUserForHistory, 'custom', customDateFrom, customDateTo)}
                    style={{
                      gridColumn: 'span 2',
                      background: '#0284C7',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '6px',
                      color: '#FFFFFF',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Apply Custom Range
                  </button>
                </div>
              )}

              {/* Route History loading / error / results */}
              {historyLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '40px', color: '#64748B' }}>
                  <Lucide.Loader2 className="animate-spin" size={24} />
                </div>
              ) : historyError ? (
                <div style={{ textAlign: 'center', padding: '20px', color: '#EF4444', fontSize: '12px' }}>
                  {historyError}
                </div>
              ) : historyPoints.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, overflowY: 'auto' }}>
                  {/* Stats Table */}
                  <div style={{
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    padding: '10px',
                    fontSize: '11px',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '6px 10px',
                  }}>
                    <div><strong>Start:</strong> {routeStats?.startTime}</div>
                    <div><strong>End:</strong> {routeStats?.endTime}</div>
                    <div><strong>Distance:</strong> {routeStats?.distanceKm} km</div>
                    <div><strong>Duration:</strong> {routeStats?.durationStr}</div>
                    <div><strong>Avg Speed:</strong> {routeStats?.averageSpeedKmh} km/h</div>
                    <div><strong>Max Speed:</strong> {routeStats?.maxSpeedKmh} km/h</div>
                    <div style={{ gridColumn: 'span 2', borderTop: '1px solid #E2E8F0', paddingTop: '6px', color: '#64748B' }}>
                      <strong>Recorded GPS Points:</strong> {historyPoints.length}
                    </div>
                  </div>

                  {/* Playback Action Buttons */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => {
                        if (historyPoints.length > 0) {
                          const bounds = new window.google.maps.LatLngBounds();
                          historyPoints.forEach(p => bounds.extend(new window.google.maps.LatLng(p.latitude, p.longitude)));
                          mapInstanceRef.current.fitBounds(bounds, { top: 50, bottom: 50, left: 50, right: 50 });
                        }
                      }}
                      style={{
                        flex: 1,
                        background: '#EFF6FF',
                        border: '1px solid #BFDBFE',
                        borderRadius: '6px',
                        padding: '8px',
                        color: '#2563EB',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Fit Route
                    </button>
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      style={{
                        flex: 1,
                        background: isPlaying ? '#FEF2F2' : '#EFF6FF',
                        border: `1px solid ${isPlaying ? '#FCA5A5' : '#BFDBFE'}`,
                        borderRadius: '6px',
                        padding: '8px',
                        color: isPlaying ? '#DC2626' : '#2563EB',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                      }}
                    >
                      {isPlaying ? <Lucide.Pause size={14} /> : <Lucide.Play size={14} />}
                      {isPlaying ? 'Pause' : 'Play Trail'}
                    </button>
                  </div>

                  {/* Playback Controls */}
                  <div style={{
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    padding: '8px 10px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px' }}>
                      <span style={{ color: '#64748B' }}>Time: {new Date(historyPoints[playbackIndex]?.capturedAt).toLocaleTimeString()}</span>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {[1, 2, 4].map((speed) => (
                          <button
                            key={speed}
                            onClick={() => setPlaybackSpeed(speed)}
                            style={{
                              background: playbackSpeed === speed ? '#E2E8F0' : 'none',
                              border: 'none',
                              borderRadius: '4px',
                              padding: '2px 6px',
                              fontSize: '10px',
                              fontWeight: 600,
                              color: '#475569',
                              cursor: 'pointer',
                            }}
                          >
                            {speed}x
                          </button>
                        ))}
                      </div>
                    </div>

                    <input
                      type="range"
                      min="0"
                      max={historyPoints.length - 1}
                      value={playbackIndex}
                      onChange={(e) => {
                        const idx = Number(e.target.value);
                        setPlaybackIndex(idx);
                        updatePlaybackMarker(historyPoints[idx]);
                      }}
                      style={{ width: '100%', cursor: 'pointer' }}
                    />
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: '#64748B', fontSize: '12px' }}>
                  No GPS history recorded for this period.
                </div>
              )}
            </>
          ) : (
            <>
              {/* Drawer Header with Title & Close */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>Staff & Devices</h3>
                  <span style={{ fontSize: '11px', color: '#64748B' }}>
                    Showing {filteredStaff.length} of {allStaffList.length} members
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={() => fitAllMarkers(false, selectedRole)}
                    title="Fit Map Bounds"
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
                    <Lucide.Crosshair size={13} />
                    Fit
                  </button>
                  <button
                    onClick={() => setShowDrawer(false)}
                    style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: '4px' }}
                  >
                    <Lucide.X size={16} />
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
                  placeholder="Search staff, role, email, device..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    flex: 1,
                    border: 'none',
                    background: 'transparent',
                    outline: 'none',
                    fontSize: '12px',
                    color: '#0F172A',
                    padding: '2px 0',
                    width: '100%',
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
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '4px' }}>
                {[
                  { id: 'ALL', label: 'All', count: allStaffList.length },
                  { id: 'ONLINE_GPS', label: 'Live GPS', count: stats.onlineGpsCount },
                  { id: 'ONLINE', label: 'Online', count: stats.onlineUsersCount },
                  { id: 'HAS_LOCATION', label: 'With Loc', count: stats.withLocation },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setStatusFilter(tab.id)}
                    style={{
                      background: statusFilter === tab.id ? '#EFF6FF' : '#F8FAFC',
                      border: `1px solid ${statusFilter === tab.id ? '#3B82F6' : '#E2E8F0'}`,
                      borderRadius: '6px',
                      padding: '4px 2px',
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

              {/* Staff Cards List */}
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
                ) : filteredStaff.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px 10px', color: '#94A3B8', fontSize: '12px' }}>
                    <Lucide.Users size={32} style={{ margin: '0 auto 8px auto', opacity: 0.5 }} />
                    No staff members match the selected filters.
                  </div>
                ) : (
                  filteredStaff.map((staff) => {
                    const cfg = ROLE_CONFIG[staff.category] || ROLE_CONFIG['Other'];
                    const sessionWithLocation = staff.sessions.find(s => s.location);
                    const activeSession = staff.sessions.find(s => s.status === 'ONLINE') || staff.latestSession;
                    const hasLiveLocation = !!(activeSession?.location && activeSession.status === 'ONLINE');
                    const hasAnyLocation = !!sessionWithLocation;
                    const isSelected = selectedSessionId && staff.sessions.some(s => s.sessionId === selectedSessionId);

                    return (
                      <div
                        key={staff.userId}
                        onClick={() => {
                          if (sessionWithLocation) {
                            handleSelectCard(sessionWithLocation, staff.name, staff.role);
                          }
                        }}
                        style={{
                          background: isSelected ? '#EFF6FF' : '#FFFFFF',
                          border: `1px solid ${isSelected ? '#3B82F6' : '#E2E8F0'}`,
                          borderRadius: '10px',
                          padding: '10px 12px',
                          cursor: hasAnyLocation ? 'pointer' : 'default',
                          transition: 'all 0.15s ease-in-out',
                          boxShadow: isSelected ? '0 2px 8px rgba(59, 130, 246, 0.15)' : 'none',
                        }}
                      >
                        {/* Header: Name + Status */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {/* Role Icon Pill */}
                            <span style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '8px',
                              background: cfg.lightBg,
                              border: `1px solid ${cfg.borderColor}`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '14px',
                            }}>
                              {cfg.emoji}
                            </span>
                            <div>
                              <strong style={{ fontSize: '13px', color: isSelected ? '#1D4ED8' : '#0F172A', display: 'block', lineHeight: 1.2 }}>
                                {staff.name}
                              </strong>
                              <span style={{ fontSize: '11px', color: cfg.textColor, fontWeight: 600 }}>
                                {staff.role}
                              </span>
                            </div>
                          </div>

                          {/* Online Status Pill */}
                          <span style={{
                            fontSize: '10px',
                            padding: '2px 6px',
                            borderRadius: '10px',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: staff.isOnline ? '#ECFDF5' : '#F1F5F9',
                            color: staff.isOnline ? '#047857' : '#64748B',
                            border: `1px solid ${staff.isOnline ? '#A7F3D0' : '#E2E8F0'}`,
                          }}>
                            <span style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              background: staff.isOnline ? '#10B981' : '#94A3B8',
                            }} />
                            {staff.isOnline ? 'Active' : 'Offline'}
                          </span>
                        </div>

                        {/* Device & Location Info */}
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginTop: '8px',
                          fontSize: '11px',
                          color: '#64748B',
                        }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {activeSession?.deviceType === 'MOBILE' ? <Lucide.Smartphone size={12} /> : <Lucide.Laptop size={12} />}
                            {activeSession ? `${activeSession.browser || 'Web'} • ${activeSession.operatingSystem || 'Device'}` : 'No active session'}
                          </span>

                          <span style={{
                            color: hasLiveLocation ? '#10B981' : staff.isOnline ? '#64748B' : hasAnyLocation ? '#F59E0B' : '#94A3B8',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px',
                          }}>
                            {hasLiveLocation
                              ? '📍 Live GPS'
                              : staff.isOnline
                              ? '⚪ Awaiting GPS'
                              : hasAnyLocation
                              ? '📍 Last Known'
                              : '⚪ No GPS'}
                          </span>
                        </div>

                        {/* Quick action buttons on card click / select */}
                        {hasAnyLocation && (
                          <div style={{ display: 'flex', gap: '6px', marginTop: '8px', paddingTop: '6px', borderTop: '1px solid #F1F5F9' }}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectCard(sessionWithLocation, staff.name, staff.role);
                              }}
                              style={{
                                flex: 1,
                                background: '#EFF6FF',
                                border: '1px solid #BFDBFE',
                                borderRadius: '4px',
                                padding: '4px',
                                color: '#2563EB',
                                fontSize: '11px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '4px',
                              }}
                            >
                              <Lucide.Eye size={12} />
                              Center Map
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                enterHistoryMode(sessionWithLocation, staff.name, staff.role, staff.userId);
                              }}
                              style={{
                                flex: 1,
                                background: '#F0FDF4',
                                border: '1px solid #BBF7D0',
                                borderRadius: '4px',
                                padding: '4px',
                                color: '#16A34A',
                                fontSize: '11px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '4px',
                              }}
                            >
                              <Lucide.History size={12} />
                              Route History
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}
        </div>

        {/* Floating Drawer Trigger when closed */}
        {!showDrawer && (
          <button
            onClick={() => setShowDrawer(true)}
            style={{
              position: 'absolute',
              left: '12px',
              top: '12px',
              zIndex: 99,
              background: '#FFFFFF',
              border: '1px solid #CBD5E1',
              borderRadius: '8px',
              padding: '8px',
              color: '#0F172A',
              cursor: 'pointer',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
          >
            <Lucide.Menu size={18} />
          </button>
        )}

        {/* Google Map Container */}
        <div style={{
          flex: 1,
          height: '100%',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          overflow: 'hidden',
          background: '#F8FAFC',
          position: 'relative',
        }}>
          {mapsError ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
              color: '#EF4444',
              padding: '24px',
              textAlign: 'center',
            }}>
              <Lucide.AlertCircle size={48} style={{ marginBottom: '12px' }} />
              <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 600 }}>Unable to load Google Maps</h4>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748B', maxWidth: '420px' }}>
                {mapsError}
              </p>
            </div>
          ) : !mapsLoaded ? (
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#94A3B8' }}>
              <Lucide.Loader2 className="animate-spin" size={32} style={{ marginBottom: '8px' }} />
              <span style={{ fontSize: '13px' }}>Loading Google Maps...</span>
            </div>
          ) : (
            <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
          )}
        </div>

      </div>
    </div>
  );
}
