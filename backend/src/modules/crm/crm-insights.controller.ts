import { Controller, Get, Param, Req } from '@nestjs/common';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CrmInsightsService } from './crm-insights.service';

@Controller()
export class CrmInsightsController {
  constructor(private readonly insights: CrmInsightsService) {}

  @Get('customers/:id/360')
  @Permissions('sales.customers.read')
  customer360(@Param('id') id: string, @Req() req: any) {
    return this.insights.customer360(
      id,
      req.user?.companyId,
      req.user?.sub,
      req.user?.role,
    );
  }

  @Get('sales/dashboard')
  @Permissions('sales.dashboard.read')
  salesDashboard(@Req() req: any) {
    return this.insights.salesDashboard(
      req.user?.companyId,
      req.user?.sub,
      req.user?.role,
    );
  }
}
