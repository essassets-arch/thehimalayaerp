import { Controller, Get, Query, Req } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Permissions } from '../../common/decorators/permissions.decorator';

/** Read-only reminder feed used by the Sales workspace. */
@Controller('sales/reminders')
export class SalesRemindersController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @Permissions('sales.leads.read')
  async list(@Req() req: any, @Query('status') status?: string) {
    const reminders = await this.prisma.followUp.findMany({
      where: {
        ...(status === 'completed' ? { reminderAt: { lt: new Date() } } : {}),
        ...(req.user?.id ? { createdById: req.user.id } : {}),
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
