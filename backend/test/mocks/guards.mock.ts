import { CanActivate, ExecutionContext } from '@nestjs/common';
import { AuthenticatedUser } from '../../src/common/types/security.types';

export class MockJwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    req.user = mockAuthenticatedUser;
    return true;
  }
}

export class MockPermissionsGuard implements CanActivate {
  canActivate(): boolean {
    return true;
  }
}

export class MockElevationGuard implements CanActivate {
  canActivate(): boolean {
    return true;
  }
}

export class MockRolesGuard implements CanActivate {
  canActivate(): boolean {
    return true;
  }
}

export const mockAuthenticatedUser: AuthenticatedUser = {
  sub: 'usr-test-123',
  email: 'test@himalayaerp.com',
  roleId: 'role-admin-123',
  roleName: 'SUPER_ADMIN',
  companyId: 'comp-123',
  permissions: ['*'],
};
