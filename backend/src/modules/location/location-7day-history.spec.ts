import { Test } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { LocationModule } from './location.module';
import { LocationService } from './location.service';
import { LocationGateway } from './location.gateway';
import { LocationSchedulerService } from './location-scheduler.service';
import { LocationController } from './location.controller';
import { LocationTrackingController } from './location-tracking.controller';
import { PrismaService } from '../../database/prisma.service';
import {
  buildDayRoadmap,
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

    it('rejects synthetic New Delhi (28.6139, 77.209) fallback and coarse 20km IP pings', () => {
      const base = new Date('2026-11-16T04:25:00.000Z').getTime();
      const raw = [
        // Legacy fake New Delhi fallback coordinate (must be dropped!)
        {
          latitude: 28.6139,
          longitude: 77.209,
          accuracy: 50,
          speed: 0,
          heading: 0,
          batteryLevel: null,
          source: 'WEB_REALTIME',
          recordedAt: new Date(base).toISOString(),
        },
        // Real Ahmedabad punch-in
        {
          latitude: 22.9336,
          longitude: 72.68,
          accuracy: 10,
          speed: 0,
          heading: 0,
          batteryLevel: null,
          source: 'PUNCH_IN_SNAPSHOT',
          recordedAt: new Date(base + 4 * 60000).toISOString(),
        },
        // Coarse 20km ISP IP fallback (must be dropped!)
        {
          latitude: 23.04,
          longitude: 72.6666,
          accuracy: 20000,
          speed: null,
          heading: null,
          batteryLevel: null,
          source: 'WEB_REALTIME',
          recordedAt: new Date(base + 120 * 60000).toISOString(),
        },
        // Real Ahmedabad punch-out (~8.6 km away)
        {
          latitude: 22.9872,
          longitude: 72.6189,
          accuracy: 13.8,
          speed: 0,
          heading: 0,
          batteryLevel: null,
          source: 'PUNCH_OUT_SNAPSHOT',
          recordedAt: new Date(base + 350 * 60000).toISOString(),
        },
      ];

      const { points, distanceKm, accuracyMetrics } = cleanAndCalculateTrack(raw);
      expect(points).toHaveLength(2);
      expect(accuracyMetrics.filteredSyntheticPoints).toBe(1);
      expect(accuracyMetrics.filteredCoarsePoints).toBe(1);
      expect(accuracyMetrics.qualityLabel).toBe('HIGH_GPS');
      expect(distanceKm).toBeGreaterThan(7);
      expect(distanceKm).toBeLessThan(10); // No 776 km Delhi teleport!
    });

    it('builds chronological Day Circle Roadmap from Punch In -> Stops & Leads -> Punch Out', () => {
      const roadmap = buildDayRoadmap({
        punchIn: {
          at: '2026-11-18T04:15:00.000Z',
          latitude: 23.065,
          longitude: 72.568,
          address: 'Ranip, Ahmedabad',
        },
        punchOut: {
          at: '2026-11-18T12:30:00.000Z',
          latitude: 23.0652,
          longitude: 72.5681,
          address: 'Ranip, Ahmedabad',
        },
        points: [],
        stops: [
          {
            stopNumber: 1,
            latitude: 23.08,
            longitude: 72.58,
            arrivedAt: '2026-11-18T05:30:00.000Z',
            departedAt: '2026-11-18T06:00:00.000Z',
            durationMinutes: 30,
            address: 'Ghatlodiya, Ahmedabad',
            locationName: 'Stop #1',
          },
        ],
        leads: [
          {
            id: 'lead-1',
            leadNumber: 'LD-101',
            companyName: 'Shree Infra',
            contactPerson: 'Rajesh Patel',
            createdAt: '2026-11-18T07:00:00.000Z',
            latitude: 23.09,
            longitude: 72.59,
            address: 'Chandkheda, Ahmedabad',
          },
        ],
        status: 'COMPLETED',
      });

      expect(roadmap.steps.map((s) => s.type)).toEqual([
        'PUNCH_IN',
        'STOP',
        'LEAD',
        'PUNCH_OUT',
      ]);
      expect(roadmap.circleClosed).toBe(true);
      expect(roadmap.returnDistanceFromStartKm).toBeLessThan(0.1);
      expect(roadmap.steps[1].legDistanceKm).toBeGreaterThan(1.5);
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

  describe('NestJS LocationModule Dependency Injection Graph', () => {
    it('instantiates LocationModule and all controllers/providers with zero circular DI errors', async () => {
      const moduleRef = await Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({ isGlobal: true }),
          LocationModule,
        ],
      })
        .overrideProvider(PrismaService)
        .useValue({})
        .compile();

      expect(moduleRef.get(LocationService)).toBeDefined();
      expect(moduleRef.get(LocationGateway)).toBeDefined();
      expect(moduleRef.get(LocationTrackingService)).toBeDefined();
      expect(moduleRef.get(LocationSchedulerService)).toBeDefined();
      expect(moduleRef.get(LocationController)).toBeDefined();
      expect(moduleRef.get(LocationTrackingController)).toBeDefined();

      await moduleRef.close();
    });
  });
});
