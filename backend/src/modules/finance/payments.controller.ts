import { Controller, Get, Post, Body, Param, Req } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { Permissions } from '../../common/decorators/permissions.decorator';

@Controller('finance/payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  @Permissions('finance.payment.read')
  async listPayments() {
    return this.paymentsService.listPayments();
  }

  @Get(':id')
  @Permissions('finance.payment.read')
  async getPayment(@Param('id') id: string) {
    return this.paymentsService.getPayment(id);
  }

  @Post()
  @Permissions('finance.payment.create')
  async createPayment(@Body() dto: { customerId: string, amount: number }, @Req() req: any) {
    return this.paymentsService.createPayment(dto, req.user?.sub);
  }

  @Post(':id/submit-verification')
  @Permissions('finance.payment.create')
  async submitForVerification(@Param('id') id: string, @Req() req: any) {
    return this.paymentsService.submitForVerification(id, req.user?.sub);
  }

  @Post(':id/verify')
  @Permissions('finance.payment.update')
  async verifyPayment(@Param('id') id: string, @Req() req: any) {
    return this.paymentsService.verifyPayment(id, req.user?.sub);
  }

  @Post(':id/allocate')
  @Permissions('finance.payment.update')
  async allocatePayment(@Param('id') id: string, @Body() dto: { allocations: { invoiceId: string, amount: number }[] }, @Req() req: any) {
    return this.paymentsService.allocatePayment(id, dto.allocations, req.user?.sub);
  }

  @Post(':id/bounce')
  @Permissions('finance.payment.update')
  async markBounced(@Param('id') id: string, @Body() dto: { remarks?: string }, @Req() req: any) {
    return this.paymentsService.markBounced(id, dto.remarks, req.user?.sub);
  }
}
