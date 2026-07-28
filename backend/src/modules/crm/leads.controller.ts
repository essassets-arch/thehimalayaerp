import { Controller, Get, Post, Patch, Body, Param, Query, Req } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { Permissions } from '../../common/decorators/permissions.decorator';

@Controller(['crm/leads', 'sales/leads'])
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Get()
  @Permissions('crm.lead.read')
  async listLeads(@Req() req: any, @Query('search') search?: string) {
    return this.leadsService.listLeads(req.user?.companyId, search);
  }

  @Get(':id')
  @Permissions('crm.lead.read')
  async getLead(@Param('id') id: string, @Req() req: any) {
    return this.leadsService.getLead(id, req.user?.companyId);
  }

  @Post()
  @Permissions('crm.lead.create')
  async createLead(@Body() dto: any, @Req() req: any) {
    return this.leadsService.createLead(dto, req.user?.sub || 'SYSTEM', req.user?.companyId);
  }

  @Patch(':id')
  @Permissions('crm.lead.update')
  async updateLead(@Param('id') id: string, @Body() dto: any, @Req() req: any) {
    return this.leadsService.updateLead(id, dto, req.user?.sub || 'SYSTEM', req.user?.companyId);
  }

  @Post(':id/activities')
  @Permissions('crm.lead.update')
  async addActivity(@Param('id') id: string, @Body() dto: { activityType: string, notes?: string, scheduledAt?: string }, @Req() req: any) {
    return this.leadsService.addActivity(id, dto, req.user?.sub || 'SYSTEM');
  }

  @Post(':id/activity')
  @Permissions('crm.lead.update')
  async addActivityAlias(@Param('id') id: string, @Body() dto: { activityType: string, notes?: string, scheduledAt?: string }, @Req() req: any) {
    return this.leadsService.addActivity(id, dto, req.user?.sub || 'SYSTEM');
  }

  @Post(':id/action')
  @Permissions('crm.lead.update')
  async processAction(@Param('id') id: string, @Body() dto: { action: string, remarks?: string }, @Req() req: any) {
    return this.leadsService.processAction(id, dto.action, dto.remarks, req.user?.sub);
  }

  @Get(':id/timeline')
  @Permissions('crm.lead.read')
  async timeline(@Param('id') id: string) {
    return this.leadsService.getTimeline(id);
  }

  @Post(':id/followups')
  @Permissions('crm.lead.update')
  async addFollowup(@Param('id') id: string, @Body() dto: any, @Req() req: any) {
    return this.leadsService.addActivity(id, {
      activityType: dto.activityType || 'FOLLOW_UP',
      notes: dto.notes,
      scheduledAt: dto.scheduledAt || dto.reminderAt,
    }, req.user?.sub || 'SYSTEM');
  }

  @Post(':id/reminders')
  @Permissions('crm.lead.update')
  async addReminder(@Param('id') id: string, @Body() dto: any, @Req() req: any) {
    return this.leadsService.updateLead(id, {
      nextReminderAt: dto.reminderAt || dto.nextReminderAt,
    }, req.user?.sub || 'SYSTEM', req.user?.companyId);
  }

  @Post(':id/qualify')
  @Permissions('crm.lead.update')
  async qualify(@Param('id') id: string, @Body() dto: any, @Req() req: any) {
    return this.leadsService.processAction(id, dto.action || 'IDENTIFY_REQ', dto.remarks, req.user?.sub);
  }

  @Post(':id/mark-lost')
  @Permissions('crm.lead.update')
  async markLost(@Param('id') id: string, @Body() dto: any, @Req() req: any) {
    await this.leadsService.updateLead(id, { lostReason: dto.reason || dto.lostReason }, req.user?.sub || 'SYSTEM', req.user?.companyId);
    return this.leadsService.processAction(id, 'LOST', dto.remarks, req.user?.sub);
  }
}
