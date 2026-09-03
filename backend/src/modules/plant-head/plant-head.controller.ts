import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import {
  UseGuards,
  Controller,
  Get,
  Post,
  Patch,
  Query,
  Req,
  Body,
  Param,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PlantHeadService } from './plant-head.service';
import type { Request } from 'express';
import { SubmitFulfillmentPlanDto } from './dto/fulfillment-plan.dto';

@Controller('plant-head')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PlantHeadController {
  constructor(private readonly plantHeadService: PlantHeadService) {}

  @RequirePermissions(
    'admin.planthead.read',
    'planthead.read',
    'plant-head.read',
    'planthead.dashboard.read',
  )
  @Get('incoming-orders')
  async getIncomingOrders(@Req() req: Request) {
    const companyId =
      (req.headers['x-company-id'] as string) ||
      (req as any).user?.['companyId'];
    return this.plantHeadService.getIncomingOrders(companyId);
  }

  @RequirePermissions(
    'admin.planthead.read',
    'planthead.read',
    'plant-head.read',
    'planthead.dashboard.read',
  )
  @Get('planning-orders')
  async getPlanningOrdersAlias(@Req() req: Request) {
    const companyId =
      (req.headers['x-company-id'] as string) ||
      (req as any).user?.['companyId'];
    return this.plantHeadService.getIncomingOrders(companyId); // alias for incoming-orders based on mock logic
  }

  @RequirePermissions(
    'admin.planthead.read',
    'planthead.read',
    'plant-head.read',
    'planthead.dashboard.read',
  )
  @Get('planning')
  async getPlanningOrders(@Req() req: Request) {
    const companyId =
      (req as any).user?.['companyId'] ||
      (req.headers['x-company-id'] as string);
    return this.plantHeadService.getPlanningOrders(companyId);
  }

  @RequirePermissions(
    'admin.planthead.read',
    'planthead.read',
    'plant-head.read',
    'planthead.dashboard.read',
  )
  @Get('daily-summary')
  async getDailySummary(@Req() req: Request, @Query('date') date?: string) {
    const companyId =
      (req as any).user?.['companyId'] ||
      (req.headers['x-company-id'] as string);
    return this.plantHeadService.getDailySummary(companyId, date);
  }

  @RequirePermissions(
    'admin.planthead.read',
    'planthead.read',
    'plant-head.read',
    'planthead.dashboard.read',
  )
  @Get('dashboard-data')
  async getDashboardData(
    @Req() req: Request,
    @Query('filter') filter?: string,
    @Query('customStart') customStart?: string,
    @Query('customEnd') customEnd?: string,
  ) {
    const companyId =
      (req.headers['x-company-id'] as string) ||
      (req as any).user?.['companyId'];
    return this.plantHeadService.getDashboardData(
      companyId,
      filter,
      customStart,
      customEnd,
    );
  }

  @RequirePermissions(
    'admin.planthead.read',
    'planthead.read',
    'plant-head.read',
    'planthead.dashboard.read',
  )
  @Get('analytics/production')
  async getProductionAnalytics(
    @Req() req: Request,
    @Query('filter') filter?: string,
    @Query('customStart') customStart?: string,
    @Query('customEnd') customEnd?: string,
  ) {
    const companyId =
      (req.headers['x-company-id'] as string) ||
      (req as any).user?.['companyId'];
    return this.plantHeadService.getProductionAnalytics(
      companyId,
      filter,
      customStart,
      customEnd,
    );
  }

  @RequirePermissions(
    'admin.planthead.read',
    'planthead.read',
    'plant-head.read',
    'planthead.dashboard.read',
  )
  @Get('analytics/material')
  async getMaterialAnalytics(
    @Req() req: Request,
    @Query('filter') filter?: string,
    @Query('customStart') customStart?: string,
    @Query('customEnd') customEnd?: string,
  ) {
    const companyId =
      (req.headers['x-company-id'] as string) ||
      (req as any).user?.['companyId'];
    return this.plantHeadService.getMaterialAnalytics(
      companyId,
      filter,
      customStart,
      customEnd,
    );
  }

  @RequirePermissions(
    'admin.planthead.read',
    'planthead.read',
    'plant-head.read',
    'planthead.dashboard.read',
  )
  @Get('analytics/dispatch')
  async getDispatchAnalytics(
    @Req() req: Request,
    @Query('filter') filter?: string,
    @Query('customStart') customStart?: string,
    @Query('customEnd') customEnd?: string,
  ) {
    const companyId =
      (req.headers['x-company-id'] as string) ||
      (req as any).user?.['companyId'];
    return this.plantHeadService.getDispatchAnalytics(
      companyId,
      filter,
      customStart,
      customEnd,
    );
  }

  @RequirePermissions(
    'admin.planthead.read',
    'planthead.read',
    'plant-head.read',
    'planthead.dashboard.read',
  )
  @Get('overview/departments')
  async getDepartmentOverview(@Req() req: Request) {
    const companyId =
      (req.headers['x-company-id'] as string) ||
      (req as any).user?.['companyId'];
    return this.plantHeadService.getDepartmentOverview(companyId);
  }

  @RequirePermissions('admin.planthead.create')
  @Post('reports/generate-ai')
  async generateAiReport(
    @Req() req: Request,
    @Body('filter') filter?: string,
    @Body('customStart') customStart?: string,
    @Body('customEnd') customEnd?: string,
  ) {
    const companyId =
      (req.headers['x-company-id'] as string) ||
      (req as any).user?.['companyId'];
    return this.plantHeadService.generateAiReport(
      companyId,
      filter,
      customStart,
      customEnd,
    );
  }

  @RequirePermissions('admin.planthead.create', 'planthead.create')
  @Post('orders/:orderId/direct-dispatch')
  async directDispatch(
    @Param('orderId') orderId: string,
    @Body('items')
    items: { salesOrderItemId: string; productId: string; quantity: number }[],
    @Req() req: Request,
  ) {
    const companyId =
      (req.headers['x-company-id'] as string) ||
      (req as any).user?.['companyId'] ||
      'd039cfa4-e78b-4138-adfc-1b0f14cffa91';
    const userId =
      (req as any).user?.['sub'] || (req as any).user?.['id'] || 'system';
    return this.plantHeadService.directDispatch(
      orderId,
      items,
      companyId,
      userId,
    );
  }

  @RequirePermissions(
    'admin.planthead.read',
    'planthead.read',
    'plant-head.read',
  )
  @Get('orders/:orderId/fulfillment-plan')
  async getFulfillmentPlan(
    @Param('orderId') orderId: string,
    @Req() req: Request,
  ) {
    const companyId =
      (req.headers['x-company-id'] as string) ||
      (req as any).user?.['companyId'];
    return this.plantHeadService.getFulfillmentPlan(orderId, companyId);
  }

  @RequirePermissions('admin.planthead.create', 'planthead.create')
  @Post('orders/:orderId/fulfillment-plan')
  async submitFulfillmentPlan(
    @Param('orderId') orderId: string,
    @Body() planDto: SubmitFulfillmentPlanDto,
    @Req() req: Request,
  ) {
    const companyId =
      (req.headers['x-company-id'] as string) ||
      (req as any).user?.['companyId'] ||
      'd039cfa4-e78b-4138-adfc-1b0f14cffa91';
    const userId =
      (req as any).user?.['sub'] || (req as any).user?.['id'] || 'system';
    return this.plantHeadService.submitFulfillmentPlan(
      orderId,
      planDto,
      companyId,
      userId,
    );
  }

  @RequirePermissions(
    'admin.planthead.update',
    'planthead.update',
    'admin.planthead.create',
    'planthead.create',
  )
  @Post('orders/:orderId/target-date')
  async updateOrderTargetDate(
    @Param('orderId') orderId: string,
    @Body('targetDate') targetDate: string,
    @Req() req: Request,
  ) {
    const companyId =
      (req.headers['x-company-id'] as string) ||
      (req as any).user?.['companyId'] ||
      'd039cfa4-e78b-4138-adfc-1b0f14cffa91';
    const userId =
      (req as any).user?.['sub'] || (req as any).user?.['id'] || 'system';
    return this.plantHeadService.updateOrderTargetDate(
      orderId,
      targetDate,
      companyId,
      userId,
    );
  }

  @RequirePermissions(
    'admin.planthead.update',
    'planthead.update',
    'admin.planthead.create',
    'planthead.create',
  )
  @Patch('orders/:orderId/target-date')
  async patchOrderTargetDate(
    @Param('orderId') orderId: string,
    @Body('targetDate') targetDate: string,
    @Req() req: Request,
  ) {
    const companyId =
      (req.headers['x-company-id'] as string) ||
      (req as any).user?.['companyId'] ||
      'd039cfa4-e78b-4138-adfc-1b0f14cffa91';
    const userId =
      (req as any).user?.['sub'] || (req as any).user?.['id'] || 'system';
    return this.plantHeadService.updateOrderTargetDate(
      orderId,
      targetDate,
      companyId,
      userId,
    );
  }
}

