import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import {
  UseGuards,
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Req,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';

@Controller('finance/payments')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('verification-queue')
  @RequirePermissions('finance.payment.read')
  async getVerificationQueue(@Query() query: any, @Req() req: any) {
    return this.paymentsService.getVerificationQueue(
      query,
      req.user?.sub,
      req.user?.role,
    );
  }

  @Get('sales-recorded')
  @RequirePermissions('sales.orders.read')
  async listSalesRecordedPayments(@Req() req: any) {
    return this.paymentsService.listSalesRecordedPayments(
      req.user?.sub,
      req.user?.role,
    );
  }

  @Get('delivered-orders')
  @RequirePermissions('finance.payment.read')
  async listDeliveredOrders() {
    return this.paymentsService.listDeliveredOrders();
  }

  @Get('order/:orderId/history')
  @RequirePermissions('finance.payment.read')
  async getOrderPaymentHistory(@Param('orderId') orderId: string) {
    return this.paymentsService.getOrderPaymentHistory(orderId);
  }

  @Post('run-daily-followup')
  @RequirePermissions('finance.payment.update')
  async runDailyFollowup(@Req() req: any) {
    const companyId = req.headers['x-company-id'] || req.user?.companyId;
    return this.paymentsService.runDailyFollowUpScan(companyId);
  }

  @Get(':id')
  @RequirePermissions('finance.payment.read')
  async getPayment(@Param('id') id: string, @Req() req: any) {
    return this.paymentsService.getPayment(id, req.user?.sub, req.user?.role);
  }

  @Get()
  @RequirePermissions('finance.payment.read')
  async listPayments(@Req() req: any) {
    return this.paymentsService.listPayments(req.user?.sub, req.user?.role);
  }

  @Post()
  @RequirePermissions('finance.payment.create')
  async createPayment(
    @Body()
    dto: {
      customerId: string;
      salesOrderId?: string;
      amount: number;
      method?: string;
      transactionReference?: string;
      proofUrl?: string;
      remarks?: string;
    },
    @Req() req: any,
  ) {
    return this.paymentsService.createPayment(dto, req.user?.sub);
  }

  @Post('sales-record')
  @RequirePermissions('sales.orders.update')
  async recordPaymentFromSales(
    @Body()
    dto: {
      customerId: string;
      salesOrderId: string;
      amount: number;
      proofUrl?: string;
      method?: string;
      transactionReference?: string;
      bankName?: string;
      paymentDate?: string;
      remarks?: string;
    },
    @Req() req: any,
  ) {
    return this.paymentsService.recordPaymentFromSales(dto, req.user?.sub);
  }

  @Post(':id/submit-verification')
  @RequirePermissions('finance.payment.create')
  async submitForVerification(@Param('id') id: string, @Req() req: any) {
    return this.paymentsService.submitForVerification(id, req.user?.sub);
  }

  @Post(':id/verify')
  @RequirePermissions('finance.payment.update')
  async verifyPayment(@Param('id') id: string, @Req() req: any) {
    return this.paymentsService.verifyPayment(id, req.user?.sub);
  }

  @Post(':id/reject')
  @RequirePermissions('finance.payment.update')
  async rejectPayment(
    @Param('id') id: string,
    @Body() dto: { rejectionReason: string; remarks?: string },
    @Req() req: any,
  ) {
    return this.paymentsService.rejectPayment(id, dto, req.user?.sub);
  }

  @Post(':id/allocate')
  @RequirePermissions('finance.payment.update')
  async allocatePayment(
    @Param('id') id: string,
    @Body() dto: { allocations: { invoiceId: string; amount: number }[] },
    @Req() req: any,
  ) {
    return this.paymentsService.allocatePayment(
      id,
      dto.allocations,
      req.user?.sub,
    );
  }

  @Post(':id/bounce')
  @RequirePermissions('finance.payment.update')
  async markBounced(
    @Param('id') id: string,
    @Body() dto: { remarks?: string },
    @Req() req: any,
  ) {
    return this.paymentsService.markBounced(id, dto?.remarks, req.user?.sub);
  }
}
