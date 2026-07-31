import { Controller, Get, Post, Patch, Body, Param, Query, Req, UseGuards } from '@nestjs/common';
import { QuotationsService } from './quotations.service';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';

@Controller(['crm/quotations', 'quotations', 'sales/quotations'])
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class QuotationsController {
  constructor(private readonly quotationsService: QuotationsService) {}

  @Get()
  @Permissions('crm.quotation.read')
  async listQuotations(@Req() req: any, @Query('search') search?: string) {
    return this.quotationsService.listQuotations(req.user?.companyId, search);
  }

  @Get(':id')
  @Permissions('crm.quotation.read')
  async getQuotation(@Param('id') id: string, @Req() req: any) {
    return this.quotationsService.getQuotation(id, req.user?.companyId);
  }

  @Post()
  @Permissions('crm.quotation.create')
  async createQuotation(@Body() dto: any, @Req() req: any) {
    return this.quotationsService.createQuotation(dto, req.user?.sub || 'SYSTEM', req.user?.companyId);
  }

  @Patch(':id')
  @Permissions('crm.quotation.update')
  async updateQuotation(@Param('id') id: string, @Body() dto: any, @Req() req: any) {
    return this.quotationsService.updateQuotation(id, dto, req.user?.sub || 'SYSTEM', req.user?.companyId);
  }

  @Post(':id/action')
  @Permissions('crm.quotation.update')
  async processAction(@Param('id') id: string, @Body() dto: { action: string, remarks?: string }, @Req() req: any) {
    return this.quotationsService.processAction(id, dto.action, dto.remarks, req.user?.sub);
  }

  @Post(':id/duplicate')
  @Permissions('crm.quotation.create')
  async duplicateVersion(@Param('id') id: string, @Req() req: any) {
    return this.quotationsService.duplicateVersion(id, req.user?.sub || 'SYSTEM');
  }

  @Post(':id/version')
  @Permissions('crm.quotation.create')
  async createVersion(@Param('id') id: string, @Req() req: any) {
    return this.quotationsService.duplicateVersion(id, req.user?.sub || 'SYSTEM');
  }

  @Post(':id/convert')
  @Permissions('crm.quotation.update', 'sales.orders.create')
  async convertToSalesOrder(@Param('id') id: string, @Req() req: any) {
    return this.quotationsService.convertToSalesOrder(id, req.user?.sub || 'SYSTEM');
  }
}
