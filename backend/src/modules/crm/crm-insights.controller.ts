import { Controller, Get, Param, Req } from '@nestjs/common';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CrmInsightsService } from './crm-insights.service';

@Controller()
export class CrmInsightsController {
  constructor(private readonly insights: CrmInsightsService) {}

  @Get('customers/:id/360')
  @Permissions('customer.read')
  customer360(@Param('id') id: string, @Req() req: any) {
    return this.insights.customer360(id, req.user?.companyId);
  }

  @Get('sales/dashboard')
  @Permissions('crm.lead.read')
  salesDashboard(@Req() req: any) {
    return this.insights.salesDashboard(req.user?.companyId);
  }
}
