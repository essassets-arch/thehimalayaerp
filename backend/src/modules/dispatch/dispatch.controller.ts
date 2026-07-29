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
  async createDispatch(@Body() dto: any) {
    return this.dispatchService.createDispatch(dto);
  }

  @Post(':id/start-delivery')
  @Permissions('dispatch.update')
  async startDelivery(@Param('id') id: string) {
    return this.dispatchService.startDelivery(id);
  }

  @Post(':id/confirm-delivery')
  @Permissions('dispatch.update')
  async confirmDelivery(@Param('id') id: string, @Body() dto: any) {
    return this.dispatchService.confirmDelivery(id, dto);
  }
}
