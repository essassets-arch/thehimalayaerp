import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import {
  UseGuards,
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  Req,
} from '@nestjs/common';
import { LeadsService } from './leads.service';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';

@Controller(['crm/leads', 'sales/leads'])
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @RequirePermissions('sales.leads.read')
  @Get()
  // @RequirePermissions('sales.leads.read')
  async listLeads(@Req() req: any, @Query('search') search?: string) {
    const resolvedCompanyId =
      req.user?.companyId || req.headers['x-company-id'];
    return this.leadsService.listLeads(
      resolvedCompanyId,
      search,
      req.user?.sub || req.user?.id,
      req.user?.role,
    );
  }

  @RequirePermissions('sales.leads.read')
  @Get(':id')
  // @RequirePermissions('sales.leads.read')
  async getLead(@Param('id') id: string, @Req() req: any) {
    const resolvedCompanyId =
      req.user?.companyId || req.headers['x-company-id'];
    return this.leadsService.getLead(
      id,
      resolvedCompanyId,
      req.user?.sub || req.user?.id,
      req.user?.role,
    );
  }

  @RequirePermissions('sales.leads.create')
  @Post()
  // @RequirePermissions('sales.leads.create')
  async createLead(@Body() dto: any, @Req() req: any) {
    return this.leadsService.createLead(
      dto,
      req.user?.id || req.user?.sub,
      req.user?.companyId || req.headers['x-company-id'],
      req.user?.role,
    );
  }

  @RequirePermissions('sales.leads.update')
  @Patch(':id')
  // @RequirePermissions('sales.leads.update')
  async updateLead(@Param('id') id: string, @Body() dto: any, @Req() req: any) {
    return this.leadsService.updateLead(
      id,
      dto,
      req.user?.sub || req.user?.id,
      req.user?.companyId || req.headers['x-company-id'],
      req.user?.role,
    );
  }

  @Post(':id/activities')
  @RequirePermissions('sales.leads.update')
  async addActivity(
    @Param('id') id: string,
    @Body() dto: { activityType: string; notes?: string; scheduledAt?: string },
    @Req() req: any,
  ) {
    return this.leadsService.addActivity(
      id,
      dto,
      req.user?.sub || 'SYSTEM',
      req.user?.role,
    );
  }

  @Post(':id/activity')
  @RequirePermissions('sales.leads.update')
  async addActivityAlias(
    @Param('id') id: string,
    @Body() dto: { activityType: string; notes?: string; scheduledAt?: string },
    @Req() req: any,
  ) {
    return this.leadsService.addActivity(
      id,
      dto,
      req.user?.sub || 'SYSTEM',
      req.user?.role,
    );
  }

  @Post(':id/action')
  @RequirePermissions('sales.leads.update')
  async processAction(
    @Param('id') id: string,
    @Body() dto: { action: string; remarks?: string },
    @Req() req: any,
  ) {
    return this.leadsService.processAction(
      id,
      dto.action,
      dto.remarks,
      req.user?.sub,
      req.user?.role,
    );
  }

  @Get(':id/timeline')
  @RequirePermissions('sales.leads.read')
  async timeline(@Param('id') id: string, @Req() req: any) {
    return this.leadsService.getTimeline(id, req.user?.sub, req.user?.role);
  }

  @Post(':id/followups')
  @RequirePermissions('sales.leads.update')
  async addFollowup(
    @Param('id') id: string,
    @Body() dto: any,
    @Req() req: any,
  ) {
    return this.leadsService.addActivity(
      id,
      {
        activityType: dto.activityType || 'FOLLOW_UP',
        notes: dto.notes,
        scheduledAt: dto.scheduledAt || dto.reminderAt,
      },
      req.user?.sub || 'SYSTEM',
      req.user?.role,
    );
  }

  @Post(':id/reminders')
  @RequirePermissions('sales.leads.update')
  async addReminder(
    @Param('id') id: string,
    @Body() dto: any,
    @Req() req: any,
  ) {
    return this.leadsService.updateLead(
      id,
      {
        nextReminder: dto.reminderAt || dto.nextReminderAt || dto.nextReminder,
      },
      req.user?.sub || 'SYSTEM',
      req.user?.companyId,
      req.user?.role,
    );
  }

  @Post(':id/qualify')
  @RequirePermissions('sales.leads.update')
  async qualify(@Param('id') id: string, @Body() dto: any, @Req() req: any) {
    return this.leadsService.processAction(
      id,
      dto.action || 'IDENTIFY_REQ',
      dto.remarks,
      req.user?.sub,
      req.user?.role,
    );
  }

  @Post(':id/mark-lost')
  @RequirePermissions('sales.leads.update')
  async markLost(@Param('id') id: string, @Body() dto: any, @Req() req: any) {
    await this.leadsService.updateLead(
      id,
      { lostReason: dto.reason || dto.lostReason },
      req.user?.sub || 'SYSTEM',
      req.user?.companyId,
      req.user?.role,
    );
    return this.leadsService.processAction(
      id,
      'LOST',
      dto.remarks,
      req.user?.sub,
      req.user?.role,
    );
  }

  @Post(':id/restore')
  @RequirePermissions('sales.leads.update')
  async restore(@Param('id') id: string, @Req() req: any) {
    return this.leadsService.restoreLead(
      id,
      req.user?.sub || 'SYSTEM',
      req.headers['x-company-id'] || req.user?.companyId,
      req.user?.role,
    );
  }
}
