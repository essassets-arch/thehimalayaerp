import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import {
  UseGuards,
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Query,
  Req,
  Body,
  Param,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';

import {
  getFollowUpSalesScope,
  isSalespersonScopedRole,
} from '../../common/utils/rbac.util';

/** Dynamic reminder feed and CRUD operations used by the Sales workspace. */
@Controller('sales/reminders')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class SalesRemindersController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('daily')
  @RequirePermissions('sales.leads.read')
  async getDailyTasks(
    @Req() req: any,
    @Query('date') dateQuery?: string,
    @Query('status') status?: string,
    @Query('sourceType') sourceType?: string,
    @Query('search') search?: string,
    @Query('module') moduleParam?: string,
  ) {
    const userId = req.user?.sub || req.user?.id || req.user?.userId;
    const companyId =
      req.headers['x-company-id'] ||
      req.user?.companyId ||
      'd039cfa4-e78b-4138-adfc-1b0f14cffa91';
    const scope = getFollowUpSalesScope(userId, req.user?.role);

    const isFinance = moduleParam === 'Finance';
    const isSales =
      moduleParam === 'Sales' ||
      moduleParam === 'SuperSales' ||
      !moduleParam ||
      moduleParam === 'All';

    const moduleTypeFilter = isFinance
      ? {
          in: [
            'Payment',
            'PaymentFollowup',
            'SalesOrder',
            'Order',
            'Invoice',
            'Finance',
            'PAYMENT',
            'PAYMENT_FOLLOWUP',
            'SALESORDER',
            'ORDER',
            'INVOICE',
          ],
        }
      : isSales
        ? {
            in: [
              'Lead',
              'Sample',
              'SampleRequest',
              'Quotation',
              'Payment',
              'PaymentFollowup',
              'SalesOrder',
              'Order',
              'Invoice',
              'LEAD',
              'SAMPLE',
              'SAMPLEREQUEST',
              'QUOTATION',
              'PAYMENT',
              'PAYMENT_FOLLOWUP',
              'SALESORDER',
              'ORDER',
              'INVOICE',
            ],
          }
        : undefined;

    const moduleWhere = moduleTypeFilter
      ? { moduleType: moduleTypeFilter }
      : {};

    // Fetch all for counts
    const allReminders = await this.prisma.followUp.findMany({
      where: {
        companyId: String(companyId),
        ...scope,
        ...moduleWhere,
      },
    });

    const now = new Date();
    const pendingCount = allReminders.filter(
      (r) => r.status === 'Pending',
    ).length;
    const completedCount = allReminders.filter(
      (r) => r.status === 'Completed',
    ).length;
    const overdueCount = allReminders.filter(
      (r) => r.status === 'Pending' && r.reminderAt && r.reminderAt < now,
    ).length;
    const upcomingCount = allReminders.filter(
      (r) => r.status === 'Pending' && r.reminderAt && r.reminderAt >= now,
    ).length;

    // Filtered query
    const targetDate = dateQuery || new Date().toISOString().split('T')[0];
    const whereClause: any = {
      companyId: String(companyId),
      ...scope,
      ...moduleWhere,
    };

    if (status && status !== 'All') {
      whereClause.status = status;
    }

    if (sourceType && sourceType !== 'All') {
      whereClause.moduleType = sourceType;
    }

    if (dateQuery) {
      whereClause.reminderDate = dateQuery;
    }

    const matchedReminders = await this.prisma.followUp.findMany({
      where: whereClause,
      orderBy: { reminderAt: 'asc' },
    });

    const items: any[] = [];
    for (const r of matchedReminders) {
      if (search) {
        const sq = search.toLowerCase();
        const matchesSearch =
          r.customerName?.toLowerCase().includes(sq) ||
          false ||
          r.notes?.toLowerCase().includes(sq) ||
          false ||
          r.remarks?.toLowerCase().includes(sq) ||
          false;
        if (!matchesSearch) continue;
      }

      let referenceNo = 'N/A';
      if (r.moduleType === 'Lead' && r.moduleId) {
        const lead = await this.prisma.lead.findUnique({
          where: { id: r.moduleId },
        });
        referenceNo = lead?.leadNumber || 'N/A';
      } else if (
        (r.moduleType === 'Sample' || r.moduleType === 'SampleRequest') &&
        r.moduleId
      ) {
        const sample = await this.prisma.sampleRequest.findUnique({
          where: { id: r.moduleId },
        });
        referenceNo = sample?.sampleNumber || 'N/A';
      } else if (r.moduleType === 'Quotation' && r.moduleId) {
        const quote = await this.prisma.quotation.findUnique({
          where: { id: r.moduleId },
        });
        referenceNo = quote?.quotationNumber || 'N/A';
      } else if (
        (r.moduleType === 'Payment' || r.moduleType === 'SalesOrder') &&
        r.moduleId
      ) {
        const order = await this.prisma.salesOrder.findFirst({
          where: {
            OR: [
              { id: r.moduleId },
              { orderNumber: r.moduleId },
              { orderNumber: r.moduleId.replace(/^#/, '') },
            ],
          },
        });
        referenceNo = order?.orderNumber || 'N/A';
      }

      const creator = await this.prisma.user.findUnique({
        where: { id: r.createdById },
        select: { id: true, name: true },
      });

      items.push({
        id: r.id,
        sourceType: r.moduleType,
        sourceId: r.moduleId,
        referenceNo,
        customerName: r.customerName || 'N/A',
        title: r.reminderType || 'Follow-up',
        description: r.notes || '',
        reminderAt: r.reminderAt,
        status: r.status,
        salesPerson: creator || { id: r.createdById, name: 'Sales Executive' },
      });
    }

    return {
      items,
      summary: {
        total: allReminders.length,
        pending: pendingCount,
        completed: completedCount,
        overdue: overdueCount,
        upcoming: upcomingCount,
      },
    };
  }

  @Get()
  @RequirePermissions('sales.leads.read')
  async list(
    @Req() req: any,
    @Query('status') status?: string,
    @Query('module_type') moduleType?: string,
    @Query('module') moduleParam?: string,
  ) {
    const userId = req.user?.sub || req.user?.id || req.user?.userId;
    const companyId =
      req.headers['x-company-id'] ||
      req.user?.companyId ||
      'd039cfa4-e78b-4138-adfc-1b0f14cffa91';
    const scope = getFollowUpSalesScope(userId, req.user?.role);

    const isFinance = moduleParam === 'Finance';
    const isSales =
      moduleParam === 'Sales' ||
      moduleParam === 'SuperSales' ||
      !moduleParam ||
      moduleParam === 'All';

    const moduleTypeFilter = isFinance
      ? {
          in: [
            'Payment',
            'PaymentFollowup',
            'SalesOrder',
            'Order',
            'Invoice',
            'Finance',
            'PAYMENT',
            'PAYMENT_FOLLOWUP',
            'SALESORDER',
            'ORDER',
            'INVOICE',
          ],
        }
      : isSales
        ? {
            in: [
              'Lead',
              'Sample',
              'SampleRequest',
              'Quotation',
              'Payment',
              'PaymentFollowup',
              'SalesOrder',
              'Order',
              'Invoice',
              'LEAD',
              'SAMPLE',
              'SAMPLEREQUEST',
              'QUOTATION',
              'PAYMENT',
              'PAYMENT_FOLLOWUP',
              'SALESORDER',
              'ORDER',
              'INVOICE',
            ],
          }
        : undefined;

    const whereClause: any = {
      companyId: String(companyId),
      ...(status ? { status } : {}),
      ...scope,
    };

    if (moduleType) {
      whereClause.moduleType = moduleType;
    } else if (moduleTypeFilter) {
      whereClause.moduleType = moduleTypeFilter;
    }

    const reminders = await this.prisma.followUp.findMany({
      where: whereClause,
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
      moduleId: reminder.moduleId || reminder.entityId || reminder.leadId,
      customerName: reminder.customerName || '',
      moduleType: reminder.moduleType || reminder.entityType || 'Lead',
      reminderDate:
        reminder.reminderDate ||
        (reminder.reminderAt
          ? reminder.reminderAt.toISOString().split('T')[0]
          : null),
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
    const userId =
      req.user?.sub || req.user?.id || req.user?.userId || 'SYSTEM';
    const companyId =
      req.headers['x-company-id'] ||
      req.user?.companyId ||
      'd039cfa4-e78b-4138-adfc-1b0f14cffa91';
    const userRole = req.user?.role;

    const { sourceType, sourceId, title, description, reminderAt } = dto;
    const norm = normalizeSourceType(sourceType || dto.moduleType || 'Lead');
    const moduleType = norm.moduleType;
    const moduleId = sourceId || dto.moduleId;

    if (!moduleId) {
      throw new Error('moduleId / sourceId is required');
    }

    let reminderDateObj = new Date();
    let reminderDateStr = reminderDateObj.toISOString().split('T')[0];
    let reminderTimeStr = reminderDateObj
      .toTimeString()
      .split(' ')[0]
      .substring(0, 5);

    const val = reminderAt || dto.reminderDate;
    if (val) {
      const d = reminderAt
        ? new Date(reminderAt)
        : new Date(`${dto.reminderDate}T${dto.reminderTime || '00:00:00'}`);
      if (!isNaN(d.getTime())) {
        reminderDateObj = d;
        try {
          reminderDateStr = d.toISOString().split('T')[0];
          reminderTimeStr = d.toTimeString().split(' ')[0].substring(0, 5);
        } catch (e) {}
      }
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const source = await validateSourceOwnership(
        tx,
        moduleType,
        moduleId,
        companyId,
        userId,
        userRole,
      );
      const customerName = await getCustomerNameForSource(
        tx,
        moduleType,
        source,
      );

      const reminder = await tx.followUp.create({
        data: {
          companyId: String(companyId),
          createdById: userId,
          notes: description || dto.remarks || '',
          reminderAt: reminderDateObj,
          status: dto.status || 'Pending',
          completedAt: dto.status === 'Completed' ? new Date() : null,
          customerName,
          moduleType,
          moduleId,
          reminderDate: reminderDateStr,
          reminderTime: reminderTimeStr,
          reminderType: dto.reminderType || title || 'Follow-up',
          priority: dto.priority || 'Medium',
          remarks: description || dto.remarks || '',
          ...(moduleType.toUpperCase() === 'LEAD' ? { leadId: moduleId } : {}),
        },
      });

      await recalculateNextReminder(
        tx,
        moduleType,
        moduleId,
        companyId,
        userId,
      );
      return reminder;
    });

    return result;
  }

  @Patch(':id')
  @RequirePermissions('sales.leads.update')
  async update(@Param('id') id: string, @Req() req: any, @Body() dto: any) {
    const userId = req.user?.sub || req.user?.id || req.user?.userId;
    const companyId =
      req.headers['x-company-id'] ||
      req.user?.companyId ||
      'd039cfa4-e78b-4138-adfc-1b0f14cffa91';
    const userRole = req.user?.role;

    const existing = await this.prisma.followUp.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Reminder not found');
    }

    let reminderAtObj: Date | null = null;
    let reminderDateStr: string | null = null;
    let reminderTimeStr: string | null = null;

    if (dto.reminderAt) {
      const d = new Date(dto.reminderAt);
      if (!isNaN(d.getTime())) {
        reminderAtObj = d;
        try {
          reminderDateStr = d.toISOString().split('T')[0];
          reminderTimeStr = d.toTimeString().split(' ')[0].substring(0, 5);
        } catch (e) {}
      }
    } else if (dto.reminderDate) {
      const d = new Date(
        `${dto.reminderDate}T${dto.reminderTime || '00:00:00'}`,
      );
      if (!isNaN(d.getTime())) {
        reminderAtObj = d;
        reminderDateStr = dto.reminderDate;
        reminderTimeStr = dto.reminderTime || '00:00:00';
      }
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const updateData: any = {
        ...(dto.remarks !== undefined
          ? { notes: dto.remarks, remarks: dto.remarks }
          : {}),
        ...(reminderAtObj !== null ? { reminderAt: reminderAtObj } : {}),
        ...(reminderDateStr !== null ? { reminderDate: reminderDateStr } : {}),
        ...(reminderTimeStr !== null ? { reminderTime: reminderTimeStr } : {}),
        ...(dto.reminderType !== undefined
          ? { reminderType: dto.reminderType }
          : {}),
        ...(dto.priority !== undefined ? { priority: dto.priority } : {}),
        ...(dto.status !== undefined ? { status: dto.status } : {}),
      };

      const reminder = await tx.followUp.update({
        where: { id },
        data: updateData,
      });

      await recalculateNextReminder(
        tx,
        reminder.moduleType || 'Lead',
        reminder.moduleId || '',
        companyId,
        userId,
      );
      return reminder;
    });

    return result;
  }

  @Patch(':id/complete')
  @RequirePermissions('sales.leads.update')
  async complete(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.sub || req.user?.id || req.user?.userId;
    const companyId =
      req.headers['x-company-id'] ||
      req.user?.companyId ||
      'd039cfa4-e78b-4138-adfc-1b0f14cffa91';

    const result = await this.prisma.$transaction(async (tx) => {
      const existing = await tx.followUp.findUnique({ where: { id } });
      if (!existing) {
        throw new NotFoundException('Reminder not found');
      }

      const reminder = await tx.followUp.update({
        where: { id },
        data: {
          status: 'Completed',
          completedAt: new Date(),
        },
      });

      await recalculateNextReminder(
        tx,
        reminder.moduleType || 'Lead',
        reminder.moduleId || '',
        companyId,
        userId,
      );
      return reminder;
    });

    return result;
  }

  @Patch(':id/dismiss')
  @RequirePermissions('sales.leads.update')
  async dismiss(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.sub || req.user?.id || req.user?.userId;
    const companyId =
      req.headers['x-company-id'] ||
      req.user?.companyId ||
      'd039cfa4-e78b-4138-adfc-1b0f14cffa91';

    const result = await this.prisma.$transaction(async (tx) => {
      const existing = await tx.followUp.findUnique({ where: { id } });
      if (!existing) {
        throw new NotFoundException('Reminder not found');
      }

      const reminder = await tx.followUp.update({
        where: { id },
        data: {
          status: 'Dismissed',
          dismissedAt: new Date(),
        },
      });

      await recalculateNextReminder(
        tx,
        reminder.moduleType || 'Lead',
        reminder.moduleId || '',
        companyId,
        userId,
      );
      return reminder;
    });

    return result;
  }

  @Delete(':id')
  @RequirePermissions('sales.leads.update')
  async cancel(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.sub || req.user?.id || req.user?.userId;
    const companyId =
      req.headers['x-company-id'] ||
      req.user?.companyId ||
      'd039cfa4-e78b-4138-adfc-1b0f14cffa91';

    const result = await this.prisma.$transaction(async (tx) => {
      const existing = await tx.followUp.findUnique({ where: { id } });
      if (!existing) {
        throw new NotFoundException('Reminder not found');
      }

      await tx.followUp.delete({ where: { id } });
      await recalculateNextReminder(
        tx,
        existing.moduleType || 'Lead',
        existing.moduleId || '',
        companyId,
        userId,
      );
      return { success: true };
    });

    return result;
  }
}

// ── UTILITY FUNCTIONS ──

function normalizeSourceType(type: string): {
  moduleType: string;
  relationField: string;
} {
  const upper = String(type).toUpperCase();
  if (upper === 'LEAD' || upper === 'CRM_LEAD')
    return { moduleType: 'Lead', relationField: 'lead' };
  if (
    upper === 'SAMPLE' ||
    upper === 'SAMPLEREQUEST' ||
    upper === 'SAMPLE_REQUEST'
  )
    return { moduleType: 'Sample', relationField: 'sampleRequest' };
  if (upper === 'QUOTATION')
    return { moduleType: 'Quotation', relationField: 'quotation' };
  if (
    upper === 'PAYMENT_FOLLOWUP' ||
    upper === 'PAYMENT' ||
    upper === 'SALESORDER' ||
    upper === 'SALES_ORDER'
  )
    return { moduleType: 'Payment', relationField: 'salesOrder' };
  return { moduleType: type, relationField: type.toLowerCase() };
}

async function validateSourceOwnership(
  tx: any,
  moduleType: string,
  moduleId: string,
  companyId: string,
  userId: string,
  userRole: string,
) {
  const isManagement = ['Super Admin', 'Admin', 'Sales Manager'].includes(
    userRole,
  );
  const typeUpper = moduleType.toUpperCase();

  let sourceRecord: any = null;

  if (typeUpper === 'LEAD') {
    sourceRecord = await tx.lead.findUnique({ where: { id: moduleId } });
  } else if (typeUpper === 'SAMPLE' || typeUpper === 'SAMPLEREQUEST') {
    sourceRecord = await tx.sampleRequest.findUnique({
      where: { id: moduleId },
    });
  } else if (typeUpper === 'QUOTATION') {
    sourceRecord = await tx.quotation.findUnique({ where: { id: moduleId } });
  } else if (
    typeUpper === 'PAYMENT_FOLLOWUP' ||
    typeUpper === 'PAYMENT' ||
    typeUpper === 'SALESORDER' ||
    typeUpper === 'ORDER'
  ) {
    sourceRecord = await tx.salesOrder.findFirst({
      where: {
        OR: [
          { id: moduleId },
          { orderNumber: moduleId },
          { orderNumber: moduleId.replace(/^#/, '') },
          { orderNumber: `ORD-${moduleId}` },
        ],
      },
    });
  }

  if (!sourceRecord) {
    throw new NotFoundException(
      `${moduleType} record with ID ${moduleId} not found`,
    );
  }

  if (
    sourceRecord.companyId &&
    String(sourceRecord.companyId) !== String(companyId)
  ) {
    throw new Error('Unauthorized company mismatch');
  }

  if (!isManagement) {
    const ownerId =
      sourceRecord.salesExecutiveId ||
      sourceRecord.createdById ||
      sourceRecord.assignedToId;
    if (ownerId && String(ownerId) !== String(userId)) {
      throw new Error('Unauthorized salesperson mismatch');
    }
  }

  return sourceRecord;
}

async function getCustomerNameForSource(
  tx: any,
  moduleType: string,
  sourceRecord: any,
) {
  const typeUpper = moduleType.toUpperCase();
  if (typeUpper === 'LEAD') {
    return sourceRecord.companyName || sourceRecord.customerName || 'Lead';
  }

  const customerId = sourceRecord.customerId;
  if (!customerId && sourceRecord.leadId) {
    const lead = await tx.lead.findUnique({
      where: { id: sourceRecord.leadId },
    });
    if (lead) return lead.companyName || lead.customerName || 'Client';
  }

  if (customerId) {
    const customer = await tx.customer.findUnique({
      where: { id: customerId },
    });
    if (customer) return customer.name || customer.companyName || 'Client';
  }

  return 'Client';
}

async function recalculateNextReminder(
  tx: any,
  moduleType: string,
  moduleId: string,
  companyId: string,
  userId: string,
) {
  const next = await tx.followUp.findFirst({
    where: {
      moduleType,
      moduleId,
      status: 'Pending',
    },
    orderBy: {
      reminderAt: 'asc',
    },
  });

  const nextReminder = next?.reminderAt ?? null;
  const typeUpper = moduleType.toUpperCase();

  if (typeUpper === 'LEAD') {
    await tx.lead.update({
      where: { id: moduleId },
      data: { nextReminder },
    });
  } else if (typeUpper === 'SAMPLE' || typeUpper === 'SAMPLEREQUEST') {
    await tx.sampleRequest.update({
      where: { id: moduleId },
      data: { nextReminder },
    });
  } else if (typeUpper === 'QUOTATION') {
    await tx.quotation.update({
      where: { id: moduleId },
      data: { nextReminder },
    });
  } else if (
    typeUpper === 'PAYMENT_FOLLOWUP' ||
    typeUpper === 'PAYMENT' ||
    typeUpper === 'SALESORDER'
  ) {
    await tx.salesOrder.update({
      where: { id: moduleId },
      data: { nextReminder },
    });
  }
}
