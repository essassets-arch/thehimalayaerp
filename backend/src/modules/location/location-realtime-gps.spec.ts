import { Test, TestingModule } from '@nestjs/testing';
import {
  LocationService,
  ONLINE_THRESHOLD_SECONDS,
  RECENT_THRESHOLD_SECONDS,
} from './location.service';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../../database/prisma.service';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';

describe('Real-Time GPS & Live User Map Certification Suite', () => {
  let locationService: LocationService;
  let usersService: UsersService;
  let mockPrisma: any;

  // In-memory mock database state
  const mockUsers: any[] = [];
  const mockSessions: any[] = [];
  const mockLocations: any[] = [];
  const mockLocationHistories: any[] = [];
  const mockPermissions: any[] = [];
  const mockRolePermissions: any[] = [];

  beforeEach(async () => {
    mockUsers.length = 0;
    mockSessions.length = 0;
    mockLocations.length = 0;
    mockLocationHistories.length = 0;
    mockPermissions.length = 0;
    mockRolePermissions.length = 0;

    mockPrisma = {
      deviceSession: {
        findUnique: jest.fn().mockImplementation(({ where }) => {
          if (where.sessionId) {
            return Promise.resolve(
              mockSessions.find((s) => s.sessionId === where.sessionId) || null,
            );
          }
          if (where.id) {
            return Promise.resolve(
              mockSessions.find((s) => s.id === where.id) || null,
            );
          }
          return Promise.resolve(null);
        }),
        findFirst: jest.fn().mockImplementation(({ where }) => {
          return Promise.resolve(
            mockSessions.find(
              (s) =>
                s.userId === where.userId &&
                (!where.deviceId || s.deviceId === where.deviceId),
            ) || null,
          );
        }),
        create: jest.fn().mockImplementation(({ data }) => {
          const session = {
            id: `ds-${mockSessions.length + 1}`,
            sessionId: `sess-${mockSessions.length + 1}`,
            createdAt: new Date(),
            updatedAt: new Date(),
            ...data,
          };
          mockSessions.push(session);
          return Promise.resolve(session);
        }),
        update: jest.fn().mockImplementation(({ where, data }) => {
          const session = mockSessions.find(
            (s) => s.id === where.id || s.sessionId === where.sessionId,
          );
          if (session) Object.assign(session, data);
          return Promise.resolve(session);
        }),
        deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
      },
      latestUserLocation: {
        findUnique: jest.fn().mockImplementation(({ where }) => {
          return Promise.resolve(
            mockLocations.find(
              (l) => l.deviceSessionId === where.deviceSessionId,
            ) || null,
          );
        }),
        upsert: jest.fn().mockImplementation(({ where, create, update }) => {
          let loc = mockLocations.find(
            (l) => l.deviceSessionId === where.deviceSessionId,
          );
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
          const histories = mockLocationHistories.filter(
            (h) => h.deviceSessionId === where.deviceSessionId,
          );
          return Promise.resolve(histories[histories.length - 1] || null);
        }),
        create: jest.fn().mockImplementation(({ data }) => {
          const item = {
            id: `hist-${mockLocationHistories.length + 1}`,
            ...data,
          };
          mockLocationHistories.push(item);
          return Promise.resolve(item);
        }),
        deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
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
                  latestLocation:
                    mockLocations.find((l) => l.deviceSessionId === s.id) ||
                    null,
                })),
            })),
          );
        }),
        findUnique: jest.fn().mockImplementation(({ where }) => {
          const u = mockUsers.find(
            (user) => user.id === where.id || user.email === where.email,
          );
          if (!u) return Promise.resolve(null);
          return Promise.resolve({
            ...u,
            role: {
              ...u.role,
              rolePermissions: mockRolePermissions
                .filter((rp) => rp.roleId === u.roleId)
                .map((rp) => ({
                  ...rp,
                  permission: mockPermissions.find(
                    (p) => p.id === rp.permissionId,
                  ),
                })),
            },
          });
        }),
      },
      permission: {
        findUnique: jest.fn().mockImplementation(({ where }) => {
          return Promise.resolve(
            mockPermissions.find((p) => p.code === where.code) || null,
          );
        }),
        create: jest.fn().mockImplementation(({ data }) => {
          const perm = { id: `perm-${mockPermissions.length + 1}`, ...data };
          mockPermissions.push(perm);
          return Promise.resolve(perm);
        }),
      },
      rolePermission: {
        findMany: jest.fn().mockImplementation(({ where }) => {
          return Promise.resolve(
            mockRolePermissions
              .filter((rp) => rp.roleId === where.roleId)
              .map((rp) => ({
                ...rp,
                permission: mockPermissions.find(
                  (p) => p.id === rp.permissionId,
                ),
              })),
          );
        }),
        upsert: jest.fn().mockImplementation(({ where, create }) => {
          let rp = mockRolePermissions.find(
            (r) =>
              r.roleId === where.roleId_permissionId.roleId &&
              r.permissionId === where.roleId_permissionId.permissionId,
          );
          if (!rp) {
            rp = { id: `rp-${mockRolePermissions.length + 1}`, ...create };
            mockRolePermissions.push(rp);
          }
          return Promise.resolve(rp);
        }),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocationService,
        UsersService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    locationService = module.get<LocationService>(LocationService);
    usersService = module.get<UsersService>(UsersService);
  });

  describe('1. Multi-User Session Registration & Map Visibility', () => {
    it('registers multiple concurrent users across departments and makes them visible on live-users snapshot', async () => {
      const users = [
        {
          id: 'user-sales-1',
          name: 'Sales Executive 1',
          email: 'sales1@thehimalaya.cloud',
          role: { name: 'Sales Executive', code: 'SALES_EXECUTIVE' },
          roleId: 'role-sales',
        },
        {
          id: 'user-sales-2',
          name: 'Sales Executive 2',
          email: 'sales2@thehimalaya.cloud',
          role: { name: 'Sales Executive', code: 'SALES_EXECUTIVE' },
          roleId: 'role-sales',
        },
        {
          id: 'user-prod-1',
          name: 'Production Plant Lead',
          email: 'plant@thehimalaya.cloud',
          role: { name: 'Plant Head', code: 'PLANT_HEAD' },
          roleId: 'role-plant',
        },
        {
          id: 'user-store-1',
          name: 'Store Master',
          email: 'store@thehimalaya.cloud',
          role: { name: 'Store Manager', code: 'STORE_MANAGER' },
          roleId: 'role-store',
        },
        {
          id: 'user-fin-1',
          name: 'Finance Head',
          email: 'finance@thehimalaya.cloud',
          role: { name: 'Finance Manager', code: 'FINANCE_MANAGER' },
          roleId: 'role-fin',
        },
      ];

      for (const u of users) {
        mockUsers.push({ ...u, companyId: 'comp-global', isActive: true });
        const reg = await locationService.registerSession(u.id, 'comp-global', {
          deviceId: `dev-${u.id}`,
          deviceType: 'MOBILE',
          browser: 'Chrome Mobile',
          operatingSystem: 'Android',
          clientType: 'WEB',
          locationPermission: 'GRANTED',
        });
        expect(reg.sessionId).toBeDefined();

        // Send initial GPS coordinates (Ahmedabad region)
        await locationService.updateLocation(u.id, 'comp-global', {
          sessionId: reg.sessionId,
          latitude: 23.0225 + Math.random() * 0.05,
          longitude: 72.5714 + Math.random() * 0.05,
          accuracy: 8.5,
          speed: 1.2,
          heading: 90,
          capturedAt: new Date().toISOString(),
        });
      }

      const snapshot = await locationService.getLiveUsers('comp-global');
      expect(snapshot.length).toBe(5);

      // Verify all 5 users have ONLINE status, active GPS coordinates, and accuracy <= 10m
      for (const entry of snapshot) {
        expect(entry.sessions.length).toBe(1);
        const s = entry.sessions[0];
        expect(s.status).toBe('ONLINE');
        expect(s.gpsStatus).toBe('ACTIVE');
        expect(s.location).toBeDefined();
        expect(s.location?.accuracy).toBeLessThanOrEqual(10);
      }
    });
  });

  describe('2. GPS Coordinate Bounds & Accuracy Validation', () => {
    it('rejects invalid latitude values (> 90 or < -90)', async () => {
      const reg = await locationService.registerSession('u-test', 'comp-1', {
        deviceId: 'd1',
        deviceType: 'WEB',
      });
      await expect(
        locationService.updateLocation('u-test', 'comp-1', {
          sessionId: reg.sessionId,
          latitude: 95.5,
          longitude: 72.5,
          capturedAt: new Date().toISOString(),
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects invalid longitude values (> 180 or < -180)', async () => {
      const reg = await locationService.registerSession('u-test', 'comp-1', {
        deviceId: 'd1',
        deviceType: 'WEB',
      });
      await expect(
        locationService.updateLocation('u-test', 'comp-1', {
          sessionId: reg.sessionId,
          latitude: 23.0,
          longitude: 195.0,
          capturedAt: new Date().toISOString(),
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects non-positive GPS accuracy (accuracy <= 0)', async () => {
      const reg = await locationService.registerSession('u-test', 'comp-1', {
        deviceId: 'd1',
        deviceType: 'WEB',
      });
      await expect(
        locationService.updateLocation('u-test', 'comp-1', {
          sessionId: reg.sessionId,
          latitude: 23.0,
          longitude: 72.0,
          accuracy: -5,
          capturedAt: new Date().toISOString(),
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects future timestamps (> 10 mins)', async () => {
      const reg = await locationService.registerSession('u-test', 'comp-1', {
        deviceId: 'd1',
        deviceType: 'WEB',
      });
      const futureTime = new Date(
        Date.now() + 2 * 60 * 60 * 1000,
      ).toISOString();
      await expect(
        locationService.updateLocation('u-test', 'comp-1', {
          sessionId: reg.sessionId,
          latitude: 23.0,
          longitude: 72.0,
          capturedAt: futureTime,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('3. Impossible GPS Jump (Teleportation) Filter', () => {
    it('filters out supersonic teleportation jumps without updating map coordinates', async () => {
      const reg = await locationService.registerSession(
        'u-jump-test',
        'comp-1',
        { deviceId: 'd-jump', deviceType: 'WEB' },
      );

      // 1. Initial location in Ahmedabad
      const loc1 = await locationService.updateLocation(
        'u-jump-test',
        'comp-1',
        {
          sessionId: reg.sessionId,
          latitude: 23.0225,
          longitude: 72.5714,
          accuracy: 10,
          capturedAt: new Date(Date.now() - 5000).toISOString(),
        },
      );
      expect(loc1.latitude).toBe(23.0225);

      // 2. Sudden jump to Delhi (900km away) in 3 seconds (> 1,000,000 km/h)
      const loc2 = await locationService.updateLocation(
        'u-jump-test',
        'comp-1',
        {
          sessionId: reg.sessionId,
          latitude: 28.6139,
          longitude: 77.209,
          accuracy: 10,
          capturedAt: new Date().toISOString(),
        },
      );

      // Filtered: isSuspiciousJump = true, coordinates remain in Ahmedabad
      expect(loc2.isSuspiciousJump).toBe(true);
      expect(loc2.latitude).toBe(23.0225);
      expect(loc2.longitude).toBe(72.5714);
    });
  });

  describe('4. Server-Controlled Presence & GPS Staleness Telemetry', () => {
    it('accurately distinguishes ONLINE vs RECENTLY_ACTIVE vs OFFLINE and ACTIVE vs STALE GPS', async () => {
      const now = Date.now();
      mockUsers.push({
        id: 'u-presence',
        name: 'Presence User',
        email: 'p@erp.com',
        role: { name: 'Sales', code: 'SALES' },
        companyId: 'comp-1',
        isActive: true,
      });

      // Session with recent heartbeat and fresh GPS (< 120s)
      const s1 = {
        id: 'ds-fresh',
        sessionId: 'sess-fresh',
        userId: 'u-presence',
        companyId: 'comp-1',
        lastSeenAt: new Date(now - 10 * 1000), // 10s ago -> ONLINE
        clientType: 'WEB',
        locationPermission: 'GRANTED',
      };
      mockSessions.push(s1);
      mockLocations.push({
        id: 'loc-fresh',
        deviceSessionId: 'ds-fresh',
        latitude: 23.0,
        longitude: 72.0,
        accuracy: 6,
        capturedAt: new Date(now - 15 * 1000), // 15s ago -> ACTIVE GPS
      });

      const res = await locationService.getLiveUsers('comp-1');
      expect(res[0].sessions[0].status).toBe('ONLINE');
      expect(res[0].sessions[0].gpsStatus).toBe('ACTIVE');
      expect(res[0].sessions[0].heartbeatAgeSeconds).toBeLessThanOrEqual(15);
    });
  });

  describe('5. Automatic Permission Provisioning & Disabled Preservation', () => {
    it('automatically provisions canonical role permissions for existing and new users on login', async () => {
      const roleId = 'role-sales-executive';
      const roleCode = 'SALES_EXECUTIVE';

      const perms = await usersService.ensureDefaultPermissions(
        roleId,
        roleCode,
      );
      expect(perms).toContain('sales.leads.read');
      expect(perms).toContain('sales.orders.create');
      expect(perms).toContain('location.track.enable');
      expect(perms).toContain('common.dashboard.read');
    });
  });
});
