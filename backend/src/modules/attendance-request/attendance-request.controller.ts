import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AttendanceRequestService } from './attendance-request.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('attendance-requests')
@UseGuards(JwtAuthGuard)
export class AttendanceRequestController {
  constructor(
    private readonly attendanceRequestService: AttendanceRequestService,
  ) {}

  @Post()
  createRequest(@Body() body: any, @Req() req: any) {
    const userId = req.user?.sub;
    const companyId =
      req.headers['x-company-id'] ||
      req.user?.companyId ||
      'd039cfa4-e78b-4138-adfc-1b0f14cffa91';
    return this.attendanceRequestService.createRequest(userId, companyId, body);
  }

  @Get('my')
  getMyRequests(@Req() req: any) {
    const userId = req.user?.sub;
    const companyId =
      req.headers['x-company-id'] ||
      req.user?.companyId ||
      'd039cfa4-e78b-4138-adfc-1b0f14cffa91';
    return this.attendanceRequestService.getMyRequests(userId, companyId);
  }

  @Get('pending')
  getPendingRequests(@Req() req: any) {
    const userId = req.user?.sub;
    const companyId =
      req.headers['x-company-id'] ||
      req.user?.companyId ||
      'd039cfa4-e78b-4138-adfc-1b0f14cffa91';
    return this.attendanceRequestService.getPendingRequests(userId, companyId);
  }

  @Get('history')
  getAuditHistory(@Req() req: any) {
    const userId = req.user?.sub;
    const companyId =
      req.headers['x-company-id'] ||
      req.user?.companyId ||
      'd039cfa4-e78b-4138-adfc-1b0f14cffa91';
    return this.attendanceRequestService.getAuditHistory(userId, companyId);
  }

  @Patch(':id/approve')
  approveRequest(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    const userId = req.user?.sub;
    const companyId =
      req.headers['x-company-id'] ||
      req.user?.companyId ||
      'd039cfa4-e78b-4138-adfc-1b0f14cffa91';
    return this.attendanceRequestService.approveRequest(
      id,
      userId,
      companyId,
      body,
    );
  }

  @Patch(':id/reject')
  rejectRequest(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    const userId = req.user?.sub;
    const companyId =
      req.headers['x-company-id'] ||
      req.user?.companyId ||
      'd039cfa4-e78b-4138-adfc-1b0f14cffa91';
    return this.attendanceRequestService.rejectRequest(
      id,
      userId,
      companyId,
      body,
    );
  }
}
