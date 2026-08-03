import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import {
  Controller,
  Post,
  Body,
  Req,
  Res,
  Get,
  UseGuards,
  Param,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Public } from '../../common/decorators/public.decorator';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ElevationGuard } from '../../common/guards/elevation.guard';
import { Throttle } from '@nestjs/throttler';
import {
  AuthenticatedUser,
  AuthenticatedRequest,
} from '../../common/types/security.types';

const loginLimit = (process.env.NODE_ENV === 'test' || process.env.DATABASE_URL?.includes('_browser_test')) ? 1000 : 5;

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Throttle({ default: { limit: loginLimit, ttl: 60000 } })
  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    const userAgent = req.headers['user-agent'];
    const ip = (req.headers['x-forwarded-for'] as string) || req.ip;

    const result = await this.authService.login(loginDto, userAgent, ip);

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/auth/refresh',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      accessToken: result.accessToken,
      user: result.user,
    };
  }

  @Public()
  @UseGuards(JwtRefreshGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('refresh')
  async refreshTokens(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const cookies = (req as Request & { cookies?: Record<string, string> })
      .cookies;
    const refreshToken = cookies?.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token missing from cookie');
    }

    const userAgent = req.headers['user-agent'];
    const ip = (req.headers['x-forwarded-for'] as string) || req.ip;

    const result = await this.authService.refreshTokens(
      refreshToken,
      userAgent,
      ip,
    );

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/auth/refresh',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { accessToken: result.accessToken };
  }

  @Public()
  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const reqWithMeta = req as Request & {
      cookies?: Record<string, string>;
      user?: AuthenticatedUser;
    };
    const refreshToken = reqWithMeta.cookies?.refreshToken;
    if (refreshToken) {
      await this.authService.logout(reqWithMeta.user?.sub || '', refreshToken);
    }

    res.clearCookie('refreshToken', {
      httpOnly: true,
      path: '/auth/refresh',
    });

    return { success: true };
  }

  @RequirePermissions('admin.auth.read')
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@CurrentUser() user: Record<string, unknown>) {
    return user;
  }

  @Public()
  @Throttle({ default: { limit: 3, ttl: 3600000 } })
  @Post('forgot-password')
  async forgotPassword(@Body() dto: { email: string }) {
    await this.authService.requestPasswordReset(dto.email);
    return {
      success: true,
      message: 'If the email exists, a reset link has been sent.',
    };
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('reset-password')
  async resetPassword(@Body() dto: { token: string; newPassword: string }) {
    await this.authService.confirmPasswordReset(dto.token, dto.newPassword);
    return { success: true };
  }

  @RequirePermissions('admin.users.unlock')
  @UseGuards(JwtAuthGuard, ElevationGuard)
  @Post('unlock/:userId')
  async unlockAccount(@Param('userId') userId: string) {
    await this.authService.unlockAccount(userId);
    return { success: true, message: 'Account unlocked successfully.' };
  }

  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post('elevate')
  async elevate(
    @Body() dto: { password: string },
    @Req() req: Record<string, unknown>,
  ) {
    const authenticatedReq = req as unknown as AuthenticatedRequest;
    return this.authService.createElevationSession(
      authenticatedReq.user.sub,
      dto.password,
    );
  }
}
