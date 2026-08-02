import { Controller, Get, Post, Patch, Body, Param, Req } from '@nestjs/common';
import { ProductionService } from './production.service';
import { Permissions } from '../../common/decorators/permissions.decorator';

@Controller('production/plans')
export class ProductionController {
  constructor(private readonly productionService: ProductionService) {}

  @Get()
  @Permissions('production.plan.read')
  async listPlans(@Req() req: any) {
    return this.productionService.listPlans(req.user?.sub, req.user?.role);
  }

  @Get(':id')
  @Permissions('production.plan.read')
  async getPlan(@Param('id') id: string, @Req() req: any) {
    return this.productionService.getPlan(id, req.user?.sub, req.user?.role);
  }

  @Post()
  @Permissions('production.plan.create')
  async createPlan(@Body() dto: any, @Req() req: any) {
    return this.productionService.createPlan(
      dto,
      req.user?.sub,
      req.user?.role,
    );
  }

  @Patch(':id')
  @Permissions('production.plan.approve')
  async updatePlan(
    @Param('id') id: string,
    @Body()
    dto: {
      plannedStartDate?: string;
      plannedEndDate?: string;
      productionLine?: string;
    },
    @Req() req: any,
  ) {
    return this.productionService.updatePlan(
      id,
      dto,
      req.user?.sub,
      req.user?.role,
    );
  }

  @Post(':id/action')
  @Permissions('production.plan.approve')
  async processAction(
    @Param('id') id: string,
    @Body() dto: { action: string; remarks?: string },
    @Req() req: any,
  ) {
    return this.productionService.processAction(
      id,
      dto.action,
      dto.remarks,
      req.user?.sub,
      req.user?.role,
    );
  }

  @Post(':id/submit')
  @Permissions('production.plan.approve')
  async submitPlan(
    @Param('id') id: string,
    @Body() dto: { remarks?: string },
    @Req() req: any,
  ) {
    return this.productionService.processAction(
      id,
      'SUBMIT',
      dto.remarks,
      req.user?.sub,
      req.user?.role,
    );
  }

  @Post(':id/approve')
  @Permissions('production.plan.approve')
  async approvePlan(
    @Param('id') id: string,
    @Body() dto: { remarks?: string },
    @Req() req: any,
  ) {
    return this.productionService.processAction(
      id,
      'APPROVE',
      dto.remarks,
      req.user?.sub,
      req.user?.role,
    );
  }

  @Post(':id/release')
  @Permissions('production.plan.release')
  async releasePlan(
    @Param('id') id: string,
    @Body() dto: { remarks?: string },
    @Req() req: any,
  ) {
    return this.productionService.processAction(
      id,
      'RELEASE',
      dto.remarks,
      req.user?.sub,
      req.user?.role,
    );
  }

  @Post(':id/reject')
  @Permissions('production.plan.approve')
  async rejectPlan(
    @Param('id') id: string,
    @Body() dto: { remarks?: string },
    @Req() req: any,
  ) {
    return this.productionService.processAction(
      id,
      'REJECT',
      dto.remarks,
      req.user?.sub,
      req.user?.role,
    );
  }

  @Post(':id/complete')
  @Permissions('production.plan.release')
  async completePlan(
    @Param('id') id: string,
    @Body() dto: { remarks?: string },
    @Req() req: any,
  ) {
    return this.productionService.processAction(
      id,
      'COMPLETE',
      dto.remarks,
      req.user?.sub,
      req.user?.role,
    );
  }
}
