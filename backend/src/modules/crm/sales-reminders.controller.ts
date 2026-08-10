import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UseGuards, Controller, Get, Query, Req } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';

import { getFollowUpSalesScope } from '../../common/utils/rbac.util';

/** Read-only reminder feed used by the Sales workspace. */
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
        ...(status === 'completed' ? { reminderAt: { lt: new Date() } } : {}),
        ...scope,
      },
      orderBy: { reminderAt: 'asc' },
    });

    return reminders.map((reminder) => ({
      id: reminder.id,
      title: reminder.entityType || 'Sales follow-up',
      description: reminder.notes || '',
      type: reminder.entityType || 'followup',
      dueDate: reminder.reminderAt,
      createdAt: reminder.createdAt,
      createdBy: reminder.createdById,
      leadId: reminder.leadId,
    }));
  }
}
