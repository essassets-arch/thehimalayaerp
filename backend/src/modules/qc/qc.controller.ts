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
} from '@nestjs/common';
import { QcService } from './qc.service';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller(['qc/inspections', 'backend/qc/inspections'])
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class QcController {
  constructor(private readonly qcService: QcService) {}

  @Get()
  @Roles(
    'QC',
    'QC_MANAGER',
    'QC_INSPECTOR',
    'QC_ENGINEER',
    'STORE_MANAGER',
    'STORE_EXECUTIVE',
    'STORE_KEEPER',
    'PLANT_HEAD',
    'SUPER_ADMIN',
    'SUPERADMIN',
    'ADMIN',
  )
  @RequirePermissions('qc.inspection.read')
  async listInspections(@Req() req: any) {
    const companyId = req.headers['x-company-id'] || req.user?.companyId;
    const items = await this.qcService.listInspections(companyId);
    console.log('listInspections called. Returned items count:', items.length);
    return items;
  }

  @Get(':id')
  @Roles(
    'QC',
    'QC_MANAGER',
    'QC_INSPECTOR',
    'QC_ENGINEER',
    'STORE_MANAGER',
    'STORE_EXECUTIVE',
    'STORE_KEEPER',
    'PLANT_HEAD',
    'SUPER_ADMIN',
    'SUPERADMIN',
    'ADMIN',
  )
  @RequirePermissions('qc.inspection.read')
  async getInspection(@Param('id') id: string) {
    return this.qcService.getInspection(id);
  }

  @Post(':id/action')
  @RequirePermissions('qc.inspection.approve')
  async processAction(
    @Param('id') id: string,
    @Body() dto: { action: string; remarks?: string },
    @Req() req: any,
  ) {
    return this.qcService.processAction(
      id,
      dto.action,
      dto.remarks,
      req.user?.sub,
    );
  }

  @Post(':id/start')
  @RequirePermissions('qc.inspection.approve')
  async startInspection(
    @Param('id') id: string,
    @Body() dto: { remarks?: string },
    @Req() req: any,
  ) {
    return this.qcService.processAction(
      id,
      'START',
      dto.remarks,
      req.user?.sub,
    );
  }

  @Post(':id/approve')
  @RequirePermissions('qc.inspection.approve')
  async approveInspection(
    @Param('id') id: string,
    @Body()
    dto: {
      remarks?: string;
      approvedQuantity?: number;
      rejectedQuantity?: number;
    },
    @Req() req: any,
  ) {
    return this.qcService.processAction(
      id,
      'APPROVE',
      dto.remarks,
      req.user?.sub,
      { ...dto, overrideSod: req.user?.permissions?.includes('qc.override') },
    );
  }

  @Post(':id/reject')
  @RequirePermissions('qc.inspection.approve')
  async rejectInspection(
    @Param('id') id: string,
    @Body() dto: { remarks?: string },
    @Req() req: any,
  ) {
    return this.qcService.processAction(
      id,
      'REJECT',
      dto.remarks,
      req.user?.sub,
    );
  }

  @Post(':id/rework')
  @RequirePermissions('qc.inspection.approve')
  async reworkInspection(
    @Param('id') id: string,
    @Body() dto: { remarks?: string },
    @Req() req: any,
  ) {
    return this.qcService.processAction(
      id,
      'REWORK',
      dto.remarks,
      req.user?.sub,
    );
  }
}
