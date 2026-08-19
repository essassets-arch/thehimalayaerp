'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { io, Socket } from 'socket.io-client';
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

const getCategoryForRole = (roleStr) => {
  const r = (roleStr || '').toUpperCase().replace(/[\s-]+/g, '_');
  
  if (r.includes('SALES') || r.includes('FIELD_STAFF')) return 'Sales';
  if (r.includes('DISPATCH') || r.includes('DELIVERY')) return 'Dispatch';
  if (r.includes('PRODUCTION') || r.includes('PLANNER') || r.includes('OPERATOR')) return 'Production';
  if (r.includes('PLANT_HEAD') || r.includes('PLANTHEAD')) return 'Plant Head';
  if (r.includes('HR') || r.includes('HUMAN_RESOURCE')) return 'HR';
  if (r.includes('STORE') || r.includes('WAREHOUSE')) return 'Store';
  if (r.includes('FINANCE')) return 'Finance';
  if (r.includes('ADMIN')) return 'Admin';
  return 'Other';
};

const getRoleSvgIcon = (role, heading, status) => {
  const category = getCategoryForRole(role);
  const isOnline = status === 'ONLINE';
  const isRecent = status === 'RECENTLY_ACTIVE';

  // Base colors
  let pinColor = '#64748B'; // Default Gray for offline/other
  if (isOnline) {
    if (category === 'Sales') pinColor = '#3B82F6'; // Blue
    else if (category === 'Dispatch') pinColor = '#8B5CF6'; // Purple
    else if (category === 'Plant Head') pinColor = '#10B981'; // Emerald
    else if (category === 'Production') pinColor = '#F59E0B'; // Amber
    else if (category === 'HR') pinColor = '#14B8A6'; // Teal
    else if (category === 'Store') pinColor = '#F97316'; // Orange
    else if (category === 'Finance') pinColor = '#6366F1'; // Indigo
    else if (category === 'Admin') pinColor = '#1E293B'; // Slate/Black
  } else if (isRecent) {
    pinColor = '#F59E0B'; // Amber alert
  }

  // Heading calculation
  const normalizedHeading = Number.isFinite(heading)
    ? ((heading % 360) + 360) % 360
    : 0;

  const shouldRotate = category === 'Sales' || category === 'Dispatch';
  const rotation = shouldRotate ? normalizedHeading : 0;

  // Select center icon symbol path
  let innerIcon = '';
  if (category === 'Sales') {
    // Scooter / Bike
    innerIcon = `
      <g transform="translate(6, 4) scale(0.46)" fill="${pinColor}">
        <path d="M19.5 14c-1.38 0-2.5 1.12-2.5 2.5s1.12 2.5 2.5 2.5 2.5-1.12 2.5-2.5-1.12-2.5-2.5-2.5zm-15 0c-1.38 0-2.5 1.12-2.5 2.5s1.12 2.5 2.5 2.5 2.5-1.12 2.5-2.5-1.12-2.5-2.5-2.5zm12-4c0-.55-.45-1-1-1h-2L11 4.5c-.35-.63-1.01-1-1.73-1H6.5c-.55 0-1 .45-1 1s.45 1 1 1h2.2l1.67 3H5.5c-.55 0-1 .45-1 1s.45 1 1 1h6.36l2.12 3.82c.28.51.81.82 1.39.82h1.13c.55 0 1-.45 1-1s-.45-1-1-1h-.64L15.5 10z"/>
      </g>
    `;
  } else if (category === 'Dispatch') {
    // Truck / Delivery
    innerIcon = `
      <g transform="translate(6, 4.5) scale(0.48)" fill="${pinColor}">
        <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm12 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6.5h-2.5V9.5h2.5v2.5z"/>
      </g>
    `;
  } else if (category === 'Production') {
    // Gear / Helmet (worker)
    innerIcon = `
      <g transform="translate(6, 4) scale(0.46)" fill="${pinColor}">
        <path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.47.39.13.79-.17.79-.58v-1.74h4.74v1.74c0 .41.4.71.79.58A9.99 9.99 0 0022 12c0-5.52-4.48-10-10-10zm-1 15.5H8v-2h3v2zm0-3.5H8v-2h3v2zm5 3.5h-3v-2h3v2zm0-3.5h-3v-2h3v2zm1.75-3.5h-9.5V8.25h9.5V11z"/>
      </g>
    `;
  } else if (category === 'Plant Head') {
    // Person / Manager
    innerIcon = `
      <g transform="translate(6.5, 4.5) scale(0.46)" fill="${pinColor}">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
      </g>
    `;
  } else if (category === 'HR') {
    // Badge / Shield-user
    innerIcon = `
      <g transform="translate(6, 4) scale(0.46)" fill="${pinColor}">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
      </g>
    `;
  } else if (category === 'Store') {
    // Box
    innerIcon = `
      <g transform="translate(6, 4) scale(0.46)" fill="${pinColor}">
        <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-8 12l-4-4h8l-4 4z"/>
      </g>
    `;
  } else if (category === 'Finance') {
    // Briefcase
    innerIcon = `
      <g transform="translate(6, 4.5) scale(0.46)" fill="${pinColor}">
        <path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"/>
      </g>
    `;
  } else if (category === 'Admin') {
    // Key/Shield
    innerIcon = `
      <g transform="translate(6.5, 4.5) scale(0.46)" fill="${pinColor}">
        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
      </g>
    `;
  } else {
    // Other (generic location point marker cx cy)
    innerIcon = `
      <g transform="translate(6.5, 4.5) scale(0.46)" fill="${pinColor}">
        <circle cx="12" cy="12" r="8"/>
      </g>
    `;
  }

  // Construct complete premium SVG
  const pinSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="40" height="40">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="${pinColor}" stroke="#FFFFFF" stroke-width="1.5"/>
      <circle cx="12" cy="9" r="6.5" fill="#FFFFFF"/>
      <g transform="rotate(${rotation} 12 9)">
        ${innerIcon}
      </g>
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
        // Automatically hide drawer on mobile load to not cover the map
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
  
  // Geocoding cache: coordinates (rounded to 4 decimals) -> address string
  const geocodeCacheRef = useRef({});

  // Dynamic values derived from env
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  // 1. Fetch live users snapshot (REST)
  const fetchSnapshot = async () => {
    try {
      const data = await backendFetch('/super-admin/live-users');
      setUsersData(data || []);
      setLoading(false);
      return data || [];
    } catch (err) {
      console.error('Error fetching live users snapshot:', err);
      setLoading(false);
      return [];
    }
  };

  // Log API key configuration status on mount
  useEffect(() => {
    console.log(
      'Google Maps configured:',
      Boolean(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY)
    );
  }, []);

  // 2. Load Google Maps Script
  useEffect(() => {
    if (!apiKey) {
      console.error(
        '[Live User Map] NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not configured'
      );
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
          console.error('[Live User Map] Google Maps JavaScript API failed to load');
          setMapsError(
            'Google Maps failed to load. Check API key, billing, API activation and referrer restrictions.'
          );
        });
        return;
      }
      const script = document.createElement('script');
      script.id = 'google-maps-api-script';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry`;
      script.async = true;
      script.defer = true;
      script.addEventListener('load', () => setMapsLoaded(true));
      script.addEventListener('error', () => {
        console.error('[Live User Map] Google Maps JavaScript API failed to load');
        setMapsError(
          'Google Maps failed to load. Check API key, billing, API activation and referrer restrictions.'
        );
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
          { elementType: 'geometry', stylers: [{ color: '#f5f5f5' }] },
          { elementType: 'labels.text.stroke', stylers: [{ color: '#ffffff' }] },
          { elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] },
          { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
          { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#e0f2fe' }] }
        ],
        mapTypeControl: false,
        fullscreenControl: true,
        streetViewControl: false,
      };

      const map = new window.google.maps.Map(mapContainerRef.current, mapOptions);
      mapInstanceRef.current = map;
      infoWindowRef.current = new window.google.maps.InfoWindow();

      // Fit bounds for any preloaded coordinates
      fitAllMarkers(true);
    } catch (err) {
      console.error('Failed to initialize Google Maps:', err);
      setMapsError('Failed to initialize Google Maps instance.');
    }
  }, [mapsLoaded, usersData]);

  // 4. Connect to Socket.IO for realtime updates
  useEffect(() => {
    if (!accessToken) return;

    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL ||
      process.env.NEXT_PUBLIC_BACKEND_SOCKET_URL ||
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? `${window.location.protocol}//${window.location.hostname}:4000`
        : window.location.origin);

    const socket = io(socketUrl, {
      path: '/socket.io',
      auth: { token: accessToken },
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setLiveStatus('LIVE');
      // Reconcile snapshot state to fetch any updates missed during disconnect
      fetchSnapshot();
    });

    socket.on('connect_error', () => {
      setLiveStatus('RECONNECTING');
    });

    socket.on('disconnect', () => {
      setLiveStatus('OFFLINE');
    });

    // Handle WebSocket Broadcast Events
    socket.on('device:connected', (data) => {
      updateSessionInState(data.userId, data.sessionId, data);
    });

    socket.on('device:disconnected', (data) => {
      // Transition device to recently active / offline
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
      setUsersData((prev) =>
        prev.map((u) => {
          if (u.userId !== data.userId) return u;
          return {
            ...u,
            sessions: u.sessions.map((s) => {
              if (s.sessionId !== data.sessionId) return s;
              return { ...s, status: 'ONLINE', lastSeenAt: new Date(data.lastSeenAt) };
            }),
          };
        })
      );
    });

    socket.on('user:location:update', (data) => {
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
  }, [accessToken]);

  // Helper: dynamic upsert of connected session in state
  const updateSessionInState = (userId, sessionId, sessionData) => {
    setUsersData((prev) => {
      const userExists = prev.some((u) => u.userId === userId);
      if (!userExists) return prev; // Avoid inserting users not in company snapshot

      return prev.map((u) => {
        if (u.userId !== userId) return u;
        const sessionExists = u.sessions.some((s) => s.sessionId === sessionId);
        const updatedSessions = sessionExists
          ? u.sessions.map((s) => (s.sessionId === sessionId ? { ...s, ...sessionData } : s))
          : [...u.sessions, sessionData];

        return { ...u, sessions: updatedSessions };
      });
    });
  };

  // Initial load
  useEffect(() => {
    fetchSnapshot();
  }, []);

  // 5. Synced Marker Management
  // When usersData updates or filters change, reconcile markers on the map
  useEffect(() => {
    if (!mapsLoaded || !mapInstanceRef.current) return;

    const activeSessionIds = new Set();

    usersData.forEach((u) => {
      u.sessions.forEach((s) => {
        if (s.location) {
          activeSessionIds.add(s.sessionId);

          // 1. Role filter
          let matchesRole = true;
          if (selectedRole !== 'All') {
            matchesRole = (getCategoryForRole(u.role) === selectedRole);
          }

          // 2. Device filter
          let matchesOS = true;
          if (selectedDevice !== 'All') {
            matchesOS = (s.operatingSystem === selectedDevice);
          }

          // 3. Search query filter
          let matchesSearch = true;
          if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const nameMatch = u.name.toLowerCase().includes(query);
            const roleMatch = u.role.toLowerCase().includes(query);
            const osMatch = s.operatingSystem?.toLowerCase().includes(query) || false;
            matchesSearch = nameMatch || roleMatch || osMatch;
          }

          const visible = matchesRole && matchesOS && matchesSearch;
          updateMarkerOnMap(s.sessionId, u.name, u.role, s.location, s.deviceType, s.status, s.locationPermission, visible);
        }
      });
    });

    // Remove stale markers for deleted/closed sessions
    Object.keys(markersRef.current).forEach((sid) => {
      if (!activeSessionIds.has(sid)) {
        markersRef.current[sid].setMap(null);
        delete markersRef.current[sid];
      }
    });
  }, [usersData, mapsLoaded, selectedRole, selectedDevice, searchQuery]);

  // Create or Update Marker in place
  const updateMarkerOnMap = (sessionId, name, role, loc, deviceType, status, locationPermission, visible = true) => {
    if (!mapsLoaded || !mapInstanceRef.current) return;

    const latLng = new window.google.maps.LatLng(loc.latitude, loc.longitude);
    let marker = markersRef.current[sessionId];

    const iconUrl = getRoleSvgIcon(role, loc.heading, status);

    if (marker) {
      marker.setPosition(latLng);
      marker.setIcon({
        url: iconUrl,
        scaledSize: new window.google.maps.Size(40, 40),
      });
      marker.setVisible(visible);
    } else {
      marker = new window.google.maps.Marker({
        position: latLng,
        map: mapInstanceRef.current,
        title: name,
        icon: {
          url: iconUrl,
          scaledSize: new window.google.maps.Size(40, 40),
        },
        visible: visible,
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

    const updateContent = (address = '') => {
      const speedKmh = loc.speed !== null && loc.speed !== undefined ? Math.round(loc.speed * 3.6) : null;
      const accuracyStr = loc.accuracy ? `±${Math.round(loc.accuracy)} m` : null;
      const isCurrent = status === 'ONLINE' && locationPermission === 'GRANTED';

      infoWindow.setContent(`
        <div style="font-family:'Outfit',sans-serif; color:#0f172a; padding:8px; min-width:240px; font-size:13px; line-height:1.4;">
          <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #e2e8f0; padding-bottom:6px; margin-bottom:8px;">
            <strong style="font-size:14px; color:#1e293b;">${name}</strong>
            <span style="font-size:10px; padding:2px 6px; border-radius:12px; font-weight:600; text-transform:uppercase; 
              ${status === 'ONLINE' ? 'background:#d1fae5; color:#065f46;' : status === 'RECENTLY_ACTIVE' ? 'background:#fef3c7; color:#92400e;' : 'background:#fee2e2; color:#991b1b;'}">
              ${status}
            </span>
          </div>
          <div style="margin-bottom:4px;"><strong>Role:</strong> ${role}</div>
          <div style="margin-bottom:4px;"><strong>Device:</strong> ${deviceType}</div>
          <div style="margin-bottom:4px;"><strong>GPS Tracking:</strong> ${isCurrent ? '<span style="color:#10b981; font-weight:600;">Current GPS</span>' : '<span style="color:#f59e0b; font-weight:600;">Last Known Location</span>'}</div>
          <div style="margin-bottom:6px; color:#475569; font-size:12px;"><strong>Address:</strong> ${address || 'Not available'}</div>
          <div style="background:#f8fafc; border-radius:6px; padding:6px; font-size:11px; color:#475569; display:grid; grid-template-columns:1fr 1fr; gap:4px;">
            <div><strong>Lat:</strong> ${loc.latitude.toFixed(6)}</div>
            <div><strong>Lng:</strong> ${loc.longitude.toFixed(6)}</div>
            ${accuracyStr ? `<div><strong>Accuracy:</strong> ${accuracyStr}</div>` : ''}
            ${speedKmh !== null ? `<div><strong>Speed:</strong> ${speedKmh} km/h</div>` : ''}
            ${loc.heading !== null && loc.heading !== undefined ? `<div><strong>Heading:</strong> ${Math.round(loc.heading)}°</div>` : ''}
            ${loc.batteryLevel !== null && loc.batteryLevel !== undefined ? `<div><strong>Battery:</strong> ${loc.batteryLevel}%</div>` : ''}
          </div>
          <button id="infowindow-route-history" data-session-id="${sessionId}" style="margin-top:10px; width:100%; background:#10B981; border:none; border-radius:6px; color:#FFFFFF; padding:8px; font-family:'Outfit',sans-serif; font-size:12px; font-weight:600; cursor:pointer; display:block; text-align:center;">
            View Route History
          </button>
          <div style="text-align:right; font-size:10px; color:#94a3b8; margin-top:8px;">
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

    // Safely remove existing and bind new click listener to the dynamic Route History button
    window.google.maps.event.clearListeners(infoWindow, 'domready');
    infoWindow.addListener('domready', () => {
      const btn = document.getElementById('infowindow-route-history');
      if (btn) {
        btn.onclick = () => {
          const sid = btn.getAttribute('data-session-id');
          let foundSession = null;
          let uName = '';
          let uRole = '';
          
          usersData.forEach((u) => {
            u.sessions.forEach((s) => {
              if (s.sessionId === sid) {
                foundSession = s;
                uName = u.name;
                uRole = u.role;
              }
            });
          });

          if (foundSession) {
            enterHistoryMode(foundSession, uName, uRole);
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

  const enterHistoryMode = (session, userName, userRole) => {
    setMode('HISTORY');
    const sessionInfo = {
      userId: session.userId,
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
      let url = `/super-admin/live-users/${sessionInfo.userId}/location-history?deviceSessionId=${sessionInfo.sessionId}`;
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
      strokeColor: '#0284C7', // premium sky blue
      strokeOpacity: 0.8,
      strokeWeight: 4,
      map: mapInstanceRef.current,
    });
    historyPolylineRef.current = polyline;

    // Fit bounds to polyline
    const bounds = new window.google.maps.LatLngBounds();
    path.forEach(p => bounds.extend(p));
    mapInstanceRef.current.fitBounds(bounds, { top: 50, bottom: 50, left: 50, right: 50 });

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
      content: `<div style="font-family:'Outfit',sans-serif;font-size:12px;padding:4px;color:#0F172A;"><strong>🟢 START</strong><br/>Time: ${startTimeStr}</div>`
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

    // Set up initial playback position
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

      // Calculate distance between points using Haversine formula
      const dLat = (curr.latitude - prev.latitude) * Math.PI / 180;
      const dLon = (curr.longitude - prev.longitude) * Math.PI / 180;
      const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(prev.latitude * Math.PI / 180) * Math.cos(curr.latitude * Math.PI / 180) * 
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const dist = 6371000 * c;

      // Filter implausible jumps (implied speed > 150 km/h)
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
      mapInstanceRef.current.setZoom(15);
      openInfoWindow(s.sessionId, name, role, s.location, s.deviceType, s.status, s.locationPermission);
    }
  };

  const fitAllMarkers = (initial = false) => {
    if (!mapsLoaded || !mapInstanceRef.current) return;

    const bounds = new window.google.maps.LatLngBounds();
    let hasCoords = false;

    usersData.forEach((u) => {
      u.sessions.forEach((s) => {
        if (s.location) {
          // Check filters
          let matchesRole = true;
          if (selectedRole !== 'All') {
            matchesRole = (getCategoryForRole(u.role) === selectedRole);
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
            const osMatch = s.operatingSystem?.toLowerCase().includes(query) || false;
            matchesSearch = nameMatch || roleMatch || osMatch;
          }

          if (matchesRole && matchesOS && matchesSearch) {
            bounds.extend(new window.google.maps.LatLng(s.location.latitude, s.location.longitude));
            hasCoords = true;
          }
        }
      });
    });

    if (hasCoords) {
      mapInstanceRef.current.fitBounds(bounds, { top: 50, bottom: 50, left: 50, right: 50 });
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

  // Fit bounds on filter change (only after initial load has occurred)
  useEffect(() => {
    if (initialBoundsFitDone) {
      fitAllMarkers();
    }
  }, [selectedRole, selectedDevice]);

  // 7. Computed Stats
  const stats = useMemo(() => {
    let totalUsers = 0;
    let onlineDevices = 0;
    let offlineDevices = 0;
    let withLocation = 0;
    const allSessions = [];

    usersData.forEach((u) => {
      totalUsers++;
      u.sessions.forEach((s) => {
        allSessions.push({ ...s, userName: u.name, userRole: u.role });
        if (s.status === 'ONLINE') onlineDevices++;
        else offlineDevices++;
        if (s.location) withLocation++;
      });
    });

    return {
      totalUsers,
      totalDevices: allSessions.length,
      onlineDevices,
      offlineDevices,
      withLocation,
      allSessions,
    };
  }, [usersData]);

  // Derived filter collections (categories actually present in returned data)
  const availableRoles = useMemo(() => {
    const cats = new Set(['All']);
    usersData.forEach((u) => {
      if (u.role) {
        cats.add(getCategoryForRole(u.role));
      }
    });
    return Array.from(cats);
  }, [usersData]);

  const availableDevices = useMemo(() => {
    const devices = new Set(['All']);
    stats.allSessions.forEach((s) => {
      if (s.operatingSystem) devices.add(s.operatingSystem);
    });
    return Array.from(devices);
  }, [stats.allSessions]);

  // Filtered session rows
  const filteredSessions = useMemo(() => {
    return stats.allSessions.filter((s) => {
      // 1. Role filter
      if (selectedRole !== 'All' && getCategoryForRole(s.userRole) !== selectedRole) return false;
      // 2. Device filter
      if (selectedDevice !== 'All' && s.operatingSystem !== selectedDevice) return false;
      // 3. Search query filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const nameMatch = s.userName.toLowerCase().includes(query);
        const roleMatch = s.userRole.toLowerCase().includes(query);
        const browserMatch = s.browser?.toLowerCase().includes(query) || false;
        const osMatch = s.operatingSystem?.toLowerCase().includes(query) || false;
        const deviceMatch = s.deviceType?.toLowerCase().includes(query) || false;
        return nameMatch || roleMatch || browserMatch || osMatch || deviceMatch;
      }
      return true;
    });
  }, [stats.allSessions, selectedRole, selectedDevice, searchQuery]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100vh - 80px)',
      background: '#F1F5F9',
      fontFamily: "'Outfit', sans-serif",
      color: '#0F172A',
      padding: '20px',
      gap: '16px',
    }}>
      
      {/* 1. Header Banner & Dynamic Stats */}
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: isMobile ? 'stretch' : 'center',
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '12px',
        padding: isMobile ? '12px 16px' : '16px 24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        gap: isMobile ? '12px' : '0',
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#0284C7' }}>Live User Map</h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#475569' }}>
            Real-time visual monitoring of authorized company device sessions
          </p>
        </div>

        {/* Real-time Connection Indicator */}
        <div style={{ 
          display: 'flex', 
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'stretch' : 'center', 
          gap: isMobile ? '12px' : '20px' 
        }}>
          <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: '#64748B' }}>
            <span>Users: <strong style={{ color: '#0F172A' }}>{stats.totalUsers}</strong></span>
            <span>Devices: <strong style={{ color: '#0F172A' }}>{stats.totalDevices}</strong></span>
            <span>Online: <strong style={{ color: '#10B981' }}>{stats.onlineDevices}</strong></span>
            <span>With Location: <strong style={{ color: '#0284C7' }}>{stats.withLocation}</strong></span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 12px',
            borderRadius: '20px',
            background: liveStatus === 'LIVE' ? '#F0FDF4' : '#FEF2F2',
            border: `1px solid ${liveStatus === 'LIVE' ? '#BBF7D0' : '#FCA5A5'}`,
            fontSize: '12px',
            fontWeight: 600,
          }}>
            <span style={{
              display: 'block',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: liveStatus === 'LIVE' ? '#16A34A' : '#DC2626',
              animation: liveStatus === 'LIVE' ? 'pulse 2s infinite' : 'none',
            }} />
            <style>{`
              @keyframes pulse {
                0% { box-shadow: 0 0 0 0 rgba(22, 163, 74, 0.4); }
                70% { box-shadow: 0 0 0 8px rgba(22, 163, 74, 0); }
                100% { box-shadow: 0 0 0 0 rgba(22, 163, 74, 0); }
              }
            `}</style>
            <span style={{ color: liveStatus === 'LIVE' ? '#16A34A' : '#DC2626' }}>
              {liveStatus === 'LIVE' ? 'LIVE' : liveStatus === 'RECONNECTING' ? 'RECONNECTING...' : 'OFFLINE'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Main Workspace Split View */}
      <div style={{
        display: 'flex',
        flex: 1,
        gap: '16px',
        overflow: 'hidden',
        position: 'relative',
      }}>
        
        {/* Left Filter & Session Drawer List */}
        <div style={{
          display: showDrawer ? 'flex' : 'none',
          flexDirection: 'column',
          width: isMobile ? 'calc(100% - 24px)' : '360px',
          position: isMobile ? 'absolute' : 'relative',
          top: isMobile ? '12px' : '0',
          left: isMobile ? '12px' : '0',
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
          padding: '16px',
          gap: '12px',
          zIndex: 100,
          height: isMobile ? 'calc(100% - 24px)' : '100%',
          boxShadow: isMobile
            ? '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)'
            : '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)',
        }}>
          
          {mode === 'HISTORY' ? (
            <>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={() => {
                      setMode('LIVE');
                      clearHistoryOverlays();
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#64748B',
                      cursor: 'pointer',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <Lucide.ArrowLeft size={18} />
                  </button>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#0F172A' }}>Route History</h3>
                </div>
                <button
                  onClick={() => setShowDrawer(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#64748B',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Lucide.X size={16} />
                </button>
              </div>

              {/* User Detail Card */}
              <div style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                padding: '12px',
              }}>
                <strong style={{ fontSize: '14px', color: '#0F172A' }}>{selectedUserForHistory?.userName}</strong>
                <div style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>{selectedUserForHistory?.userRole}</div>
                <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>
                  {selectedUserForHistory?.browser} • {selectedUserForHistory?.operatingSystem}
                </div>
              </div>

              {/* Date Selector Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
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
                      fontWeight: selectedDateOption === opt ? 600 : 500,
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
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
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
                        padding: '4px 8px',
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
                        padding: '4px 8px',
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, overflowY: 'auto' }}>
                  {/* Stats Table */}
                  <div style={{
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    padding: '10px',
                    fontSize: '11px',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '8px 12px',
                  }}>
                    <div><strong>Start:</strong> {routeStats?.startTime}</div>
                    <div><strong>End:</strong> {routeStats?.endTime}</div>
                    <div><strong>Distance:</strong> {routeStats?.distanceKm} km</div>
                    <div><strong>Duration:</strong> {routeStats?.durationStr}</div>
                    <div><strong>Avg Speed:</strong> {routeStats?.averageSpeedKmh} km/h</div>
                    <div><strong>Max Speed:</strong> {routeStats?.maxSpeedKmh} km/h</div>
                    <div style={{ gridColumn: 'span 2', borderTop: '1px solid #E2E8F0', paddingTop: '6px', color: '#64748B' }}>
                      <strong>Points:</strong> {historyPoints.length} {historyMetadata?.truncated && '(Truncated)'}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => {
                        if (historyPoints.length > 0) {
                          const bounds = new window.google.maps.LatLngBounds();
                          historyPoints.forEach(p => bounds.extend(new window.google.maps.LatLng(p.latitude, p.longitude)));
                          mapInstanceRef.current.fitBounds(bounds);
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
                      {isPlaying ? 'Pause' : 'Playback'}
                    </button>
                  </div>

                  {/* Playback Controls */}
                  <div style={{
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    padding: '10px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
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
                      style={{
                        width: '100%',
                        cursor: 'pointer',
                      }}
                    />
                  </div>

                  {/* Waypoint Timeline */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Timeline</span>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      borderLeft: '2px solid #E2E8F0',
                      paddingLeft: '12px',
                      marginLeft: '6px',
                    }}>
                      {/* Start Point */}
                      <div style={{ position: 'relative', fontSize: '11px' }}>
                        <span style={{
                          position: 'absolute',
                          left: '-17px',
                          top: '2px',
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: '#10B981',
                        }} />
                        <strong>{routeStats?.startTime}</strong>
                        <div style={{ color: '#64748B' }}>🟢 Start Location</div>
                      </div>

                      {/* Mid Points */}
                      {historyPoints.length > 2 && (
                        <div style={{ position: 'relative', fontSize: '11px' }}>
                          <span style={{
                            position: 'absolute',
                            left: '-17px',
                            top: '2px',
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: '#94A3B8',
                          }} />
                          <strong>{new Date(historyPoints[Math.floor(historyPoints.length / 2)]?.capturedAt).toLocaleTimeString()}</strong>
                          <div style={{ color: '#64748B' }}>📍 Waypoint Update</div>
                        </div>
                      )}

                      {/* End Point */}
                      <div style={{ position: 'relative', fontSize: '11px' }}>
                        <span style={{
                          position: 'absolute',
                          left: '-17px',
                          top: '2px',
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: '#EF4444',
                        }} />
                        <strong>{routeStats?.endTime}</strong>
                        <div style={{ color: '#64748B' }}>🔴 Last GPS Point</div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: '#64748B', fontSize: '12px' }}>
                  No history recorded for this device session.
                </div>
              )}
            </>
          ) : (
            <>
              {/* Drawer Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#0F172A' }}>Active Devices</h3>
                <button
                  onClick={() => setShowDrawer(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#64748B',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Lucide.X size={16} />
                </button>
              </div>
              
              {/* Search bar */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                background: '#F8FAFC',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                padding: '6px 12px',
                gap: '8px',
              }}>
                <span style={{ color: '#64748B', display: 'flex', alignItems: 'center' }}>
                  <Lucide.Search size={16} />
                </span>
                <input
                  type="text"
                  placeholder="Search user, role, device..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    flex: 1,
                    border: 'none',
                    background: 'transparent',
                    outline: 'none',
                    fontSize: '13px',
                    color: '#0F172A',
                    padding: '4px 0',
                    width: '100%',
                  }}
                />
              </div>

              {/* Filters */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', color: '#64748B', marginBottom: '4px', textTransform: 'uppercase' }}>Role</label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    style={{
                      width: '100%',
                      background: '#F8FAFC',
                      border: '1px solid #CBD5E1',
                      borderRadius: '6px',
                      padding: '6px',
                      fontSize: '12px',
                      color: '#0F172A',
                    }}
                  >
                    {availableRoles.map((r) => (
                      <option key={r} value={r} style={{ background: '#FFFFFF', color: '#0F172A' }}>{r}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '10px', color: '#64748B', marginBottom: '4px', textTransform: 'uppercase' }}>OS</label>
                  <select
                    value={selectedDevice}
                    onChange={(e) => setSelectedDevice(e.target.value)}
                    style={{
                      width: '100%',
                      background: '#F8FAFC',
                      border: '1px solid #CBD5E1',
                      borderRadius: '6px',
                      padding: '6px',
                      fontSize: '12px',
                      color: '#0F172A',
                    }}
                  >
                    {availableDevices.map((d) => (
                      <option key={d} value={d} style={{ background: '#FFFFFF', color: '#0F172A' }}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', color: '#64748B' }}>Showing {filteredSessions.length} devices</span>
                <button
                  onClick={() => fitAllMarkers()}
                  style={{
                    background: '#EFF6FF',
                    border: '1px solid #BFDBFE',
                    borderRadius: '6px',
                    padding: '4px 10px',
                    color: '#2563EB',
                    fontSize: '11px',
                    cursor: 'pointer',
                    fontWeight: 500,
                  }}
                >
                  Fit Bounds
                </button>
              </div>

              {/* User/Device cards list */}
              <div style={{
                flex: 1,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                paddingRight: '4px',
              }}>
                {loading ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '40px', color: '#94A3B8' }}>
                    <Lucide.Loader2 className="animate-spin" size={24} />
                  </div>
                ) : filteredSessions.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#94A3B8', fontSize: '13px' }}>
                    No active device sessions found.
                  </div>
                ) : (
                  filteredSessions.map((s) => {
                    const isSelected = selectedSessionId === s.sessionId;
                    return (
                      <div
                        key={s.sessionId}
                        onClick={() => handleSelectCard(s, s.userName, s.userRole)}
                        style={{
                          background: isSelected ? '#EFF6FF' : '#F8FAFC',
                          border: `1px solid ${isSelected ? '#93C5FD' : '#E2E8F0'}`,
                          borderRadius: '8px',
                          padding: '12px',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                      >
                        <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{
                              display: 'block',
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              background: s.status === 'ONLINE' ? '#10B981' : s.status === 'RECENTLY_ACTIVE' ? '#F59E0B' : '#EF4444',
                            }} />
                            <strong style={{ fontSize: '13px', color: isSelected ? '#1D4ED8' : '#0F172A' }}>
                              {s.userName}
                            </strong>
                          </div>
                          <span style={{ fontSize: '10px', color: '#64748B' }}>
                            {s.status === 'ONLINE' ? 'Active' : s.lastSeenAt ? `Seen ${new Date(s.lastSeenAt).toLocaleTimeString()}` : ''}
                          </span>
                        </div>

                        <div style={{ fontSize: '11px', color: '#475569', marginTop: '4px' }}>
                          {s.userRole}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', fontSize: '11px' }}>
                          <span style={{ color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Lucide.Laptop size={12} />
                            {s.browser} • {s.operatingSystem}
                          </span>
                          
                          <span style={{
                            color: s.locationPermission === 'GRANTED' ? (s.status === 'ONLINE' ? '#10B981' : '#F59E0B') : '#EF4444',
                            fontWeight: 500,
                          }}>
                            {!s.location ? (s.locationPermission === 'GRANTED' ? 'Awaiting GPS' : 'GPS Denied') : (s.status === 'ONLINE' && s.locationPermission === 'GRANTED' ? 'Current GPS' : 'Last Known GPS')}
                          </span>
                        </div>

                        {isSelected && (
                          <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectCard(s, s.userName, s.userRole);
                              }}
                              style={{
                                flex: 1,
                                background: '#EFF6FF',
                                border: '1px solid #BFDBFE',
                                borderRadius: '4px',
                                padding: '4px',
                                color: '#2563EB',
                                fontSize: '11px',
                                fontWeight: 500,
                                cursor: 'pointer',
                              }}
                            >
                              View Live
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                enterHistoryMode(s, s.userName, s.userRole);
                              }}
                              style={{
                                flex: 1,
                                background: '#F0FDF4',
                                border: '1px solid #BBF7D0',
                                borderRadius: '4px',
                                padding: '4px',
                                color: '#16A34A',
                                fontSize: '11px',
                                fontWeight: 500,
                                cursor: 'pointer',
                              }}
                            >
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

        {/* Floating Drawer Trigger for Tablet/Mobile when closed */}
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

        {/* Map Container */}
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
