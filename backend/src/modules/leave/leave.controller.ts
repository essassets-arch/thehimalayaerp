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
import { LeaveService } from './leave.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { resolveTenantId } from '../../common/utils/tenant.util';

@Controller('leaves')
@UseGuards(JwtAuthGuard)
export class LeaveController {
  constructor(private readonly leaveService: LeaveService) {}

  @Post()
  applyLeave(@Body() body: any, @Req() req: any) {
    const userId = req.user?.sub;
    const companyId = resolveTenantId(req);
    return this.leaveService.applyLeave(body, userId, companyId);
  }

  @Get('my')
  getMyLeaves(@Req() req: any) {
    const userId = req.user?.sub;
    const companyId = resolveTenantId(req);
    return this.leaveService.getMyLeaves(userId, companyId);
  }

  @Get('balance')
  getLeaveBalance(@Req() req: any) {
    const userId = req.user?.sub;
    const companyId = resolveTenantId(req);
    return this.leaveService.getLeaveBalance(userId, companyId);
  }

  @Get('pending')
  getPendingLeaves(@Req() req: any) {
    const userId = req.user?.sub;
    const companyId = resolveTenantId(req);
    return this.leaveService.getPendingLeaves(userId, companyId);
  }

  @Patch(':id/approve')
  approveLeave(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    const userId = req.user?.sub;
    const companyId = resolveTenantId(req);
    return this.leaveService.approveLeave(id, body, userId, companyId);
  }

  @Patch(':id/reject')
  rejectLeave(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    const userId = req.user?.sub;
    const companyId = resolveTenantId(req);
    return this.leaveService.rejectLeave(id, body, userId, companyId);
  }

  @Get()
  getLeaves(@Req() req: any) {
    const userId = req.user?.sub;
    const companyId = resolveTenantId(req);
    return this.leaveService.getAllLeaves(userId, companyId);
  }

  @Get('all')
  getAllLeaves(@Req() req: any) {
    const userId = req.user?.sub;
    const companyId = resolveTenantId(req);
    return this.leaveService.getAllLeaves(userId, companyId);
  }
}
