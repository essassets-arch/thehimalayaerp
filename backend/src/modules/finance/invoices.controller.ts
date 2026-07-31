import { Controller, Get, Post, Body, Param, Req } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { Permissions } from '../../common/decorators/permissions.decorator';

@Controller('finance/invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get()
  @Permissions('finance.invoice.read')
  async listInvoices(@Req() req: any) {
    return this.invoicesService.listInvoices(req.user?.sub, req.user?.role);
  }

  @Get(':id')
  @Permissions('finance.invoice.read')
  async getInvoice(@Param('id') id: string, @Req() req: any) {
    return this.invoicesService.getInvoice(id, req.user?.sub, req.user?.role);
  }

  @Post(':id/action')
  @Permissions('finance.invoice.update')
  async processAction(@Param('id') id: string, @Body() dto: { action: string, remarks?: string }, @Req() req: any) {
    return this.invoicesService.processAction(id, dto.action, dto.remarks, req.user?.sub);
  }

  @Post(':id/post')
  @Permissions('finance.invoice.update')
  async postInvoice(@Param('id') id: string, @Body() dto: { remarks?: string }, @Req() req: any) {
    return this.invoicesService.processAction(id, 'POST', dto.remarks, req.user?.sub);
  }

  @Post(':id/cancel')
  @Permissions('finance.invoice.update')
  async cancelInvoice(@Param('id') id: string, @Body() dto: { remarks?: string }, @Req() req: any) {
    return this.invoicesService.processAction(id, 'CANCEL', dto.remarks, req.user?.sub);
  }

  @Post(':id/void')
  @Permissions('finance.invoice.update')
  async voidInvoice(@Param('id') id: string, @Body() dto: { remarks?: string }, @Req() req: any) {
    return this.invoicesService.processAction(id, 'VOID', dto.remarks, req.user?.sub);
  }
}
