import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UseGuards, Controller, Get, Param, Req } from '@nestjs/common';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CrmInsightsService } from './crm-insights.service';

@Controller()
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class CrmInsightsController {
  constructor(private readonly insights: CrmInsightsService) {}

  @Get('customers/:id/360')
  @RequirePermissions('sales.customers.read')
  customer360(@Param('id') id: string, @Req() req: any) {
    return this.insights.customer360(
      id,
      req.user?.companyId,
      req.user?.sub,
      req.user?.role,
    );
  }

  @Get('sales/dashboard')
  @RequirePermissions('sales.dashboard.read')
  salesDashboard(@Req() req: any) {
    return this.insights.salesDashboard(
      req.user?.companyId,
      req.user?.sub,
      req.user?.role,
    );
  }
}
