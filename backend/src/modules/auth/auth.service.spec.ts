import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../../database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { createMockPrismaService } from '../../../test/mocks/prisma.mock';
import {
  createMockConfigService,
  createMockJwtService,
} from '../../../test/mocks/services.mock';
import { hash } from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: ReturnType<typeof createMockPrismaService>;
  let usersService: {
    findByEmail: jest.Mock;
    findById: jest.Mock;
    ensureDefaultPermissions: jest.Mock;
  };

  beforeEach(async () => {
    prisma = createMockPrismaService();
    usersService = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      ensureDefaultPermissions: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: createMockJwtService() },
        { provide: ConfigService, useValue: createMockConfigService() },
        { provide: UsersService, useValue: usersService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('returns remaining-attempt final warning on 9th failed password', async () => {
    const validHash = await hash('Correct@2026', 4);
    usersService.findByEmail.mockResolvedValue({
      id: 'user-1',
      email: 'backoffice@himalayaerp.com',
      isActive: true,
      password: validHash,
      failedLoginAttempts: 8,
      lockedUntil: null,
      role: { id: 'role-1', code: 'BACK_OFFICE' },
      companyId: 'comp-1',
    });
    prisma.user.update = jest.fn().mockResolvedValue({});

    try {
      await service.login({ email: 'backoffice@himalayaerp.com', password: 'wrong' });
      fail('Expected UnauthorizedException');
    } catch (err) {
      expect(err).toBeInstanceOf(UnauthorizedException);
      const body = (err as UnauthorizedException).getResponse() as any;
      expect(body.code).toBe('INVALID_CREDENTIALS');
      expect(body.attemptsRemaining).toBe(1);
      expect(body.maxAttempts).toBe(10);
      expect(body.message).toContain('FINAL WARNING');
    }
  });

  it('locks account for 5 minutes on 10th failed attempt with retryAfterSeconds', async () => {
    const validHash = await hash('Correct@2026', 4);
    usersService.findByEmail.mockResolvedValue({
      id: 'user-1',
      email: 'backoffice@himalayaerp.com',
      isActive: true,
      password: validHash,
      failedLoginAttempts: 9,
      lockedUntil: null,
      role: { id: 'role-1', code: 'BACK_OFFICE' },
      companyId: 'comp-1',
    });
    prisma.user.update = jest.fn().mockResolvedValue({});

    try {
      await service.login({ email: 'backoffice@himalayaerp.com', password: 'wrong' });
      fail('Expected UnauthorizedException');
    } catch (err) {
      expect(err).toBeInstanceOf(UnauthorizedException);
      const body = (err as UnauthorizedException).getResponse() as any;
      expect(body.code).toBe('ACCOUNT_LOCKED');
      expect(body.retryAfterSeconds).toBe(300);
      expect(body.attemptsRemaining).toBe(0);
      expect(body.lockedUntil).toBeDefined();
    }
  });

  it('returns exact remaining countdown while account is actively locked', async () => {
    usersService.findByEmail.mockResolvedValue({
      id: 'user-1',
      email: 'backoffice@himalayaerp.com',
      isActive: true,
      password: 'hash',
      failedLoginAttempts: 10,
      lockedUntil: new Date(Date.now() + 95_000),
      role: { id: 'role-1', code: 'BACK_OFFICE' },
      companyId: 'comp-1',
    });

    try {
      await service.login({ email: 'backoffice@himalayaerp.com', password: 'any' });
      fail('Expected UnauthorizedException');
    } catch (err) {
      const body = (err as UnauthorizedException).getResponse() as any;
      expect(body.code).toBe('ACCOUNT_LOCKED');
      expect(body.retryAfterSeconds).toBeGreaterThanOrEqual(90);
      expect(body.retryAfterSeconds).toBeLessThanOrEqual(96);
      expect(body.message).toMatch(/1 min \d+ sec/);
    }
  });

  it('resets failed counter cleanly once prior lockout has expired', async () => {
    const validHash = await hash('Correct@2026', 4);
    usersService.findByEmail.mockResolvedValue({
      id: 'user-1',
      email: 'backoffice@himalayaerp.com',
      isActive: true,
      password: validHash,
      failedLoginAttempts: 10,
      lockedUntil: new Date(Date.now() - 10_000), // Already expired
      role: { id: 'role-1', code: 'BACK_OFFICE' },
      companyId: 'comp-1',
    });
    prisma.user.update = jest.fn().mockResolvedValue({});

    try {
      await service.login({ email: 'backoffice@himalayaerp.com', password: 'wrong' });
      fail('Expected UnauthorizedException');
    } catch (err) {
      const body = (err as UnauthorizedException).getResponse() as any;
      expect(body.code).toBe('INVALID_CREDENTIALS');
      expect(body.attemptsRemaining).toBe(9);
      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ failedLoginAttempts: 1, lockedUntil: null }),
        }),
      );
    }
  });
});
