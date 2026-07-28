import { Controller, Get, Post, Body, Param, Req } from '@nestjs/common';
import { WorkOrdersService } from './work-orders.service';
import { Permissions } from '../../common/decorators/permissions.decorator';

@Controller('production/work-orders')
export class WorkOrdersController {
  constructor(private readonly workOrdersService: WorkOrdersService) {}

  @Get()
  @Permissions('production.workorder.read')
  async listWorkOrders() {
    return this.workOrdersService.listWorkOrders();
  }

  @Get(':id')
  @Permissions('production.workorder.read')
  async getWorkOrder(@Param('id') id: string) {
    return this.workOrdersService.getWorkOrder(id);
  }

  @Post(':id/action')
  @Permissions('production.workorder.start')
  async processAction(@Param('id') id: string, @Body() dto: { action: string, remarks?: string }, @Req() req: any) {
    return this.workOrdersService.processAction(id, dto.action, dto.remarks, req.user?.sub);
  }

  @Post(':id/request-materials')
  @Permissions('production.workorder.start')
  async requestMaterials(@Param('id') id: string, @Body() dto: { remarks?: string }, @Req() req: any) {
    return this.workOrdersService.processAction(id, 'REQUEST_MATERIALS', dto.remarks, req.user?.sub);
  }

  @Post(':id/issue-materials')
  @Permissions('production.workorder.start') // Store manager would issue normally
  async issueMaterials(@Param('id') id: string, @Body() dto: { remarks?: string }, @Req() req: any) {
    return this.workOrdersService.processAction(id, 'ISSUE_MATERIALS', dto.remarks, req.user?.sub);
  }

  @Post(':id/start')
  @Permissions('production.workorder.start')
  async startWorkOrder(@Param('id') id: string, @Body() dto: { remarks?: string }, @Req() req: any) {
    return this.workOrdersService.processAction(id, 'START', dto.remarks, req.user?.sub);
  }

  @Post(':id/log-batch')
  @Permissions('production.workorder.start')
  async logBatch(@Param('id') id: string, @Body() dto: { remarks?: string }, @Req() req: any) {
    return this.workOrdersService.processAction(id, 'LOG_BATCH', dto.remarks, req.user?.sub);
  }

  @Post(':id/complete')
  @Permissions('production.workorder.complete')
  async completeWorkOrder(@Param('id') id: string, @Body() dto: { remarks?: string }, @Req() req: any) {
    return this.workOrdersService.processAction(id, 'COMPLETE', dto.remarks, req.user?.sub);
  }
}
