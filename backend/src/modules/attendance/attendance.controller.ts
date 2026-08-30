import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Param,
  Query,
  Req,
  ForbiddenException,
  Delete,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('attendance')
@UseGuards(JwtAuthGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get('me/today')
  getTodayAttendance(@Req() req: any) {
    const userId = req.user?.sub || req.user?.id || req.user?.userId;
    const companyId = '88c57ebc-b3b7-49e3-8d5d-6321a0e89015';
    if (!userId) {
      return {
        status: 'NOT_PUNCHED_IN',
        isPunchedIn: false,
        isPunchedOut: false,
        punchInTime: null,
        punchOutTime: null,
      };
    }
    return this.attendanceService.getTodayAttendance(userId, companyId);
  }

  @Get('me')
  getMyAttendanceHistory(@Req() req: any, @Query() query: any) {
    const userId = req.user?.sub || req.user?.id || req.user?.userId;
    const companyId = '88c57ebc-b3b7-49e3-8d5d-6321a0e89015';
    return this.attendanceService.getMyAttendanceHistory(
      userId,
      companyId,
      query,
    );
  }

  @Post('punch-in')
  punchIn(@Req() req: any, @Body() body: any) {
    const userId = req.user?.sub || req.user?.id || req.user?.userId;
    const companyId = '88c57ebc-b3b7-49e3-8d5d-6321a0e89015';
    return this.attendanceService.punchIn(userId, companyId, body);
  }

  @Post('punch-out')
  punchOut(@Req() req: any, @Body() body: any) {
    const userId = req.user?.sub || req.user?.id || req.user?.userId;
    const companyId = '88c57ebc-b3b7-49e3-8d5d-6321a0e89015';
    return this.attendanceService.punchOut(userId, companyId, body);
  }

  @Get('summary')
  getAttendanceSummary(@Req() req: any, @Query('date') dateStr?: string) {
    const companyId = '88c57ebc-b3b7-49e3-8d5d-6321a0e89015';
    return this.attendanceService.getAttendanceSummary(companyId, dateStr);
  }

  @Get()
  listCompanyAttendance(@Req() req: any, @Query() query: any) {
    const rawRole = req.user?.role;
    const roleCode =
      typeof rawRole === 'string'
        ? rawRole
        : rawRole?.code || rawRole?.name || '';
    const upperRole = roleCode.toUpperCase();
    const allowedRoles = [
      'HR',
      'SUPER_ADMIN',
      'ADMIN',
      'FINANCE',
      'FINANCE_MANAGER',
      'PLANT_HEAD',
      'PLANT_HEAD_MANAGER',
    ];
    if (!allowedRoles.some((r) => upperRole.includes(r))) {
      return this.attendanceService.getMyAttendanceHistory(
        req.user?.sub,
        '88c57ebc-b3b7-49e3-8d5d-6321a0e89015',
        query,
      );
    }
    const companyId = '88c57ebc-b3b7-49e3-8d5d-6321a0e89015';
    return this.attendanceService.listCompanyAttendance(companyId, query);
  }

  // Shift policy management
  @Get('policies')
  getAllShiftPolicies() {
    return this.attendanceService.getAllShiftPolicies();
  }

  @Post('policies/:deptName')
  saveShiftPolicy(@Param('deptName') deptName: string, @Body() body: any) {
    return this.attendanceService.saveShiftPolicy(deptName, body);
  }

  // HR Employee Attendance breakdown endpoint
  @Get('employees/:employeeId')
  getEmployeeMonthlyAttendance(
    @Req() req: any,
    @Param('employeeId') employeeId: string,
    @Query('month') monthStr?: string,
  ) {
    const role = req.user.role;
    if (
      role !== 'HR' &&
      role !== 'SUPER_ADMIN' &&
      role !== 'ADMIN' &&
      role !== 'Super Admin' &&
      role !== 'Admin'
    ) {
      throw new ForbiddenException(
        'Not authorized to access employee attendance details',
      );
    }
    const companyId = '88c57ebc-b3b7-49e3-8d5d-6321a0e89015';
    return this.attendanceService.getEmployeeMonthlyAttendance(
      employeeId,
      companyId,
      monthStr,
    );
  }

  @Delete('clear-all')
  clearAll() {
    return this.attendanceService.clearAll();
  }
}
