import { Controller, Get, Post, Body, UseGuards, Param } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('attendance')
@UseGuards(JwtAuthGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get('punches')
  getAllPunches() {
    return this.attendanceService.getAllPunches();
  }

  @Post('punches')
  createPunch(@Body() body: any) {
    return this.attendanceService.createPunch(body);
  }

  @Get('policies')
  getAllShiftPolicies() {
    return this.attendanceService.getAllShiftPolicies();
  }

  @Post('policies/:deptName')
  saveShiftPolicy(@Param('deptName') deptName: string, @Body() body: any) {
    return this.attendanceService.saveShiftPolicy(deptName, body);
  }
}
