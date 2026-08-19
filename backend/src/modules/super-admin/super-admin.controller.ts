import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Res, ForbiddenException, BadRequestException } from '@nestjs/common';
import { SuperAdminService } from './super-admin.service';
import { CentralizedReportQueryDto } from './dto/centralized-report-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { LocationService } from '../location/location.service';

@Controller(['admin', 'super-admin', 'backend/admin', 'backend/super-admin'])
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Super Admin', 'Admin', 'SUPER_ADMIN', 'ADMIN')
export class SuperAdminController {
  constructor(
    private readonly superAdminService: SuperAdminService,
    private readonly locationService: LocationService,
  ) {}

  @Get('live-users')
  @Roles(
    'Super Admin',
    'Admin',
    'SUPER_ADMIN',
    'ADMIN',
    'Sales Executive',
    'SALES_EXECUTIVE',
    'Sales Manager',
    'SALES_MANAGER',
    'Sales',
    'Super Sales',
    'SUPER_SALES',
    'SUPERSALES',
    'HR',
    'HR_MANAGER',
    'HR_EXECUTIVE',
    'Plant Head',
    'PLANT_HEAD',
    'PLANTHEAD',
    'Store Manager',
    'STORE_MANAGER',
    'STORE',
    'Finance Manager',
    'FINANCE_MANAGER',
    'FINANCE',
    'FINANCE_EXECUTIVE',
    'Purchase Manager',
    'PURCHASE_MANAGER',
    'Production Manager',
    'PRODUCTION_MANAGER',
    'Production Planner',
    'PRODUCTION_PLANNER',
    'Production Operator',
    'PRODUCTION_OPERATOR',
    'Dispatch Executive',
    'DISPATCH_EXECUTIVE',
    'DISPATCH_2',
    'DISPATCH',
    'QC Inspector',
    'QC_INSPECTOR',
  )
  async getLiveUsers(@CurrentUser() user: any) {
    const hasAccess = await this.locationService.hasMapPermission(user.sub);
    if (!hasAccess) {
      throw new ForbiddenException('Access Denied: Insufficient permissions to view the Live User Map.');
    }

    return this.locationService.getLiveUsers(user.companyId);
  }

  @Get('live-users/:userId/location-history')
  @Roles(
    'Super Admin',
    'Admin',
    'SUPER_ADMIN',
    'ADMIN',
    'Sales Executive',
    'SALES_EXECUTIVE',
    'Sales Manager',
    'SALES_MANAGER',
    'Sales',
    'Super Sales',
    'SUPER_SALES',
    'SUPERSALES',
    'HR',
    'HR_MANAGER',
    'HR_EXECUTIVE',
    'Plant Head',
    'PLANT_HEAD',
    'PLANTHEAD',
    'Store Manager',
    'STORE_MANAGER',
    'STORE',
    'Finance Manager',
    'FINANCE_MANAGER',
    'FINANCE',
    'FINANCE_EXECUTIVE',
    'Purchase Manager',
    'PURCHASE_MANAGER',
    'Production Manager',
    'PRODUCTION_MANAGER',
    'Production Planner',
    'PRODUCTION_PLANNER',
    'Production Operator',
    'PRODUCTION_OPERATOR',
    'Dispatch Executive',
    'DISPATCH_EXECUTIVE',
    'DISPATCH_2',
    'DISPATCH',
    'QC Inspector',
    'QC_INSPECTOR',
  )
  async getLocationHistory(
    @Param('userId') targetUserId: string,
    @Query('deviceSessionId') deviceSessionId?: string,
    @Query('date') dateQuery?: string,
    @Query('from') fromQuery?: string,
    @Query('to') toQuery?: string,
    @CurrentUser() user?: any,
  ) {
    const hasAccess = await this.locationService.hasHistoryPermission(user.sub);
    if (!hasAccess) {
      throw new ForbiddenException('Access Denied: Insufficient permissions to view location history.');
    }

    if (!deviceSessionId) {
      throw new BadRequestException('deviceSessionId query parameter is required.');
    }

    const hasDate = !!dateQuery;
    const hasRange = !!fromQuery && !!toQuery;

    if (hasDate && hasRange) {
      throw new BadRequestException('Provide either "date" OR ("from" and "to") parameters, not both.');
    }
    if ((fromQuery && !toQuery) || (!fromQuery && toQuery)) {
      throw new BadRequestException('Both "from" and "to" parameters must be provided for a custom date range.');
    }
    if (!hasDate && !hasRange) {
      throw new BadRequestException('Provide either "date" OR ("from" and "to") parameters.');
    }

    return this.locationService.getLocationHistory(
      user.companyId,
      targetUserId,
      deviceSessionId,
      dateQuery,
      fromQuery,
      toQuery,
    );
  }

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
