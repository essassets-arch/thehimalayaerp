import {
  Controller,
  Get,
  Post,
  Patch,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { QuotationsService } from './quotations.service';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';

@Controller(['crm/quotations', 'quotations', 'sales/quotations'])
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class QuotationsController {
  constructor(private readonly quotationsService: QuotationsService) {}

  private mapQuotationStatus(data: any): any {
    if (!data) return data;
    if (Array.isArray(data)) {
      return data.map((item) => this.mapQuotationStatus(item));
    }
    return {
      ...data,
      status: data.workflowState?.code || data.status,
    };
  }

  @Get()
  @RequirePermissions('crm.quotations.read')
  async listQuotations(
    @Req() req: any,
    @Query('search') search?: string,
    @Query('includeDeleted') includeDeleted?: string,
  ) {
    const result = await this.quotationsService.listQuotations(
      req.user?.companyId,
      search,
      req.user?.sub,
      req.user?.role,
      includeDeleted === 'true' || includeDeleted === '1',
    );
    return this.mapQuotationStatus(result);
  }

  @Get('terms-master')
  @RequirePermissions('crm.quotations.read')
  async getTermsMaster() {
    return this.quotationsService.getTermsMaster();
  }

  @Get(':id')
  @RequirePermissions('crm.quotations.read')
  async getQuotation(@Param('id') id: string, @Req() req: any) {
    const result = await this.quotationsService.getQuotation(
      id,
      req.user?.companyId,
      req.user?.sub,
      req.user?.role,
    );
    return this.mapQuotationStatus(result);
  }

  @Post()
  @RequirePermissions('crm.quotations.create')
  async createQuotation(@Body() dto: any, @Req() req: any) {
    const result = await this.quotationsService.createQuotation(
      dto,
      req.user?.sub || 'SYSTEM',
      req.user?.companyId,
      req.user?.role,
    );
    return this.mapQuotationStatus(result);
  }

  @Patch(':id')
  @Put(':id')
  @RequirePermissions('crm.quotations.update')
  async updateQuotation(
    @Param('id') id: string,
    @Body() dto: any,
    @Req() req: any,
  ) {
    const result = await this.quotationsService.updateQuotation(
      id,
      dto,
      req.user?.sub || 'SYSTEM',
      req.user?.companyId,
      req.user?.role,
    );
    return this.mapQuotationStatus(result);
  }

  @Post(':id/action')
  @RequirePermissions('crm.quotations.update')
  async processAction(
    @Param('id') id: string,
    @Body() dto: { action: string; remarks?: string },
    @Req() req: any,
  ) {
    const result = await this.quotationsService.processAction(
      id,
      dto.action,
      dto.remarks,
      req.user?.sub,
      req.user?.role,
    );
    return this.mapQuotationStatus(result);
  }

  @Post(':id/duplicate')
  @RequirePermissions('crm.quotations.create')
  async duplicateVersion(@Param('id') id: string, @Req() req: any) {
    const result = await this.quotationsService.duplicateVersion(
      id,
      req.user?.sub || 'SYSTEM',
      req.user?.role,
    );
    return this.mapQuotationStatus(result);
  }

  @Post(':id/version')
  @RequirePermissions('crm.quotations.create')
  async createVersion(@Param('id') id: string, @Req() req: any) {
    const result = await this.quotationsService.duplicateVersion(
      id,
      req.user?.sub || 'SYSTEM',
      req.user?.role,
    );
    return this.mapQuotationStatus(result);
  }

  @Post(':id/convert')
  @RequirePermissions('crm.quotations.convert', 'sales.orders.create')
  async convertToSalesOrder(@Param('id') id: string, @Req() req: any) {
    return this.quotationsService.convertToSalesOrder(
      id,
      req.user?.sub || 'SYSTEM',
      req.user?.role,
    );
  }

  @Delete(':id')
  @Post(':id/delete')
  @RequirePermissions('crm.quotations.update')
  async deleteQuotation(
    @Param('id') id: string,
    @Query('reason') reason?: string,
    @Body('reason') bodyReason?: string,
  ) {
    const result = await this.quotationsService.deleteQuotation(
      id,
      reason || bodyReason || 'Deleted by user',
    );
    return this.mapQuotationStatus(result);
  }

  @Post(':id/restore')
  @RequirePermissions('crm.quotations.update')
  async restoreQuotation(@Param('id') id: string) {
    const result = await this.quotationsService.restoreQuotation(id);
    return this.mapQuotationStatus(result);
  }
}

