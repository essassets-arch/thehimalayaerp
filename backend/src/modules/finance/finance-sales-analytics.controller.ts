import { Controller, Get, Query, Param, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { FinanceSalesAnalyticsService } from './finance-sales-analytics.service';
import { FinanceSalesAnalyticsQueryDto } from './dto/finance-sales-analytics-query.dto';

@Controller(['finance/sales-analytics', 'finance/sales'])
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class FinanceSalesAnalyticsController {
  constructor(
    private readonly analyticsService: FinanceSalesAnalyticsService,
  ) {}

  @Get('summary')
  @RequirePermissions('finance.sales-analytics.read')
  async getSummary(@Query() query: FinanceSalesAnalyticsQueryDto) {
    return this.analyticsService.getSummary(query);
  }

  @Get('salespersons')
  @RequirePermissions('finance.sales-analytics.read')
  async getSalespersons(@Query() query: FinanceSalesAnalyticsQueryDto) {
    return this.analyticsService.getSalespersonsTable(query);
  }

  @Get('salespersons/:id')
  @RequirePermissions('finance.sales-analytics.read')
  async getSalespersonDetail(
    @Param('id') id: string,
    @Query() query: FinanceSalesAnalyticsQueryDto,
  ) {
    return this.analyticsService.getSalespersonDetail(id, query);
  }

  @Get('salespersons/:id/activities')
  @RequirePermissions('finance.sales-analytics.activity.read')
  async getSalespersonTimeline(
    @Param('id') id: string,
    @Query() query: FinanceSalesAnalyticsQueryDto,
  ) {
    return this.analyticsService.getSalespersonTimeline(id, query);
  }

  @Get('leads')
  @RequirePermissions('finance.sales-analytics.read')
  async getLeads(
    @Query() query: FinanceSalesAnalyticsQueryDto,
    @Req() req?: any,
  ) {
    return this.analyticsService.getLeads(
      query,
      req?.user?.sub,
      req?.user?.role,
    );
  }

  @Get('samples')
  @RequirePermissions('finance.sales-analytics.read')
  async getSamples(
    @Query() query: FinanceSalesAnalyticsQueryDto,
    @Req() req?: any,
  ) {
    return this.analyticsService.getSamples(
      query,
      req?.user?.sub,
      req?.user?.role,
    );
  }

  @Get('quotations')
  @RequirePermissions('finance.sales-analytics.read')
  async getQuotations(
    @Query() query: FinanceSalesAnalyticsQueryDto,
    @Req() req?: any,
  ) {
    return this.analyticsService.getQuotations(
      query,
      req?.user?.sub,
      req?.user?.role,
    );
  }

  @Get('orders')
  @RequirePermissions('finance.sales-analytics.read')
  async getOrders(
    @Query() query: FinanceSalesAnalyticsQueryDto,
    @Req() req?: any,
  ) {
    return this.analyticsService.getOrders(
      query,
      req?.user?.sub,
      req?.user?.role,
    );
  }

  @Get('collections')
  @RequirePermissions('finance.sales-analytics.receivables.read')
  async getCollections(
    @Query() query: FinanceSalesAnalyticsQueryDto,
    @Req() req?: any,
  ) {
    return this.analyticsService.getCollections(
      query,
      req?.user?.sub,
      req?.user?.role,
    );
  }

  @Get('customers')
  @RequirePermissions('finance.sales-analytics.read')
  async getCustomers(
    @Query() query: FinanceSalesAnalyticsQueryDto,
    @Req() req?: any,
  ) {
    return this.analyticsService.getCustomers(
      query,
      req?.user?.sub,
      req?.user?.role,
    );
  }

  @Get('activities')
  @RequirePermissions('finance.sales-analytics.activity.read')
  async getActivities(
    @Query() query: FinanceSalesAnalyticsQueryDto,
    @Req() req?: any,
  ) {
    return this.analyticsService.getActivities(
      query,
      req?.user?.sub,
      req?.user?.role,
    );
  }

  @Get('complaints')
  @RequirePermissions('finance.sales-analytics.read')
  async getComplaints(
    @Query() query: FinanceSalesAnalyticsQueryDto,
    @Req() req?: any,
  ) {
    return this.analyticsService.getComplaints(
      query,
      req?.user?.sub,
      req?.user?.role,
    );
  }

  @Get('returns')
  @RequirePermissions('finance.sales-analytics.read')
  async getReturns(@Query() query: FinanceSalesAnalyticsQueryDto) {
    return this.analyticsService.getReturns(query);
  }

  @Get('replacements')
  @RequirePermissions('finance.sales-analytics.read')
  async getReplacements(@Query() query: FinanceSalesAnalyticsQueryDto) {
    return this.analyticsService.getReplacements(query);
  }

  @Get('charts')
  @RequirePermissions('finance.sales-analytics.read')
  async getCharts(@Query() query: FinanceSalesAnalyticsQueryDto) {
    return this.analyticsService.getCharts(query);
  }

  @Get('leaderboards')
  @RequirePermissions('finance.sales-analytics.read')
  async getLeaderboards(@Query() query: FinanceSalesAnalyticsQueryDto) {
    return this.analyticsService.getLeaderboards(query);
  }

  @Get('export')
  @RequirePermissions('finance.sales-analytics.export')
  async getExport(@Query() query: FinanceSalesAnalyticsQueryDto) {
    return this.analyticsService.getExportData(query);
  }
}
