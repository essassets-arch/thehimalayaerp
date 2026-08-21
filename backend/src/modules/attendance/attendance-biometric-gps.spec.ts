import { Test, TestingModule } from '@nestjs/testing';
import { AttendanceService } from './attendance.service';
import { PrismaService } from '../../database/prisma.service';
import { BadRequestException, ConflictException } from '@nestjs/common';

describe('Attendance Biometric & GPS Validation Suite', () => {
  let service: AttendanceService;
  let mockPrisma: any;

  const mockUsers: any[] = [];
  const mockEmployees: any[] = [];
  const mockAttendances: any[] = [];
  const mockShiftPolicies: any[] = [];

  beforeEach(async () => {
    mockUsers.length = 0;
    mockEmployees.length = 0;
    mockAttendances.length = 0;
    mockShiftPolicies.length = 0;

    // Reset env vars by default for each test
    process.env.ATTENDANCE_TEST_MODE = 'false';
    process.env.NODE_ENV = 'production';

    mockPrisma = {
      user: {
        findUnique: jest.fn().mockImplementation(({ where }) => {
          const u = mockUsers.find(user => user.id === where.id);
          if (!u) return Promise.resolve(null);
          const emp = mockEmployees.find(e => e.userId === u.id);
          return Promise.resolve({
            ...u,
            employee: emp || null,
          });
        }),
      },
      employee: {
        findUnique: jest.fn().mockImplementation(({ where }) => {
          if (where.workEmail) {
            return Promise.resolve(mockEmployees.find(e => e.workEmail === where.workEmail) || null);
          }
          return Promise.resolve(mockEmployees.find(e => e.id === where.id) || null);
        }),
        findFirst: jest.fn().mockImplementation(({ where }) => {
          return Promise.resolve(mockEmployees.find(e => e.userId === where.userId) || null);
        }),
        create: jest.fn().mockImplementation(({ data }) => {
          const emp = { id: `emp-${mockEmployees.length + 1}`, ...data };
          mockEmployees.push(emp);
          return Promise.resolve(emp);
        }),
      },
      department: {
        findFirst: jest.fn().mockResolvedValue({ id: 'dept-1', name: 'Default' }),
        create: jest.fn().mockResolvedValue({ id: 'dept-1', name: 'Default' }),
      },
      workLocation: {
        findFirst: jest.fn().mockResolvedValue({ id: 'loc-1', name: 'Default Location' }),
        create: jest.fn().mockResolvedValue({ id: 'loc-1', name: 'Default Location' }),
      },
      shiftPolicy: {
        findUnique: jest.fn().mockImplementation(({ where }) => {
          return Promise.resolve(mockShiftPolicies.find(p => p.deptName === where.deptName) || null);
        }),
      },
      attendance: {
        findFirst: jest.fn().mockImplementation(({ where }) => {
          return Promise.resolve(
            mockAttendances.find(
              a =>
                a.employeeId === where.employeeId &&
                a.attendanceDate.getTime() === where.attendanceDate.getTime()
            ) || null
          );
        }),
        create: jest.fn().mockImplementation(({ data }) => {
          const att = { id: `att-${mockAttendances.length + 1}`, createdAt: new Date(), punchOutAt: null, ...data };
          mockAttendances.push(att);
          return Promise.resolve(att);
        }),
        update: jest.fn().mockImplementation(({ where, data }) => {
          const idx = mockAttendances.findIndex(a => a.id === where.id);
          if (idx === -1) return Promise.resolve(null);
          mockAttendances[idx] = { ...mockAttendances[idx], ...data };
          return Promise.resolve(mockAttendances[idx]);
        }),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttendanceService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<AttendanceService>(AttendanceService);
  });

  describe('1. Production Biometric Selfie Constraints', () => {
    it('accepts real camera selfie with valid location and accuracy in production', async () => {
      mockUsers.push({ id: 'user-1', email: 'user1@example.com', companyId: 'comp-1', name: 'User One' });
      mockEmployees.push({ id: 'emp-1', userId: 'user-1', companyId: 'comp-1', fullName: 'User One' });

      const res = await service.punchIn('user-1', 'comp-1', {
        latitude: 23.02281,
        longitude: 72.55661,
        accuracy: 10,
        address: 'Real Address Sabarmati',
        selfie: 'data:image/jpeg;base64,realimageselfiedatabytes',
        isBiometricCard: false,
        isGpsFallback: false,
      });

      expect(res.status).toBe('PUNCHED_IN');
      expect(mockAttendances.length).toBe(1);
    });

    it('rejects biometric security card fallback in production', async () => {
      mockUsers.push({ id: 'user-1', email: 'user1@example.com', companyId: 'comp-1', name: 'User One' });
      mockEmployees.push({ id: 'emp-1', userId: 'user-1', companyId: 'comp-1', fullName: 'User One' });

      await expect(
        service.punchIn('user-1', 'comp-1', {
          latitude: 23.02281,
          longitude: 72.55661,
          accuracy: 10,
          address: 'Real Address Sabarmati',
          selfie: 'data:image/jpeg;base64,realimageselfiedatabytes',
          isBiometricCard: true,
          isGpsFallback: false,
        })
      ).rejects.toThrow(BadRequestException);
    });

    it('accepts biometric security card fallback if ATTENDANCE_TEST_MODE is enabled', async () => {
      process.env.ATTENDANCE_TEST_MODE = 'true';
      mockUsers.push({ id: 'user-1', email: 'user1@example.com', companyId: 'comp-1', name: 'User One' });
      mockEmployees.push({ id: 'emp-1', userId: 'user-1', companyId: 'comp-1', fullName: 'User One' });

      const res = await service.punchIn('user-1', 'comp-1', {
        latitude: 23.02281,
        longitude: 72.55661,
        accuracy: 10,
        address: 'Real Address Sabarmati',
        selfie: 'data:image/jpeg;base64,realimageselfiedatabytes',
        isBiometricCard: true,
        isGpsFallback: false,
      });

      expect(res.status).toBe('PUNCHED_IN');
    });
  });

  describe('2. GPS Fallback and Default Coordinates Prevention', () => {
    it('rejects default coordinates or Gps Fallback in production', async () => {
      mockUsers.push({ id: 'user-1', email: 'user1@example.com', companyId: 'comp-1', name: 'User One' });
      mockEmployees.push({ id: 'emp-1', userId: 'user-1', companyId: 'comp-1', fullName: 'User One' });

      await expect(
        service.punchIn('user-1', 'comp-1', {
          latitude: 23.0228,
          longitude: 72.5566,
          accuracy: 15,
          address: 'Ahmedabad (GPS Fallback Applied) 📍',
          selfie: 'data:image/jpeg;base64,realimageselfiedatabytes',
          isBiometricCard: false,
          isGpsFallback: true,
        })
      ).rejects.toThrow(BadRequestException);
    });

    it('accepts default coordinates / fallback GPS if ATTENDANCE_TEST_MODE is enabled', async () => {
      process.env.ATTENDANCE_TEST_MODE = 'true';
      mockUsers.push({ id: 'user-1', email: 'user1@example.com', companyId: 'comp-1', name: 'User One' });
      mockEmployees.push({ id: 'emp-1', userId: 'user-1', companyId: 'comp-1', fullName: 'User One' });

      const res = await service.punchIn('user-1', 'comp-1', {
        latitude: 23.0228,
        longitude: 72.5566,
        accuracy: 15,
        address: 'Ahmedabad (GPS Fallback Applied) 📍',
        selfie: 'data:image/jpeg;base64,realimageselfiedatabytes',
        isBiometricCard: false,
        isGpsFallback: true,
      });

      expect(res.status).toBe('PUNCHED_IN');
    });
  });

  describe('3. GPS Accuracy Thresholds', () => {
    it('rejects poor GPS accuracy (> 50m) in production', async () => {
      mockUsers.push({ id: 'user-1', email: 'user1@example.com', companyId: 'comp-1', name: 'User One' });
      mockEmployees.push({ id: 'emp-1', userId: 'user-1', companyId: 'comp-1', fullName: 'User One' });

      await expect(
        service.punchIn('user-1', 'comp-1', {
          latitude: 23.02281,
          longitude: 72.55661,
          accuracy: 65, // > 50m
          address: 'Real Address Sabarmati',
          selfie: 'data:image/jpeg;base64,realimageselfiedatabytes',
          isBiometricCard: false,
          isGpsFallback: false,
        })
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects negative or zero GPS accuracy', async () => {
      mockUsers.push({ id: 'user-1', email: 'user1@example.com', companyId: 'comp-1', name: 'User One' });
      mockEmployees.push({ id: 'emp-1', userId: 'user-1', companyId: 'comp-1', fullName: 'User One' });

      await expect(
        service.punchIn('user-1', 'comp-1', {
          latitude: 23.02281,
          longitude: 72.55661,
          accuracy: -5,
          address: 'Real Address Sabarmati',
          selfie: 'data:image/jpeg;base64,realimageselfiedatabytes',
          isBiometricCard: false,
          isGpsFallback: false,
        })
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('4. Attendance Uniqueness and Sequence Constraints', () => {
    it('rejects punch-out when no punch-in exists for today', async () => {
      mockUsers.push({ id: 'user-1', email: 'user1@example.com', companyId: 'comp-1', name: 'User One' });
      mockEmployees.push({ id: 'emp-1', userId: 'user-1', companyId: 'comp-1', fullName: 'User One' });

      await expect(
        service.punchOut('user-1', 'comp-1', {
          latitude: 23.02281,
          longitude: 72.55661,
          accuracy: 10,
          address: 'Real Address Sabarmati',
          selfie: 'data:image/jpeg;base64,realimageselfiedatabytes',
          isBiometricCard: false,
          isGpsFallback: false,
        })
      ).rejects.toThrow(ConflictException);
    });

    it('rejects duplicate punch-in on same calendar date', async () => {
      mockUsers.push({ id: 'user-1', email: 'user1@example.com', companyId: 'comp-1', name: 'User One' });
      mockEmployees.push({ id: 'emp-1', userId: 'user-1', companyId: 'comp-1', fullName: 'User One' });

      // First punch in
      await service.punchIn('user-1', 'comp-1', {
        latitude: 23.02281,
        longitude: 72.55661,
        accuracy: 10,
        address: 'Real Address Sabarmati',
        selfie: 'data:image/jpeg;base64,realimageselfiedatabytes',
        isBiometricCard: false,
        isGpsFallback: false,
      });

      // Second punch in should throw
      await expect(
        service.punchIn('user-1', 'comp-1', {
          latitude: 23.02281,
          longitude: 72.55661,
          accuracy: 10,
          address: 'Real Address Sabarmati',
          selfie: 'data:image/jpeg;base64,realimageselfiedatabytes',
          isBiometricCard: false,
          isGpsFallback: false,
        })
      ).rejects.toThrow(ConflictException);
    });

    it('completes the daily attendance cycle (punch-in then punch-out) successfully', async () => {
      mockUsers.push({ id: 'user-1', email: 'user1@example.com', companyId: 'comp-1', name: 'User One' });
      mockEmployees.push({ id: 'emp-1', userId: 'user-1', companyId: 'comp-1', fullName: 'User One' });

      const inRes = await service.punchIn('user-1', 'comp-1', {
        latitude: 23.02281,
        longitude: 72.55661,
        accuracy: 10,
        address: 'Real Address Sabarmati',
        selfie: 'data:image/jpeg;base64,realimageselfiedatabytes',
        isBiometricCard: false,
        isGpsFallback: false,
      });
      expect(inRes.isPunchedIn).toBe(true);

      const outRes = await service.punchOut('user-1', 'comp-1', {
        latitude: 23.02281,
        longitude: 72.55661,
        accuracy: 10,
        address: 'Real Address Sabarmati',
        selfie: 'data:image/jpeg;base64,realimageselfiedatabytes',
        isBiometricCard: false,
        isGpsFallback: false,
      });
      expect(outRes.isPunchedIn).toBe(false);
      expect(outRes.isPunchedOut).toBe(true);
    });
  });
});
