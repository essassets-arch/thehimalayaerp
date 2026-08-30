import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateProductionTargetDto } from './dto/create-production-target.dto';
import { UpdateProductionTargetDto } from './dto/update-production-target.dto';

@Injectable()
export class ProductionTargetService {
  constructor(private readonly prisma: PrismaService) {}

  private serializeBigInt(obj: any): any {
    if (obj === null || obj === undefined) return obj;
    if (obj instanceof Date) return obj;
    if (typeof obj === 'bigint') return Number(obj);
    if (Array.isArray(obj))
      return obj.map((item) => this.serializeBigInt(item));
    if (typeof obj === 'object') {
      const res: any = {};
      for (const key of Object.keys(obj)) {
        res[key] = this.serializeBigInt(obj[key]);
      }
      return res;
    }
    return obj;
  }

  async create(dto: CreateProductionTargetDto, userId: string) {
    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);

    if (start > end) {
      throw new BadRequestException(
        'Start date must be before or equal to end date.',
      );
    }

    // Verify if there is already an active target for the same period
    const existing = await this.prisma.productionTarget.findFirst({
      where: {
        status: 'ACTIVE',
        targetPeriod: dto.targetPeriod,
        startDate: { lte: end },
        endDate: { gte: start },
      },
    });

    if (existing) {
      throw new BadRequestException(
        `An active target already exists for ${dto.targetPeriod} in the specified date range.`,
      );
    }

    const target = await this.prisma.productionTarget.create({
      data: {
        targetPeriod: dto.targetPeriod,
        startDate: start,
        endDate: end,
        quantityTarget: dto.quantityTarget,
        remarks: dto.remarks,
        plantId: dto.plantId || '1',
        createdById: userId,
        updatedById: userId,
      },
    });

    return this.serializeBigInt(target);
  }

  async findAll() {
    const targets = await this.prisma.productionTarget.findMany({
      orderBy: { createdAt: 'desc' },
    });
    const serialized = this.serializeBigInt(targets);

    const enriched = await Promise.all(
      serialized.map(async (t: any) => {
        const workOrders = await this.prisma.workOrder.findMany({
          where: {
            status: {
              in: [
                'COMPLETED',
                'QC_APPROVED',
                'READY_FOR_DISPATCH',
                'DISPATCHED',
                'CLOSED',
              ],
            },
            completedAt: {
              gte: new Date(t.startDate),
              lte: new Date(t.endDate),
            },
          },
          select: {
            quantity: true,
          },
        });
        const achieved = workOrders.reduce(
          (sum, wo) => sum + Number(wo.quantity),
          0,
        );
        const achievement =
          t.quantityTarget > 0 ? (achieved / t.quantityTarget) * 100 : 0;
        return {
          ...t,
          achieved,
          achievement: Number(achievement.toFixed(1)),
        };
      }),
    );

    return enriched;
  }

  async findOne(id: string) {
    const target = await this.prisma.productionTarget.findUnique({
      where: { id },
    });
    if (!target) {
      throw new NotFoundException(`Production target with ID ${id} not found.`);
    }
    return this.serializeBigInt(target);
  }

  async update(id: string, dto: UpdateProductionTargetDto, userId: string) {
    const target = await this.findOne(id);

    const updated = await this.prisma.productionTarget.update({
      where: { id },
      data: {
        status: dto.status,
        quantityTarget: dto.quantityTarget,
        remarks: dto.remarks,
        updatedById: userId,
      },
    });

    return this.serializeBigInt(updated);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.productionTarget.delete({
      where: { id },
    });
    return { success: true };
  }

  async getCurrentAchievement() {
    try {
      const today = new Date();
      // Reset hours to start of day for comparison
      today.setUTCHours(0, 0, 0, 0);

      const activeTarget = await this.prisma.productionTarget.findFirst({
        where: {
          status: 'ACTIVE',
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      if (!activeTarget) {
        return {
          hasTarget: false,
          achievement: 0,
          achieved: 0,
          target: 0,
          remaining: 0,
        };
      }

      // Sum quantity of completed work orders within target period
      const workOrders = await this.prisma.workOrder.findMany({
        where: {
          status: {
            in: [
              'COMPLETED',
              'QC_APPROVED',
              'READY_FOR_DISPATCH',
              'DISPATCHED',
              'CLOSED',
            ],
          },
          completedAt: {
            gte: activeTarget.startDate,
            lte: activeTarget.endDate,
          },
        },
        select: {
          quantity: true,
        },
      });

      const targetVal = activeTarget.quantityTarget || 0;
      const achievedVal = workOrders.reduce(
        (sum, wo) => sum + Number(wo.quantity || 0),
        0,
      );
      const remainingVal = Math.max(targetVal - achievedVal, 0);
      const achievementVal =
        targetVal > 0 ? (achievedVal / targetVal) * 100 : 0;

      return {
        hasTarget: true,
        targetId: activeTarget.id,
        period: activeTarget.targetPeriod,
        target: targetVal,
        achieved: achievedVal,
        remaining: remainingVal,
        achievement: Number(achievementVal.toFixed(1)),
        startDate: activeTarget.startDate.toISOString().split('T')[0],
        endDate: activeTarget.endDate.toISOString().split('T')[0],
      };
    } catch (error) {
      return {
        hasTarget: false,
        achievement: 0,
        achieved: 0,
        target: 0,
        remaining: 0,
      };
    }
  }
}
