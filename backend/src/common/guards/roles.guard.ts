import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

interface RequestWithRole {
  user?: {
    role?: string;
  };
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest<RequestWithRole>();

    if (!user || !user.role) {
      throw new ForbiddenException('Insufficient role privileges');
    }

    const normalizedRole = String(user.role || '').toUpperCase().replace(/[\s-]+/g, '_');
    if (['SUPER_ADMIN', 'ADMIN'].includes(normalizedRole)) {
      return true;
    }

    const normalizedRequired = requiredRoles.map(r => String(r || '').toUpperCase().replace(/[\s-]+/g, '_'));
    const hasRole = normalizedRequired.includes(normalizedRole);
    if (!hasRole) {
      throw new ForbiddenException('Insufficient role privileges');
    }

    return true;
  }
}
