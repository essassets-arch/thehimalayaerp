import { Controller, Get, Post, Body, UseGuards, Param, Query, Req, ForbiddenException } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('attendance')
@UseGuards(JwtAuthGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get('me/today')
  getTodayAttendance(@Req() req: any) {
    const userId = req.user.sub;
    const companyId = req.user.companyId;
    return this.attendanceService.getTodayAttendance(userId, companyId);
  }

  @Get('me')
  getMyAttendanceHistory(@Req() req: any, @Query() query: any) {
    const userId = req.user.sub;
    const companyId = req.user.companyId;
    return this.attendanceService.getMyAttendanceHistory(userId, companyId, query);
  }

  @Post('punch-in')
  punchIn(@Req() req: any, @Body() body: any) {
    const userId = req.user.sub;
    const companyId = req.user.companyId;
    return this.attendanceService.punchIn(userId, companyId, body);
  }

  @Post('punch-out')
  punchOut(@Req() req: any, @Body() body: any) {
    const userId = req.user.sub;
    const companyId = req.user.companyId;
    return this.attendanceService.punchOut(userId, companyId, body);
  }

  @Get('summary')
  getAttendanceSummary(@Req() req: any) {
    const role = req.user.role;
    // Authorized roles: Super Admin, Admin, HR
    if (role !== 'HR' && role !== 'SUPER_ADMIN' && role !== 'ADMIN' && role !== 'Super Admin' && role !== 'Admin') {
      throw new ForbiddenException('Not authorized to access attendance summary');
    }
    const companyId = req.user.companyId;
    return this.attendanceService.getAttendanceSummary(companyId);
  }

  @Get()
  listCompanyAttendance(@Req() req: any, @Query() query: any) {
    const role = req.user.role;
    if (role !== 'HR' && role !== 'SUPER_ADMIN' && role !== 'ADMIN' && role !== 'Super Admin' && role !== 'Admin') {
      throw new ForbiddenException('Not authorized to access company attendance logs');
    }
    const companyId = req.user.companyId;
    return this.attendanceService.listCompanyAttendance(companyId, query);
  }

  @Get(':id')
  getAttendanceById(@Req() req: any, @Param('id') id: string) {
    const role = req.user.role;
    if (role !== 'HR' && role !== 'SUPER_ADMIN' && role !== 'ADMIN' && role !== 'Super Admin' && role !== 'Admin') {
      throw new ForbiddenException('Not authorized to access attendance details');
    }
    const companyId = req.user.companyId;
    return this.attendanceService.getAttendanceById(companyId, id);
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
}
