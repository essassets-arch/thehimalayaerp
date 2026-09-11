import { apiClient } from './apiClient';

/**
 * Request real device GPS coordinates with high accuracy (maximumAge: 0).
 * Rejects if permission is denied or location cannot be obtained.
 * ZERO fake/factory fallbacks.
 *
 * @returns {Promise<{ latitude: number, longitude: number, accuracy: number, coordsStr: string }>}
 */
export async function getCurrentDeviceLocation() {
  if (typeof window === 'undefined' || !('geolocation' in navigator)) {
    throw new Error('Geolocation is not supported or accessible on this device/browser.');
  }

  return new Promise((resolve, reject) => {
    const handleSuccess = (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      const accuracy = position.coords.accuracy || 15;
      const latDir = lat >= 0 ? 'N' : 'S';
      const lngDir = lng >= 0 ? 'E' : 'W';
      const coordsStr = `${Math.abs(lat).toFixed(4)}° ${latDir}, ${Math.abs(lng).toFixed(4)}° ${lngDir}`;

      resolve({
        latitude: lat,
        longitude: lng,
        accuracy,
        coordsStr,
        timestamp: position.timestamp || Date.now()
      });
    };

    const handleError = (err) => {
      let message = 'Unable to acquire device GPS position.';
      if (err.code === 1) {
        message = 'Location access denied. Please grant location/GPS permission in your browser settings to punch attendance.';
      } else if (err.code === 2) {
        message = 'Location unavailable. Please verify device GPS/Location services are enabled.';
      } else if (err.code === 3) {
        message = 'Location acquisition timed out. Please ensure clear GPS reception and retry.';
      }
      reject(new Error(message));
    };

    // First try strict high accuracy (10s timeout, maximumAge: 0 for fresh GPS)
    navigator.geolocation.getCurrentPosition(
      handleSuccess,
      (firstErr) => {
        // If high accuracy times out or fails (e.g. indoor office Wi-Fi), try standard accuracy with maximumAge: 0
        if (firstErr.code === 3 || firstErr.code === 2) {
          navigator.geolocation.getCurrentPosition(
            handleSuccess,
            handleError,
            { enableHighAccuracy: false, timeout: 8000, maximumAge: 0 }
          );
        } else {
          handleError(firstErr);
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
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
    const res = await apiClient.get(`/attendance/reverse-geocode?${queryParams.toString()}`);

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
