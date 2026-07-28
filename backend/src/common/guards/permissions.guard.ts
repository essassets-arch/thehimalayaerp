import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user || !user.sub) {
      throw new ForbiddenException('Insufficient permissions');
    }

    if (user.role === 'SUPER_ADMIN') {
      return true;
    }

    // Since we didn't attach permissions to the JWT payload (to keep it small),
    // we query the DB to verify permissions for the user's role.
    // Alternatively, we could get permissions from user object if we attach it in JwtStrategy by querying DB there.
    // Assuming JwtStrategy doesn't query DB to stay stateless/fast, we query here when needed.
    const userRole = await this.prisma.role.findUnique({
      where: { code: user.role },
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
      (rp: any) => rp.permission.code,
    );

    const hasPermission = requiredPermissions.every((perm) =>
      userPermissions.includes(perm),
    );

    console.log('[PermissionsGuard]', {
      email: user.email,
      role: user.role,
      required: requiredPermissions,
      hasPermission,
      missingPermissions: requiredPermissions.filter(p => !userPermissions.includes(p))
    });

    if (!hasPermission) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
