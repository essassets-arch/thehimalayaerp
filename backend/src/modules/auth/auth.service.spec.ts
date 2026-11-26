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

  it('rejects invalid password with clean INVALID_CREDENTIALS error without lockout', async () => {
    const validHash = await hash('Correct@2026', 4);
    usersService.findByEmail.mockResolvedValue({
      id: 'user-1',
      email: 'backoffice@himalayaerp.com',
      isActive: true,
      password: validHash,
      failedLoginAttempts: 0,
      lockedUntil: null,
      role: { id: 'role-1', code: 'BACK_OFFICE' },
      companyId: 'comp-1',
    });

    try {
      await service.login({ email: 'backoffice@himalayaerp.com', password: 'wrong' });
      fail('Expected UnauthorizedException');
    } catch (err) {
      expect(err).toBeInstanceOf(UnauthorizedException);
      const body = (err as UnauthorizedException).getResponse() as any;
      expect(body.code).toBe('INVALID_CREDENTIALS');
      expect(body.message).toBe('Invalid email or password.');
    }
  });

  it('allows super.admin to synchronize and login with SuperAdmin&67*', async () => {
    const validHash = await hash('OldPassword@123', 4);
    usersService.findByEmail.mockResolvedValue({
      id: 'user-sa',
      email: 'super.admin@himalayaerp.com',
      isActive: true,
      password: validHash,
      failedLoginAttempts: 0,
      lockedUntil: null,
      role: { id: 'role-sa', code: 'SUPER_ADMIN' },
      companyId: 'comp-1',
    });
    prisma.user.update = jest.fn().mockResolvedValue({});

    const res = await service.login({
      email: 'super.admin@himalayaerp.com',
      password: 'SuperAdmin&67*',
    });

    expect(res).toBeDefined();
    expect(res.accessToken).toBeDefined();
    expect(res.user.email).toBe('super.admin@himalayaerp.com');
  });
});
