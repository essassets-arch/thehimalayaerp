import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { ComplaintsService } from './complaints.service';
import {
  CreateComplaintDto,
  UpdateComplaintStatusDto,
  ComplaintQueryDto,
} from './dto/complaint.dto';

@Controller()
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ComplaintsController {
  constructor(private readonly complaintsService: ComplaintsService) {}

  /**
   * Submit a new workplace complaint.
   * Complainant identity is strictly derived from JWT req.user.sub.
   */
  @Post('complaints')
  async createComplaint(@Req() req: any, @Body() dto: CreateComplaintDto) {
    const userId = req.user?.sub || req.user?.id;
    const companyId = req.user?.companyId || req.headers['x-company-id'];
    return this.complaintsService.createComplaint(userId, companyId, dto);
  }

  /**
   * Get all complaints submitted by the authenticated user.
   */
  @Get('complaints/my')
  async getMyComplaints(@Req() req: any) {
    const userId = req.user?.sub || req.user?.id;
    const companyId = req.user?.companyId || req.headers['x-company-id'];
    return this.complaintsService.getMyComplaints(userId, companyId);
  }

  /**
   * HR / Admin endpoint to list all company complaints with filters & stats.
   */
  @Get('hr/complaints')
  async getHrComplaints(@Req() req: any, @Query() query: ComplaintQueryDto) {
    const companyId = req.user?.companyId || req.headers['x-company-id'];
    return this.complaintsService.getHrComplaints(companyId, query);
  }

  /**
   * HR / Admin endpoint to update complaint status and add resolution remarks.
   */
  @Patch('hr/complaints/:id/status')
  async updateComplaintStatus(
    @Param('id') id: string,
    @Req() req: any,
    @Body() dto: UpdateComplaintStatusDto,
  ) {
    const resolverUserId = req.user?.sub || req.user?.id;
    const companyId = req.user?.companyId || req.headers['x-company-id'];
    return this.complaintsService.updateComplaintStatus(
      id,
      companyId,
      resolverUserId,
      dto,
    );
  }
}
