import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import {
  UseGuards,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Body,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PlantHeadService } from './plant-head.service';
import type { Request } from 'express';

@Controller('plant-head')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PlantHeadController {
  constructor(private readonly plantHeadService: PlantHeadService) {}

  @RequirePermissions('admin.planthead.read', 'planthead.read', 'plant-head.read', 'planthead.dashboard.read')
  @Get('incoming-orders')
  async getIncomingOrders(@Req() req: Request) {
    const companyId =
      (req.headers['x-company-id'] as string) ||
      (req as any).user?.['companyId'];
    return this.plantHeadService.getIncomingOrders(companyId);
  }

  @RequirePermissions('admin.planthead.read', 'planthead.read', 'plant-head.read', 'planthead.dashboard.read')
  @Get('planning-orders')
  async getPlanningOrdersAlias(@Req() req: Request) {
    const companyId =
      (req.headers['x-company-id'] as string) ||
      (req as any).user?.['companyId'];
    return this.plantHeadService.getIncomingOrders(companyId); // alias for incoming-orders based on mock logic
  }

  @RequirePermissions('admin.planthead.read', 'planthead.read', 'plant-head.read', 'planthead.dashboard.read')
  @Get('planning')
  async getPlanningOrders(@Req() req: Request) {
    const companyId =
      (req as any).user?.['companyId'] ||
      (req.headers['x-company-id'] as string);
    return this.plantHeadService.getPlanningOrders(companyId);
  }

  @RequirePermissions('admin.planthead.read', 'planthead.read', 'plant-head.read', 'planthead.dashboard.read')
  @Get('daily-summary')
  async getDailySummary(
    @Req() req: Request,
    @Query('date') date?: string,
  ) {
    const companyId =
      (req as any).user?.['companyId'] ||
      (req.headers['x-company-id'] as string);
    return this.plantHeadService.getDailySummary(companyId, date);
  }

  @RequirePermissions('admin.planthead.read', 'planthead.read', 'plant-head.read', 'planthead.dashboard.read')
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

  @RequirePermissions('admin.planthead.read', 'planthead.read', 'plant-head.read', 'planthead.dashboard.read')
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

  @RequirePermissions('admin.planthead.read', 'planthead.read', 'plant-head.read', 'planthead.dashboard.read')
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

  @RequirePermissions('admin.planthead.read', 'planthead.read', 'plant-head.read', 'planthead.dashboard.read')
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

  @RequirePermissions('admin.planthead.read', 'planthead.read', 'plant-head.read', 'planthead.dashboard.read')
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
}
