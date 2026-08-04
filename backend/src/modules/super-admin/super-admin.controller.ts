import { Controller, Get, UseGuards } from '@nestjs/common';
import { SuperAdminService } from './super-admin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller(['admin', 'super-admin', 'backend/admin', 'backend/super-admin'])
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Super Admin', 'Admin', 'SUPER_ADMIN', 'ADMIN')
export class SuperAdminController {
  constructor(private readonly superAdminService: SuperAdminService) {}

  @Get('dashboard-stats')
  async getDashboardStats() {
    return this.superAdminService.getDashboardStats();
  }

  @Get('user-types')
  async getUserTypes() {
    return this.superAdminService.getUserTypes();
  }

  @Get('permissions/catalog')
  async getPermissionsCatalog() {
    return this.superAdminService.getPermissionsCatalog();
  }
}
