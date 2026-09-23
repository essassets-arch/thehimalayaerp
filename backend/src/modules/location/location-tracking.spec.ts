import { Test, TestingModule } from '@nestjs/testing';
import { LocationTrackingService } from './location-tracking.service';
import { PrismaService } from '../../database/prisma.service';
import { AttendanceService } from '../attendance/attendance.service';
import { LocationService } from './location.service';
import { ForbiddenException } from '@nestjs/common';

describe('Employee Live Route Tracking Subsystem (Production Safety & Acceptance Tests)', () => {
  let trackingService: LocationTrackingService;
  let attendanceService: AttendanceService;
  let prisma: PrismaService;

  const testCompanyId = 'test-company-loc-uuid';
  const testUserId = 'test-user-loc-uuid';
  const testEmployeeId = 'test-employee-loc-uuid';
  const testAttendanceId = 'test-attendance-loc-uuid';

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaService,
        LocationTrackingService,
        AttendanceService,
        {
          provide: LocationService,
          useValue: {
            reverseGeocode: jest.fn().mockResolvedValue({ formattedAddress: 'Test Campus, Ahmedabad' }),
          },
        },
      ],
    }).compile();

    trackingService = module.get<LocationTrackingService>(LocationTrackingService);
    attendanceService = module.get<AttendanceService>(AttendanceService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Haversine Distance Engine', () => {
    it('should compute exact geospatial distance between two coordinates', () => {
      // Ahmedabad Kalupur Railway Station to Sabarmati Ashram (~5.5 km)
      const lat1 = 23.0276;
      const lon1 = 72.6012;
      const lat2 = 23.0605;
      const lon2 = 72.5804;

      const distKm = trackingService.calculateHaversineDistanceKm(lat1, lon1, lat2, lon2);
      expect(distKm).toBeGreaterThan(4.0);
      expect(distKm).toBeLessThan(6.0);
    });

    it('should return 0 distance for identical coordinates', () => {
      const distKm = trackingService.calculateHaversineDistanceKm(23.0225, 72.5714, 23.0225, 72.5714);
      expect(distKm).toBe(0);
    });
  });

  describe('ACCEPTANCE TEST 1: Duplicate Point Ingestion & Idempotency', () => {
    it('should deduplicate repeated mobile points and not double-count distance', async () => {
      const fakeSessionId = 'session-dedup-test-id';
      jest.spyOn(prisma.employeeLocationSession, 'findUnique').mockResolvedValue({
        id: fakeSessionId,
        companyId: testCompanyId,
        employeeId: testEmployeeId,
        userId: testUserId,
        status: 'ACTIVE',
      } as any);

      const recordedPoints = new Map<string, any>();
      jest.spyOn(prisma.employeeLocationPoint, 'upsert').mockImplementation((args: any) => {
        const key = `${args.where.sessionId_clientPointId.sessionId}:${args.where.sessionId_clientPointId.clientPointId}`;
        if (!recordedPoints.has(key)) {
          recordedPoints.set(key, { ...args.create, id: 'pt-' + key });
        }
        return Promise.resolve(recordedPoints.get(key));
      });

      jest.spyOn(prisma.employeeLocationPoint, 'findMany').mockImplementation((args: any) => {
        const list = Array.from(recordedPoints.values());
        return Promise.resolve(list as any);
      });

      jest.spyOn(prisma.employeeLocationPoint, 'count').mockImplementation(() => {
        return Promise.resolve(recordedPoints.size);
      });

      jest.spyOn(prisma.employeeRouteStop, 'count').mockResolvedValue(0);
      jest.spyOn(prisma.employeeLocationSession, 'update').mockResolvedValue({} as any);

      const baseTime = new Date('2026-09-23T10:00:00.000Z').getTime();
      const batchPayload = {
        sessionId: fakeSessionId,
        points: [
          {
            clientPointId: 'pt-uuid-1',
            latitude: 23.0225,
            longitude: 72.5714,
            recordedAt: new Date(baseTime).toISOString(),
            speed: 25,
          },
          {
            clientPointId: 'pt-uuid-2',
            latitude: 23.0250,
            longitude: 72.5730,
            recordedAt: new Date(baseTime + 30000).toISOString(),
            speed: 28,
          },
          {
            clientPointId: 'pt-uuid-2', // DUPLICATE RETRY FROM MOBILE
            latitude: 23.0250,
            longitude: 72.5730,
            recordedAt: new Date(baseTime + 30000).toISOString(),
            speed: 28,
          },
          {
            clientPointId: 'pt-uuid-3',
            latitude: 23.0290,
            longitude: 72.5760,
            recordedAt: new Date(baseTime + 60000).toISOString(),
            speed: 30,
          },
        ],
      };

      const result = await trackingService.recordBatchPoints(testUserId, testCompanyId, batchPayload as any);

      // Asserts: exactly 3 unique points stored, duplicate safely deduplicated
      expect(recordedPoints.size).toBe(3);
      expect(result.totalPointsCount).toBe(3);
      expect(result.totalDistanceKm).toBeGreaterThan(0);
    });
  });

  describe('ACCEPTANCE TEST 2: Concurrent Punch In Race Protection & Reuse', () => {
    it('should safely reuse ACTIVE session when concurrent punch in requests collide', async () => {
      const activeSessionFixture = {
        id: 'existing-active-session-uuid',
        companyId: testCompanyId,
        employeeId: testEmployeeId,
        userId: testUserId,
        attendanceId: testAttendanceId,
        status: 'ACTIVE',
      };

      jest.spyOn(prisma.attendance, 'findUnique').mockResolvedValue({
        id: testAttendanceId,
        companyId: testCompanyId,
        employeeId: testEmployeeId,
        userId: testUserId,
      } as any);

      let callCount = 0;
      jest.spyOn(prisma.employeeLocationSession, 'findFirst').mockImplementation(() => {
        if (callCount === 0) return Promise.resolve(null);
        return Promise.resolve(activeSessionFixture as any);
      });

      jest.spyOn(prisma.employeeLocationSession, 'create').mockImplementation(() => {
        callCount++;
        if (callCount > 1) {
          const p2002Error: any = new Error('Unique constraint failed on idx_active_employee_location_session');
          p2002Error.code = 'P2002';
          throw p2002Error;
        }
        return Promise.resolve(activeSessionFixture as any);
      });

      jest.spyOn(prisma.employeeLocationPoint, 'create').mockResolvedValue({} as any);
      jest.spyOn(prisma.employeeLocationSession, 'update').mockResolvedValue({} as any);

      const punchData = {
        latitude: 23.0225,
        longitude: 72.5714,
        accuracy: 10,
        address: 'Office Campus, Ahmedabad',
      };

      // Request A (creates)
      const sessionA = await trackingService.startSession(
        testUserId,
        testCompanyId,
        testEmployeeId,
        testAttendanceId,
        punchData,
      );

      // Request B (collides and recovers)
      const sessionB = await trackingService.startSession(
        testUserId,
        testCompanyId,
        testEmployeeId,
        testAttendanceId,
        punchData,
      );

      expect(sessionA.id).toBe('existing-active-session-uuid');
      expect(sessionB.id).toBe('existing-active-session-uuid');
    });
  });

  describe('ACCEPTANCE TEST 3: Location Failure Isolation & Attendance Primacy', () => {
    it('should complete Attendance Punch In successfully even if LocationTrackingService fails', async () => {
      // Mock failure in trackingService.startSession
      jest.spyOn(trackingService, 'startSession').mockRejectedValue(
        new Error('Database connectivity error in tracking engine'),
      );

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue({
        id: testUserId,
        email: 'test@himalaya.cloud',
        companyId: testCompanyId,
        employee: {
          id: testEmployeeId,
          department: { name: 'Sales' },
        },
      } as any);

      jest.spyOn(prisma.attendance, 'findFirst').mockResolvedValue(null);

      const attendanceCreatedFixture = {
        id: 'new-attendance-uuid-999',
        companyId: testCompanyId,
        userId: testUserId,
        employeeId: testEmployeeId,
        status: 'PUNCHED_IN',
        punchInAt: new Date(),
        punchInLatitude: 23.0225,
        punchInLongitude: 72.5714,
        punchInAddress: 'Office Campus',
        punchInSelfieUrl: '/uploads/attendance/selfie-test.jpg',
        punchOutAt: null,
        workedSeconds: 0,
        workedMinutes: 0,
        lateMinutes: 0,
      };

      jest.spyOn(prisma.attendance, 'create').mockResolvedValue(attendanceCreatedFixture as any);

      const result = await attendanceService.punchIn(testUserId, testCompanyId, {
        latitude: 23.0225,
        longitude: 72.5714,
        accuracy: 15,
        selfie: 'data:image/jpeg;base64,VGhpcyBpcyBhIHRlc3Qgc2VsZmll',
        address: 'Office Campus',
        isTestMode: true,
      });

      // NON-NEGOTIABLE GUARDRAIL A: Attendance must succeed with status PUNCHED_IN
      expect(result).toBeDefined();
      expect(result.status).toBe('PUNCHED_IN');
      expect(result.isPunchedIn).toBe(true);
      // Tracking is gracefully degraded without breaking attendance
    });
  });

  describe('ACCEPTANCE TEST 4: Punch Out Location Failure Isolation & Attendance Primacy', () => {
    it('should complete Attendance Punch Out successfully even if LocationTrackingService.endSession fails', async () => {
      // Mock failure in trackingService.endSession
      jest.spyOn(trackingService, 'endSession').mockRejectedValue(
        new Error('Redis/DB failure in location session conclusion engine'),
      );

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue({
        id: testUserId,
        email: 'test@himalaya.cloud',
        companyId: testCompanyId,
        employee: {
          id: testEmployeeId,
          department: { name: 'Sales' },
        },
      } as any);

      const existingAttendance = {
        id: 'attendance-to-punch-out-123',
        companyId: testCompanyId,
        userId: testUserId,
        employeeId: testEmployeeId,
        status: 'PUNCHED_IN',
        punchInAt: new Date(Date.now() - 8 * 3600 * 1000), // 8 hours ago
        punchInLatitude: 23.0225,
        punchInLongitude: 72.5714,
        punchInAddress: 'Office Campus',
        punchOutAt: null,
      };

      jest.spyOn(prisma.attendance, 'findFirst').mockResolvedValue(existingAttendance as any);

      const updatedAttendanceFixture = {
        ...existingAttendance,
        punchOutAt: new Date(),
        punchOutLatitude: 23.03,
        punchOutLongitude: 72.58,
        punchOutAddress: 'Client Site, Ahmedabad',
        workedSeconds: 8 * 3600,
        workedMinutes: 480,
        earlyExitMinutes: 0,
        overtimeMinutes: 0,
        status: 'PRESENT',
      };

      jest.spyOn(prisma.attendance, 'update').mockResolvedValue(updatedAttendanceFixture as any);

      const result = await attendanceService.punchOut(testUserId, testCompanyId, {
        latitude: 23.03,
        longitude: 72.58,
        accuracy: 12,
        selfie: 'data:image/jpeg;base64,VGhpcyBpcyBhIHB1bmNoIG91dCBzZWxmaWU=',
        address: 'Client Site, Ahmedabad',
        isTestMode: true,
      });

      // NON-NEGOTIABLE GUARDRAIL: Attendance Punch Out MUST succeed
      expect(result).toBeDefined();
      expect(result.punchOutTime).toBeDefined();
      expect(result.status).toBe('PRESENT');
      expect(result.isPunchedIn).toBe(false);
      expect(result.workedDuration).toBeDefined();
    });
  });

  describe('Anti-Fraud Security & 4-Way Consistency Check', () => {
    it('should reject startSession if Attendance company/user/employee does not match', async () => {
      jest.spyOn(prisma.attendance, 'findUnique').mockResolvedValue({
        id: 'diff-attendance-id',
        companyId: 'company-a',
        employeeId: 'employee-a',
        userId: 'user-a',
      } as any);

      await expect(
        trackingService.startSession(
          'user-b',
          'company-b',
          'employee-b',
          'diff-attendance-id',
          { latitude: 23.0, longitude: 72.0 },
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should flag impossible speed jumps (> 180 km/h) as isFilteredJump', async () => {
      const fakeSessionId = 'session-jump-test-id';
      jest.spyOn(prisma.employeeLocationSession, 'findUnique').mockResolvedValue({
        id: fakeSessionId,
        companyId: testCompanyId,
        status: 'ACTIVE',
      } as any);

      const point1 = {
        sessionId: fakeSessionId,
        latitude: 23.0225,
        longitude: 72.5714,
        recordedAt: new Date('2026-09-23T10:00:00Z'),
        isFilteredJump: false,
      };

      jest.spyOn(prisma.employeeLocationPoint, 'findFirst').mockResolvedValue(point1 as any);

      let savedPoint: any = null;
      jest.spyOn(prisma.employeeLocationPoint, 'upsert').mockImplementation((args: any) => {
        savedPoint = args.create;
        return Promise.resolve(args.create);
      });

      jest.spyOn(prisma.employeeLocationPoint, 'count').mockResolvedValue(1);
      jest.spyOn(prisma.employeeRouteStop, 'count').mockResolvedValue(0);
      jest.spyOn(prisma.employeeLocationSession, 'update').mockResolvedValue({} as any);
      jest.spyOn(trackingService, 'recalculateSessionDistanceKm').mockResolvedValue(0);

      // Point 2: Mumbai (~450 km away) in 10 seconds -> ~162,000 km/h
      const jumpPointPayload = {
        sessionId: fakeSessionId,
        points: [
          {
            clientPointId: 'jump-point-uuid',
            latitude: 19.0760,
            longitude: 72.8777,
            recordedAt: new Date('2026-09-23T10:00:10Z').toISOString(),
            speed: 50,
          },
        ],
      };

      await trackingService.recordBatchPoints(testUserId, testCompanyId, jumpPointPayload as any);

      expect(savedPoint).toBeDefined();
      expect(savedPoint.isFilteredJump).toBe(true);
    });
  });
});
