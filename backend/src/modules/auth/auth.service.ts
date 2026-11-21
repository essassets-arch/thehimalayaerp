import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { compare, hash } from 'bcrypt';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../database/prisma.service';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from '../../common/types/security.types';
import { RefreshSession } from '@prisma/client';

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
    const user = await this.usersService.findByEmail(loginDto.email);

    if (!user || !user.isActive) {
      throw new UnauthorizedException({
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password.',
      });
    }

    const now = new Date();

    if (user.lockedUntil && now < user.lockedUntil) {
      const retryAfterSeconds = Math.max(
        1,
        Math.ceil((user.lockedUntil.getTime() - now.getTime()) / 1000),
      );
      throw new UnauthorizedException({
        code: 'ACCOUNT_LOCKED',
        message: `Account is temporarily locked due to too many failed attempts. Please try again in ${formatWaitDuration(retryAfterSeconds)}.`,
        retryAfterSeconds,
        lockedUntil: user.lockedUntil.toISOString(),
        attemptsRemaining: 0,
        maxAttempts: MAX_FAILED_LOGIN_ATTEMPTS,
      });
    }

    // Strict bcrypt verification solely against the stored database hash
    const isMatch = user.password
      ? await compareAsync(loginDto.password, user.password).catch(() => false)
      : false;

    if (!isMatch) {
      // If a previous lockout window has already expired, start a fresh counter
      const priorExpired = Boolean(user.lockedUntil && now >= user.lockedUntil);
      const baseAttempts = priorExpired ? 0 : user.failedLoginAttempts || 0;
      const attempts = baseAttempts + 1;
      const attemptsRemaining = Math.max(0, MAX_FAILED_LOGIN_ATTEMPTS - attempts);

      const dataToUpdate: {
        failedLoginAttempts: number;
        lockedUntil?: Date | null;
      } = {
        failedLoginAttempts: attempts,
        ...(priorExpired ? { lockedUntil: null } : {}),
      };

      if (attempts >= MAX_FAILED_LOGIN_ATTEMPTS) {
        const lockedUntil = new Date(now.getTime() + ACCOUNT_LOCKOUT_DURATION_MS);
        const retryAfterSeconds = Math.ceil(ACCOUNT_LOCKOUT_DURATION_MS / 1000);
        dataToUpdate.lockedUntil = lockedUntil;

        await this.prisma.user.update({
          where: { id: user.id },
          data: dataToUpdate,
        });

        throw new UnauthorizedException({
          code: 'ACCOUNT_LOCKED',
          message: `Too many failed login attempts (${MAX_FAILED_LOGIN_ATTEMPTS}/${MAX_FAILED_LOGIN_ATTEMPTS}). Your account is locked for ${formatWaitDuration(retryAfterSeconds)}.`,
          retryAfterSeconds,
          lockedUntil: lockedUntil.toISOString(),
          attemptsRemaining: 0,
          maxAttempts: MAX_FAILED_LOGIN_ATTEMPTS,
        });
      }

      await this.prisma.user.update({
        where: { id: user.id },
        data: dataToUpdate,
      });

      let message: string;
      if (attemptsRemaining === 1) {
        message =
          'Invalid email or password. FINAL WARNING: 1 attempt left — one more wrong password will lock your account for 5 minutes.';
      } else if (attemptsRemaining <= 3) {
        message = `Invalid email or password. Warning: Only ${attemptsRemaining} attempts left before your account is locked for 5 minutes.`;
      } else {
        message = `Invalid email or password. (${attemptsRemaining} of ${MAX_FAILED_LOGIN_ATTEMPTS} attempts remaining before a 5-minute lock.)`;
      }

      throw new UnauthorizedException({
        code: 'INVALID_CREDENTIALS',
        message,
        attemptsRemaining,
        maxAttempts: MAX_FAILED_LOGIN_ATTEMPTS,
      });
    }

    if ((user.failedLoginAttempts || 0) > 0 || user.lockedUntil) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { failedLoginAttempts: 0, lockedUntil: null },
      });
    }

    // Auto-provision canonical default permissions for the role
    const permissions = await this.usersService.ensureDefaultPermissions(
      user.role.id,
      user.role.code,
    );

    const tokens = await this.getTokens(
      user.id,
      user.email,
      user.role.code,
      user.companyId,
    );
    await this.updateRefreshToken(
      user.id,
      tokens.refreshToken,
      ipAddress,
      userAgent,
    );

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
    refreshToken: string,
  ): Promise<{ success: boolean }> {
    const hashedTokens = await this.prisma.refreshSession.findMany({
      where: { userId, revokedAt: null },
    });

    for (const session of hashedTokens) {
      const isMatch = await compareAsync(refreshToken, session.tokenHash);
      if (isMatch) {
        await this.prisma.refreshSession.update({
          where: { id: session.id },
          data: { revokedAt: new Date() },
        });
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

    const user = await this.usersService.findById(userId);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Access Denied');
    }

    const hashedTokens = await this.prisma.refreshSession.findMany({
      where: { userId, revokedAt: null },
    });

    let matchedSession: RefreshSession | null = null;
    for (const session of hashedTokens) {
      const isMatch = await compareAsync(refreshToken, session.tokenHash);
      if (isMatch) {
        matchedSession = session;
        break;
      }
    }

    if (!matchedSession) {
      throw new UnauthorizedException('Access Denied');
    }

    await this.prisma.refreshSession.update({
      where: { id: matchedSession.id },
      data: { revokedAt: new Date() },
    });

    const tokens = await this.getTokens(
      user.id,
      user.email,
      user.role.code,
      user.companyId,
    );
    await this.updateRefreshToken(
      user.id,
      tokens.refreshToken,
      ipAddress,
      userAgent,
    );

    return tokens;
  }

  async getTokens(
    userId: string,
    email: string,
    role: string,
    companyId: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const accessSecret =
      this.configService.get<string>('jwt.accessSecret') || 'secret';
    const accessExpiresIn = (this.configService.get<string>(
      'jwt.accessExpiresIn',
    ) || '15m') as unknown as number;
    const refreshSecret =
      this.configService.get<string>('jwt.refreshSecret') || 'secret';
    const refreshExpiresIn = (this.configService.get<string>(
      'jwt.refreshExpiresIn',
    ) || '7d') as unknown as number;

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email, role, companyId },
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
  ): Promise<void> {
    const rounds = this.configService.get<number>('bcryptRounds') || 12;
    const tokenHash = await hashAsync(refreshToken, rounds);

    const decoded = this.jwtService.decode<JwtPayload>(refreshToken);
    const exp = decoded?.exp
      ? decoded.exp * 1000
      : Date.now() + 7 * 24 * 60 * 60 * 1000;
    const expiresAt = new Date(exp);

    await this.prisma.refreshSession.create({
      data: {
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
