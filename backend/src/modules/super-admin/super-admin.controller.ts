import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
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

  @Get('companies')
  async getCompanies() {
    return this.superAdminService.getCompanies();
  }

  @Post('companies')
  async createCompany(@Body() body: any) {
    return this.superAdminService.createCompany(body);
  }

  @Put('companies/:id')
  async updateCompany(@Param('id') id: string, @Body() body: any) {
    return this.superAdminService.updateCompany(id, body);
  }

  @Delete('companies/:id')
  async deleteCompany(@Param('id') id: string) {
    return this.superAdminService.deleteCompany(id);
  }

  @Get('roles')
  async getRoles() {
    return this.superAdminService.getRoles();
  }
}
