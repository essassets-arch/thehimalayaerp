import { backendFetch } from './backendFetch';

let lastKnownLocation = null;

/**
 * Request real device GPS coordinates with high accuracy and mobile-optimized fallback.
 * Uses watchPosition and fused location provider fallback to prevent indoor Android/iOS timeouts.
 * ZERO fake/factory fallbacks.
 *
 * @param {{ forceFresh?: boolean, maxAgeSeconds?: number }} [options]
 * @returns {Promise<{ latitude: number, longitude: number, accuracy: number, coordsStr: string, timestamp: number }>}
 */
export async function getCurrentDeviceLocation(options = {}) {
  if (typeof window === 'undefined' || !('geolocation' in navigator)) {
    throw new Error('Geolocation is not supported or accessible on this device/browser.');
  }

  const { forceFresh = false, maxAgeSeconds = 45 } = options;

  // Return recent real device location if acquired within maxAgeSeconds
  if (!forceFresh && lastKnownLocation && (Date.now() - (lastKnownLocation.acquiredAt || 0) < maxAgeSeconds * 1000)) {
    return lastKnownLocation;
  }

  const formatPos = (position) => {
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
    return loc;
  };

  return new Promise((resolve, reject) => {
    let settled = false;
    let watchId = null;
    let timerId = null;

    const cleanup = () => {
      if (watchId !== null) {
        try {
          navigator.geolocation.clearWatch(watchId);
        } catch (e) {}
        watchId = null;
      }
      if (timerId !== null) {
        clearTimeout(timerId);
        timerId = null;
      }
    };

    const finishSuccess = (pos) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(formatPos(pos));
    };

    const tryFallback = () => {
      cleanup();
      // Try fused/network provider (enableHighAccuracy: false, maximumAge: 60s)
      // This is crucial for indoor Android devices where direct satellite GPS is blocked by ceilings/walls
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (settled) return;
          settled = true;
          resolve(formatPos(pos));
        },
        (finalErr) => {
          if (settled) return;
          // If we have a cached device location within 2 minutes, use it rather than failing
          if (lastKnownLocation && (Date.now() - (lastKnownLocation.acquiredAt || 0) < 120000)) {
            settled = true;
            resolve(lastKnownLocation);
            return;
          }
          settled = true;
          let msg = 'Unable to acquire device GPS position.';
          if (finalErr && finalErr.code === 1) {
            msg = 'Location access denied. Please grant location/GPS permission in your browser settings to punch attendance.';
          } else if (finalErr && finalErr.code === 2) {
            msg = 'Location unavailable. Please verify device GPS/Location services are turned ON in phone settings.';
          } else if (finalErr && finalErr.code === 3) {
            msg = 'Location acquisition timed out. Please tap "Retry GPS" and ensure device location is active.';
          }
          reject(new Error(msg));
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
      );
    };

    // Tier 1: Try watchPosition with high accuracy and 30s maximumAge
    // watchPosition on Android Chrome binds directly to FusedLocationProvider and fires quickly
    try {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          if (pos && pos.coords) {
            finishSuccess(pos);
          }
        },
        (watchErr) => {
          if (watchErr && watchErr.code === 1) {
            settled = true;
            cleanup();
            reject(new Error('Location access denied. Please grant location/GPS permission in your browser settings to punch attendance.'));
          } else {
            tryFallback();
          }
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 }
      );

      // If watchPosition does not produce a fix within 6 seconds, invoke fallback
      timerId = setTimeout(() => {
        if (!settled) {
          tryFallback();
        }
      }, 6000);
    } catch (e) {
      tryFallback();
    }
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
