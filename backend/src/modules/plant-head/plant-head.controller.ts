import { Controller, Get, Post, Query, UseGuards, Req, Body } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';
import { PlantHeadService } from './plant-head.service';
import type { Request } from 'express';

@Public()
@Controller('plant-head')
export class PlantHeadController {
  constructor(private readonly plantHeadService: PlantHeadService) {}

  @Get('incoming-orders')
  async getIncomingOrders(@Req() req: Request) {
    const companyId = req.headers['x-company-id'] as string || (req as any).user?.['companyId'];
    return this.plantHeadService.getIncomingOrders(companyId);
  }

  @Get('planning-orders')
  async getPlanningOrdersAlias(@Req() req: Request) {
    const companyId = req.headers['x-company-id'] as string || (req as any).user?.['companyId'];
    return this.plantHeadService.getIncomingOrders(companyId); // alias for incoming-orders based on mock logic
  }

  @Get('planning')
  async getPlanningOrders(@Req() req: Request) {
    const companyId = req.headers['x-company-id'] as string || (req as any).user?.['companyId'];
    return this.plantHeadService.getPlanningOrders(companyId);
  }

  @Get('dashboard-data')
  async getDashboardData(
    @Req() req: Request,
    @Query('filter') filter?: string,
    @Query('customStart') customStart?: string,
    @Query('customEnd') customEnd?: string,
  ) {
    const companyId = req.headers['x-company-id'] as string || (req as any).user?.['companyId'];
    return this.plantHeadService.getDashboardData(companyId, filter, customStart, customEnd);
  }

  @Get('analytics/production')
  async getProductionAnalytics(
    @Req() req: Request,
    @Query('filter') filter?: string,
    @Query('customStart') customStart?: string,
    @Query('customEnd') customEnd?: string,
  ) {
    const companyId = req.headers['x-company-id'] as string || (req as any).user?.['companyId'];
    return this.plantHeadService.getProductionAnalytics(companyId, filter, customStart, customEnd);
  }

  @Get('analytics/material')
  async getMaterialAnalytics(
    @Req() req: Request,
    @Query('filter') filter?: string,
    @Query('customStart') customStart?: string,
    @Query('customEnd') customEnd?: string,
  ) {
    const companyId = req.headers['x-company-id'] as string || (req as any).user?.['companyId'];
    return this.plantHeadService.getMaterialAnalytics(companyId, filter, customStart, customEnd);
  }

  @Get('overview/departments')
  async getDepartmentOverview(
    @Req() req: Request,
  ) {
    const companyId = req.headers['x-company-id'] as string || (req as any).user?.['companyId'];
    return this.plantHeadService.getDepartmentOverview(companyId);
  }

  @Post('reports/generate-ai')
  async generateAiReport(
    @Req() req: Request,
    @Body('filter') filter?: string,
    @Body('customStart') customStart?: string,
    @Body('customEnd') customEnd?: string,
  ) {
    const companyId = req.headers['x-company-id'] as string || (req as any).user?.['companyId'];
    return this.plantHeadService.generateAiReport(companyId, filter, customStart, customEnd);
  }
}
