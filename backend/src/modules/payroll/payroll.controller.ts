import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { PayrollService } from './payroll.service';

@Controller('hr')
export class PayrollController {
  constructor(private readonly service: PayrollService) {}

  @Get('salary-structures')
  @Permissions('hr.payroll.read')
  structures(@Req() req: any) {
    return this.service.structures(req.user);
  }

  @Post('salary-structures/:employeeId')
  @Permissions('hr.payroll.prepare')
  saveStructure(
    @Param('employeeId') id: string,
    @Body() body: any,
    @Req() req: any,
  ) {
    return this.service.saveStructure(id, body, req.user);
  }

  @Post('attendance-summary/:employeeId')
  @Permissions('hr.payroll.prepare')
  saveAttendance(
    @Param('employeeId') id: string,
    @Body() body: any,
    @Req() req: any,
  ) {
    return this.service.saveAttendanceSummary(id, body, req.user);
  }

  @Get('payroll-periods')
  @Permissions('hr.payroll.read')
  periods() {
    return this.service.periods();
  }

  @Post('payroll-periods')
  @Permissions('hr.payroll.prepare')
  period(@Body() body: any) {
    return this.service.period(Number(body.month), Number(body.year));
  }

  @Post('payroll-periods/:id/lock-attendance')
  @Permissions('hr.payroll.prepare')
  lock(@Param('id') id: string, @Req() req: any) {
    return this.service.periodAction(id, 'lock', req.user);
  }

  @Post('payroll-periods/:id/close')
  @Permissions('hr.payroll.prepare')
  close(@Param('id') id: string, @Req() req: any) {
    return this.service.periodAction(id, 'close', req.user);
  }

  @Get('payroll/approvals/pending')
  @Permissions('superadmin.payroll.read')
  approvals(@Query() query: any, @Req() req: any) {
    return this.service.list(query, req.user, [
      'PENDING_SUPER_ADMIN_APPROVAL',
      'SUPER_ADMIN_APPROVED',
    ]);
  }

  @Get('payroll/finance/pending')
  @Permissions('finance.payroll.read')
  financePending(@Query() query: any, @Req() req: any) {
    return this.service.list(query, req.user, ['SENT_TO_FINANCE']);
  }

  @Get('payroll/finance/processing')
  @Permissions('finance.payroll.read')
  processing(@Query() query: any, @Req() req: any) {
    return this.service.list(query, req.user, ['PAYMENT_PROCESSING']);
  }

  @Get('payroll/finance/history')
  @Permissions('finance.payroll.history')
  history(@Query() query: any, @Req() req: any) {
    return this.service.list(query, req.user, ['SALARY_PAID']);
  }

  @Get('payroll')
  @Permissions('hr.payroll.read')
  list(@Query() query: any, @Req() req: any) {
    return this.service.list(query, req.user);
  }

  @Post('payroll/generate')
  @Permissions('hr.payroll.prepare')
  generate(@Body() body: any, @Req() req: any) {
    return this.service.generate(body, req.user);
  }

  @Post('payroll/generate-bulk')
  @Permissions('hr.payroll.prepare')
  generateBulk(@Body() body: any, @Req() req: any) {
    return this.service.generate(body, req.user);
  }

  @Post('payroll/submit-bulk')
  @Permissions('hr.payroll.submit')
  submitBulk(@Body() body: any, @Req() req: any) {
    return Promise.all(
      body.records.map((item: any) =>
        this.service.submit(item.id, item, req.user),
      ),
    );
  }

  @Post('payroll/send-to-finance')
  @Permissions('superadmin.payroll.send_to_finance')
  sendBulk(@Body() body: any, @Req() req: any) {
    return Promise.all(
      body.records.map((item: any) =>
        this.service.sendFinance(item.id, item, req.user),
      ),
    );
  }

  @Post('payroll/start-processing-bulk')
  @Permissions('finance.payroll.process')
  startBulk(@Body() body: any, @Req() req: any) {
    return Promise.all(
      body.records.map((item: any) =>
        this.service.start(item.id, item, req.user),
      ),
    );
  }

  @Get('payroll/:id')
  @Permissions('hr.payroll.read')
  get(@Param('id') id: string, @Req() req: any) {
    return this.service.get(id, req.user);
  }

  @Post('payroll/:id/submit')
  @Permissions('hr.payroll.submit')
  submit(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.service.submit(id, body, req.user);
  }

  @Post('payroll/:id/approve')
  @Permissions('superadmin.payroll.approve')
  approve(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.service.approve(id, body, req.user);
  }

  @Post('payroll/:id/reject')
  @Permissions('superadmin.payroll.reject')
  reject(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.service.reject(id, body, req.user);
  }

  @Post('payroll/:id/hold')
  @Permissions('superadmin.payroll.hold')
  hold(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.service.hold(id, body, req.user);
  }

  @Post('payroll/:id/return-for-correction')
  @Permissions('superadmin.payroll.reject')
  correction(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.service.correction(id, body, req.user);
  }

  @Post('payroll/:id/start-processing')
  @Permissions('finance.payroll.process')
  start(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.service.start(id, body, req.user);
  }

  @Post('payroll/:id/mark-paid')
  @Permissions('finance.payroll.pay')
  paid(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.service.markPaid(id, body, req.user);
  }

  @Post('payroll/:id/adjustments')
  @Permissions('hr.payroll.update')
  adjustment(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.service.adjustment(id, body, req.user);
  }

  @Get('salary-slips')
  @Permissions('salary_slips.read_all')
  slips(@Query() query: any, @Req() req: any) {
    return this.service.slips(query, req.user);
  }

  @Get('salary-slips/mine')
  @Permissions('salary_slips.read_own')
  ownSlips(@Req() req: any) {
    return this.service.ownSlips(req.user);
  }

  @Get('salary-slips/payroll/:payrollRecordId')
  @Permissions('salary_slips.read_all')
  slipByPayroll(@Param('payrollRecordId') id: string, @Req() req: any) {
    return this.service.slipByPayroll(id, req.user);
  }

  @Get('salary-slips/own/:id')
  @Permissions('salary_slips.read_own')
  ownSlip(@Param('id') id: string, @Req() req: any) {
    return this.service.ownSlip(id, req.user);
  }

  @Public()
  @Get('salary-slips/shared/:token/pdf')
  async sharedPdf(@Param('token') token: string, @Res() res: any) {
    const result = await this.service.publicPdf(token);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${result.filename}"`,
    );
    res.send(result.buffer);
  }

  @Public()
  @Get('salary-slips/shared/:token')
  shared(@Param('token') token: string) {
    return this.service.publicShare(token);
  }

  @Get('salary-slips/:id/pdf')
  @Permissions('salary_slips.download')
  async pdf(@Param('id') id: string, @Req() req: any, @Res() res: any) {
    const result = await this.service.pdf(id, req.user);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${result.filename}"`,
    );
    res.send(result.buffer);
  }

  @Post('salary-slips/:id/share')
  @Permissions('salary_slips.share')
  share(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.service.createShare(id, body, req.user);
  }

  @Delete('salary-slips/shares/:shareId')
  @Permissions('salary_slips.revoke_share')
  revoke(@Param('shareId') id: string, @Req() req: any) {
    return this.service.revokeShare(id, req.user);
  }

  @Post('salary-slips/:id/enable-employee-access')
  @Permissions('salary_slips.share')
  enableEmployee(@Param('id') id: string, @Req() req: any) {
    return this.service.enableEmployee(id, req.user);
  }

  @Post('salary-slips/:id/print')
  @Permissions('salary_slips.read_all')
  printAudit(@Param('id') id: string, @Req() req: any) {
    return this.service.printAudit(id, req.user);
  }

  @Get('salary-slips/:id')
  @Permissions('salary_slips.read_all')
  async slip(@Param('id') id: string, @Req() req: any) {
    const result = await this.service.slip(id, req.user);
    if (!result) throw new NotFoundException('Salary slip not found.');
    return result;
  }

  @Get('employees/:employeeId/salary-slips')
  @Permissions('salary_slips.read_all')
  employeeSlips(@Param('employeeId') employeeId: string, @Req() req: any) {
    return this.service.slips({ employeeId }, req.user);
  }
}
