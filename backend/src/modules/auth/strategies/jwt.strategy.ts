import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SessionSecurityService } from '../../../common/security/session-security.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private sessionSecurity: SessionSecurityService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (request: any) => {
          // Never extract JWTs from URL query strings (?token=) to prevent log/referrer leakage
          return (
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

    await this.sessionSecurity.validateAccessSession(payload);

    return payload; // Attached to request.user (including sid)
  }
}
