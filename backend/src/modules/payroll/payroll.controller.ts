import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PayrollService } from './payroll.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class PayrollController {
  constructor(private readonly service: PayrollService) {}

  // ==========================================
  // HR PAYROLL ENDPOINTS
  // ==========================================

  @Post('hr/payroll/generate')
  generate(@Body() body: any, @Req() req: any) {
    return this.service.generate(body, req.user);
  }

  @Get('hr/payroll')
  listHrPayroll(@Query() query: any, @Req() req: any) {
    return this.service.list(query, req.user);
  }

  @Get('hr/payroll/:id')
  getPayrollRecord(@Param('id') id: string, @Req() req: any) {
    return this.service.get(id, req.user);
  }

  @Post('hr/payroll/:id/verify')
  verifyRecord(@Param('id') id: string, @Req() req: any) {
    return this.service.verify(id, req.user);
  }

  @Post('hr/payroll/:id/edit-returned')
  editReturnedRecord(@Param('id') id: string, @Req() req: any) {
    return this.service.editReturned(id, req.user);
  }

  @Post('hr/payroll/send-to-super-admin')
  sendToSuperAdmin(@Body() body: { ids: string[] }, @Req() req: any) {
    return this.service.submitToSuperAdmin(body.ids, req.user);
  }

  // ==========================================
  // SUPER ADMIN PAYROLL APPROVAL ENDPOINTS
  // ==========================================

  @Get('super-admin/payroll/pending')
  listSuperAdminPending(@Query() query: any, @Req() req: any) {
    return this.service.list(query, req.user, [
      'PENDING_SUPER_ADMIN_APPROVAL',
      'ON_HOLD',
    ]);
  }

  @Post('super-admin/payroll/:id/approve')
  approveRecord(@Param('id') id: string, @Req() req: any) {
    return this.service.approve(id, req.user);
  }

  @Post('super-admin/payroll/:id/hold')
  holdRecord(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.service.hold(id, body, req.user);
  }

  @Post('super-admin/payroll/:id/return')
  returnRecordToHr(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.service.returnToHr(id, body, req.user);
  }

  @Post('super-admin/payroll/:id/reject')
  rejectRecord(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.service.reject(id, body, req.user);
  }

  @Post('super-admin/payroll/send-to-finance')
  sendToFinance(@Body() body: { ids: string[] }, @Req() req: any) {
    return this.service.sendToFinance(body.ids, req.user);
  }

  // ==========================================
  // FINANCE PAYROLL DISBURSEMENT ENDPOINTS
  // ==========================================

  @Get('finance/payroll/pending')
  listFinancePending(@Query() query: any, @Req() req: any) {
    return this.service.list(query, req.user, ['PENDING_FINANCE']);
  }

  @Get('finance/payroll/processing')
  listFinanceProcessing(@Query() query: any, @Req() req: any) {
    return this.service.list(query, req.user, ['PROCESSING']);
  }

  @Get('finance/payroll/paid')
  listFinancePaidHistory(@Query() query: any, @Req() req: any) {
    return this.service.list(query, req.user, ['PAID']);
  }

  @Post('finance/payroll/start-processing')
  startProcessing(@Body() body: { ids: string[] }, @Req() req: any) {
    return this.service.startProcessing(body.ids, req.user);
  }

  @Post('finance/payroll/:id/mark-paid')
  markPaid(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.service.markPaid(id, body, req.user);
  }

  // ==========================================
  // EMPLOYEE PROFILE SELF-SERVICE ENDPOINTS
  // ==========================================

  @Get('payroll/me')
  getOwnSalarySlips(@Req() req: any) {
    return this.service.getOwnSalarySlips(req.user);
  }

  @Get('payroll/me/:id/slip')
  getOwnSalarySlipDetail(@Param('id') id: string, @Req() req: any) {
    return this.service.getSalarySlipPdf(id, req.user);
  }
}
