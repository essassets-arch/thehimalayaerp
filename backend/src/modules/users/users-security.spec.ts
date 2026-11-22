import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { compare } from 'bcrypt';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('Users Password Security & Super Admin Reset Controls', () => {
  const makeService = () => {
    const prisma: any = {
      user: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      employee: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      refreshSession: {
        updateMany: jest.fn().mockResolvedValue({ count: 2 }),
      },
      auditLog: {
        create: jest.fn().mockResolvedValue({ id: 'audit-1' }),
      },
    };
    return { prisma, service: new UsersService(prisma) };
  };

  it('findAll never exposes password hashes and reports lock status cleanly', async () => {
    const { prisma, service } = makeService();
    const futureLock = new Date(Date.now() + 120_000);
    prisma.user.findMany.mockResolvedValue([
      {
        id: 'u-1',
        publicId: 'EMP-1',
        email: 'backoffice@himalayaerp.com',
        name: 'Back Office',
        password: '$2b$12$supersecrethashvalue',
        roleId: 'r-1',
        role: { name: 'Back Office', code: 'BACK_OFFICE' },
        employee: null,
        isActive: true,
        failedLoginAttempts: 10,
        lockedUntil: futureLock,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    const rows = await service.findAll();
    expect(rows).toHaveLength(1);
    expect(rows[0].password).toBeUndefined();
    expect(rows[0].hasUserAccount).toBe(true);
    expect(rows[0].isLocked).toBe(true);
  });

  it('blocks non-Super-Admin roles (e.g. HR) from calling resetPassword', async () => {
    const { service } = makeService();
    const controller = new UsersController(service);

    await expect(
      controller.resetPassword(
        'u-1',
        { new_password: 'StrongPassword@2026' },
        { user: { sub: 'hr-1', role: 'HR' } },
      ),
    ).rejects.toThrow(ForbiddenException);
  });

  it('rejects weak or short passwords on resetPassword', async () => {
    const { service } = makeService();
    await expect(service.resetPassword('u-1', '123456')).rejects.toThrow(
      BadRequestException,
    );
    await expect(service.resetPassword('u-1', 'admin123')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('throws NotFoundException when target user account does not exist', async () => {
    const { prisma, service } = makeService();
    prisma.user.findUnique.mockResolvedValue(null);
    await expect(
      service.resetPassword('missing-id', 'StrongPass@99', 'super-1'),
    ).rejects.toThrow(NotFoundException);
  });

  it('hashes with bcrypt, unlocks account, revokes sessions, and audits without plaintext', async () => {
    const { prisma, service } = makeService();
    const controller = new UsersController(service);
    prisma.user.findUnique.mockResolvedValue({
      id: 'u-1',
      email: 'sales1@himalayaerp.com',
      name: 'Sales One',
      companyId: 'comp-1',
    });
    prisma.user.update.mockResolvedValue({});

    const res = await controller.resetPassword(
      'u-1',
      { new_password: 'NewSecure#2026' },
      { user: { sub: 'super-1', role: 'SUPER_ADMIN' } },
    );

    expect(res).toEqual(
      expect.objectContaining({
        success: true,
        userId: 'u-1',
        unlocked: true,
        sessionsRevoked: true,
      }),
    );

    const updateCall = prisma.user.update.mock.calls[0][0];
    expect(updateCall.data.failedLoginAttempts).toBe(0);
    expect(updateCall.data.lockedUntil).toBeNull();
    expect(updateCall.data.password).toMatch(/^\$2[aby]\$12\$/);
    expect(await compare('NewSecure#2026', updateCall.data.password)).toBe(true);
    expect(prisma.refreshSession.updateMany).toHaveBeenCalledTimes(1);
    const auditCall = prisma.auditLog.create.mock.calls[0][0];
    expect(JSON.stringify(auditCall)).not.toContain('NewSecure#2026');
  });
});
