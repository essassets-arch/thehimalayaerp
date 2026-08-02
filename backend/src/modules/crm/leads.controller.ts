import {
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
import { Permissions } from '../../common/decorators/permissions.decorator';
import { Public } from '../../common/decorators/public.decorator';

@Public()
@Controller(['crm/leads', 'sales/leads'])
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Get()
  // @Permissions('sales.leads.read')
  async listLeads(@Req() req: any, @Query('search') search?: string) {
    return this.leadsService.listLeads(
      req.headers['x-company-id'] || req.user?.companyId || 'd039cfa4-e78b-4138-adfc-1b0f14cffa91',
      search,
      req.user?.sub || 'a6605e65-beca-40f2-a19f-8e451e270867',
      req.user?.role || 'admin',
    );
  }

  @Get(':id')
  // @Permissions('sales.leads.read')
  async getLead(@Param('id') id: string, @Req() req: any) {
    return this.leadsService.getLead(
      id,
      req.headers['x-company-id'] || req.user?.companyId || 'd039cfa4-e78b-4138-adfc-1b0f14cffa91',
      req.user?.sub || 'a6605e65-beca-40f2-a19f-8e451e270867',
      req.user?.role || 'admin',
    );
  }

  @Post()
  // @Permissions('sales.leads.create')
  async createLead(@Body() dto: any, @Req() req: any) {
    return this.leadsService.createLead(
      dto,
      req.user?.sub || 'a6605e65-beca-40f2-a19f-8e451e270867',
      req.headers['x-company-id'] || req.user?.companyId || 'd039cfa4-e78b-4138-adfc-1b0f14cffa91',
    );
  }

  @Patch(':id')
  // @Permissions('sales.leads.update')
  async updateLead(@Param('id') id: string, @Body() dto: any, @Req() req: any) {
    return this.leadsService.updateLead(
      id,
      dto,
      req.user?.sub || 'a6605e65-beca-40f2-a19f-8e451e270867',
      req.headers['x-company-id'] || req.user?.companyId || 'd039cfa4-e78b-4138-adfc-1b0f14cffa91',
      req.user?.role || 'admin',
    );
  }

  @Post(':id/activities')
  @Permissions('sales.leads.update')
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
  @Permissions('sales.leads.update')
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
  @Permissions('sales.leads.update')
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
  @Permissions('sales.leads.read')
  async timeline(@Param('id') id: string, @Req() req: any) {
    return this.leadsService.getTimeline(id, req.user?.sub, req.user?.role);
  }

  @Post(':id/followups')
  @Permissions('sales.leads.update')
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
  @Permissions('sales.leads.update')
  async addReminder(
    @Param('id') id: string,
    @Body() dto: any,
    @Req() req: any,
  ) {
    return this.leadsService.updateLead(
      id,
      {
        nextReminderAt: dto.reminderAt || dto.nextReminderAt,
      },
      req.user?.sub || 'SYSTEM',
      req.user?.companyId,
      req.user?.role,
    );
  }

  @Post(':id/qualify')
  @Permissions('sales.leads.update')
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
  @Permissions('sales.leads.update')
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
}
