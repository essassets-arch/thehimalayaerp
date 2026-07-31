import { Controller, Get, Query, UseGuards } from '@nestjs/common';
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
  ) {
    return this.salesReportsService.getSalesSummary(dateFrom, dateTo);
  }

  @Get('top-products')
  async getTopProducts(
    @Query('date_from') dateFrom: string,
    @Query('date_to') dateTo: string,
    @Query('limit') limit: string,
  ) {
    return this.salesReportsService.getTopProducts(dateFrom, dateTo, parseInt(limit, 10) || 10);
  }

  @Get('customer-performance')
  async getCustomerPerformance(
    @Query('date_from') dateFrom: string,
    @Query('date_to') dateTo: string,
  ) {
    return this.salesReportsService.getCustomerPerformance(dateFrom, dateTo);
  }
}
