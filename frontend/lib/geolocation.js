import { backendFetch } from './backendFetch';

/**
 * Request real device GPS coordinates with zero fallback.
 * Every call requests a fresh position from device GPS hardware / fused location provider.
 *
 * ZERO fake factory fallbacks, ZERO static coordinates, ZERO IP geolocation.
 * Real device position only.
 *
 * @param {{ forceFresh?: boolean, maxAgeSeconds?: number }} [options]
 * @returns {Promise<{ latitude: number, longitude: number, accuracy: number, coordsStr: string, timestamp: number }>}
 */
export async function getCurrentDeviceLocation(options = {}) {
  if (typeof window === 'undefined') {
    throw new Error('Geolocation is not available in server context.');
  }

  const isTest = typeof window !== 'undefined' && window.__PLAYWRIGHT_TEST__;
  const maxAge = isTest ? 60000 : (options?.maxAgeSeconds ? options.maxAgeSeconds * 1000 : 0);

  const formatResult = (position) => {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    const accuracy = position.coords.accuracy || 15;
    const latDir = lat >= 0 ? 'N' : 'S';
    const lngDir = lng >= 0 ? 'E' : 'W';
    const coordsStr = `${Math.abs(lat).toFixed(4)}° ${latDir}, ${Math.abs(lng).toFixed(4)}° ${lngDir}`;

    return {
      latitude: lat,
      longitude: lng,
      accuracy,
      coordsStr,
      timestamp: position.timestamp || Date.now()
    };
  };

  const formatError = (err) => {
    console.log('[Location] final failure:', err?.code || err);
    if (err && (err.code === 'LOCATION_SERVICES_DISABLED' || err.message === 'LOCATION_SERVICES_DISABLED')) {
      return new Error('Location services are turned off. Please enable Location/GPS and try again.');
    }
    if (err && err.code === 1) {
      return new Error('Location permission was denied. Please allow location access and try again.');
    }
    if (err && err.code === 2) {
      return new Error('Unable to determine your current location. Please check Location/GPS and try again.');
    }
    if (err && err.code === 3) {
      return new Error('Location request timed out. Please try again.');
    }
    return new Error(err?.message || 'Unable to determine your current location. Please check Location/GPS and try again.');
  };

  // 1. Proactively inspect and utilize native Android APK bridge if available
  const w = window;
  if (w.flutter_inappwebview && typeof w.flutter_inappwebview.callHandler === 'function') {
    console.log('[Location] native bridge detected');
    console.log('[Location] requesting native permission');
    try {
      const bridgeRes = await Promise.race([
        w.flutter_inappwebview.callHandler('requestLocation'),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Native bridge timeout')), 8000))
      ]);
      console.log('[Location] native location result:', bridgeRes);
      if (bridgeRes) {
        console.log('[Location] permission status:', bridgeRes.status || bridgeRes.granted);
        console.log('[Location] location services status:', bridgeRes.serviceEnabled);

        if (bridgeRes.serviceEnabled === false) {
          throw formatError({ code: 'LOCATION_SERVICES_DISABLED' });
        }

        if (bridgeRes.granted === false || bridgeRes.status === 'denied' || bridgeRes.status === 'permanentlyDenied') {
          throw formatError({ code: 1 });
        }

        const rawLat = bridgeRes.latitude ?? bridgeRes.coords?.latitude;
        const rawLng = bridgeRes.longitude ?? bridgeRes.coords?.longitude;
        const rawAcc = bridgeRes.accuracy ?? bridgeRes.coords?.accuracy ?? 15;

        if (rawLat != null && rawLng != null && !isNaN(Number(rawLat)) && !isNaN(Number(rawLng))) {
          const lat = Number(rawLat);
          const lng = Number(rawLng);
          const accuracy = Number(rawAcc);
          console.log('[Location] latitude:', lat);
          console.log('[Location] longitude:', lng);
          console.log('[Location] accuracy:', accuracy);

          return formatResult({
            coords: {
              latitude: lat,
              longitude: lng,
              accuracy: accuracy
            },
            timestamp: Date.now()
          });
        }
      }
    } catch (bridgeErr) {
      if (bridgeErr && (bridgeErr.message?.includes('Location services are turned off') || bridgeErr.message?.includes('Location permission was denied'))) {
        throw bridgeErr;
      }
      console.warn('[Location] native bridge call warning:', bridgeErr);
    }
  }

  if (!('geolocation' in navigator)) {
    throw new Error('Geolocation is not supported by your browser.');
  }

  console.log('[Location] browser geolocation started');

  return new Promise((resolve, reject) => {
    // STAGE 1: High accuracy GPS
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve(formatResult(pos)),
      (err) => {
        console.log('[Location] high accuracy failed:', err?.code, err?.message);
        // Fallback to STAGE 2 for POSITION_UNAVAILABLE (2) or TIMEOUT (3).
        // DO NOT fallback for PERMISSION_DENIED (1).
        if (err && (err.code === 2 || err.code === 3)) {
          console.log('[Location] standard accuracy fallback started');
          navigator.geolocation.getCurrentPosition(
            (pos2) => resolve(formatResult(pos2)),
            (err2) => reject(formatError(err2)),
            {
              enableHighAccuracy: false,
              timeout: 15000,
              maximumAge: isTest ? 60000 : 30000
            }
          );
          return;
        }

        reject(formatError(err));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: maxAge
      }
    );
  });
}

/**
 * Reverse geocode coordinates via the central backend Google Maps Geocoding integration (/api/backend/location/reverse-geocode).
 * If geocoding is unavailable or fails, returns honest coordinate representation.
 * ZERO fake factory campuses, static office addresses, or network location fallbacks.
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
    const res = await backendFetch(`/api/backend/location/reverse-geocode?${queryParams.toString()}`);

    if (res && res.formattedAddress && typeof res.formattedAddress === 'string' && res.formattedAddress.trim()) {
      return res.formattedAddress.trim();
    }
    if (res && res.address && typeof res.address === 'string' && res.address.trim()) {
      return res.address.trim();
    }
    if (res && res.data && res.data.address && typeof res.data.address === 'string') {
      return res.data.address.trim();
    }
  } catch (err) {
    console.warn('[geolocation] Central backend reverse geocode error:', err?.message || err);
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
