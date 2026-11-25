import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ONLINE_THRESHOLD_SECONDS } from '../../modules/location/location.service';
import { getIstDateString, getIstDayBoundsUtc } from '../../modules/location/location-time.util';

export interface ForceLogoutEvent {
  userId?: string;
  sessionId?: string;
  reason: string;
}

export interface ParsedDeviceInfo {
  browser: string;
  os: string;
  deviceType: 'DESKTOP' | 'MOBILE' | 'TABLET' | 'API' | 'UNKNOWN';
  label: string;
}

const USER_CACHE_TTL_MS = 15_000;
const SESSION_DB_CACHE_TTL_MS = 10_000;
const REVOKED_ENTRY_MAX_AGE_MS = 25 * 60 * 60 * 1000; // > 24h access token lifetime

@Injectable()
export class SessionSecurityService {
  private readonly logger = new Logger(SessionSecurityService.name);

  private readonly revokedSessionIds = new Map<string, number>();
  private readonly sessionRevokeReasons = new Map<string, string>();
  private readonly userRevokedBefore = new Map<string, number>();
  private readonly sessionLastActive = new Map<string, number>();
  private readonly activeUserCache = new Map<
    string,
    { isActive: boolean; roleId: string; companyId: string; cachedAt: number }
  >();
  private readonly sessionDbCache = new Map<
    string,
    { revoked: boolean; checkedAt: number }
  >();
  private readonly forceLogoutListeners: Array<(evt: ForceLogoutEvent) => void> =
    [];

  constructor(private readonly prisma: PrismaService) {}

  onForceLogout(listener: (evt: ForceLogoutEvent) => void): void {
    this.forceLogoutListeners.push(listener);
  }

  private emitForceLogout(evt: ForceLogoutEvent): void {
    for (const listener of this.forceLogoutListeners) {
      try {
        listener(evt);
      } catch (err: any) {
        this.logger.warn(`Force-logout listener failed: ${err?.message}`);
      }
    }
  }

  private pruneStaleEntries(now: number): void {
    if (this.revokedSessionIds.size > 5000) {
      for (const [sid, ts] of this.revokedSessionIds.entries()) {
        if (now - ts > REVOKED_ENTRY_MAX_AGE_MS) {
          this.revokedSessionIds.delete(sid);
          this.sessionRevokeReasons.delete(sid);
        }
      }
    }
    if (this.sessionDbCache.size > 5000) {
      for (const [sid, entry] of this.sessionDbCache.entries()) {
        if (now - entry.checkedAt > SESSION_DB_CACHE_TTL_MS * 6) {
          this.sessionDbCache.delete(sid);
        }
      }
    }
    if (this.activeUserCache.size > 2000) {
      for (const [uid, entry] of this.activeUserCache.entries()) {
        if (now - entry.cachedAt > USER_CACHE_TTL_MS * 4) {
          this.activeUserCache.delete(uid);
        }
      }
    }
  }

  invalidateUserCache(userId: string): void {
    if (!userId) return;
    this.activeUserCache.delete(userId);
  }

  recordSessionActive(sessionId?: string | null): void {
    if (!sessionId) return;
    this.sessionLastActive.set(sessionId, Date.now());
  }

  markSessionRevoked(
    sessionId?: string | null,
    reason?: string,
    userId?: string,
  ): void {
    if (!sessionId) return;
    const now = Date.now();
    this.revokedSessionIds.set(sessionId, now);
    if (reason) {
      this.sessionRevokeReasons.set(sessionId, reason);
    }
    this.sessionDbCache.set(sessionId, { revoked: true, checkedAt: now });
    this.sessionLastActive.delete(sessionId);
    if (reason) {
      this.emitForceLogout({ sessionId, userId, reason });
    }
    this.pruneStaleEntries(now);
  }

  markUserSessionsRevoked(userId: string, reason = 'Session terminated by administrator'): void {
    if (!userId) return;
    const now = Date.now();
    this.userRevokedBefore.set(userId, now);
    this.activeUserCache.delete(userId);
    this.emitForceLogout({ userId, reason });
    this.pruneStaleEntries(now);
  }

  /**
   * Validates active user status + instant session revocation for every JWT request.
   * Uses bounded in-memory caching so normal API load avoids hammering Postgres.
   */
  async validateAccessSession(payload: {
    sub?: string;
    sid?: string;
    iat?: number;
  }): Promise<void> {
    const userId = payload?.sub;
    const sessionId = payload?.sid;
    const now = Date.now();

    // 1. Instant in-memory session kill check (O(1))
    if (sessionId && this.revokedSessionIds.has(sessionId)) {
      const reason =
        this.sessionRevokeReasons.get(sessionId) ||
        'Your session was terminated. Please sign in again.';
      throw new UnauthorizedException({
        code: 'SESSION_REVOKED',
        message: reason,
      });
    }

    // 2. Instant in-memory user-wide kill check (covers legacy tokens without sid too)
    if (userId) {
      const revokedBefore = this.userRevokedBefore.get(userId);
      if (revokedBefore) {
        const tokenIatMs = payload?.iat ? payload.iat * 1000 : 0;
        // Allow tokens minted strictly after the revocation timestamp (1s buffer for JWT second granularity)
        if (!tokenIatMs || tokenIatMs + 1000 <= revokedBefore) {
          throw new UnauthorizedException({
            code: 'SESSION_REVOKED',
            message: 'Your session was terminated by an administrator. Please sign in again.',
          });
        }
      }
    }

    // 3. Cached user active check
    if (userId) {
      let cachedUser = this.activeUserCache.get(userId);
      if (!cachedUser || now - cachedUser.cachedAt > USER_CACHE_TTL_MS) {
        const dbUser = await this.prisma.user.findUnique({
          where: { id: userId },
          select: { id: true, isActive: true, roleId: true, companyId: true },
        });
        if (!dbUser) {
          throw new UnauthorizedException({
            code: 'USER_NOT_FOUND',
            message: 'User record does not exist.',
          });
        }
        cachedUser = {
          isActive: dbUser.isActive,
          roleId: dbUser.roleId,
          companyId: dbUser.companyId,
          cachedAt: now,
        };
        this.activeUserCache.set(userId, cachedUser);
      }

      if (!cachedUser.isActive) {
        throw new UnauthorizedException({
          code: 'ACCOUNT_DISABLED',
          message: 'User account has been deactivated.',
        });
      }
    }

    // 4. Cold-boot / cross-process DB validation for sid-bearing tokens
    if (sessionId) {
      const cachedSess = this.sessionDbCache.get(sessionId);
      if (!cachedSess || now - cachedSess.checkedAt > SESSION_DB_CACHE_TTL_MS) {
        const dbSession = await this.prisma.refreshSession.findUnique({
          where: { id: sessionId },
          select: { id: true, revokedAt: true, expiresAt: true },
        });

        const isRevoked =
          !dbSession ||
          Boolean(dbSession.revokedAt) ||
          dbSession.expiresAt.getTime() <= now;

        this.sessionDbCache.set(sessionId, { revoked: isRevoked, checkedAt: now });
        if (isRevoked) {
          this.revokedSessionIds.set(sessionId, now);
          throw new UnauthorizedException({
            code: 'SESSION_REVOKED',
            message: 'Your session was terminated or has expired. Please sign in again.',
          });
        }
      } else if (cachedSess.revoked) {
        throw new UnauthorizedException({
          code: 'SESSION_REVOKED',
          message: 'Your session was terminated by an administrator. Please sign in again.',
        });
      }

      this.sessionLastActive.set(sessionId, now);
    }
  }

  parseUserAgent(rawUa?: string | null): ParsedDeviceInfo {
    const ua = String(rawUa || '').trim();
    if (!ua) {
      return {
        browser: 'Unknown',
        os: 'Unknown',
        deviceType: 'UNKNOWN',
        label: 'Unknown Device',
      };
    }

    if (/^(node|undici|axios|curl|python-requests|postman)/i.test(ua)) {
      return {
        browser: 'API Client',
        os: 'Server / Script',
        deviceType: 'API',
        label: `API Client (${ua.slice(0, 28)})`,
      };
    }

    let os = 'Unknown OS';
    let deviceType: ParsedDeviceInfo['deviceType'] = 'DESKTOP';

    if (/Android/i.test(ua)) {
      os = 'Android';
      deviceType = /Mobile/i.test(ua) ? 'MOBILE' : 'TABLET';
    } else if (/iPad/i.test(ua)) {
      os = 'iPadOS';
      deviceType = 'TABLET';
    } else if (/iPhone|iPod/i.test(ua)) {
      os = 'iOS';
      deviceType = 'MOBILE';
    } else if (/Windows NT 10|Windows NT 11|Windows/i.test(ua)) {
      os = 'Windows';
    } else if (/Mac OS X|Macintosh/i.test(ua)) {
      os = 'macOS';
    } else if (/CrOS/i.test(ua)) {
      os = 'ChromeOS';
    } else if (/Linux/i.test(ua)) {
      os = 'Linux';
    }

    let browser = 'Browser';
    if (/Flutter|Dart|HimalayaERP/i.test(ua)) {
      browser = 'Himalaya Mobile App';
      deviceType = 'MOBILE';
    } else if (/Edg\//i.test(ua)) {
      browser = 'Microsoft Edge';
    } else if (/OPR\/|Opera/i.test(ua)) {
      browser = 'Opera';
    } else if (/Chrome\/|CriOS\//i.test(ua)) {
      browser = 'Chrome';
    } else if (/Firefox\/|FxiOS\//i.test(ua)) {
      browser = 'Firefox';
    } else if (/Safari\//i.test(ua)) {
      browser = 'Safari';
    }

    return {
      browser,
      os,
      deviceType,
      label: `${browser} on ${os}`,
    };
  }

  private cleanIpAddress(rawIp?: string | null): string {
    if (!rawIp) return 'Unknown';
    const cleaned = String(rawIp)
      .split(',')[0]
      .trim()
      .replace(/^::ffff:/i, '');
    if (!cleaned || cleaned === 'node' || cleaned === 'undefined') {
      return 'Unknown';
    }
    return cleaned;
  }

  async listActiveSessions(
    currentSessionId?: string,
    query?: { search?: string; role?: string; page?: number; limit?: number },
  ) {
    const now = new Date();
    const nowMs = now.getTime();
    const { start: istStartToday } = getIstDayBoundsUtc(getIstDateString(now));

    const [activeSessions, recentDevices, revokedTodayCount] =
      await Promise.all([
        this.prisma.refreshSession.findMany({
          where: {
            revokedAt: null,
            expiresAt: { gt: now },
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                isActive: true,
                role: { select: { code: true, name: true } },
                employee: {
                  select: {
                    employeeCode: true,
                    jobTitle: true,
                    department: { select: { name: true } },
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 500,
        }),
        this.prisma.deviceSession.findMany({
          where: {
            lastSeenAt: { gte: new Date(nowMs - 15 * 60 * 1000) },
          },
          select: {
            userId: true,
            deviceType: true,
            deviceModel: true,
            operatingSystem: true,
            browser: true,
            clientType: true,
            lastSeenAt: true,
          },
          orderBy: { lastSeenAt: 'desc' },
        }),
        this.prisma.refreshSession.count({
          where: {
            revokedAt: { gte: istStartToday },
          },
        }),
      ]);

    const latestDeviceByUser = new Map<string, (typeof recentDevices)[number]>();
    for (const dev of recentDevices) {
      if (!latestDeviceByUser.has(dev.userId)) {
        latestDeviceByUser.set(dev.userId, dev);
      }
    }

    const mappedAll = activeSessions
      .filter((s) => Boolean(s.user))
      .map((s) => {
        const device = latestDeviceByUser.get(s.userId);
        // Handle historical swapped rows gracefully if userAgent looks like an IP and ipAddress looks like a UA
        let rawIp = s.ipAddress;
        let rawUa = s.userAgent;
        const looksLikeIp = (v?: string | null) =>
          Boolean(v && /^(\d{1,3}\.){3}\d{1,3}$|^[0-9a-f:]+$/i.test(v.split(',')[0].trim()));
        if (!looksLikeIp(rawIp) && looksLikeIp(rawUa)) {
          const tmp = rawIp;
          rawIp = rawUa;
          rawUa = tmp;
        }

        const parsedUa = this.parseUserAgent(rawUa);
        const memLastActive = this.sessionLastActive.get(s.id) || 0;
        const deviceLastSeen = device?.lastSeenAt ? device.lastSeenAt.getTime() : 0;
        const lastActiveMs = Math.max(
          s.createdAt.getTime(),
          memLastActive,
          deviceLastSeen,
        );
        const ageSec = Math.floor((nowMs - lastActiveMs) / 1000);

        let presenceStatus: 'ONLINE' | 'ACTIVE' | 'IDLE' = 'IDLE';
        if (ageSec <= ONLINE_THRESHOLD_SECONDS) {
          presenceStatus = 'ONLINE';
        } else if (ageSec <= 15 * 60) {
          presenceStatus = 'ACTIVE';
        }

        const browser =
          parsedUa.browser !== 'Unknown' && parsedUa.browser !== 'API Client'
            ? parsedUa.browser
            : device?.browser || parsedUa.browser;
        const os =
          parsedUa.os !== 'Unknown' && parsedUa.os !== 'Server / Script'
            ? parsedUa.os
            : device?.operatingSystem || parsedUa.os;
        const deviceType =
          parsedUa.deviceType !== 'UNKNOWN' && parsedUa.deviceType !== 'API'
            ? parsedUa.deviceType
            : ((device?.deviceType?.toUpperCase() as any) || parsedUa.deviceType);

        return {
          sessionId: s.id,
          userId: s.userId,
          userName: s.user.name || s.user.email,
          email: s.user.email,
          employeeCode: s.user.employee?.employeeCode || null,
          role: s.user.role?.name || s.user.role?.code || 'Staff',
          roleCode: s.user.role?.code || 'STAFF',
          department:
            s.user.employee?.department?.name ||
            s.user.role?.name ||
            'Operations',
          isActiveUser: s.user.isActive,
          ipAddress: this.cleanIpAddress(rawIp),
          userAgent: rawUa || null,
          browser,
          os,
          deviceType,
          deviceLabel: `${browser} on ${os}`,
          loginAt: s.createdAt.toISOString(),
          lastActiveAt: new Date(lastActiveMs).toISOString(),
          expiresAt: s.expiresAt.toISOString(),
          presenceStatus,
          isCurrentSession: Boolean(currentSessionId && s.id === currentSessionId),
        };
      });

    // Summary stats across ALL active sessions (before search/role pagination filter)
    const uniqueUsers = new Set(mappedAll.map((m) => m.userId));
    const onlineUsers = new Set(
      mappedAll
        .filter((m) => m.presenceStatus === 'ONLINE')
        .map((m) => m.userId),
    );
    const byRoleMap = new Map<string, number>();
    for (const row of mappedAll) {
      byRoleMap.set(row.role, (byRoleMap.get(row.role) || 0) + 1);
    }

    // Apply filters
    let filtered = mappedAll;
    const search = String(query?.search || '').trim().toLowerCase();
    if (search) {
      filtered = filtered.filter(
        (row) =>
          row.userName.toLowerCase().includes(search) ||
          row.email.toLowerCase().includes(search) ||
          (row.employeeCode || '').toLowerCase().includes(search) ||
          row.role.toLowerCase().includes(search) ||
          row.ipAddress.toLowerCase().includes(search) ||
          row.deviceLabel.toLowerCase().includes(search),
      );
    }
    const roleFilter = String(query?.role || '').trim().toUpperCase();
    if (roleFilter && roleFilter !== 'ALL') {
      filtered = filtered.filter(
        (row) =>
          row.roleCode.toUpperCase() === roleFilter ||
          row.role.toUpperCase().includes(roleFilter),
      );
    }

    const page = Math.max(1, Number(query?.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query?.limit) || 25));
    const total = filtered.length;
    const start = (page - 1) * limit;
    const items = filtered.slice(start, start + limit);

    return {
      summary: {
        totalActiveSessions: mappedAll.length,
        uniqueLoggedInUsers: uniqueUsers.size,
        liveOnlineNow: onlineUsers.size,
        revokedToday: revokedTodayCount,
        byRole: Array.from(byRoleMap.entries())
          .map(([role, count]) => ({ role, count }))
          .sort((a, b) => b.count - a.count),
      },
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  async revokeSessionById(
    sessionId: string,
    actorUserId: string,
    reason = 'Session terminated by Super Admin',
  ) {
    const session = await this.prisma.refreshSession.findUnique({
      where: { id: sessionId },
      include: {
        user: { select: { id: true, email: true, name: true, companyId: true } },
      },
    });

    if (!session) {
      throw new NotFoundException('Active session not found.');
    }

    const now = new Date();
    if (!session.revokedAt) {
      await this.prisma.refreshSession.update({
        where: { id: sessionId },
        data: { revokedAt: now },
      });
    }

    this.markSessionRevoked(sessionId);
    this.emitForceLogout({
      userId: session.userId,
      sessionId,
      reason,
    });

    try {
      await this.prisma.auditLog.create({
        data: {
          companyId: session.user.companyId,
          actorUserId: actorUserId || session.userId,
          action: 'SESSION_REVOKED_BY_SUPER_ADMIN',
          entityType: 'RefreshSession',
          entityId: sessionId,
          after: {
            targetUserId: session.userId,
            targetEmail: session.user.email,
            reason,
          },
        },
      });
    } catch {
      // non-fatal
    }

    return {
      success: true,
      sessionId,
      userId: session.userId,
      email: session.user.email,
      revokedAt: now.toISOString(),
    };
  }

  async revokeAllUserSessions(
    targetUserId: string,
    actorUserId: string,
    reason = 'All sessions terminated by Super Admin',
  ) {
    const targetUser = await this.prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, email: true, name: true, companyId: true },
    });

    if (!targetUser) {
      throw new NotFoundException('User not found.');
    }

    const active = await this.prisma.refreshSession.findMany({
      where: { userId: targetUserId, revokedAt: null },
      select: { id: true },
    });

    const now = new Date();
    if (active.length > 0) {
      await this.prisma.refreshSession.updateMany({
        where: { userId: targetUserId, revokedAt: null },
        data: { revokedAt: now },
      });
      for (const row of active) {
        this.markSessionRevoked(row.id);
      }
    }

    this.markUserSessionsRevoked(targetUserId, reason);

    try {
      await this.prisma.auditLog.create({
        data: {
          companyId: targetUser.companyId,
          actorUserId: actorUserId || targetUser.id,
          action: 'USER_FORCE_LOGOUT_BY_SUPER_ADMIN',
          entityType: 'User',
          entityId: targetUser.id,
          after: {
            targetEmail: targetUser.email,
            revokedCount: active.length,
            reason,
          },
        },
      });
    } catch {
      // non-fatal
    }

    return {
      success: true,
      userId: targetUser.id,
      email: targetUser.email,
      revokedCount: active.length,
      revokedAt: now.toISOString(),
    };
  }

  async revokeAllOtherSessions(
    exceptSessionId: string | undefined,
    actorUserId: string,
    reason = 'Emergency logout of all sessions by Super Admin',
  ) {
    const now = new Date();
    const targetSessions = await this.prisma.refreshSession.findMany({
      where: {
        revokedAt: null,
        expiresAt: { gt: now },
        ...(exceptSessionId ? { id: { not: exceptSessionId } } : {}),
        ...(actorUserId ? { userId: { not: actorUserId } } : {}),
      },
      select: { id: true, userId: true },
    });

    if (targetSessions.length > 0) {
      const ids = targetSessions.map((s) => s.id);
      await this.prisma.refreshSession.updateMany({
        where: { id: { in: ids } },
        data: { revokedAt: now },
      });

      const affectedUsers = new Set<string>();
      for (const s of targetSessions) {
        this.markSessionRevoked(s.id);
        affectedUsers.add(s.userId);
      }
      for (const uid of affectedUsers) {
        this.markUserSessionsRevoked(uid, reason);
      }
    }

    try {
      const actor = actorUserId
        ? await this.prisma.user.findUnique({
            where: { id: actorUserId },
            select: { companyId: true },
          })
        : null;
      if (actor?.companyId) {
        await this.prisma.auditLog.create({
          data: {
            companyId: actor.companyId,
            actorUserId,
            action: 'ALL_SESSIONS_REVOKED_BY_SUPER_ADMIN',
            entityType: 'RefreshSession',
            entityId: exceptSessionId || 'GLOBAL',
            after: {
              revokedCount: targetSessions.length,
              reason,
            },
          },
        });
      }
    } catch {
      // non-fatal
    }

    return {
      success: true,
      revokedCount: targetSessions.length,
      revokedAt: now.toISOString(),
    };
  }
}
