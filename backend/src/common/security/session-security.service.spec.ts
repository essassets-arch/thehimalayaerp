import { UnauthorizedException } from '@nestjs/common';
import { SessionSecurityService } from './session-security.service';
import { createMockPrismaService } from '../../../test/mocks/prisma.mock';

describe('SessionSecurityService', () => {
  let service: SessionSecurityService;
  let prisma: ReturnType<typeof createMockPrismaService>;

  beforeEach(() => {
    prisma = createMockPrismaService();
    (prisma as any).refreshSession = {
      findUnique: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
      update: jest.fn(),
      updateMany: jest.fn(),
      count: jest.fn().mockResolvedValue(0),
    };
    (prisma as any).deviceSession = {
      findMany: jest.fn().mockResolvedValue([]),
    };
    (prisma as any).auditLog = {
      create: jest.fn().mockResolvedValue({}),
    };
    service = new SessionSecurityService(prisma as any);
  });

  it('rejects a killed session immediately with SESSION_REVOKED', async () => {
    prisma.user.findUnique = jest.fn().mockResolvedValue({
      id: 'u-1',
      isActive: true,
      roleId: 'r-1',
      companyId: 'c-1',
    });
    (prisma as any).refreshSession.findUnique.mockResolvedValue({
      id: 'sid-123',
      userId: 'u-1',
      revokedAt: null,
      expiresAt: new Date(Date.now() + 60_000),
      user: { id: 'u-1', email: 'sales1@himalayaerp.com', name: 'Sales 1', companyId: 'c-1' },
    });

    // Valid before kill
    await expect(
      service.validateAccessSession({ sub: 'u-1', sid: 'sid-123', iat: Math.floor(Date.now() / 1000) }),
    ).resolves.toBeUndefined();

    // Kill session & assert listener fires
    const forceLogoutSpy = jest.fn();
    service.onForceLogout(forceLogoutSpy);
    await service.revokeSessionById('sid-123', 'admin-1');
    expect(forceLogoutSpy).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'u-1', sessionId: 'sid-123' }),
    );

    // Must immediately throw SESSION_REVOKED
    await expect(
      service.validateAccessSession({ sub: 'u-1', sid: 'sid-123', iat: Math.floor(Date.now() / 1000) }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('revokes legacy tokens without sid when revokeAllUserSessions is triggered', async () => {
    prisma.user.findUnique = jest.fn().mockResolvedValue({
      id: 'u-2',
      email: 'sales2@himalayaerp.com',
      name: 'Sales 2',
      companyId: 'c-1',
      isActive: true,
      roleId: 'r-1',
    });
    (prisma as any).refreshSession.findMany.mockResolvedValue([{ id: 'sid-a' }, { id: 'sid-b' }]);

    const oldIat = Math.floor((Date.now() - 10_000) / 1000);
    await service.revokeAllUserSessions('u-2', 'admin-1');

    await expect(
      service.validateAccessSession({ sub: 'u-2', iat: oldIat }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('parses real browser/OS user agents accurately', () => {
    const parsed = service.parseUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
    );
    expect(parsed.browser).toBe('Chrome');
    expect(parsed.os).toBe('Windows');
    expect(parsed.deviceType).toBe('DESKTOP');

    const mobile = service.parseUserAgent(
      'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Mobile Safari/537.36',
    );
    expect(mobile.os).toBe('Android');
    expect(mobile.deviceType).toBe('MOBILE');
  });
});
