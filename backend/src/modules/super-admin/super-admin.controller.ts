import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Res } from '@nestjs/common';
import { SuperAdminService } from './super-admin.service';
import { CentralizedReportQueryDto } from './dto/centralized-report-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller(['admin', 'super-admin', 'backend/admin', 'backend/super-admin'])
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Super Admin', 'Admin', 'SUPER_ADMIN', 'ADMIN')
export class SuperAdminController {
  constructor(private readonly superAdminService: SuperAdminService) {}

  @Get('dashboard')
  async getDashboard(@Query() query: any) {
    return this.superAdminService.getDashboardStats(query);
  }

  @Get('dashboard-stats')
  async getDashboardStats(@Query() query: any) {
    return this.superAdminService.getDashboardStats(query);
  }

  @Get('executive-command-center')
  async getExecutiveCommandCenter(@Query() query: any, @CurrentUser() user: any) {
    return this.superAdminService.getExecutiveCommandCenter(query, user.companyId);
  }

  @Get('analytics/production')
  async getProductionAnalytics(@Query() query: any, @CurrentUser() user: any) {
    return this.superAdminService.getProductionAnalytics(query, user.companyId);
  }

  @Get('analytics/inventory')
  async getInventoryAnalytics(@Query() query: any, @CurrentUser() user: any) {
    return this.superAdminService.getInventoryAnalytics(query, user.companyId);
  }

  @Get('reports')
  async getCentralizedReports(@Query() query: CentralizedReportQueryDto, @CurrentUser() user: any) {
    return this.superAdminService.getCentralizedReports(query, user.companyId);
  }

  @Get('reports/export/csv')
  async exportCentralizedReportsCsv(
    @Query() query: CentralizedReportQueryDto,
    @CurrentUser() user: any,
    @Res() res: any,
  ) {
    const result = await this.superAdminService.exportCentralizedReportsCsv(query, user.companyId);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    return res.send(result.content);
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
