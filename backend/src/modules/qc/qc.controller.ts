import { Controller, Get, Post, Body, Param, Req } from '@nestjs/common';
import { QcService } from './qc.service';
import { Permissions } from '../../common/decorators/permissions.decorator';

@Controller('qc/inspections')
export class QcController {
  constructor(private readonly qcService: QcService) {}

  @Get()
  @Permissions('qc.inspection.read')
  async listInspections() {
    return this.qcService.listInspections();
  }

  @Get(':id')
  @Permissions('qc.inspection.read')
  async getInspection(@Param('id') id: string) {
    return this.qcService.getInspection(id);
  }

  @Post(':id/action')
  @Permissions('qc.inspection.approve')
  async processAction(@Param('id') id: string, @Body() dto: { action: string, remarks?: string }, @Req() req: any) {
    return this.qcService.processAction(id, dto.action, dto.remarks, req.user?.sub);
  }

  @Post(':id/start')
  @Permissions('qc.inspection.approve')
  async startInspection(@Param('id') id: string, @Body() dto: { remarks?: string }, @Req() req: any) {
    return this.qcService.processAction(id, 'START', dto.remarks, req.user?.sub);
  }

  @Post(':id/approve')
  @Permissions('qc.inspection.approve')
  async approveInspection(@Param('id') id: string, @Body() dto: { remarks?: string }, @Req() req: any) {
    return this.qcService.processAction(id, 'APPROVE', dto.remarks, req.user?.sub);
  }

  @Post(':id/reject')
  @Permissions('qc.inspection.approve')
  async rejectInspection(@Param('id') id: string, @Body() dto: { remarks?: string }, @Req() req: any) {
    return this.qcService.processAction(id, 'REJECT', dto.remarks, req.user?.sub);
  }

  @Post(':id/rework')
  @Permissions('qc.inspection.approve')
  async reworkInspection(@Param('id') id: string, @Body() dto: { remarks?: string }, @Req() req: any) {
    return this.qcService.processAction(id, 'REWORK', dto.remarks, req.user?.sub);
  }
}
