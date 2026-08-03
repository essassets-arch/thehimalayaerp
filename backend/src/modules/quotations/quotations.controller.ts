import {
  Controller,
  Get,
  Post,
  Patch,
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

  @Get()
  @RequirePermissions('crm.quotation.read')
  async listQuotations(@Req() req: any, @Query('search') search?: string) {
    return this.quotationsService.listQuotations(
      req.user?.companyId,
      search,
      req.user?.sub,
      req.user?.role,
    );
  }

  @Get(':id')
  @RequirePermissions('crm.quotation.read')
  async getQuotation(@Param('id') id: string, @Req() req: any) {
    return this.quotationsService.getQuotation(
      id,
      req.user?.companyId,
      req.user?.sub,
      req.user?.role,
    );
  }

  @Post()
  @RequirePermissions('crm.quotation.create')
  async createQuotation(@Body() dto: any, @Req() req: any) {
    return this.quotationsService.createQuotation(
      dto,
      req.user?.sub || 'SYSTEM',
      req.user?.companyId,
      req.user?.role,
    );
  }

  @Patch(':id')
  @RequirePermissions('crm.quotation.update')
  async updateQuotation(
    @Param('id') id: string,
    @Body() dto: any,
    @Req() req: any,
  ) {
    return this.quotationsService.updateQuotation(
      id,
      dto,
      req.user?.sub || 'SYSTEM',
      req.user?.companyId,
      req.user?.role,
    );
  }

  @Post(':id/action')
  @RequirePermissions('crm.quotation.update')
  async processAction(
    @Param('id') id: string,
    @Body() dto: { action: string; remarks?: string },
    @Req() req: any,
  ) {
    return this.quotationsService.processAction(
      id,
      dto.action,
      dto.remarks,
      req.user?.sub,
      req.user?.role,
    );
  }

  @Post(':id/duplicate')
  @RequirePermissions('crm.quotation.create')
  async duplicateVersion(@Param('id') id: string, @Req() req: any) {
    return this.quotationsService.duplicateVersion(
      id,
      req.user?.sub || 'SYSTEM',
      req.user?.role,
    );
  }

  @Post(':id/version')
  @RequirePermissions('crm.quotation.create')
  async createVersion(@Param('id') id: string, @Req() req: any) {
    return this.quotationsService.duplicateVersion(
      id,
      req.user?.sub || 'SYSTEM',
      req.user?.role,
    );
  }

  @Post(':id/convert')
  @RequirePermissions('crm.quotation.update', 'sales.orders.create')
  async convertToSalesOrder(@Param('id') id: string, @Req() req: any) {
    return this.quotationsService.convertToSalesOrder(
      id,
      req.user?.sub || 'SYSTEM',
      req.user?.role,
    );
  }
}
