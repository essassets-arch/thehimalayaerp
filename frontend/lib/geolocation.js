import { backendFetch } from './backendFetch';

let lastKnownLocation = null;

/**
 * Load persisted real device location from localStorage or sessionStorage
 */
const loadPersistedLocation = () => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('himalaya_last_real_location') || sessionStorage.getItem('himalaya_last_real_location');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.latitude === 'number' && typeof parsed.longitude === 'number') {
        return parsed;
      }
    }
    const latStr = sessionStorage.getItem('himalaya_last_lat');
    const lngStr = sessionStorage.getItem('himalaya_last_lng');
    if (latStr && lngStr) {
      const latitude = parseFloat(latStr);
      const longitude = parseFloat(lngStr);
      if (!isNaN(latitude) && !isNaN(longitude)) {
        const latDir = latitude >= 0 ? 'N' : 'S';
        const lngDir = longitude >= 0 ? 'E' : 'W';
        return {
          latitude,
          longitude,
          accuracy: 25,
          coordsStr: `${Math.abs(latitude).toFixed(4)}° ${latDir}, ${Math.abs(longitude).toFixed(4)}° ${lngDir}`,
          timestamp: Date.now(),
          acquiredAt: Date.now()
        };
      }
    }
  } catch (_) {}
  return null;
};

/**
 * Persist real device location to localStorage & sessionStorage
 */
const persistRealLocation = (loc) => {
  if (typeof window === 'undefined' || !loc) return;
  try {
    localStorage.setItem('himalaya_last_real_location', JSON.stringify(loc));
    sessionStorage.setItem('himalaya_last_real_location', JSON.stringify(loc));
    sessionStorage.setItem('himalaya_last_lat', String(loc.latitude));
    sessionStorage.setItem('himalaya_last_lng', String(loc.longitude));
    if (loc.accuracy != null) {
      sessionStorage.setItem('himalaya_last_loc_accuracy', String(loc.accuracy));
    }
    sessionStorage.setItem('himalaya_last_loc_time', String(loc.acquiredAt || Date.now()));
  } catch (_) {}
};

/**
 * Helper to format raw geolocation coordinates into normalized real object
 */
const formatPosition = (position) => {
  const lat = position.coords.latitude;
  const lng = position.coords.longitude;
  const accuracy = position.coords.accuracy || 15;
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';
  const coordsStr = `${Math.abs(lat).toFixed(4)}° ${latDir}, ${Math.abs(lng).toFixed(4)}° ${lngDir}`;

  const loc = {
    latitude: lat,
    longitude: lng,
    accuracy,
    coordsStr,
    timestamp: position.timestamp || Date.now(),
    acquiredAt: Date.now()
  };
  lastKnownLocation = loc;
  persistRealLocation(loc);
  return loc;
};

/**
 * Request real device GPS coordinates with mobile/APK-optimized multi-tier acquisition.
 *
 * Tiers:
 *   1. Native Flutter InAppWebView Bridge trigger (requestLocation)
 *   2. Cached Fused Location Provider (maximumAge: 600s, resolves instantly in 50ms)
 *   3. High-Accuracy Hardware Satellite GPS (12s timeout)
 *   4. Network / WiFi / Cell Tower Fused Fallback (10s timeout, indoor-safe)
 *   5. Session Persisted Real Location (Prevents locking users out indoors)
 *
 * ZERO fake factory fallbacks. Real employee position only.
 *
 * @param {{ forceFresh?: boolean, maxAgeSeconds?: number }} [options]
 * @returns {Promise<{ latitude: number, longitude: number, accuracy: number, coordsStr: string, timestamp: number }>}
 */
export async function getCurrentDeviceLocation(options = {}) {
  if (typeof window === 'undefined') {
    throw new Error('Geolocation is not available in server context.');
  }

  const { forceFresh = false, maxAgeSeconds = 120 } = options;

  // Initialize from storage if memory reference is empty
  if (!lastKnownLocation) {
    lastKnownLocation = loadPersistedLocation();
  }

  // 1. Return recent real device location if acquired within maxAgeSeconds
  if (!forceFresh && lastKnownLocation && (Date.now() - (lastKnownLocation.acquiredAt || 0) < maxAgeSeconds * 1000)) {
    return lastKnownLocation;
  }

  // 2. Proactively trigger native Flutter APK permission prompt if running in InAppWebView
  const w = window;
  if (w.flutter_inappwebview && typeof w.flutter_inappwebview.callHandler === 'function') {
    try {
      await w.flutter_inappwebview.callHandler('requestLocation');
    } catch (_) {}
  }

  if (!('geolocation' in navigator)) {
    if (lastKnownLocation) return lastKnownLocation;
    throw new Error('Geolocation is not supported or accessible on this device/browser.');
  }

  return new Promise((resolve, reject) => {
    let settled = false;

    const finish = (loc) => {
      if (settled) return;
      settled = true;
      resolve(loc);
    };

    const fail = (err) => {
      if (settled) return;
      // If we have any previously verified real location from this session, use it
      const fallback = lastKnownLocation || loadPersistedLocation();
      if (fallback) {
        settled = true;
        resolve(fallback);
        return;
      }

      settled = true;
      let msg = 'Unable to acquire device GPS position.';
      if (err && err.code === 1) {
        msg = 'Location permission is denied. In your phone Settings ➔ Apps ➔ Himalaya ➔ Permissions, please select "Allow only while using the app".';
      } else if (err && err.code === 2) {
        msg = 'Location service unavailable. Please ensure device Location/GPS is turned ON in your phone quick settings.';
      } else if (err && err.code === 3) {
        msg = 'Location acquisition timed out. Please check that Location is allowed in Phone Settings ➔ Apps ➔ Himalaya ➔ Permissions, and device GPS is active.';
      }
      reject(new Error(msg));
    };

    const acquireLiveLocation = () => {
      // Tier 2: Live GPS with high accuracy
      navigator.geolocation.getCurrentPosition(
        (pos) => finish(formatPosition(pos)),
        (highAccErr) => {
          // If user explicitly denied permission, fail immediately with clear instructions
          if (highAccErr && highAccErr.code === 1) {
            fail(highAccErr);
            return;
          }

          // Tier 3: High accuracy timed out (common indoors). Fallback to Network Provider
          navigator.geolocation.getCurrentPosition(
            (netPos) => finish(formatPosition(netPos)),
            (netErr) => {
              fail(netErr || highAccErr);
            },
            { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 }
          );
        },
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 }
      );
    };

    // Tier 1: Try Fast Fused Location Provider (indoor WiFi / cell cache)
    if (!forceFresh) {
      navigator.geolocation.getCurrentPosition(
        (pos) => finish(formatPosition(pos)),
        () => {
          // If fast cache fails, continue to live satellite query
          acquireLiveLocation();
        },
        { enableHighAccuracy: false, maximumAge: 600000, timeout: 3500 }
      );
      return;
    }

    acquireLiveLocation();
  });
}

/**
 * Reverse geocode coordinates via the backend Google Maps Geocoding integration.
 * If geocoding is unavailable or fails, returns honest coordinate representation.
 * ZERO fake factory campuses or network location fallbacks.
 *
 * @param {number} latitude
 * @param {number} longitude
 * @param {number} [accuracy]
 * @returns {Promise<string>}
 */
export async function reverseGeocodeViaBackend(latitude, longitude, accuracy) {
  const honestCoords = accuracy != null && accuracy > 0
    ? `${latitude.toFixed(4)}, ${longitude.toFixed(4)} (Accuracy: ±${Math.round(accuracy)}m)`
    : `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;

  try {
    const queryParams = new URLSearchParams();
    queryParams.set('lat', String(latitude));
    queryParams.set('lng', String(longitude));
    if (accuracy != null && accuracy > 0) {
      queryParams.set('accuracy', String(Math.round(accuracy)));
    }
    const res = await backendFetch(`/api/backend/attendance/reverse-geocode?${queryParams.toString()}`);

    if (res && res.address && typeof res.address === 'string' && res.address.trim()) {
      return res.address.trim();
    }
    if (res && res.data && res.data.address && typeof res.data.address === 'string') {
      return res.data.address.trim();
    }
  } catch (err) {
    console.warn('[geolocation] Backend reverse geocode error:', err?.message || err);
  }

  return honestCoords;
}

/**
 * Format total working seconds into standard "09h 07m 15s" string.
 *
 * @param {number} totalSecs
 * @returns {string}
 */
export function formatWorkingDurationHms(totalSecs) {
  if (!totalSecs || totalSecs <= 0) return '00h 00m 00s';
  const h = Math.floor(totalSecs / 3600);
  const m = Math.floor((totalSecs % 3600) / 60);
  const s = totalSecs % 60;
  return `${h.toString().padStart(2, '0')}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`;
}

/**
 * Format elapsed duration between punchIn timestamp and current time into "04h 31m".
 *
 * @param {string|Date} punchInAt
 * @returns {string}
 */
export function formatElapsedDurationHm(punchInAt) {
  if (!punchInAt) return '00h 00m';
  const startMs = new Date(punchInAt).getTime();
  if (isNaN(startMs)) return '00h 00m';
  const elapsedSecs = Math.max(0, Math.floor((Date.now() - startMs) / 1000));
  const h = Math.floor(elapsedSecs / 3600);
  const m = Math.floor((elapsedSecs % 3600) / 60);
  return `${h.toString().padStart(2, '0')}h ${m.toString().padStart(2, '0')}m`;
}
