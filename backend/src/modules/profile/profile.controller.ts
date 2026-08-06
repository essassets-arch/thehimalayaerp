import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  getProfile(@Req() req: any) {
    const userId = req.user?.sub;
    const companyId = req.headers['x-company-id'] || req.user?.companyId || 'd039cfa4-e78b-4138-adfc-1b0f14cffa91';
    return this.profileService.getProfile(userId, companyId);
  }

  @Get('attendance')
  getAttendance(@Req() req: any) {
    const userId = req.user?.sub;
    const companyId = req.headers['x-company-id'] || req.user?.companyId || 'd039cfa4-e78b-4138-adfc-1b0f14cffa91';
    return this.profileService.getAttendance(userId, companyId);
  }

  @Get('salary-slips')
  getSalarySlips(@Req() req: any) {
    const userId = req.user?.sub;
    const companyId = req.headers['x-company-id'] || req.user?.companyId || 'd039cfa4-e78b-4138-adfc-1b0f14cffa91';
    return this.profileService.getSalarySlips(userId, companyId);
  }

  @Get('my-expenses')
  getMyExpenses(@Req() req: any) {
    const userId = req.user?.sub;
    const companyId = req.headers['x-company-id'] || req.user?.companyId || 'd039cfa4-e78b-4138-adfc-1b0f14cffa91';
    return this.profileService.getMyExpenses(userId, companyId);
  }
}
