import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { FinanceReportsService } from './finance-reports.service';

@Controller(['reports/finance', 'finance/reports', 'backend/reports/finance'])
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class FinanceReportsController {
  constructor(private readonly service: FinanceReportsService) {}

  @Get('revenue-expense')
  @RequirePermissions('finance.reports.read')
  @Roles(
    'FINANCE',
    'FINANCE_MANAGER',
    'FINANCE_EXECUTIVE',
    'ADMIN',
    'SUPER_ADMIN',
    'SUPERADMIN',
  )
  async getRevenueExpense(
    @Query('date_from') dateFrom: string,
    @Query('date_to') dateTo: string,
    @Req() req: any,
  ) {
    const rawRole = req.user?.role;
    const roleCode =
      typeof rawRole === 'string'
        ? rawRole
        : rawRole?.code || rawRole?.name || '';
    const isSuperAdmin =
      roleCode.toUpperCase().includes('SUPER_ADMIN') ||
      roleCode.toUpperCase().includes('ADMIN');
    const targetCompanyId = isSuperAdmin ? undefined : req.user?.companyId;

    return this.service.getRevenueExpense(dateFrom, dateTo, targetCompanyId);
  }

  @Get('cash-flow')
  @RequirePermissions('finance.reports.read')
  @Roles(
    'FINANCE',
    'FINANCE_MANAGER',
    'FINANCE_EXECUTIVE',
    'ADMIN',
    'SUPER_ADMIN',
    'SUPERADMIN',
  )
  async getCashFlow(
    @Query('date_from') dateFrom: string,
    @Query('date_to') dateTo: string,
    @Req() req: any,
  ) {
    const rawRole = req.user?.role;
    const roleCode =
      typeof rawRole === 'string'
        ? rawRole
        : rawRole?.code || rawRole?.name || '';
    const isSuperAdmin =
      roleCode.toUpperCase().includes('SUPER_ADMIN') ||
      roleCode.toUpperCase().includes('ADMIN');
    const targetCompanyId = isSuperAdmin ? undefined : req.user?.companyId;

    return this.service.getCashFlow(dateFrom, dateTo, targetCompanyId);
  }
}
