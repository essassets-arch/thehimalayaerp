import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards, Req, UseInterceptors } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { TransitionLeadDto } from './dto/transition-lead.dto';
import { AddFollowupDto } from './dto/add-followup.dto';
import { AddReminderDto } from './dto/add-reminder.dto';
import { MarkLeadLostDto } from './dto/mark-lead-lost.dto';
import { ListLeadsQueryDto } from './dto/list-leads-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { IdempotencyInterceptor } from '../../common/interceptors/idempotency.interceptor';

@Controller('sales/leads')
@UseGuards(JwtAuthGuard)
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Get()
  listLeads(@Query() query: ListLeadsQueryDto) {
    return this.leadsService.listLeads(query);
  }

  @Get(':id')
  getLead(@Param('id') id: string) {
    return this.leadsService.getLead(id);
  }

  @Get(':id/timeline')
  getTimeline(@Param('id') id: string) {
    return this.leadsService.getTimeline(id);
  }

  @Post()
  @UseInterceptors(IdempotencyInterceptor)
  createLead(@Body() dto: CreateLeadDto, @Req() req: any) {
    return this.leadsService.createLead(dto, req.user.userId);
  }

  @Patch(':id')
  @UseInterceptors(IdempotencyInterceptor)
  updateLead(@Param('id') id: string, @Body() dto: UpdateLeadDto, @Req() req: any) {
    return this.leadsService.updateLead(id, dto, req.user.userId);
  }

  @Post(':id/qualify')
  @UseInterceptors(IdempotencyInterceptor)
  qualifyLead(@Param('id') id: string, @Body() dto: TransitionLeadDto, @Req() req: any) {
    return this.leadsService.qualifyLead(id, dto, req.user.userId);
  }

  @Post(':id/followups')
  @UseInterceptors(IdempotencyInterceptor)
  addFollowup(@Param('id') id: string, @Body() dto: AddFollowupDto, @Req() req: any) {
    return this.leadsService.addFollowup(id, dto, req.user.userId);
  }

  @Post(':id/reminders')
  @UseInterceptors(IdempotencyInterceptor)
  addReminder(@Param('id') id: string, @Body() dto: AddReminderDto, @Req() req: any) {
    return this.leadsService.addReminder(id, dto, req.user.userId);
  }

  @Post(':id/mark-lost')
  @UseInterceptors(IdempotencyInterceptor)
  markLost(@Param('id') id: string, @Body() dto: MarkLeadLostDto, @Req() req: any) {
    return this.leadsService.markLost(id, dto, req.user.userId);
  }

  @Post(':id/restore')
  @UseInterceptors(IdempotencyInterceptor)
  restoreLead(@Param('id') id: string, @Body() dto: TransitionLeadDto, @Req() req: any) {
    return this.leadsService.restoreLead(id, dto, req.user.userId);
  }
}
