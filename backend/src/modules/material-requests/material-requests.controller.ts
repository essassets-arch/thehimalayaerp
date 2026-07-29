import { Body, Controller, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { MaterialRequestsService } from './material-requests.service';

@Controller('material-requests')
export class MaterialRequestsController {
  constructor(private readonly service: MaterialRequestsService) {}

  @Get()
  findAll(@Req() req: any) {
    return this.service.findAll(req.user.companyId);
  }

  @Post()
  create(@Body() dto: any, @Req() req: any) {
    return this.service.create(dto, req.user.sub ?? req.user.id, req.user.companyId);
  }

  @Patch(':id/approve')
  approve(@Param('id') id: string, @Body() dto: any, @Req() req: any) {
    return this.service.decide(id, 'PLANT_HEAD_APPROVED', dto, req.user.sub ?? req.user.id, req.user.companyId);
  }

  @Patch(':id/reject')
  reject(@Param('id') id: string, @Req() req: any) {
    return this.service.decide(id, 'PLANT_HEAD_REJECTED', {}, req.user.sub ?? req.user.id, req.user.companyId);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: any, @Req() req: any) {
    return this.service.updateStatus(id, dto, req.user.sub ?? req.user.id, req.user.companyId);
  }
}
