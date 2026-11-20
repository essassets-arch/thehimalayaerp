import {
  cleanAndCalculateTrack,
  detectStopsFromPoints,
  getIstDateString,
  getIstDayBoundsUtc,
  getLastNDaysIst,
} from './location-time.util';
import { LocationTrackingService } from './location-tracking.service';

describe('Location 7-Day Tracking & IST Time Utilities', () => {
  describe('IST Date Utilities', () => {
    it('computes accurate IST date key across midnight boundary', () => {
      // 2026-11-19 19:00:00 UTC === 2026-11-20 00:30:00 IST
      const afterIstMidnight = new Date('2026-11-19T19:00:00.000Z');
      expect(getIstDateString(afterIstMidnight)).toBe('2026-11-20');

      // 2026-11-19 18:00:00 UTC === 2026-11-19 23:30:00 IST
      const beforeIstMidnight = new Date('2026-11-19T18:00:00.000Z');
      expect(getIstDateString(beforeIstMidnight)).toBe('2026-11-19');
    });

    it('returns exact 24-hour IST day bounds in UTC', () => {
      const { start, end } = getIstDayBoundsUtc('2026-11-20');
      expect(start.toISOString()).toBe('2026-11-19T18:30:00.000Z');
      expect(end.toISOString()).toBe('2026-11-20T18:29:59.999Z');
    });

    it('returns N consecutive IST date keys ending on reference date', () => {
      const keys = getLastNDaysIst(7, '2026-11-20');
      expect(keys).toEqual([
        '2026-11-14',
        '2026-11-15',
        '2026-11-16',
        '2026-11-17',
        '2026-11-18',
        '2026-11-19',
        '2026-11-20',
      ]);
    });
  });

  describe('cleanAndCalculateTrack & detectStopsFromPoints', () => {
    it('deduplicates dual-source points within 8s/12m and filters impossible >180km/h jumps', () => {
      const base = new Date('2026-11-20T04:00:00.000Z').getTime();
      const raw = [
        // Normal point 1 (Ahmedabad)
        {
          latitude: 23.0225,
          longitude: 72.5714,
          accuracy: 15,
          speed: 20,
          heading: 90,
          batteryLevel: 0.9,
          source: 'EMPLOYEE_POINT',
          recordedAt: new Date(base).toISOString(),
        },
        // Duplicate from UserLocationHistory 1s later at same spot (lower accuracy -> ignored)
        {
          latitude: 23.02251,
          longitude: 72.57141,
          accuracy: 25,
          speed: null,
          heading: null,
          batteryLevel: null,
          source: 'USER_HISTORY',
          recordedAt: new Date(base + 1000).toISOString(),
        },
        // Teleport jump to Mumbai (~440 km) in 30 seconds -> must be filtered!
        {
          latitude: 19.076,
          longitude: 72.8777,
          accuracy: 50,
          speed: null,
          heading: null,
          batteryLevel: null,
          source: 'USER_HISTORY',
          recordedAt: new Date(base + 30000).toISOString(),
        },
        // Legitimate movement ~1.1 km north 3 minutes later (~22 km/h)
        {
          latitude: 23.0325,
          longitude: 72.5714,
          accuracy: 12,
          speed: 22,
          heading: 0,
          batteryLevel: 0.89,
          source: 'EMPLOYEE_POINT',
          recordedAt: new Date(base + 180000).toISOString(),
        },
      ];

      const { points, distanceKm } = cleanAndCalculateTrack(raw);
      expect(points).toHaveLength(2);
      expect(points[0].latitude).toBe(23.0225);
      expect(points[1].latitude).toBe(23.0325);
      expect(distanceKm).toBeGreaterThan(0.9);
      expect(distanceKm).toBeLessThan(1.3);
    });

    it('detects stationary stops purely via spatial+temporal clustering even when web speed is null', () => {
      const base = new Date('2026-11-20T05:00:00.000Z').getTime();
      const points = [
        // Moving before stop
        {
          latitude: 23.02,
          longitude: 72.57,
          accuracy: 20,
          speed: null,
          heading: null,
          batteryLevel: null,
          source: 'WEB',
          recordedAt: new Date(base).toISOString(),
        },
        // Stationary client visit for 12 minutes (small GPS drift within 20m)
        {
          latitude: 23.03,
          longitude: 72.58,
          accuracy: 20,
          speed: null,
          heading: null,
          batteryLevel: null,
          source: 'WEB',
          recordedAt: new Date(base + 5 * 60000).toISOString(),
        },
        {
          latitude: 23.0301,
          longitude: 72.5801,
          accuracy: 25,
          speed: null,
          heading: null,
          batteryLevel: null,
          source: 'WEB',
          recordedAt: new Date(base + 10 * 60000).toISOString(),
        },
        {
          latitude: 23.03005,
          longitude: 72.57995,
          accuracy: 18,
          speed: null,
          heading: null,
          batteryLevel: null,
          source: 'WEB',
          recordedAt: new Date(base + 17 * 60000).toISOString(),
        },
        // Departed 1 km away
        {
          latitude: 23.04,
          longitude: 72.58,
          accuracy: 15,
          speed: null,
          heading: null,
          batteryLevel: null,
          source: 'WEB',
          recordedAt: new Date(base + 22 * 60000).toISOString(),
        },
      ];

      const stops = detectStopsFromPoints(points);
      expect(stops).toHaveLength(1);
      expect(stops[0].durationMinutes).toBe(12);
      expect(stops[0].latitude).toBeCloseTo(23.03005, 3);
      expect(stops[0].longitude).toBeCloseTo(72.58001, 3);
    });
  });

  describe('LocationTrackingService Zombie Session Cleanup', () => {
    it('forceCloseStaleActiveSessions closes prior-day ACTIVE sessions and skips today', async () => {
      const yesterdaySession = {
        id: 'zombie-1',
        companyId: 'comp-1',
        employeeId: 'emp-1',
        userId: 'user-1',
        punchInAt: new Date('2026-10-05T04:00:00.000Z'),
        status: 'ACTIVE',
      };
      const todaySession = {
        id: 'active-today',
        companyId: 'comp-1',
        employeeId: 'emp-2',
        userId: 'user-2',
        punchInAt: new Date(), // Today
        status: 'ACTIVE',
      };

      const prismaMock: any = {
        employeeLocationSession: {
          findMany: jest.fn().mockResolvedValue([yesterdaySession, todaySession]),
          findUnique: jest.fn().mockResolvedValue(yesterdaySession),
          update: jest.fn().mockResolvedValue({ ...yesterdaySession, status: 'FORCE_CLOSED' }),
        },
        employeeLocationPoint: {
          findMany: jest.fn().mockResolvedValue([
            {
              latitude: 23.03,
              longitude: 72.58,
              accuracy: 12,
              speed: 10,
              heading: 90,
              batteryLevel: 0.8,
              source: 'WEB_REALTIME',
              recordedAt: new Date('2026-10-05T12:30:00.000Z'),
            },
          ]),
          count: jest.fn().mockResolvedValue(1),
        },
        employeeRouteStop: {
          findFirst: jest.fn().mockResolvedValue(null),
          findMany: jest.fn().mockResolvedValue([]),
          count: jest.fn().mockResolvedValue(0),
        },
      };

      const reverseGeocodeMock: any = {
        resolveAddress: jest.fn().mockResolvedValue('Ahmedabad, Gujarat'),
      };

      const service = new LocationTrackingService(prismaMock, reverseGeocodeMock);
      const closedCount = await service.forceCloseStaleActiveSessions();

      expect(closedCount).toBe(1);
      expect(prismaMock.employeeLocationSession.update).toHaveBeenCalledTimes(1);
      expect(prismaMock.employeeLocationSession.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'zombie-1' },
          data: expect.objectContaining({ status: 'FORCE_CLOSED' }),
        }),
      );
    });
  });
});
