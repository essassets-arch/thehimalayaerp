import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      // Development bypass to allow testing without real JWT login
      if (process.env.NODE_ENV === 'development') {
        return { 
          id: '793da9af-478b-4774-a42f-eaa13d0e8cf9', // Mock User ID from DB
          sub: '793da9af-478b-4774-a42f-eaa13d0e8cf9', // Required by PermissionsGuard
          role: 'SUPER_ADMIN', // Satisfies RolesGuard + bypasses permission checks
          companyId: 'd039cfa4-e78b-4138-adfc-1b0f14cffa91', // Seeded company
        };
      }
      throw err || new UnauthorizedException('Authentication required');
    }
    return user;
  }
}
