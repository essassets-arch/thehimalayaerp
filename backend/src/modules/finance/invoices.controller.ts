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
import { InvoicesService } from './invoices.service';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';

@Controller('finance/invoices')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get()
  @RequirePermissions('finance.invoice.read')
  async listInvoices(@Req() req: any) {
    return this.invoicesService.listInvoices(req.user?.sub, req.user?.role);
  }

  @Get(':id')
  @RequirePermissions('finance.invoice.read')
  async getInvoice(@Param('id') id: string, @Req() req: any) {
    return this.invoicesService.getInvoice(id, req.user?.sub, req.user?.role);
  }

  @Post(':id/action')
  @RequirePermissions('finance.invoice.update')
  async processAction(
    @Param('id') id: string,
    @Body() dto: { action: string; remarks?: string },
    @Req() req: any,
  ) {
    return this.invoicesService.processAction(
      id,
      dto.action,
      dto.remarks,
      req.user?.sub,
    );
  }

  @Post(':id/post')
  @RequirePermissions('finance.invoice.update')
  async postInvoice(
    @Param('id') id: string,
    @Body() dto: { remarks?: string },
    @Req() req: any,
  ) {
    return this.invoicesService.processAction(
      id,
      'POST',
      dto.remarks,
      req.user?.sub,
    );
  }

  @Post(':id/cancel')
  @RequirePermissions('finance.invoice.update')
  async cancelInvoice(
    @Param('id') id: string,
    @Body() dto: { remarks?: string },
    @Req() req: any,
  ) {
    return this.invoicesService.processAction(
      id,
      'CANCEL',
      dto.remarks,
      req.user?.sub,
    );
  }

  @Post(':id/void')
  @RequirePermissions('finance.invoice.update')
  async voidInvoice(
    @Param('id') id: string,
    @Body() dto: { remarks?: string },
    @Req() req: any,
  ) {
    return this.invoicesService.processAction(
      id,
      'VOID',
      dto.remarks,
      req.user?.sub,
    );
  }
}
