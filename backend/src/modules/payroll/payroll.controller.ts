import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  Res,
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

  @Post(['hr/payroll/generate', 'hr/payroll/generate-bulk'])
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

  @Post(['hr/payroll/send-to-super-admin', 'hr/payroll/:id/submit', 'hr/payroll/submit-bulk'])
  sendToSuperAdmin(@Param('id') idParam: string, @Body() body: any, @Req() req: any) {
    const ids = body?.ids || body?.records?.map((r: any) => r?.id || r) || (idParam ? [idParam] : []);
    return this.service.submitToSuperAdmin(ids, req.user);
  }

  @Get(['hr/payroll/attendance-summary/:employeeId', 'payroll/attendance-summary/:employeeId'])
  getPayrollAttendanceSummary(
    @Param('employeeId') employeeId: string,
    @Query('month') month: string,
    @Req() req: any,
  ) {
    return this.service.getPayrollAttendanceSummary(employeeId, month, req.user);
  }

  // ==========================================
  // SUPER ADMIN PAYROLL APPROVAL ENDPOINTS
  // ==========================================

  @Get(['super-admin/payroll/pending', 'hr/payroll/approvals/pending'])
  listSuperAdminPending(@Query() query: any, @Req() req: any) {
    return this.service.list(query, req.user, [
      'PENDING_SUPER_ADMIN_APPROVAL',
      'ON_HOLD',
    ]);
  }

  @Post(['super-admin/payroll/:id/approve', 'hr/payroll/:id/approve'])
  approveRecord(@Param('id') id: string, @Req() req: any) {
    return this.service.approve(id, req.user);
  }

  @Post(['super-admin/payroll/:id/hold', 'hr/payroll/:id/hold'])
  holdRecord(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.service.hold(id, body, req.user);
  }

  @Post(['super-admin/payroll/:id/return', 'hr/payroll/:id/return', 'hr/payroll/:id/return-for-correction'])
  returnRecordToHr(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.service.returnToHr(id, body, req.user);
  }

  @Post(['super-admin/payroll/:id/reject', 'hr/payroll/:id/reject'])
  rejectRecord(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.service.reject(id, body, req.user);
  }

  @Post(['super-admin/payroll/send-to-finance', 'hr/payroll/send-to-finance'])
  sendToFinance(@Body() body: any, @Req() req: any) {
    const ids = body?.ids || body?.records?.map((r: any) => r?.id || r) || [];
    return this.service.sendToFinance(ids, req.user);
  }

  // ==========================================
  // FINANCE PAYROLL DISBURSEMENT ENDPOINTS
  // ==========================================

  @Get(['finance/payroll/pending', 'hr/payroll/finance/pending'])
  listFinancePending(@Query() query: any, @Req() req: any) {
    return this.service.list(query, req.user, ['PENDING_FINANCE']);
  }

  @Get(['finance/payroll/processing', 'hr/payroll/finance/processing'])
  listFinanceProcessing(@Query() query: any, @Req() req: any) {
    return this.service.list(query, req.user, ['PROCESSING']);
  }

  @Get(['finance/payroll/paid', 'hr/payroll/finance/history'])
  listFinancePaidHistory(@Query() query: any, @Req() req: any) {
    return this.service.list(query, req.user, ['PAID']);
  }

  @Post(['finance/payroll/start-processing', 'hr/payroll/:id/start-processing', 'hr/payroll/start-processing-bulk'])
  startProcessing(@Param('id') idParam: string, @Body() body: any, @Req() req: any) {
    const ids = body?.ids || body?.records?.map((r: any) => r?.id || r) || (idParam ? [idParam] : []);
    return this.service.startProcessing(ids, req.user);
  }

  @Post(['finance/payroll/:id/mark-paid', 'hr/payroll/:id/mark-paid'])
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

  @Get(['salary-slips/payroll/:payrollRecordId', 'hr/salary-slips/payroll/:payrollRecordId'])
  getSalarySlipByPayrollId(@Param('payrollRecordId') payrollRecordId: string, @Req() req: any) {
    return this.service.getSalarySlipByPayrollId(payrollRecordId, req.user);
  }

  @Get(['salary-slips/:id', 'hr/salary-slips/:id'])
  getSalarySlipDetail(@Param('id') id: string, @Req() req: any) {
    return this.service.getSalarySlipPdf(id, req.user);
  }

  @Get(['salary-slips/:id/pdf', 'hr/salary-slips/:id/pdf'])
  async getSalarySlipPdfFile(@Param('id') id: string, @Req() req: any, @Res() res: any) {
    const result = await this.service.getSalarySlipPdfBuffer(id, req.user);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    return res.send(result.buffer);
  }

  @Post(['salary-slips/:id/share', 'hr/salary-slips/:id/share'])
  createSalarySlipShare(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.service.createSalarySlipShare(id, body, req.user);
  }

  @Delete(['salary-slips/shares/:shareId', 'hr/salary-slips/shares/:shareId'])
  revokeSalarySlipShare(@Param('shareId') shareId: string) {
    return this.service.revokeSalarySlipShare(shareId);
  }

  @Get(['salary-slips/shared/:token', 'hr/salary-slips/shared/:token'])
  getPublicSharedSalarySlip(@Param('token') token: string) {
    return this.service.getPublicSharedSalarySlip(token);
  }

  // ==========================================
  // SALARY STRUCTURE / CTC ENDPOINTS
  // ==========================================

  @Get(['hr/salary-structures', 'salary-structures'])
  listSalaryStructures(@Req() req: any) {
    return this.service.listSalaryStructures(req.user);
  }

  @Get(['hr/salary-structures/:id', 'salary-structures/:id'])
  getSalaryStructure(@Param('id') id: string, @Req() req: any) {
    return this.service.getSalaryStructure(id, req.user);
  }

  @Get(['hr/salary-structures/employee/:employeeId', 'salary-structures/employee/:employeeId'])
  getEmployeeSalaryStructure(@Param('employeeId') employeeId: string, @Req() req: any) {
    return this.service.getEmployeeSalaryStructure(employeeId, req.user);
  }

  @Post(['hr/salary-structures', 'salary-structures'])
  createSalaryStructure(@Body() body: any, @Req() req: any) {
    return this.service.createSalaryStructure(body, req.user);
  }

  @Put(['hr/salary-structures/:id', 'salary-structures/:id'])
  updateSalaryStructure(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.service.updateSalaryStructure(id, body, req.user);
  }

  @Patch(['hr/salary-structures/:id', 'salary-structures/:id'])
  patchSalaryStructure(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.service.updateSalaryStructure(id, body, req.user);
  }

  @Delete(['hr/salary-structures/:id', 'salary-structures/:id'])
  deleteSalaryStructure(@Param('id') id: string, @Req() req: any) {
    return this.service.deleteSalaryStructure(id, req.user);
  }
}
