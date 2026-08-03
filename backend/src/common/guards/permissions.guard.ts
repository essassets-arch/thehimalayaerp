import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { PrismaService } from '../../database/prisma.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { IS_OPTIONAL_AUTH_KEY } from '../decorators/optional-auth.decorator';

interface UserPayload {
  sub?: string;
  role?: string;
  permissions?: string[];
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const isOptional = this.reflector.getAllAndOverride<boolean>(
      IS_OPTIONAL_AUTH_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (isPublic) {
      return true;
    }

    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    const req = context.switchToHttp().getRequest<{ user?: UserPayload }>();
    const user = req.user;

    if (!requiredPermissions || requiredPermissions.length === 0) {
      if (isOptional) return true;
      if (!user || !user.sub) {
        throw new ForbiddenException('Authentication required');
      }
      return true;
    }

    if (!user || !user.sub) {
      if (isOptional) return true;
      throw new ForbiddenException('Insufficient permissions');
    }

    if (user.role === 'SUPER_ADMIN') {
      return true;
    }

    if (user.permissions && Array.isArray(user.permissions)) {
      const hasPermission = requiredPermissions.every((perm) =>
        user.permissions?.includes(perm),
      );
      if (hasPermission) return true;
    }

    const userRole = await this.prisma.role.findUnique({
      where: { code: user.role || '' },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    if (!userRole) {
      throw new ForbiddenException('Role not found');
    }

    const userPermissions = userRole.rolePermissions.map(
      (rp) => rp.permission.code,
    );

    const hasPermission = requiredPermissions.every((perm) =>
      userPermissions.includes(perm),
    );

    if (!hasPermission) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
