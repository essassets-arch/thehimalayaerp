import { Test, TestingModule } from '@nestjs/testing';
import { LocationService, ONLINE_THRESHOLD_SECONDS } from './location.service';
import { PrismaService } from '../../database/prisma.service';
import { BadRequestException } from '@nestjs/common';

describe('Super Admin Real-Time Tracking & Truthful GPS Status Suite', () => {
  let locationService: LocationService;
  let mockPrisma: any;

  const mockUsers: any[] = [];
  const mockSessions: any[] = [];
  const mockLocations: any[] = [];
  const mockHistories: any[] = [];
  const mockShiftSessions: any[] = [];
  const mockShiftPoints: any[] = [];

  beforeEach(async () => {
    mockUsers.length = 0;
    mockSessions.length = 0;
    mockLocations.length = 0;
    mockHistories.length = 0;
    mockShiftSessions.length = 0;
    mockShiftPoints.length = 0;

    mockPrisma = {
      deviceSession: {
        findUnique: jest.fn().mockImplementation(({ where }) => {
          return Promise.resolve(mockSessions.find((s) => s.sessionId === where.sessionId || s.id === where.id) || null);
        }),
        findFirst: jest.fn().mockImplementation(({ where }) => {
          return Promise.resolve(mockSessions.find((s) => s.userId === where.userId) || null);
        }),
        update: jest.fn().mockImplementation(({ where, data }) => {
          const s = mockSessions.find((x) => x.id === where.id || x.sessionId === where.sessionId);
          if (s) Object.assign(s, data);
          return Promise.resolve(s);
        }),
        upsert: jest.fn().mockImplementation(({ where, create, update }) => {
          let s = mockSessions.find((x) => x.sessionId === where.sessionId);
          if (s) {
            Object.assign(s, update);
          } else {
            s = { id: `ds-${mockSessions.length + 1}`, sessionId: `sess-${mockSessions.length + 1}`, ...create };
            mockSessions.push(s);
          }
          return Promise.resolve(s);
        }),
      },
      latestUserLocation: {
        findUnique: jest.fn().mockImplementation(({ where }) => {
          return Promise.resolve(mockLocations.find((l) => l.deviceSessionId === where.deviceSessionId) || null);
        }),
        upsert: jest.fn().mockImplementation(({ where, create, update }) => {
          let loc = mockLocations.find((l) => l.deviceSessionId === where.deviceSessionId);
          if (!loc) {
            loc = { id: `loc-${mockLocations.length + 1}`, ...create };
            mockLocations.push(loc);
          } else {
            Object.assign(loc, update);
          }
          return Promise.resolve(loc);
        }),
      },
      userLocationHistory: {
        findFirst: jest.fn().mockImplementation(({ where }) => {
          const list = mockHistories.filter((h) => h.deviceSessionId === where.deviceSessionId);
          return Promise.resolve(list[list.length - 1] || null);
        }),
        create: jest.fn().mockImplementation(({ data }) => {
          const hist = { id: `hist-${mockHistories.length + 1}`, ...data };
          mockHistories.push(hist);
          return Promise.resolve(hist);
        }),
      },
      employeeLocationSession: {
        findFirst: jest.fn().mockImplementation(({ where }) => {
          return Promise.resolve(
            mockShiftSessions.find((s) => s.userId === where.userId && (!where.status || s.status === where.status)) || null,
          );
        }),
        update: jest.fn().mockImplementation(({ where, data }) => {
          const s = mockShiftSessions.find((x) => x.id === where.id);
          if (s) Object.assign(s, data);
          return Promise.resolve(s);
        }),
      },
      employeeLocationPoint: {
        findFirst: jest.fn().mockImplementation(({ where }) => {
          const points = mockShiftPoints.filter((p) => p.sessionId === where.sessionId);
          return Promise.resolve(points[points.length - 1] || null);
        }),
        upsert: jest.fn().mockImplementation(({ where, create, update }) => {
          let p = mockShiftPoints.find((x) => x.clientPointId === where.sessionId_clientPointId?.clientPointId);
          if (!p) {
            p = { id: `pt-${mockShiftPoints.length + 1}`, ...create };
            mockShiftPoints.push(p);
          } else {
            Object.assign(p, update);
          }
          return Promise.resolve(p);
        }),
      },
      user: {
        findMany: jest.fn().mockImplementation(() => {
          return Promise.resolve(
            mockUsers.map((u) => ({
              ...u,
              deviceSessions: mockSessions
                .filter((s) => s.userId === u.id)
                .map((s) => ({
                  ...s,
                  latestLocation: mockLocations.find((l) => l.deviceSessionId === s.id) || null,
                })),
              employeeLocationSessions: mockShiftSessions
                .filter((s) => s.userId === u.id && s.status === 'ACTIVE')
                .map((s) => ({
                  ...s,
                  points: mockShiftPoints.filter((p) => p.sessionId === s.id),
                  stops: [],
                })),
            })),
          );
        }),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocationService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    locationService = module.get<LocationService>(LocationService);
  });

  describe('Truthful GPS Status vs Active Tracking Service', () => {
    it('never labels an old coordinate (e.g. 500m old) as LIVE even when tracking service is ACTIVE', async () => {
      const now = new Date();
      const fiveHundredMinsAgo = new Date(now.getTime() - 500 * 60 * 1000);

      const user = {
        id: 'user-sales-1',
        name: 'Sales Executive 1',
        email: 'sales1@thehimalaya.cloud',
        role: { name: 'Sales Executive', code: 'SALES' },
        employee: {
          id: 'emp-1',
          employeeCode: 'EMP-001',
          jobTitle: 'Sales Officer',
          department: { id: 'd-1', name: 'Sales' },
        },
      };
      mockUsers.push(user);

      // Active shift started 500 minutes ago with punch-in snapshot
      const activeShift = {
        id: 'shift-1',
        userId: user.id,
        employeeId: 'emp-1',
        status: 'ACTIVE',
        punchInAt: fiveHundredMinsAgo,
        punchInLatitude: 23.0225,
        punchInLongitude: 72.5714,
        totalDistanceKm: 0,
        totalPointsCount: 1,
      };
      mockShiftSessions.push(activeShift);

      // Only one point from 500 minutes ago (Punch-In snapshot)
      mockShiftPoints.push({
        id: 'pt-1',
        sessionId: activeShift.id,
        latitude: 23.0225,
        longitude: 72.5714,
        recordedAt: fiveHundredMinsAgo,
        source: 'PUNCH_IN_SNAPSHOT',
      });

      // Device session is currently online / active
      const session = {
        id: 'ds-1',
        sessionId: 'sess-1',
        userId: user.id,
        deviceId: 'dev-1',
        lastSeenAt: now, // Active heartbeat right now
        locationPermission: 'GRANTED',
        clientType: 'WEB',
      };
      mockSessions.push(session);

      const liveUsers = await locationService.getLiveUsers();
      expect(liveUsers).toHaveLength(1);

      const u = liveUsers[0];
      // Tracking service is ACTIVE
      expect(u.trackingStatus).toBe('ACTIVE_SHIFT');
      // But GPS freshness is STALE because telemetry is 500m old
      expect(u.gpsFreshness).toBe('STALE');
      // Overall status is truthfully STALE, NOT LIVE!
      expect(u.overallStatus).toBe('STALE');
      expect(u.latestLocation?.gpsAgeSeconds).toBeGreaterThan(20000);
    });

    it('accurately identifies fresh GPS (< 120s) as LIVE', async () => {
      const now = new Date();
      const thirtySecondsAgo = new Date(now.getTime() - 30 * 1000);

      const user = {
        id: 'user-field-2',
        name: 'Field Driver 2',
        email: 'driver2@thehimalaya.cloud',
        role: { name: 'Dispatch Executive', code: 'DISPATCH' },
        employee: {
          id: 'emp-2',
          employeeCode: 'EMP-002',
          jobTitle: 'Driver',
          department: { id: 'd-2', name: 'Dispatch' },
        },
      };
      mockUsers.push(user);

      const session = {
        id: 'ds-2',
        sessionId: 'sess-2',
        userId: user.id,
        deviceId: 'dev-2',
        lastSeenAt: now,
        locationPermission: 'GRANTED',
        clientType: 'MOBILE',
      };
      mockSessions.push(session);

      mockLocations.push({
        id: 'loc-2',
        deviceSessionId: session.id,
        latitude: 23.033,
        longitude: 72.585,
        accuracy: 10,
        capturedAt: thirtySecondsAgo,
      });

      const liveUsers = await locationService.getLiveUsers();
      const u = liveUsers[0];
      expect(u.gpsFreshness).toBe('LIVE');
      expect(u.overallStatus).toBe('LIVE');
      expect(u.latestLocation?.gpsAgeSeconds).toBeLessThanOrEqual(120);
    });

    it('accurately marks employees with no recorded location as NO_LOCATION', async () => {
      const now = new Date();
      const user = {
        id: 'user-plant-3',
        name: 'Plant Operator 3',
        email: 'plant3@thehimalaya.cloud',
        role: { name: 'Plant Head', code: 'PLANT_HEAD' },
        employee: {
          id: 'emp-3',
          employeeCode: 'EMP-003',
          jobTitle: 'Plant Head',
          department: { id: 'd-3', name: 'Plant' },
        },
      };
      mockUsers.push(user);

      // Connected in web ERP, but has not granted or captured location
      mockSessions.push({
        id: 'ds-3',
        sessionId: 'sess-3',
        userId: user.id,
        deviceId: 'dev-3',
        lastSeenAt: now,
        locationPermission: 'PROMPT',
        clientType: 'WEB',
      });

      const liveUsers = await locationService.getLiveUsers();
      const u = liveUsers[0];
      expect(u.gpsFreshness).toBe('NO_LOCATION');
      expect(u.overallStatus).toBe('NO_LOCATION');
      expect(u.latestLocation).toBeNull();
    });

    it('cross-synchronizes real-time updates to active shift session', async () => {
      const user = { id: 'user-cross-4' };
      const session = { id: 'ds-4', sessionId: 'sess-4', userId: user.id };
      mockSessions.push(session);

      const activeShift = {
        id: 'shift-4',
        userId: user.id,
        employeeId: 'emp-4',
        companyId: 'comp-1',
        status: 'ACTIVE',
        totalDistanceKm: 0,
        totalPointsCount: 1,
      };
      mockShiftSessions.push(activeShift);

      await locationService.updateLocation(user.id, 'comp-1', {
        sessionId: session.sessionId,
        latitude: 23.025,
        longitude: 72.575,
        accuracy: 15,
        capturedAt: new Date().toISOString(),
      });

      // Shift point must be created
      expect(mockShiftPoints).toHaveLength(1);
      expect(mockShiftPoints[0].sessionId).toBe(activeShift.id);
      expect(mockShiftPoints[0].source).toBe('WEB_REALTIME');
      // Shift session point count incremented
      expect(mockShiftSessions[0].totalPointsCount).toBe(2);
    });
  });
});
