import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { SalesReportsService } from './sales-reports.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('reports/sales')
@UseGuards(JwtAuthGuard)
export class SalesReportsController {
  constructor(private readonly salesReportsService: SalesReportsService) {}

  @Get('summary')
  async getSummary(
    @Query('date_from') dateFrom: string,
    @Query('date_to') dateTo: string,
    @Req() req: any,
  ) {
    return this.salesReportsService.getSalesSummary(
      dateFrom,
      dateTo,
      req.user?.sub,
      req.user?.role,
    );
  }

  @Get('top-products')
  async getTopProducts(
    @Query('date_from') dateFrom: string,
    @Query('date_to') dateTo: string,
    @Query('limit') limit: string,
    @Req() req: any,
  ) {
    return this.salesReportsService.getTopProducts(
      dateFrom,
      dateTo,
      parseInt(limit, 10) || 10,
      req.user?.sub,
      req.user?.role,
    );
  }

  @Get('customer-performance')
  async getCustomerPerformance(
    @Query('date_from') dateFrom: string,
    @Query('date_to') dateTo: string,
    @Req() req: any,
  ) {
    return this.salesReportsService.getCustomerPerformance(
      dateFrom,
      dateTo,
      req.user?.sub,
      req.user?.role,
    );
  }
}
