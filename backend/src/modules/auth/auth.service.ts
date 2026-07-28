import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../database/prisma.service';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private usersService: UsersService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && user.isActive) {
      const isMatch = await bcrypt.compare(pass, user.password);
      if (isMatch) {
        const { password, ...result } = user;
        return result;
      }
    }
    return null;
  }

  async login(loginDto: LoginDto, ipAddress?: string, userAgent?: string) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.getTokens(user.id, user.email, user.role.code, user.companyId);
    await this.updateRefreshToken(
      user.id,
      tokens.refreshToken,
      ipAddress,
      userAgent,
    );

    // Map permissions
    const permissions = user.role.rolePermissions.map(
      (rp: any) => rp.permission.code,
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

  async logout(userId: string, refreshToken: string) {
    // Revoke the specific refresh session
    const hashedTokens = await this.prisma.refreshSession.findMany({
      where: { userId, revokedAt: null },
    });

    for (const session of hashedTokens) {
      const isMatch = await bcrypt.compare(refreshToken, session.tokenHash);
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
    refreshToken: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const user = await this.usersService.findById(userId);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Access Denied');
    }

    const hashedTokens = await this.prisma.refreshSession.findMany({
      where: { userId, revokedAt: null },
    });

    let matchedSession: any = null;
    for (const session of hashedTokens) {
      const isMatch = await bcrypt.compare(refreshToken, session.tokenHash);
      if (isMatch) {
        matchedSession = session;
        break;
      }
    }

    if (!matchedSession) {
      throw new UnauthorizedException('Access Denied');
    }

    // Revoke old session (Rotation)
    await this.prisma.refreshSession.update({
      where: { id: matchedSession.id },
      data: { revokedAt: new Date() },
    });

    const tokens = await this.getTokens(user.id, user.email, user.role.code, user.companyId);
    await this.updateRefreshToken(
      user.id,
      tokens.refreshToken,
      ipAddress,
      userAgent,
    );

    return tokens;
  }

  async getTokens(userId: string, email: string, role: string, companyId: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email, role, companyId },
        {
          secret: this.configService.get<string>('jwt.accessSecret') as string,
          expiresIn: this.configService.get<string>(
            'jwt.accessExpiresIn',
          ) as any,
        },
      ),
      this.jwtService.signAsync(
        { sub: userId, email, role, companyId },
        {
          secret: this.configService.get<string>('jwt.refreshSecret') as string,
          expiresIn: this.configService.get<string>(
            'jwt.refreshExpiresIn',
          ) as any,
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
  ) {
    const tokenHash = await bcrypt.hash(
      refreshToken,
      this.configService.get<number>('bcryptRounds') || 12,
    );

    // Parse expiry from JWT payload to set exact expiry date in DB
    const decoded = this.jwtService.decode(refreshToken);
    const expiresAt = new Date(decoded.exp * 1000);

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
}
