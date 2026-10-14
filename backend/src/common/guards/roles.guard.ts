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

    const rawRole =
      typeof user.role === 'object' && user.role !== null
        ? (user.role as any).code || (user.role as any).name || ''
        : user.role;

    let normalizedRole = String(rawRole || '')
      .toUpperCase()
      .replace(/[\s-]+/g, '_');
    if (
      normalizedRole.startsWith('SUPER_SALES') ||
      normalizedRole.startsWith('SUPERSALES')
    ) {
      normalizedRole = 'SUPER_SALES';
    } else if (
      normalizedRole.startsWith('SALES_EXEC') ||
      normalizedRole === 'SALES'
    ) {
      normalizedRole = 'SALES_EXECUTIVE';
    }

    if (['SUPER_ADMIN', 'ADMIN'].includes(normalizedRole)) {
      return true;
    }

    const normalizedRequired = requiredRoles.map((r) => {
      const nr = String(r || '')
        .toUpperCase()
        .replace(/[\s-]+/g, '_');
      if (nr.startsWith('SUPER_SALES') || nr.startsWith('SUPERSALES'))
        return 'SUPER_SALES';
      if (nr.startsWith('SALES_EXEC') || nr === 'SALES')
        return 'SALES_EXECUTIVE';
      return nr;
    });
    const hasRole = normalizedRequired.includes(normalizedRole);
    if (!hasRole) {
      throw new ForbiddenException('Insufficient role privileges');
    }

    return true;
  }
}
