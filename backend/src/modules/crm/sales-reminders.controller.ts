import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UseGuards, Controller, Get, Post, Put, Patch, Delete, Query, Req, Body, Param, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';

import { getFollowUpSalesScope } from '../../common/utils/rbac.util';

/** Dynamic reminder feed and CRUD operations used by the Sales workspace. */
@Controller('sales/reminders')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class SalesRemindersController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @RequirePermissions('sales.leads.read')
  async list(@Req() req: any, @Query('status') status?: string) {
    const userId = req.user?.sub || req.user?.id || req.user?.userId;
    const scope = getFollowUpSalesScope(userId, req.user?.role);
    const reminders = await this.prisma.followUp.findMany({
      where: {
        ...(status ? { status } : {}),
        ...scope,
      },
      orderBy: { reminderAt: 'asc' },
    });

    return reminders.map((reminder) => ({
      // Old fields for backward compat
      id: reminder.id,
      title: reminder.entityType || 'Sales follow-up',
      description: reminder.notes || '',
      type: reminder.entityType || 'followup',
      dueDate: reminder.reminderAt,
      createdAt: reminder.createdAt,
      createdBy: reminder.createdById,
      leadId: reminder.leadId,

      // Structured reminder fields
      moduleId: reminder.entityId || reminder.leadId,
      customerName: reminder.customerName || '',
      moduleType: reminder.moduleType || reminder.entityType || 'Lead',
      reminderDate: reminder.reminderDate || (reminder.reminderAt ? reminder.reminderAt.toISOString().split('T')[0] : null),
      reminderTime: reminder.reminderTime || null,
      reminderType: reminder.reminderType || 'Follow-up',
      priority: reminder.priority || 'Medium',
      remarks: reminder.remarks || reminder.notes || '',
      status: reminder.status || 'Pending',
    }));
  }

  @Post()
  @RequirePermissions('sales.leads.update')
  async create(@Req() req: any, @Body() dto: any) {
    const userId = req.user?.sub || req.user?.id || req.user?.userId || 'SYSTEM';

    let reminderAt: Date | null = null;
    if (dto.reminderDate) {
      reminderAt = new Date(`${dto.reminderDate}T${dto.reminderTime || '00:00:00'}`);
    }

    const data: any = {
      notes: dto.remarks || '',
      reminderAt,
      createdById: userId,
      entityType: dto.moduleType || 'Lead',
      entityId: dto.moduleId ? String(dto.moduleId) : null,
      moduleId: dto.moduleId ? String(dto.moduleId) : null,
      customerName: dto.customerName || null,
      moduleType: dto.moduleType || 'Lead',
      reminderDate: dto.reminderDate || null,
      reminderTime: dto.reminderTime || null,
      reminderType: dto.reminderType || 'Follow-up',
      priority: dto.priority || 'Medium',
      status: 'Pending',
      remarks: dto.remarks || '',
    };

    if (dto.moduleType === 'Lead' && dto.moduleId) {
      data.leadId = String(dto.moduleId);
    }

    const reminder = await this.prisma.followUp.create({
      data,
    });

    return {
      id: reminder.id,
      title: reminder.entityType || 'Sales follow-up',
      description: reminder.notes || '',
      type: reminder.entityType || 'followup',
      dueDate: reminder.reminderAt,
      createdAt: reminder.createdAt,
      createdBy: reminder.createdById,
      leadId: reminder.leadId,

      moduleId: reminder.entityId || reminder.leadId,
      customerName: reminder.customerName || '',
      moduleType: reminder.moduleType || reminder.entityType || 'Lead',
      reminderDate: reminder.reminderDate || (reminder.reminderAt ? reminder.reminderAt.toISOString().split('T')[0] : null),
      reminderTime: reminder.reminderTime || null,
      reminderType: reminder.reminderType || 'Follow-up',
      priority: reminder.priority || 'Medium',
      remarks: reminder.remarks || reminder.notes || '',
      status: reminder.status || 'Pending',
    };
  }

  @Put(':id')
  @RequirePermissions('sales.leads.update')
  async update(@Param('id') id: string, @Req() req: any, @Body() dto: any) {
    const userId = req.user?.sub || req.user?.id || req.user?.userId;
    const scope = getFollowUpSalesScope(userId, req.user?.role);

    const existing = await this.prisma.followUp.findFirst({
      where: { id, ...scope },
    });
    if (!existing) {
      throw new NotFoundException('Reminder not found or access denied');
    }

    let reminderAt: Date | null | undefined = undefined;
    if (dto.reminderDate !== undefined) {
      reminderAt = dto.reminderDate ? new Date(`${dto.reminderDate}T${dto.reminderTime || '00:00:00'}`) : null;
    }

    const updateData: any = {
      ...(dto.remarks !== undefined ? { notes: dto.remarks, remarks: dto.remarks } : {}),
      ...(reminderAt !== undefined ? { reminderAt } : {}),
      ...(dto.customerName !== undefined ? { customerName: dto.customerName } : {}),
      ...(dto.moduleType !== undefined ? { moduleType: dto.moduleType, entityType: dto.moduleType } : {}),
      ...(dto.moduleId !== undefined ? { entityId: String(dto.moduleId), moduleId: String(dto.moduleId) } : {}),
      ...(dto.reminderDate !== undefined ? { reminderDate: dto.reminderDate } : {}),
      ...(dto.reminderTime !== undefined ? { reminderTime: dto.reminderTime } : {}),
      ...(dto.reminderType !== undefined ? { reminderType: dto.reminderType } : {}),
      ...(dto.priority !== undefined ? { priority: dto.priority } : {}),
      ...(dto.status !== undefined ? { status: dto.status } : {}),
    };

    if (dto.moduleType === 'Lead' && dto.moduleId) {
      updateData.leadId = String(dto.moduleId);
    } else if (dto.moduleType && dto.moduleType !== 'Lead') {
      updateData.leadId = null;
    }

    const reminder = await this.prisma.followUp.update({
      where: { id },
      data: updateData,
    });

    return {
      id: reminder.id,
      title: reminder.entityType || 'Sales follow-up',
      description: reminder.notes || '',
      type: reminder.entityType || 'followup',
      dueDate: reminder.reminderAt,
      createdAt: reminder.createdAt,
      createdBy: reminder.createdById,
      leadId: reminder.leadId,

      moduleId: reminder.entityId || reminder.leadId,
      customerName: reminder.customerName || '',
      moduleType: reminder.moduleType || reminder.entityType || 'Lead',
      reminderDate: reminder.reminderDate || (reminder.reminderAt ? reminder.reminderAt.toISOString().split('T')[0] : null),
      reminderTime: reminder.reminderTime || null,
      reminderType: reminder.reminderType || 'Follow-up',
      priority: reminder.priority || 'Medium',
      remarks: reminder.remarks || reminder.notes || '',
      status: reminder.status || 'Pending',
    };
  }

  @Patch(':id/complete')
  @RequirePermissions('sales.leads.update')
  async complete(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.sub || req.user?.id || req.user?.userId;
    const scope = getFollowUpSalesScope(userId, req.user?.role);

    const existing = await this.prisma.followUp.findFirst({
      where: { id, ...scope },
    });
    if (!existing) {
      throw new NotFoundException('Reminder not found or access denied');
    }

    const reminder = await this.prisma.followUp.update({
      where: { id },
      data: {
        status: 'Completed',
      },
    });

    return {
      id: reminder.id,
      title: reminder.entityType || 'Sales follow-up',
      description: reminder.notes || '',
      type: reminder.entityType || 'followup',
      dueDate: reminder.reminderAt,
      createdAt: reminder.createdAt,
      createdBy: reminder.createdById,
      leadId: reminder.leadId,

      moduleId: reminder.entityId || reminder.leadId,
      customerName: reminder.customerName || '',
      moduleType: reminder.moduleType || reminder.entityType || 'Lead',
      reminderDate: reminder.reminderDate || (reminder.reminderAt ? reminder.reminderAt.toISOString().split('T')[0] : null),
      reminderTime: reminder.reminderTime || null,
      reminderType: reminder.reminderType || 'Follow-up',
      priority: reminder.priority || 'Medium',
      remarks: reminder.remarks || reminder.notes || '',
      status: reminder.status || 'Pending',
    };
  }

  @Delete(':id')
  @RequirePermissions('sales.leads.update')
  async cancel(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.sub || req.user?.id || req.user?.userId;
    const scope = getFollowUpSalesScope(userId, req.user?.role);

    const existing = await this.prisma.followUp.findFirst({
      where: { id, ...scope },
    });
    if (!existing) {
      throw new NotFoundException('Reminder not found or access denied');
    }

    await this.prisma.followUp.delete({
      where: { id },
    });

    return { success: true };
  }
}
