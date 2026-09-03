import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import {
  UseGuards,
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  Query,
} from '@nestjs/common';
import { WorkOrdersService } from './work-orders.service';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';

@Controller('production/work-orders')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class WorkOrdersController {
  constructor(private readonly workOrdersService: WorkOrdersService) {}

  @Get()
  @RequirePermissions(
    'production.workorder.read',
    'logistics.dispatches.read',
    'logistics.dispatches.create',
  )
  async listWorkOrders(@Query('status') status?: string, @Req() req?: any) {
    const statuses = status ? status.split(',') : [];
    return this.workOrdersService.listWorkOrders(
      statuses,
      req?.user?.sub,
      req?.user?.role,
    );
  }

  @Get(':id')
  @RequirePermissions('production.workorder.read')
  async getWorkOrder(@Param('id') id: string, @Req() req?: any) {
    return this.workOrdersService.getWorkOrder(
      id,
      req?.user?.sub,
      req?.user?.role,
    );
  }

  @Post(':id/action')
  @RequirePermissions('production.workorder.start')
  async processAction(
    @Param('id') id: string,
    @Body() dto: { action: string; remarks?: string },
    @Req() req: any,
  ) {
    return this.workOrdersService.processAction(
      id,
      dto.action,
      dto.remarks,
      req.user?.sub,
    );
  }

  @Post(':id/request-materials')
  @RequirePermissions('production.workorder.start')
  async requestMaterials(
    @Param('id') id: string,
    @Body() dto: { remarks?: string },
    @Req() req: any,
  ) {
    return this.workOrdersService.processAction(
      id,
      'REQUEST_MATERIALS',
      dto.remarks,
      req.user?.sub,
    );
  }

  @Post(':id/issue-materials')
  @RequirePermissions('production.workorder.start') // Store manager would issue normally
  async issueMaterials(
    @Param('id') id: string,
    @Body() dto: { remarks?: string },
    @Req() req: any,
  ) {
    return this.workOrdersService.processAction(
      id,
      'ISSUE_MATERIALS',
      dto.remarks,
      req.user?.sub,
    );
  }

  @Post(':id/start')
  @RequirePermissions('production.workorder.start')
  async startWorkOrder(
    @Param('id') id: string,
    @Body() dto: { remarks?: string },
    @Req() req: any,
  ) {
    return this.workOrdersService.processAction(
      id,
      'START',
      dto.remarks,
      req.user?.sub,
    );
  }

  @Post(':id/log-batch')
  @RequirePermissions('production.workorder.start')
  async logBatch(
    @Param('id') id: string,
    @Body() dto: { remarks?: string },
    @Req() req: any,
  ) {
    return this.workOrdersService.processAction(
      id,
      'LOG_BATCH',
      dto.remarks,
      req.user?.sub,
    );
  }

  @Post(':id/complete')
  @RequirePermissions('production.workorder.complete')
  async completeWorkOrder(
    @Param('id') id: string,
    @Body() dto: { remarks?: string },
    @Req() req: any,
  ) {
    return this.workOrdersService.processAction(
      id,
      'COMPLETE',
      dto.remarks,
      req.user?.sub,
    );
  }

  @Post(':id/send-to-dispatch')
  @RequirePermissions('production.workorder.complete')
  async sendToDispatch(@Param('id') id: string, @Req() req: any) {
    return this.workOrdersService.sendToDispatch(id, req.user?.sub);
  }

  @Post(':id/dispatch')
  @RequirePermissions('dispatch.update')
  async dispatchOrder(@Param('id') id: string, @Req() req: any) {
    return this.workOrdersService.dispatchOrder(id, req.user?.sub);
  }
}
