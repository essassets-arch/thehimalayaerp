import { Controller, Get, Post, Body, Param, Req } from '@nestjs/common';
import { DispatchService } from './dispatch.service';
import { Permissions } from '../../common/decorators/permissions.decorator';

@Controller('logistics/dispatches')
export class DispatchController {
  constructor(private readonly dispatchService: DispatchService) {}

  @Get()
  @Permissions('dispatch.read')
  async listDispatches() {
    return this.dispatchService.listDispatches();
  }

  @Get(':id')
  @Permissions('dispatch.read')
  async getDispatch(@Param('id') id: string) {
    return this.dispatchService.getDispatch(id);
  }

  @Post()
  @Permissions('dispatch.create')
  async createDispatch(@Body() dto: { salesOrderId: string, items: { salesOrderItemId: string, quantity: number }[] }) {
    return this.dispatchService.createDispatch(dto);
  }

  @Post(':id/action')
  @Permissions('dispatch.update')
  async processAction(@Param('id') id: string, @Body() dto: { action: string, remarks?: string }, @Req() req: any) {
    return this.dispatchService.processAction(id, dto.action, dto.remarks, req.user?.sub);
  }

  @Post(':id/mark-ready')
  @Permissions('dispatch.update')
  async markReady(@Param('id') id: string, @Body() dto: { remarks?: string }, @Req() req: any) {
    return this.dispatchService.processAction(id, 'READY_FOR_DISPATCH', dto.remarks, req.user?.sub);
  }

  @Post(':id/dispatch')
  @Permissions('dispatch.update')
  async dispatchVehicle(@Param('id') id: string, @Body() dto: { remarks?: string }, @Req() req: any) {
    return this.dispatchService.processAction(id, 'DISPATCH', dto.remarks, req.user?.sub);
  }

  @Post(':id/deliver')
  @Permissions('dispatch.update')
  async confirmDelivery(@Param('id') id: string, @Body() dto: { remarks?: string, partial?: boolean }, @Req() req: any) {
    return this.dispatchService.processAction(id, dto.partial ? 'PARTIAL_DELIVERY' : 'DELIVER', dto.remarks, req.user?.sub);
  }
}
