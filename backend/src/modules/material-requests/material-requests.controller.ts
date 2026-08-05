import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import {
  UseGuards,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { MaterialRequestsService } from './material-requests.service';

@Controller(['material-requests', 'production/material-requests'])
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class MaterialRequestsController {
  constructor(private readonly service: MaterialRequestsService) {}

  @RequirePermissions('admin.materialrequests.read')
  @Get()
  findAll(@Req() req: any) {
    return this.service.findAll(
      req.user.companyId,
      req.user.sub,
      req.user.role,
    );
  }

  @RequirePermissions('admin.materialrequests.create')
  @Post()
  create(@Body() dto: any, @Req() req: any) {
    return this.service.create(
      dto,
      req.user.sub ?? req.user.id,
      req.user.companyId,
    );
  }

  @RequirePermissions('admin.materialrequests.approve')
  @Patch(':id/approve')
  approve(@Param('id') id: string, @Body() dto: any, @Req() req: any) {
    return this.service.decide(
      id,
      'PLANT_HEAD_APPROVED',
      dto,
      req.user.sub ?? req.user.id,
      req.user.companyId,
    );
  }

  @RequirePermissions('admin.materialrequests.reject')
  @Patch(':id/reject')
  reject(@Param('id') id: string, @Req() req: any) {
    return this.service.decide(
      id,
      'PLANT_HEAD_REJECTED',
      {},
      req.user.sub ?? req.user.id,
      req.user.companyId,
    );
  }

  @RequirePermissions('admin.materialrequests.update')
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: any, @Req() req: any) {
    return this.service.updateStatus(
      id,
      dto,
      req.user.sub ?? req.user.id,
      req.user.companyId,
    );
  }
}
