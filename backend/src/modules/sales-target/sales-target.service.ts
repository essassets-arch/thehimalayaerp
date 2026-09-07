import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateSalesTargetDto } from './dto/create-sales-target.dto';
import { UpdateSalesTargetDto } from './dto/update-sales-target.dto';

@Injectable()
export class SalesTargetService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSalesTargetDto, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      // Check for overlapping active targets
      const existing = await tx.salesTarget.findFirst({
        where: {
          salespersonId: dto.salespersonId,
          status: 'ACTIVE',
          AND: [
            { startDate: { lte: new Date(dto.endDate) } },
            { endDate: { gte: new Date(dto.startDate) } },
          ],
        },
      });

      if (existing) {
        throw new BadRequestException(
          'An active target already exists for this salesperson during the selected period.',
        );
      }

      return tx.salesTarget.create({
        data: {
          salespersonId: dto.salespersonId,
          targetPeriod: dto.targetPeriod,
          startDate: new Date(dto.startDate),
          endDate: new Date(dto.endDate),
          revenueTarget: dto.revenueTarget,
          remarks: dto.remarks,
          status: 'ACTIVE',
          createdById: userId,
        },
      });
    });
  }

  async findAll(salespersonId?: string) {
    return this.prisma.salesTarget.findMany({
      where: salespersonId ? { salespersonId } : undefined,
      include: {
        salesperson: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async history(userId: string) {
    return this.prisma.salesTarget.findMany({
      where: {
        salespersonId: userId,
        status: { in: ['ACTIVE', 'COMPLETED'] },
      },
      orderBy: { endDate: 'desc' },
    });
  }

  async dashboard(userId: string, role?: string) {
    const today = new Date();

    const roleCode = String(role || '')
      .toUpperCase()
      .replace(/[\s-]+/g, '_');
    const isAdmin = ['SUPER_ADMIN', 'ADMIN', 'SALES_ADMIN', 'SUPER_USER'].includes(roleCode);

    // 1. Look for active target assigned specifically to this user
    let target = await this.prisma.salesTarget.findFirst({
      where: {
        salespersonId: userId,
        status: 'ACTIVE',
      },
      orderBy: { createdAt: 'desc' },
    });

    // 2. Only for Admin roles: if no personal target is assigned, fall back to the latest active target
    // For non-admin sales representatives (Sales 1, Sales 2, etc.), NEVER fall back to another salesperson's target!
    if (!target && isAdmin) {
      target = await this.prisma.salesTarget.findFirst({
        where: {
          status: 'ACTIVE',
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    if (!target) {
      return {
        target: null,
        monthlyTarget: 0,
        achievedSales: 0,
        achievement: 0,
        remainingTarget: 0,
        daysRemaining: 0,
        requiredDailySales: 0,
        progress: 0,
      };
    }

    // Measure achievement for targetSalespersonId
    const targetSalespersonId = !isAdmin ? userId : (target.salespersonId || userId);
    const achieved = await this.prisma.salesOrder.aggregate({
      _sum: { totalAmount: true },
      where: {
        AND: [
          targetSalespersonId
            ? {
                OR: [
                  { createdById: targetSalespersonId },
                  { salesExecutiveId: targetSalespersonId },
                ],
              }
            : {},
          {
            status: {
              in: [
                'CONFIRMED',
                'SENT_TO_PLANT',
                'SENT_TO_PLANT_HEAD',
                'PLANT_APPROVED',
                'READY_FOR_PRODUCTION',
                'IN_PRODUCTION',
                'READY_FOR_DISPATCH',
                'COMPLETED',
              ],
            },
          },
          {
            createdAt: {
              gte: target.startDate,
              lte: target.endDate,
            },
          },
        ],
      },
    });

    const achievedSales = Number(achieved?._sum?.totalAmount ?? 0);
    const targetAmount = Number(target.revenueTarget);

    const achievement =
      targetAmount > 0 ? (achievedSales / targetAmount) * 100 : 0;
    const remainingTarget = Math.max(targetAmount - achievedSales, 0);

    const ms = target.endDate.getTime() - today.getTime();
    const daysRemaining = Math.max(Math.ceil(ms / (1000 * 60 * 60 * 24)), 0);

    const requiredDailySales =
      daysRemaining > 0 ? remainingTarget / daysRemaining : remainingTarget;

    return {
      target: {
        id: target.id,
        period: target.targetPeriod,
        startDate: target.startDate,
        endDate: target.endDate,
        revenueTarget: targetAmount,
      },
      monthlyTarget: targetAmount,
      achievedSales,
      achievement,
      remainingTarget,
      daysRemaining,
      requiredDailySales,
      progress: Math.min(achievement, 100),
    };
  }

  async update(id: string, dto: UpdateSalesTargetDto, userId: string) {
    return this.prisma.salesTarget.update({
      where: { id },
      data: {
        ...(dto as any),
        updatedById: userId,
      },
    });
  }

  async softDelete(id: string, userId: string) {
    return this.prisma.salesTarget.update({
      where: { id },
      data: { status: 'CANCELLED', updatedById: userId },
    });
  }
}
