import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';

@Controller(['users', 'admin/users', 'backend/admin/users', 'backend/users'])
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @RequirePermissions(
    'user.read',
    'finance.read',
    'admin.read',
    'hr.read',
    'store.read',
    'super-admin.read',
    'plant.read',
  )
  async findAll(@Req() req: any) {
    const rawRole =
      typeof req?.user?.role === 'object' && req?.user?.role !== null
        ? req.user.role.code || req.user.role.name || ''
        : req?.user?.role || '';
    const normalizedRole = String(rawRole)
      .trim()
      .toUpperCase()
      .replace(/[\s-]+/g, '_');

    // Field/Sales roles must never enumerate the company-wide admin user directory
    if (
      normalizedRole === 'SALES' ||
      normalizedRole.startsWith('SALES_EXEC') ||
      normalizedRole === 'EMPLOYEE' ||
      normalizedRole === 'QC_INSPECTOR' ||
      normalizedRole === 'PRODUCTION_OPERATOR'
    ) {
      throw new ForbiddenException(
        'Access Denied: Insufficient privileges to list user directory.',
      );
    }

    return this.usersService.findAll();
  }

  @Get('roles')
  @RequirePermissions(
    'user.read',
    'admin.read',
    'hr.read',
    'super-admin.read',
    'finance.read',
  )
  async getRoles(@Req() req: any) {
    const rawRole =
      typeof req?.user?.role === 'object' && req?.user?.role !== null
        ? req.user.role.code || req.user.role.name || ''
        : req?.user?.role || '';
    const normalizedRole = String(rawRole)
      .trim()
      .toUpperCase()
      .replace(/[\s-]+/g, '_');
    if (
      normalizedRole === 'SALES' ||
      normalizedRole.startsWith('SALES_EXEC') ||
      normalizedRole === 'EMPLOYEE'
    ) {
      throw new ForbiddenException(
        'Access Denied: Insufficient privileges to view system roles.',
      );
    }
    return this.usersService.getRoles();
  }

  @Post()
  @RequirePermissions('user.create')
  async create(@Body() body: any) {
    return this.usersService.create(body);
  }

  @Put(':id')
  @RequirePermissions('user.update')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.usersService.update(id, body);
  }

  @Post(':id/reset-password')
  @RequirePermissions('user.update', 'admin.users.manage', 'super-admin.read')
  async resetPassword(
    @Param('id') id: string,
    @Body() body: { new_password?: string; newPassword?: string },
    @Req() req: any,
  ) {
    const rawRole =
      typeof req?.user?.role === 'object' && req?.user?.role !== null
        ? req.user.role.code || req.user.role.name || ''
        : req?.user?.role || '';
    const normalizedRole = String(rawRole)
      .trim()
      .toUpperCase()
      .replace(/[\s-]+/g, '_');

    if (normalizedRole !== 'SUPER_ADMIN') {
      throw new ForbiddenException(
        'Only Super Admin is authorized to reset user passwords.',
      );
    }

    const passwordValue = body?.new_password ?? body?.newPassword ?? '';
    const actorUserId = req?.user?.sub || req?.user?.id || null;
    return this.usersService.resetPassword(id, passwordValue, actorUserId);
  }

  @Post(':id/toggle-status')
  @RequirePermissions('user.update')
  async toggleStatus(@Param('id') id: string, @Body('status') status: string) {
    const isActive =
      status === 'Active' || status === 'true' || status === 'active';
    return this.usersService.toggleStatus(id, isActive);
  }

  @Delete(':id')
  @RequirePermissions('user.delete')
  async deleteUser(@Param('id') id: string) {
    return this.usersService.delete(id);
  }
}
