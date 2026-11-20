/**
 * Shared IST (Asia/Kolkata) timezone, distance, jump-filtering, and
 * stationary-stop clustering utilities for Himalaya ERP Location Tracking.
 */

export const IST_TIMEZONE = 'Asia/Kolkata';
export const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000; // UTC+5:30 (no DST in India)
export const STOP_RADIUS_METERS = 65; // Spatial clustering radius for stationary stops
export const STOP_SPEED_KMH_MAX = 2.5; // Max speed (km/h) considered stationary
export const STOP_MIN_DURATION_SECONDS = 300; // 5 minutes minimum stay
export const MAX_REALISTIC_SPEED_KMH = 180; // Impossible teleport threshold
export const MAX_ROUTE_ACCURACY_METERS = 500; // Exclude coarse ISP/IP-geolocation pings (e.g. 20km/50km)

/**
 * Reject known synthetic/hardcoded placeholder coordinates (Null Island or legacy New Delhi modal fallback).
 */
export function isSyntheticPlaceholderCoord(lat: number, lng: number): boolean {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return true;
  if (Math.abs(lat) < 0.0005 && Math.abs(lng) < 0.0005) return true;
  // Legacy MandatoryPermissionsModal fallback (28.6139, 77.2090)
  if (Math.abs(lat - 28.6139) < 0.0005 && Math.abs(lng - 77.209) < 0.0005) {
    return true;
  }
  return false;
}

/**
 * Convert any Date (or now) into a YYYY-MM-DD calendar date string in Asia/Kolkata (IST).
 */
export function getIstDateString(date: Date = new Date()): string {
  const shifted = new Date(date.getTime() + IST_OFFSET_MS);
  const y = shifted.getUTCFullYear();
  const m = String(shifted.getUTCMonth() + 1).padStart(2, '0');
  const d = String(shifted.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Get the current IST hour (0-23) and minute (0-59).
 */
export function getIstHourMinute(date: Date = new Date()): {
  dateIst: string;
  hour: number;
  minute: number;
} {
  const shifted = new Date(date.getTime() + IST_OFFSET_MS);
  return {
    dateIst: getIstDateString(date),
    hour: shifted.getUTCHours(),
    minute: shifted.getUTCMinutes(),
  };
}

/**
 * Convert a YYYY-MM-DD IST calendar date into exact UTC start & end Date bounds.
 * Example: "2026-11-20" IST -> 2026-11-19T18:30:00.000Z .. 2026-11-20T18:29:59.999Z
 */
export function getIstDayBoundsUtc(dateStr: string): {
  start: Date;
  end: Date;
} {
  const parts = String(dateStr || '').trim().split('-').map(Number);
  if (parts.length !== 3 || parts.some((n) => isNaN(n))) {
    const fallback = getIstDateString();
    return getIstDayBoundsUtc(fallback);
  }
  const [year, month, day] = parts;
  const startUtcMs = Date.UTC(year, month - 1, day, 0, 0, 0, 0) - IST_OFFSET_MS;
  const endUtcMs =
    Date.UTC(year, month - 1, day, 23, 59, 59, 999) - IST_OFFSET_MS;
  return {
    start: new Date(startUtcMs),
    end: new Date(endUtcMs),
  };
}

/**
 * Return an ordered array (oldest -> newest) of YYYY-MM-DD IST strings for a date range.
 */
export function getIstDateListBetween(fromStr: string, toStr: string): string[] {
  const [fy, fm, fd] = fromStr.split('-').map(Number);
  const [ty, tm, td] = toStr.split('-').map(Number);
  const startUtc = Date.UTC(fy, fm - 1, fd, 12, 0, 0);
  const endUtc = Date.UTC(ty, tm - 1, td, 12, 0, 0);

  const dates: string[] = [];
  for (let ms = startUtc; ms <= endUtc && dates.length < 31; ms += 86400000) {
    const d = new Date(ms);
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    dates.push(`${y}-${m}-${day}`);
  }
  return dates;
}

/**
 * Return an ordered array of the last N IST calendar days ending on endDateStr (default today IST).
 */
export function getLastNDaysIst(days = 7, endDateStr?: string): string[] {
  const safeDays = Math.max(1, Math.min(14, Math.floor(days) || 7));
  const endStr = endDateStr || getIstDateString(new Date());
  const [ey, em, ed] = endStr.split('-').map(Number);
  const endNoonUtc = Date.UTC(ey, em - 1, ed, 12, 0, 0);
  const startNoonUtc = endNoonUtc - (safeDays - 1) * 86400000;
  const startD = new Date(startNoonUtc);
  const startStr = `${startD.getUTCFullYear()}-${String(startD.getUTCMonth() + 1).padStart(2, '0')}-${String(startD.getUTCDate()).padStart(2, '0')}`;
  return getIstDateListBetween(startStr, endStr);
}

/**
 * Format a YYYY-MM-DD date string into a friendly display label like "Fri, 20 Nov".
 */
export function formatIstDayLabel(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  return dt.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    timeZone: 'UTC',
  });
}

/**
 * Haversine distance in meters between two WGS84 coordinates.
 */
export function haversineDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export interface NormalizedTrackPoint {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  speed: number | null; // km/h
  heading: number | null;
  batteryLevel: number | null;
  recordedAt: string; // ISO string
  source: string;
}

export interface DetectedStop {
  stopNumber: number;
  latitude: number;
  longitude: number;
  arrivedAt: string;
  departedAt: string;
  durationMinutes: number;
  address: string | null;
  locationName: string;
}

export interface TrackAccuracyMetrics {
  medianAccuracyMeters: number | null;
  highAccuracyPercent: number;
  filteredCoarsePoints: number;
  filteredSyntheticPoints: number;
  filteredJumps: number;
  qualityLabel: 'HIGH_GPS' | 'MODERATE' | 'LOW_SIGNAL' | 'NO_GPS';
}

export interface DayRoadmapStep {
  stepNumber: number;
  type: 'PUNCH_IN' | 'STOP' | 'LEAD' | 'PUNCH_OUT' | 'LAST_POSITION';
  title: string;
  subtitle: string | null;
  time: string;
  endTime?: string | null;
  durationMinutes?: number | null;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  legDistanceKm: number | null;
  stopNumber?: number;
  leadId?: string;
}

/**
 * Deduplicate raw GPS points from multiple sources (EmployeeLocationPoint + UserLocationHistory),
 * reject synthetic placeholder coordinates & coarse ISP/IP fallback readings (> 500m),
 * filter impossible teleport jumps (>180 km/h across ANY gap, plus anchor outlier spikes),
 * and compute realistic travel distance + accuracy quality metrics.
 */
export function cleanAndCalculateTrack(
  rawPoints: NormalizedTrackPoint[],
  anchorPoint?: { latitude: number; longitude: number; recordedAt: string } | null,
): {
  points: NormalizedTrackPoint[];
  distanceKm: number;
  accuracyMetrics: TrackAccuracyMetrics;
} {
  if (!rawPoints || rawPoints.length === 0) {
    return {
      points: [],
      distanceKm: 0,
      accuracyMetrics: {
        medianAccuracyMeters: null,
        highAccuracyPercent: 0,
        filteredCoarsePoints: 0,
        filteredSyntheticPoints: 0,
        filteredJumps: 0,
        qualityLabel: 'NO_GPS',
      },
    };
  }

  let filteredSyntheticPoints = 0;
  let filteredCoarsePoints = 0;
  let filteredJumps = 0;

  const validBounds = rawPoints.filter((p) => {
    if (
      !Number.isFinite(p.latitude) ||
      !Number.isFinite(p.longitude) ||
      p.latitude < -90 ||
      p.latitude > 90 ||
      p.longitude < -180 ||
      p.longitude > 180
    ) {
      return false;
    }
    if (isSyntheticPlaceholderCoord(p.latitude, p.longitude)) {
      filteredSyntheticPoints++;
      return false;
    }
    // Reject coarse desktop/ISP IP-geolocation readings (> 500m radius, e.g. 20,000m / 50,000m)
    if (p.accuracy != null && p.accuracy > MAX_ROUTE_ACCURACY_METERS) {
      filteredCoarsePoints++;
      return false;
    }
    return true;
  });

  const sorted = [...validBounds].sort(
    (a, b) =>
      new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime(),
  );

  // If we have an authoritative Punch-In anchor, discard isolated pre-punch-in spikes > 25 km away within 45 min
  const anchorFiltered = sorted.filter((p) => {
    if (!anchorPoint || isSyntheticPlaceholderCoord(anchorPoint.latitude, anchorPoint.longitude)) {
      return true;
    }
    const dtMin =
      Math.abs(
        new Date(p.recordedAt).getTime() -
          new Date(anchorPoint.recordedAt).getTime(),
      ) / 60000;
    if (dtMin <= 45) {
      const distFromAnchorKm =
        haversineDistanceMeters(
          anchorPoint.latitude,
          anchorPoint.longitude,
          p.latitude,
          p.longitude,
        ) / 1000;
      // Impossible to be > 60 km from Punch-In within 45 min, or > 25 km within 10 min
      if (distFromAnchorKm > 60 || (dtMin <= 10 && distFromAnchorKm > 25)) {
        filteredJumps++;
        return false;
      }
    }
    return true;
  });

  const cleaned: NormalizedTrackPoint[] = [];
  let totalDistanceMeters = 0;

  for (const pt of anchorFiltered) {
    if (cleaned.length === 0) {
      cleaned.push(pt);
      continue;
    }

    const prev = cleaned[cleaned.length - 1];
    const dtSeconds =
      (new Date(pt.recordedAt).getTime() -
        new Date(prev.recordedAt).getTime()) /
      1000;
    const distM = haversineDistanceMeters(
      prev.latitude,
      prev.longitude,
      pt.latitude,
      pt.longitude,
    );

    // Deduplicate identical / cross-synced pings within 8s and 12m
    if (dtSeconds <= 8 && distM <= 12) {
      if (
        pt.accuracy != null &&
        (prev.accuracy == null || pt.accuracy < prev.accuracy)
      ) {
        cleaned[cleaned.length - 1] = pt;
      }
      continue;
    }

    // Filter impossible teleport jumps (> 180 km/h over > 500m across ANY interval)
    const speedKmh =
      dtSeconds > 0 ? (distM / 1000) / (dtSeconds / 3600) : Infinity;
    if (distM > 500 && speedKmh > MAX_REALISTIC_SPEED_KMH) {
      filteredJumps++;
      continue;
    }

    // Only add distance for accurate readings (<= 300m) with meaningful movement (>= 8m)
    const prevAccOk = prev.accuracy == null || prev.accuracy <= 300;
    const currAccOk = pt.accuracy == null || pt.accuracy <= 300;
    if (prevAccOk && currAccOk && distM >= 8) {
      totalDistanceMeters += distM;
    }

    cleaned.push(pt);
  }

  // Compute GPS quality metrics for transparent Super Admin reporting
  const accValues = cleaned
    .map((p) => p.accuracy)
    .filter((a): a is number => a != null && Number.isFinite(a))
    .sort((a, b) => a - b);

  const medianAccuracyMeters =
    accValues.length > 0
      ? Math.round(accValues[Math.floor(accValues.length / 2)] * 10) / 10
      : null;

  const highAccCount = accValues.filter((a) => a <= 30).length;
  const highAccuracyPercent =
    accValues.length > 0 ? Math.round((highAccCount / accValues.length) * 100) : 0;

  let qualityLabel: TrackAccuracyMetrics['qualityLabel'] = 'NO_GPS';
  if (cleaned.length > 0) {
    if (medianAccuracyMeters != null && medianAccuracyMeters <= 25) {
      qualityLabel = 'HIGH_GPS';
    } else if (medianAccuracyMeters != null && medianAccuracyMeters <= 120) {
      qualityLabel = 'MODERATE';
    } else {
      qualityLabel = 'LOW_SIGNAL';
    }
  }

  return {
    points: cleaned,
    distanceKm: Math.round((totalDistanceMeters / 1000) * 1000) / 1000,
    accuracyMetrics: {
      medianAccuracyMeters,
      highAccuracyPercent,
      filteredCoarsePoints,
      filteredSyntheticPoints,
      filteredJumps,
      qualityLabel,
    },
  };
}

/**
 * Assemble a chronological Day Circle Roadmap from Day Start (Punch In) ->
 * Stops & CRM Lead Visits (with inter-checkpoint leg distances) -> Day End (Punch Out / Last Position).
 */
export function buildDayRoadmap(params: {
  punchIn: {
    at: string;
    latitude: number | null;
    longitude: number | null;
    address: string | null;
  } | null;
  punchOut: {
    at: string;
    latitude: number | null;
    longitude: number | null;
    address: string | null;
  } | null;
  points: NormalizedTrackPoint[];
  stops: DetectedStop[];
  leads: Array<{
    id: string;
    leadNumber?: string | null;
    companyName: string;
    contactPerson?: string | null;
    createdAt: string;
    latitude: number | null;
    longitude: number | null;
    address: string | null;
  }>;
  status: string;
}): {
  steps: DayRoadmapStep[];
  returnDistanceFromStartKm: number | null;
  circleClosed: boolean;
} {
  const { punchIn, punchOut, points, stops, leads, status } = params;
  const rawSteps: Array<Omit<DayRoadmapStep, 'stepNumber' | 'legDistanceKm'>> = [];

  const firstPt = points.length > 0 ? points[0] : null;
  const lastPt = points.length > 0 ? points[points.length - 1] : null;

  const startLat = punchIn?.latitude ?? firstPt?.latitude ?? null;
  const startLng = punchIn?.longitude ?? firstPt?.longitude ?? null;
  const startTime = punchIn?.at ?? firstPt?.recordedAt ?? null;

  if (startTime) {
    rawSteps.push({
      type: 'PUNCH_IN',
      title: punchIn ? 'Day Start — Punch In' : 'First GPS Activity',
      subtitle: punchIn ? 'Shift Started' : 'Auto-Tracked Start',
      time: startTime,
      latitude: startLat,
      longitude: startLng,
      address: punchIn?.address || null,
    });
  }

  // Chronologically interleave Field Stops and CRM Lead captures
  const midEvents: Array<Omit<DayRoadmapStep, 'stepNumber' | 'legDistanceKm'>> = [];

  for (const st of stops) {
    midEvents.push({
      type: 'STOP',
      title: `Stop #${st.stopNumber} (${st.durationMinutes} min)`,
      subtitle: st.locationName || 'Client / Field Halt',
      time: st.arrivedAt,
      endTime: st.departedAt,
      durationMinutes: st.durationMinutes,
      latitude: st.latitude,
      longitude: st.longitude,
      address: st.address || null,
      stopNumber: st.stopNumber,
    });
  }

  for (const l of leads) {
    midEvents.push({
      type: 'LEAD',
      title: `Lead: ${l.companyName}`,
      subtitle: [l.contactPerson, l.leadNumber].filter(Boolean).join(' • ') || 'CRM Visit',
      time: l.createdAt,
      latitude: l.latitude,
      longitude: l.longitude,
      address: l.address || null,
      leadId: l.id,
    });
  }

  midEvents.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
  rawSteps.push(...midEvents);

  const endLat = punchOut?.latitude ?? lastPt?.latitude ?? null;
  const endLng = punchOut?.longitude ?? lastPt?.longitude ?? null;
  const endTime = punchOut?.at ?? lastPt?.recordedAt ?? null;

  if (endTime && (punchOut || (lastPt && endTime !== startTime))) {
    rawSteps.push({
      type: punchOut ? 'PUNCH_OUT' : 'LAST_POSITION',
      title: punchOut
        ? 'Day End — Punch Out'
        : status === 'ACTIVE'
          ? 'Live Position (On Shift)'
          : 'Last Recorded Position',
      subtitle: punchOut ? 'Shift Completed' : status === 'ACTIVE' ? 'Currently Active' : 'End of Telemetry',
      time: endTime,
      latitude: endLat,
      longitude: endLng,
      address: punchOut?.address || null,
    });
  }

  // Compute step numbers & leg distances between consecutive geocoded checkpoints
  let prevCoord: { lat: number; lng: number } | null = null;
  const steps: DayRoadmapStep[] = rawSteps.map((s, idx) => {
    let legDistanceKm: number | null = null;
    if (s.latitude != null && s.longitude != null) {
      if (prevCoord) {
        const dMeters = haversineDistanceMeters(
          prevCoord.lat,
          prevCoord.lng,
          s.latitude,
          s.longitude,
        );
        legDistanceKm = Math.round((dMeters / 1000) * 100) / 100;
      }
      prevCoord = { lat: s.latitude, lng: s.longitude };
    }
    return {
      ...s,
      stepNumber: idx + 1,
      legDistanceKm,
    };
  });

  let returnDistanceFromStartKm: number | null = null;
  if (
    startLat != null &&
    startLng != null &&
    endLat != null &&
    endLng != null &&
    steps.length >= 2
  ) {
    const retM = haversineDistanceMeters(startLat, startLng, endLat, endLng);
    returnDistanceFromStartKm = Math.round((retM / 1000) * 100) / 100;
  }

  const circleClosed =
    Boolean(punchIn && punchOut) &&
    returnDistanceFromStartKm != null &&
    returnDistanceFromStartKm <= 1.5;

  return { steps, returnDistanceFromStartKm, circleClosed };
}

/**
 * Spatial + temporal stationary stop clustering.
 * Works reliably for BOTH web GPS (where speed is often null) and native mobile GPS:
 * groups consecutive points within STOP_RADIUS_METERS (65m) of the cluster anchor
 * whose total span is >= 5 minutes (300s).
 */
export function detectStopsFromPoints(
  points: NormalizedTrackPoint[],
): DetectedStop[] {
  if (!points || points.length < 2) return [];

  const stops: DetectedStop[] = [];
  let anchorLat = points[0].latitude;
  let anchorLng = points[0].longitude;
  let clusterStartIdx = 0;
  let clusterCount = 1;
  let sumLat = points[0].latitude;
  let sumLng = points[0].longitude;

  const flushCluster = (endIdx: number) => {
    const startPt = points[clusterStartIdx];
    const endPt = points[endIdx];
    const durationSec =
      (new Date(endPt.recordedAt).getTime() -
        new Date(startPt.recordedAt).getTime()) /
      1000;

    // Require >= 5 minutes AND <= 12 hours (ignore overnight gap between two separate shifts)
    if (
      durationSec >= STOP_MIN_DURATION_SECONDS &&
      durationSec <= 12 * 3600 &&
      clusterCount >= 2
    ) {
      const avgLat = sumLat / clusterCount;
      const avgLng = sumLng / clusterCount;
      const stopNumber = stops.length + 1;
      stops.push({
        stopNumber,
        latitude: Math.round(avgLat * 1e7) / 1e7,
        longitude: Math.round(avgLng * 1e7) / 1e7,
        arrivedAt: startPt.recordedAt,
        departedAt: endPt.recordedAt,
        durationMinutes: Math.max(1, Math.round(durationSec / 60)),
        address: null,
        locationName: `Stop #${stopNumber}`,
      });
    }
  };

  for (let i = 1; i < points.length; i++) {
    const pt = points[i];
    const prev = points[i - 1];
    const gapSec =
      (new Date(pt.recordedAt).getTime() -
        new Date(prev.recordedAt).getTime()) /
      1000;
    const distFromAnchor = haversineDistanceMeters(
      anchorLat,
      anchorLng,
      pt.latitude,
      pt.longitude,
    );

    const movingFast = pt.speed != null && pt.speed > STOP_SPEED_KMH_MAX * 2;
    // Break cluster if moved outside radius, moving fast, or telemetry gap > 90 mins
    if (distFromAnchor <= STOP_RADIUS_METERS && !movingFast && gapSec <= 5400) {
      clusterCount++;
      sumLat += pt.latitude;
      sumLng += pt.longitude;
      anchorLat = sumLat / clusterCount;
      anchorLng = sumLng / clusterCount;
    } else {
      flushCluster(i - 1);
      anchorLat = pt.latitude;
      anchorLng = pt.longitude;
      clusterStartIdx = i;
      clusterCount = 1;
      sumLat = pt.latitude;
      sumLng = pt.longitude;
    }
  }

  flushCluster(points.length - 1);
  return stops;
}

/**
 * Format duration in milliseconds into "06h 42m".
 */
export function formatDurationHm(ms: number): string {
  if (!ms || ms <= 0) return '00h 00m';
  const hours = Math.floor(ms / (1000 * 3600));
  const mins = Math.floor((ms % (1000 * 3600)) / (1000 * 60));
  return `${String(hours).padStart(2, '0')}h ${String(mins).padStart(2, '0')}m`;
}
