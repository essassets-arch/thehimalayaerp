import { Injectable, Optional, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { compare, hash } from 'bcrypt';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../database/prisma.service';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from '../../common/types/security.types';
import { RefreshSession } from '@prisma/client';
import { SessionSecurityService } from '../../common/security/session-security.service';

const compareAsync = compare as unknown as (
  data: string,
  encrypted: string,
) => Promise<boolean>;
const hashAsync = hash as unknown as (
  data: string,
  saltOrRounds: number,
) => Promise<string>;

export interface SafeUser {
  id: string;
  email: string;
  name: string;
  roleId: string;
  companyId: string;
  isActive: boolean;
}

export interface AuthLoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    companyId: string;
    permissions: string[];
  };
}

const MAX_FAILED_LOGIN_ATTEMPTS = 10;
const ACCOUNT_LOCKOUT_DURATION_MS = 5 * 60 * 1000; // 5 minutes

function formatWaitDuration(totalSeconds: number): string {
  const secs = Math.max(1, Math.ceil(totalSeconds));
  const mins = Math.floor(secs / 60);
  const remSecs = secs % 60;
  if (mins > 0 && remSecs > 0) {
    return `${mins} min ${remSecs} sec`;
  }
  if (mins > 0) {
    return `${mins} ${mins === 1 ? 'minute' : 'minutes'}`;
  }
  return `${secs} ${secs === 1 ? 'second' : 'seconds'}`;
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private usersService: UsersService,
    @Optional() private sessionSecurity?: SessionSecurityService,
  ) {}

  async validateUser(
    email: string,
    pass: string,
  ): Promise<Omit<SafeUser, 'password'> | null> {
    const user = await this.usersService.findByEmail(email);
    if (!user || !user.isActive || !user.password) return null;

    const isMatch = await compareAsync(pass, user.password).catch(() => false);
    if (isMatch) {
      const result = { ...user };
      delete (result as { password?: string }).password;
      return result;
    }
    return null;
  }

  async login(
    loginDto: LoginDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuthLoginResponse> {
    const cleanInputEmail = String(loginDto.email || '').trim().toLowerCase();
    let user = await this.usersService.findByEmail(cleanInputEmail);
    if (!user && loginDto.email && loginDto.email !== cleanInputEmail) {
      user = await this.usersService.findByEmail(loginDto.email);
    }
    const rawPassword = String(loginDto.password || '');
    const cleanPassword = rawPassword.trim();

    if (!user) {
      throw new UnauthorizedException({
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password.',
      });
    }

    // Check account lockout
    if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
      const remainingSeconds = Math.ceil(
        (new Date(user.lockedUntil).getTime() - Date.now()) / 1000,
      );
      throw new UnauthorizedException({
        code: 'ACCOUNT_LOCKED',
        message: `Account is temporarily locked. Please try again in ${formatWaitDuration(remainingSeconds)}.`,
      });
    }

    // Strict bcrypt verification against stored database hash
    let isMatch = user.password
      ? await compareAsync(rawPassword, user.password).catch(() => false)
      : false;

    // Check with trimmed password if untrimmed failed
    if (!isMatch && user.password && cleanPassword !== rawPassword) {
      isMatch = await compareAsync(cleanPassword, user.password).catch(() => false);
    }

    if (!isMatch) {
      // Record failed login attempt and lock if threshold exceeded
      const failedAttempts = (user.failedLoginAttempts || 0) + 1;
      const willLock = failedAttempts >= MAX_FAILED_LOGIN_ATTEMPTS;
      const lockedUntil = willLock
        ? new Date(Date.now() + ACCOUNT_LOCKOUT_DURATION_MS)
        : null;

      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: failedAttempts,
          lockedUntil,
        },
      });

      if (willLock) {
        throw new UnauthorizedException({
          code: 'ACCOUNT_LOCKED',
          message:
            'Too many failed login attempts. Your account has been temporarily locked for 5 minutes.',
        });
      }

      throw new UnauthorizedException({
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password.',
      });
    }

    // If password matches but account was inactive or locked, ensure it is activated and unlocked
    if (!user.isActive || (user.failedLoginAttempts || 0) > 0 || user.lockedUntil) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { isActive: true, failedLoginAttempts: 0, lockedUntil: null },
      });
      user.isActive = true;
    }

    // Clear any previous session revocation cache for this user
    this.sessionSecurity?.clearUserRevocation(user.id);

    // Auto-provision canonical default permissions for the role
    const permissions = await this.usersService.ensureDefaultPermissions(
      user.role.id,
      user.role.code,
    );

    const sessionId = randomUUID();
    const tokens = await this.getTokens(
      user.id,
      user.email,
      user.role.code,
      user.companyId,
      sessionId,
    );
    await this.updateRefreshToken(
      user.id,
      tokens.refreshToken,
      ipAddress,
      userAgent,
      sessionId,
    );
    this.sessionSecurity?.recordSessionActive(sessionId);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role.code,
        companyId: user.companyId,
        permissions,
      },
    };
  }

  async logout(
    userId: string,
    refreshToken?: string,
    accessToken?: string,
  ): Promise<{ success: boolean }> {
    let resolvedUserId = userId;
    let resolvedSid: string | undefined;

    if (accessToken) {
      const decodedAccess = this.jwtService.decode<any>(accessToken);
      if (decodedAccess?.sid) resolvedSid = decodedAccess.sid;
      if (!resolvedUserId && decodedAccess?.sub) resolvedUserId = decodedAccess.sub;
    }

    if (refreshToken) {
      const decodedRefresh = this.jwtService.decode<any>(refreshToken);
      if (!resolvedSid && decodedRefresh?.sid) resolvedSid = decodedRefresh.sid;
      if (!resolvedUserId && decodedRefresh?.sub) resolvedUserId = decodedRefresh.sub;
    }

    if (resolvedSid) {
      await this.prisma.refreshSession
        .updateMany({
          where: { id: resolvedSid, revokedAt: null },
          data: { revokedAt: new Date() },
        })
        .catch(() => {});
      this.sessionSecurity?.markSessionRevoked(resolvedSid);
    }

    if (resolvedUserId && refreshToken) {
      const hashedTokens = await this.prisma.refreshSession.findMany({
        where: { userId: resolvedUserId, revokedAt: null },
      });

      for (const session of hashedTokens) {
        const isMatch = await compareAsync(refreshToken, session.tokenHash).catch(
          () => false,
        );
        if (isMatch) {
          await this.prisma.refreshSession.update({
            where: { id: session.id },
            data: { revokedAt: new Date() },
          });
          this.sessionSecurity?.markSessionRevoked(session.id);
        }
      }
    }
    return { success: true };
  }

  async refreshTokens(
    userId: string,
    refreshToken: string | undefined,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    if (!refreshToken) {
      throw new UnauthorizedException('Access Denied');
    }

    let resolvedUserId = userId;
    if (!resolvedUserId) {
      const decoded = this.jwtService.decode<any>(refreshToken);
      resolvedUserId = decoded?.sub;
    }
    if (!resolvedUserId) {
      throw new UnauthorizedException('Access Denied');
    }

    const user = await this.usersService.findById(resolvedUserId);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Access Denied');
    }

    const now = new Date();
    const hashedTokens = await this.prisma.refreshSession.findMany({
      where: { userId: resolvedUserId, revokedAt: null, expiresAt: { gt: now } },
    });

    let matchedSession: RefreshSession | null = null;
    for (const session of hashedTokens) {
      const isMatch = await compareAsync(refreshToken, session.tokenHash).catch(
        () => false,
      );
      if (isMatch) {
        matchedSession = session;
        break;
      }
    }

    if (!matchedSession) {
      throw new UnauthorizedException({
        code: 'SESSION_REVOKED',
        message: 'Your session is no longer active. Please sign in again.',
      });
    }

    await this.prisma.refreshSession.update({
      where: { id: matchedSession.id },
      data: { revokedAt: now },
    });
    this.sessionSecurity?.markSessionRevoked(matchedSession.id);

    const nextSessionId = randomUUID();
    const tokens = await this.getTokens(
      user.id,
      user.email,
      user.role.code,
      user.companyId,
      nextSessionId,
    );
    await this.updateRefreshToken(
      user.id,
      tokens.refreshToken,
      ipAddress,
      userAgent,
      nextSessionId,
    );
    this.sessionSecurity?.recordSessionActive(nextSessionId);

    return tokens;
  }

  async getTokens(
    userId: string,
    email: string,
    role: string,
    companyId: string,
    sessionId?: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const accessSecret =
      this.configService.get<string>('jwt.accessSecret') || 'secret';
    const accessExpiresIn = (this.configService.get<string>(
      'jwt.accessExpiresIn',
    ) || '30d') as unknown as number;
    const refreshSecret =
      this.configService.get<string>('jwt.refreshSecret') || 'secret';
    const refreshExpiresIn = (this.configService.get<string>(
      'jwt.refreshExpiresIn',
    ) || '30d') as unknown as number;
    const sid = sessionId || randomUUID();

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email, role, companyId, sid },
        {
          secret: accessSecret,
          expiresIn: accessExpiresIn,
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
          role,
          companyId,
          sid,
          jti: randomUUID(),
        },
        {
          secret: refreshSecret,
          expiresIn: refreshExpiresIn,
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async updateRefreshToken(
    userId: string,
    refreshToken: string,
    ipAddress?: string,
    userAgent?: string,
    sessionId?: string,
  ): Promise<void> {
    const rounds = this.configService.get<number>('bcryptRounds') || 12;
    const tokenHash = await hashAsync(refreshToken, rounds);

    const decoded = this.jwtService.decode<JwtPayload>(refreshToken);
    const exp = decoded?.exp
      ? decoded.exp * 1000
      : Date.now() + 30 * 24 * 60 * 60 * 1000;
    const expiresAt = new Date(exp);

    await this.prisma.refreshSession.create({
      data: {
        ...(sessionId ? { id: sessionId } : {}),
        userId,
        tokenHash,
        expiresAt,
        ipAddress,
        userAgent,
      },
    });
  }

  async requestPasswordReset(email: string): Promise<void> {
    const user = await this.usersService.findByEmail(email);
    if (!user) return;
  }

  confirmPasswordReset(token: string, newPassword: string): Promise<void> {
    void token;
    void newPassword;
    return Promise.resolve();
  }

  async unlockAccount(userId: string): Promise<void> {
    const user = await this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException('User not found');
    await this.prisma.user.update({
      where: { id: userId },
      data: { failedLoginAttempts: 0, lockedUntil: null },
    });
  }

  async createElevationSession(
    userId: string,
    password: string,
  ): Promise<{ elevationToken: string; expiresAt: Date }> {
    const user = await this.usersService.findById(userId);
    if (!user || !user.isActive)
      throw new UnauthorizedException('User not found');

    const isMatch = await compareAsync(password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    const sessionId = randomUUID();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    const accessSecret =
      this.configService.get<string>('jwt.accessSecret') || 'secret';
    const elevationToken = await this.jwtService.signAsync(
      { sub: userId, jti: sessionId },
      {
        secret: accessSecret,
        expiresIn: '15m',
      },
    );

    const tokenHash = await hashAsync(elevationToken, 12);
    await this.prisma.elevationSession.create({
      data: {
        id: sessionId,
        userId,
        tokenHash,
        expiresAt,
      },
    });

    return { elevationToken, expiresAt };
  }
}
