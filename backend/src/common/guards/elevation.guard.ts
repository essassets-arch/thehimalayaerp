import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import {
  ElevationTokenPayload,
  AuthenticatedRequest,
} from '../types/security.types';

@Injectable()
export class ElevationGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<any>();
    const headerVal = request.headers?.['x-elevation-token'];
    const elevationToken = Array.isArray(headerVal) ? headerVal[0] : headerVal;

    if (!elevationToken) {
      throw new UnauthorizedException(
        'Elevation token is required for this action',
      );
    }

    try {
      const decoded =
        this.jwtService.verify<ElevationTokenPayload>(elevationToken);
      if (!decoded.jti || !request.user?.sub) {
        throw new UnauthorizedException('Invalid elevation token payload');
      }

      const session = await this.prisma.elevationSession.findUnique({
        where: { id: decoded.jti },
      });

      if (
        !session ||
        session.expiresAt < new Date() ||
        session.userId !== request.user.sub
      ) {
        throw new UnauthorizedException('Invalid or expired elevation session');
      }

      return true;
    } catch (error: unknown) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid elevation token');
    }
  }
}
