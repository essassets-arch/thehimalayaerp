import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { io as ioClient, Socket } from 'socket.io-client';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/database/prisma.service';
import { LocationService } from '../src/modules/location/location.service';

interface ResponseBody {
  data?: {
    accessToken?: string;
    sessionId?: string;
  };
  accessToken?: string;
  sessionId?: string;
}

const api = (app: INestApplication) =>
  request(app.getHttpServer() as Parameters<typeof request>[0]);

async function createTestApp() {
  const mod: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();
  const app = mod.createNestApplication();
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  await app.listen(0); // Listen on ephemeral port for WebSocket testing
  const prisma = app.get<PrismaService>(PrismaService);
  return { app, prisma };
}

describe('Location & Presence Module (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let serverPort: number;

  let superAdminToken: string;
  let normalUserToken: string;
  let otherCompanyAdminToken: string;

  let companyId: string;
  let otherCompanyId: string;
  let normalUserId: string;
  let otherCompanyAdminId: string;

  beforeAll(async () => {
    const testApp = await createTestApp();
    app = testApp.app;
    prisma = testApp.prisma;

    const address = app.getHttpServer().address();
    serverPort = typeof address === 'string' ? 0 : address.port;

    // Retrieve two distinct companies
    const companies = await prisma.company.findMany({ take: 2 });
    companyId = companies[0].id;
    otherCompanyId = companies[1]?.id || companyId;

    // Login as Super Admin of Company 1
    const adminUser = await prisma.user.findFirst({
      where: {
        companyId,
        isActive: true,
        role: {
          code: { in: ['SUPER_ADMIN', 'Super Admin'] },
        },
      },
    });

    const superAdminEmail = adminUser?.email || 'admin@himalaya.com';
    const loginRes = await api(app)
      .post('/auth/login')
      .send({ email: superAdminEmail, password: 'Password@123' })
      .catch(() =>
        api(app)
          .post('/auth/login')
          .send({ email: superAdminEmail, password: 'Admin@123456' }),
      );

    const body = loginRes.body as ResponseBody;
    superAdminToken = body.data?.accessToken || body.accessToken || '';

    // Login as a normal Sales Executive user of Company 1
    const salesUser = await prisma.user.findFirst({
      where: {
        companyId,
        isActive: true,
        role: {
          code: { notIn: ['SUPER_ADMIN', 'Super Admin', 'ADMIN', 'Admin'] },
        },
      },
    });

    if (salesUser) {
      normalUserId = salesUser.id;
      const salesLoginRes = await api(app)
        .post('/auth/login')
        .send({ email: salesUser.email, password: 'Password@123' })
        .catch(() =>
          api(app)
            .post('/auth/login')
            .send({ email: salesUser.email, password: 'Admin@123456' }),
        );
      const salesBody = salesLoginRes.body as ResponseBody;
      normalUserToken =
        salesBody.data?.accessToken || salesBody.accessToken || '';
    }

    // Login as Admin of Company 2 (for leakage tests)
    if (otherCompanyId && otherCompanyId !== companyId) {
      const otherAdmin = await prisma.user.findFirst({
        where: {
          companyId: otherCompanyId,
          isActive: true,
          role: {
            code: { in: ['SUPER_ADMIN', 'Super Admin'] },
          },
        },
      });

      if (otherAdmin) {
        otherCompanyAdminId = otherAdmin.id;
        const otherLoginRes = await api(app)
          .post('/auth/login')
          .send({ email: otherAdmin.email, password: 'Password@123' })
          .catch(() =>
            api(app)
              .post('/auth/login')
              .send({ email: otherAdmin.email, password: 'Admin@123456' }),
          );
        const otherBody = otherLoginRes.body as ResponseBody;
        otherCompanyAdminToken =
          otherBody.data?.accessToken || otherBody.accessToken || '';
      }
    }
  });

  afterAll(async () => {
    if (normalUserId) {
      await prisma.deviceSession.deleteMany({
        where: { userId: normalUserId },
      });
    }
    await app.close();
  });

  describe('REST Scoping Checks', () => {
    it('should block unauthenticated requests to GET /super-admin/live-users', async () => {
      await api(app).get('/super-admin/live-users').expect(401);
    });

    it('should block non-super admin requests to GET /super-admin/live-users', async () => {
      if (!normalUserToken) return;

      await api(app)
        .get('/super-admin/live-users')
        .set('Authorization', `Bearer ${normalUserToken}`)
        .expect(403);
    });

    it('should allow Super Admin requests to GET /super-admin/live-users', async () => {
      if (!superAdminToken) return;

      const res = await api(app)
        .get('/super-admin/live-users')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);

      const data = Array.isArray(res.body)
        ? res.body
        : res.body.data || res.body.items;
      expect(Array.isArray(data)).toBe(true);
    });

    it('should allow non-Super-Admin with LIVE_USER_MAP_VIEW permission to access GET /super-admin/live-users', async () => {
      if (!normalUserToken || !normalUserId) return;

      const userRecord = await prisma.user.findUnique({
        where: { id: normalUserId },
      });

      // 1. Create permission
      const perm = await prisma.permission.upsert({
        where: { code: 'LIVE_USER_MAP_VIEW' },
        update: {},
        create: {
          code: 'LIVE_USER_MAP_VIEW',
          name: 'Live User Map View',
          publicId: 'PERM-LUMV',
        },
      });

      // 2. Link permission to user's role
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: userRecord!.roleId,
            permissionId: perm.id,
          },
        },
        update: {},
        create: { roleId: userRecord!.roleId, permissionId: perm.id },
      });

      try {
        // 3. Since user context in JWT is signed with original permissions, log in again to get fresh token
        const normalLoginRes = await api(app)
          .post('/auth/login')
          .send({ email: userRecord!.email, password: 'Password@123' })
          .catch(() =>
            api(app)
              .post('/auth/login')
              .send({ email: userRecord!.email, password: 'Admin@123456' }),
          );
        const normalBody = normalLoginRes.body as ResponseBody;
        const privilegedUserToken =
          normalBody.data?.accessToken || normalBody.accessToken || '';

        // 4. Request live users with updated token
        const res = await api(app)
          .get('/super-admin/live-users')
          .set('Authorization', `Bearer ${privilegedUserToken}`)
          .expect(200);

        const data = Array.isArray(res.body)
          ? res.body
          : res.body.data || res.body.items;
        expect(Array.isArray(data)).toBe(true);
      } finally {
        // 5. Cleanup relation in DB
        await prisma.rolePermission
          .delete({
            where: {
              roleId_permissionId: {
                roleId: userRecord!.roleId,
                permissionId: perm.id,
              },
            },
          })
          .catch(() => {});
      }
    });
  });

  describe('Session registration & stale update protection', () => {
    let sessionIdDevice1: string;
    let sessionIdDevice2: string;

    it('should register Device A and Device B independently for same user', async () => {
      if (!normalUserToken) return;

      // Register Device A
      const resA = await api(app)
        .post('/location/session')
        .set('Authorization', `Bearer ${normalUserToken}`)
        .send({
          deviceId: 'device-id-A',
          deviceType: 'MOBILE',
          deviceModel: 'Pixel 7',
          operatingSystem: 'Android 14',
          browser: 'Chrome Mobile',
          clientType: 'WEB',
          locationPermission: 'GRANTED',
        })
        .expect(201);

      const bodyA = resA.body as ResponseBody;
      sessionIdDevice1 = bodyA.data?.sessionId || bodyA.sessionId || '';

      // Register Device B
      const resB = await api(app)
        .post('/location/session')
        .set('Authorization', `Bearer ${normalUserToken}`)
        .send({
          deviceId: 'device-id-B',
          deviceType: 'DESKTOP',
          deviceModel: 'MacBook',
          operatingSystem: 'macOS Sonoma',
          browser: 'Safari',
          clientType: 'WEB',
          locationPermission: 'DENIED',
        })
        .expect(201);

      const bodyB = resB.body as ResponseBody;
      sessionIdDevice2 = bodyB.data?.sessionId || bodyB.sessionId || '';

      expect(sessionIdDevice1).toBeDefined();
      expect(sessionIdDevice2).toBeDefined();
      expect(sessionIdDevice1).not.toEqual(sessionIdDevice2);
    });

    it('should update Device A location without affecting Device B', async () => {
      if (!normalUserToken || !sessionIdDevice1 || !sessionIdDevice2) return;

      // Update Device A coordinates
      await api(app)
        .post('/location/location-update')
        .set('Authorization', `Bearer ${normalUserToken}`)
        .send({
          sessionId: sessionIdDevice1,
          latitude: 23.01,
          longitude: 72.51,
          accuracy: 5,
          capturedAt: new Date().toISOString(),
        })
        .expect(201);

      // Verify DB locations
      const devA = await prisma.deviceSession.findUnique({
        where: { sessionId: sessionIdDevice1 },
        include: { latestLocation: true },
      });
      const devB = await prisma.deviceSession.findUnique({
        where: { sessionId: sessionIdDevice2 },
        include: { latestLocation: true },
      });

      expect(devA?.latestLocation).toBeDefined();
      expect(Number(devA?.latestLocation?.latitude)).toBeCloseTo(23.01, 2);
      expect(devB?.latestLocation).toBeNull();
    });

    it('should reject location updates for sessionId owned by another user', async () => {
      if (!otherCompanyAdminToken || !sessionIdDevice1) return;

      // Other company admin tries to submit GPS for Device A session
      await api(app)
        .post('/location/location-update')
        .set('Authorization', `Bearer ${otherCompanyAdminToken}`)
        .send({
          sessionId: sessionIdDevice1,
          latitude: 23.0,
          longitude: 72.0,
          capturedAt: new Date().toISOString(),
        })
        .expect(401);
    });

    it('should prevent stale capturedAt timestamps from overwriting newer locations', async () => {
      if (!normalUserToken || !sessionIdDevice1) return;

      const tNew = new Date('2026-08-19T10:05:00Z');
      const tOld = new Date('2026-08-19T10:02:00Z');

      // 1. Submit newer coordinate
      await api(app)
        .post('/location/location-update')
        .set('Authorization', `Bearer ${normalUserToken}`)
        .send({
          sessionId: sessionIdDevice1,
          latitude: 23.111,
          longitude: 72.111,
          capturedAt: tNew.toISOString(),
        })
        .expect(201);

      // 2. Submit older coordinate (stale)
      await api(app)
        .post('/location/location-update')
        .set('Authorization', `Bearer ${normalUserToken}`)
        .send({
          sessionId: sessionIdDevice1,
          latitude: 23.222, // Should be ignored
          longitude: 72.222, // Should be ignored
          capturedAt: tOld.toISOString(),
        })
        .expect(201);

      // Verify the coordinate remains the newer one
      const loc = await prisma.latestUserLocation.findFirst({
        where: { deviceSession: { sessionId: sessionIdDevice1 } },
      });
      expect(Number(loc?.latitude)).toBeCloseTo(23.111, 3);
      expect(loc?.capturedAt.toISOString()).toEqual(tNew.toISOString());
    });
  });

  describe('Socket.IO gateway permissions & leakage boundaries', () => {
    let clientSocketAdminA: Socket;
    let clientSocketUserA: Socket;
    let clientSocketAdminB: Socket;

    const connectSocket = (token: string): Promise<Socket> => {
      return new Promise((resolve, reject) => {
        const client = ioClient(`http://localhost:${serverPort}`, {
          auth: { token },
          transports: ['websocket'],
          forceNew: true,
        });

        client.on('connect', () => resolve(client));
        client.on('connect_error', (err) => reject(err));
      });
    };

    afterEach(() => {
      if (clientSocketAdminA?.connected) clientSocketAdminA.disconnect();
      if (clientSocketUserA?.connected) clientSocketUserA.disconnect();
      if (clientSocketAdminB?.connected) clientSocketAdminB.disconnect();
    });

    it('should permit Super Admin A to connect and join company A room, receiving location updates', async () => {
      if (!superAdminToken || !normalUserToken) return;

      clientSocketAdminA = await connectSocket(superAdminToken);
      clientSocketUserA = await connectSocket(normalUserToken);

      // Set up admin listeners
      const promiseEvent = new Promise<any>((resolve) => {
        clientSocketAdminA.on('user:location:update', (data) => {
          resolve(data);
        });
      });

      // Register session for user A over websocket
      const regRes = await new Promise<any>((resolve) => {
        clientSocketUserA.emit(
          'device:register',
          {
            deviceId: 'socket-device-id',
            deviceType: 'MOBILE',
            browser: 'Chrome',
          },
          (res) => resolve(res),
        );
      });

      expect(regRes.success).toBe(true);

      // Emit coordinates from User A
      clientSocketUserA.emit('user:location:update', {
        sessionId: regRes.sessionId,
        latitude: 23.333,
        longitude: 72.333,
        capturedAt: new Date().toISOString(),
      });

      const receivedData = await promiseEvent;
      expect(receivedData.latitude).toBeCloseTo(23.333, 3);
      expect(receivedData.sessionId).toEqual(regRes.sessionId);
    });

    it('should NOT broadcast location updates to normal user socket (who is not in company room)', async () => {
      if (!superAdminToken || !normalUserToken) return;

      clientSocketAdminA = await connectSocket(superAdminToken);
      clientSocketUserA = await connectSocket(normalUserToken);

      let receivedEvent = false;
      clientSocketUserA.on('user:location:update', () => {
        receivedEvent = true;
      });

      // Register session for normal user
      const regRes = await new Promise<any>((resolve) => {
        clientSocketUserA.emit(
          'device:register',
          {
            deviceId: 'socket-device-id',
            deviceType: 'MOBILE',
            browser: 'Chrome',
          },
          (res) => resolve(res),
        );
      });

      // Register session for Admin A to trigger coordinates broadcast
      clientSocketAdminA.emit('user:location:update', {
        sessionId: regRes.sessionId, // simulated
        latitude: 23.444,
        longitude: 72.444,
        capturedAt: new Date().toISOString(),
      });

      // Wait briefly to check if normal user receives the coordinates broadcast
      await new Promise((resolve) => setTimeout(resolve, 500));
      expect(receivedEvent).toBe(false);
    });

    it('should isolate tenants: Admin B (Company B) should NOT receive Company A location broadcasts', async () => {
      if (!superAdminToken || !normalUserToken || !otherCompanyAdminToken) {
        console.warn(
          'Skipping isolation test: other company admin token missing.',
        );
        return;
      }

      clientSocketAdminA = await connectSocket(superAdminToken);
      clientSocketUserA = await connectSocket(normalUserToken);
      clientSocketAdminB = await connectSocket(otherCompanyAdminToken);

      let adminBReceivedEvent = false;
      clientSocketAdminB.on('user:location:update', () => {
        adminBReceivedEvent = true;
      });

      // Register User A
      const regRes = await new Promise<any>((resolve) => {
        clientSocketUserA.emit(
          'device:register',
          {
            deviceId: 'socket-device-id',
            deviceType: 'MOBILE',
            browser: 'Chrome',
          },
          (res) => resolve(res),
        );
      });

      // User A submits update
      clientSocketUserA.emit('user:location:update', {
        sessionId: regRes.sessionId,
        latitude: 23.555,
        longitude: 72.555,
        capturedAt: new Date().toISOString(),
      });

      // Wait briefly
      await new Promise((resolve) => setTimeout(resolve, 500));
      expect(adminBReceivedEvent).toBe(false);
    });
  });

  describe('Location History API & Sampling Boundaries', () => {
    let mockSessionId: string;
    let targetUserId: string;
    let locationService: LocationService;

    beforeAll(async () => {
      locationService = app.get(LocationService);

      // Create a real session to generate locations
      const registerRes = await api(app)
        .post('/location/session')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          deviceId: 'history-test-device',
          deviceType: 'WEB',
          browser: 'Firefox',
        });

      const body = registerRes.body as ResponseBody;
      mockSessionId = body.data?.sessionId || body.sessionId || '';

      const adminUser = await prisma.user.findFirst({
        where: {
          companyId,
          isActive: true,
          role: {
            code: { in: ['SUPER_ADMIN', 'Super Admin'] },
          },
        },
      });
      targetUserId = adminUser!.id;
    });

    it('should block history queries if user has no USER_LOCATION_HISTORY_VIEW permission', async () => {
      if (!normalUserToken) return;

      const res = await api(app)
        .get(
          `/super-admin/live-users/${targetUserId}/location-history?deviceSessionId=${mockSessionId}&date=2026-08-19`,
        )
        .set('Authorization', `Bearer ${normalUserToken}`);

      expect(res.status).toBe(403);
      expect(res.body.error.message).toContain('Insufficient permissions');
    });

    it('should validate query parameters and throw BadRequest for missing deviceSessionId', async () => {
      if (!superAdminToken) return;

      const res = await api(app)
        .get(
          `/super-admin/live-users/${targetUserId}/location-history?date=2026-08-19`,
        )
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res.status).toBe(400);
      expect(res.body.error.message).toContain(
        'deviceSessionId query parameter is required',
      );
    });

    it('should enforce date OR from/to parameters', async () => {
      if (!superAdminToken) return;

      // Both date and from/to provided
      const res1 = await api(app)
        .get(
          `/super-admin/live-users/${targetUserId}/location-history?deviceSessionId=${mockSessionId}&date=2026-08-19&from=2026-08-19&to=2026-08-19`,
        )
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res1.status).toBe(400);
      expect(res1.body.error.message).toContain(
        'Provide either "date" OR ("from" and "to") parameters, not both',
      );

      // Incomplete custom range
      const res2 = await api(app)
        .get(
          `/super-admin/live-users/${targetUserId}/location-history?deviceSessionId=${mockSessionId}&from=2026-08-19`,
        )
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res2.status).toBe(400);
      expect(res2.body.error.message).toContain(
        'Both "from" and "to" parameters must be provided',
      );
    });

    it('should enforce date range limit of 7 days', async () => {
      if (!superAdminToken) return;

      const res = await api(app)
        .get(
          `/super-admin/live-users/${targetUserId}/location-history?deviceSessionId=${mockSessionId}&from=2026-08-01&to=2026-08-10`,
        )
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res.status).toBe(400);
      expect(res.body.error.message).toContain(
        'Maximum date range is limited to 7 days',
      );
    });

    it('should sample coordinates and protect against stale/poor-accuracy history entries', async () => {
      const baseTime = new Date('2026-08-19T10:00:00.000Z');

      // Update 1: Write first location
      await locationService.updateLocation(targetUserId, companyId, {
        sessionId: mockSessionId,
        latitude: 23.0225,
        longitude: 72.5714,
        accuracy: 10,
        capturedAt: baseTime.toISOString(),
      });

      // Update 2: Stale coordinates: should NOT add to history
      await locationService.updateLocation(targetUserId, companyId, {
        sessionId: mockSessionId,
        latitude: 23.0235,
        longitude: 72.5724,
        accuracy: 10,
        capturedAt: new Date(baseTime.getTime() - 1000).toISOString(),
      });

      // Update 3: Poor accuracy coordinate (> 100 meters): should NOT add to history
      await locationService.updateLocation(targetUserId, companyId, {
        sessionId: mockSessionId,
        latitude: 23.0245,
        longitude: 72.5734,
        accuracy: 120, // poor
        capturedAt: new Date(baseTime.getTime() + 10000).toISOString(),
      });

      // Update 4: High accuracy but small movement (< 20m) and small elapsed time (< 60s): should NOT add to history
      await locationService.updateLocation(targetUserId, companyId, {
        sessionId: mockSessionId,
        latitude: 23.02251, // ~1 meter
        longitude: 72.5714,
        accuracy: 10,
        capturedAt: new Date(baseTime.getTime() + 5000).toISOString(),
      });

      // Update 5: Valid coordinate movement (e.g. > 20 meters or > 60 seconds elapsed)
      // e.g. 70 seconds later, 5 meters away (time condition satisfied)
      await locationService.updateLocation(targetUserId, companyId, {
        sessionId: mockSessionId,
        latitude: 23.02255,
        longitude: 72.5714,
        accuracy: 10,
        capturedAt: new Date(baseTime.getTime() + 70000).toISOString(),
      });

      // Fetch history and verify only 2 points are returned (Update 1 and Update 5)
      const historyRes = await api(app)
        .get(
          `/super-admin/live-users/${targetUserId}/location-history?deviceSessionId=${mockSessionId}&date=2026-08-19`,
        )
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(historyRes.status).toBe(200);
      const data = historyRes.body.data || historyRes.body;
      expect(data.points.length).toBe(2);
      expect(data.summary.pointCount).toBe(2);
      expect(data.summary.truncated).toBe(false);
    });
  });
});
