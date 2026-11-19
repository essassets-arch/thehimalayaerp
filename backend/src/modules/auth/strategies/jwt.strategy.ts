import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (request: any) => {
          return (
            request?.query?.token ||
            request?.cookies?.token ||
            request?.cookies?.accessToken ||
            request?.cookies?.himalaya_token ||
            null
          );
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.accessSecret'),
    });
  }

  async validate(payload: any) {
    if (payload.jti) {
      throw new UnauthorizedException(
        'Elevation token cannot be used for standard authentication',
      );
    }

    if (payload.sub) {
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, isActive: true, roleId: true, companyId: true },
      });

      if (!user) {
        throw new UnauthorizedException('User record does not exist');
      }

      if (!user.isActive) {
        throw new UnauthorizedException('User account has been deactivated');
      }
    }

    return payload; // Attached to request.user
  }
}
