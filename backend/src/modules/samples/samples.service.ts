import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateSampleDto } from './dto/create-sample.dto';
import { UpdateSampleDto } from './dto/update-sample.dto';
import { generatePublicId, withOptimisticUpdate } from '../../common/utils/database.util';
import { SampleStatus } from '@prisma/client';
import { getSalesScope } from '../../common/utils/rbac.util';

@Injectable()
export class SamplesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createSampleDto: CreateSampleDto, userId: string = 'system') {
    return this.prisma.$transaction(async (tx) => {
      if (!createSampleDto.leadId && !createSampleDto.customerId) {
        throw new BadRequestException('A sample must be linked to a lead or customer');
      }
      if (createSampleDto.leadId) {
        const existing = await tx.sampleRequest.findFirst({
          where: {
            companyId: createSampleDto.companyId,
            leadId: createSampleDto.leadId,
            deletedAt: null,
            status: { notIn: [SampleStatus.REJECTED, SampleStatus.RETURN_REQUIRED] },
            items: { some: { productId: { in: createSampleDto.items.map((item) => item.productId) } } },
          },
        });
        if (existing) {
          throw new ConflictException(
            `Active sample ${existing.sampleNumber} already covers this lead/product; revise its history instead`,
          );
        }
      }
      const sampleNumber = await generatePublicId(tx, 'SAMPLE', 'SMP');
      
      const sample = await tx.sampleRequest.create({
        data: {
          sampleNumber,
          companyId: createSampleDto.companyId,
          leadId: createSampleDto.leadId,
          customerId: createSampleDto.customerId,
          expectedDeliveryDate: createSampleDto.expectedDeliveryDate ? new Date(createSampleDto.expectedDeliveryDate) : null,
          testingDeadline: createSampleDto.testingDeadline ? new Date(createSampleDto.testingDeadline) : null,
          returnDeadline: createSampleDto.returnDeadline ? new Date(createSampleDto.returnDeadline) : null,
          dispatchReference: createSampleDto.dispatchReference,
          status: createSampleDto.status || SampleStatus.CREATED,
          createdById: userId,
          items: {
            create: createSampleDto.items.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              specifications: item.specifications
            }))
          }
        },
        include: {
          items: true
        }
      });

      await tx.sampleHistory.create({
        data: {
          sampleRequestId: sample.id,
          action: 'CREATED',
          details: { message: 'Sample request created' },
          createdById: userId
        }
      });
      await tx.auditLog.create({
        data: {
          actorUserId: userId,
          companyId: createSampleDto.companyId,
          action: 'SAMPLE_CREATED',
          entityType: 'SampleRequest',
          entityId: sample.id,
          after: JSON.parse(JSON.stringify(sample)),
        },
      });

      return sample;
    });
  }

  async findAll(companyId: string, userId?: string, role?: string) {
    const scope = getSalesScope(userId, role, 'createdById');
    return this.prisma.sampleRequest.findMany({
      where: { companyId, deletedAt: null, ...scope },
      include: {
        items: {
          include: {
            product: { select: { id: true, name: true, sku: true } }
          }
        },
        lead: { select: { id: true, companyName: true, leadNumber: true } },
        customer: { select: { id: true, companyName: true, customerCode: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findOne(id: string, companyId: string, userId?: string, role?: string) {
    const scope = getSalesScope(userId, role, 'createdById');
    const sample = await this.prisma.sampleRequest.findFirst({
      where: { id, companyId, deletedAt: null, ...scope },
      include: {
        items: {
          include: {
            product: { select: { id: true, name: true, sku: true } }
          }
        },
        lead: { select: { id: true, companyName: true, leadNumber: true } },
        customer: { select: { id: true, companyName: true, customerCode: true } },
        histories: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!sample) {
      throw new NotFoundException(`Sample request ${id} not found`);
    }

    return sample;
  }

  async update(id: string, companyId: string, updateDto: UpdateSampleDto, userId: string = 'system', role?: string) {
    const { expectedVersion, items, ...updateData } = updateDto;

    // ensure it exists and user owns it
    await this.findOne(id, companyId, userId, role);

    return this.prisma.$transaction(async (tx) => {
      // 1. Optimistic update for the parent fields
      const updatedSample = await withOptimisticUpdate(this.prisma, 'sampleRequest', id, expectedVersion, updateData);

      // 2. If items were passed, we recreate them or update them. For simplicity in this migration phase, we'll delete and recreate.
      if (items && items.length > 0) {
        await tx.sampleItem.deleteMany({ where: { sampleRequestId: id } });
        await tx.sampleItem.createMany({
          data: items.map(item => ({
            sampleRequestId: id,
            productId: item.productId,
            quantity: item.quantity,
            specifications: item.specifications
          }))
        });
      }

      await tx.sampleHistory.create({
        data: {
          sampleRequestId: id,
          action: 'UPDATED',
          details: updateData,
          createdById: userId
        }
      });

      return this.findOne(id, companyId);
    });
  }

  async updateStatus(id: string, companyId: string, status: SampleStatus, expectedVersion: number, userId: string = 'system') {
    return this.prisma.$transaction(async (tx) => {
      const current = await tx.sampleRequest.findFirst({ where: { id, companyId, deletedAt: null } });
      if (!current) throw new NotFoundException(`Sample request ${id} not found`);
      const allowed: Record<SampleStatus, SampleStatus[]> = {
        CREATED: [SampleStatus.PENDING_DISPATCH],
        PENDING_DISPATCH: [SampleStatus.DISPATCHED],
        DISPATCHED: [SampleStatus.DELIVERED],
        DELIVERED: [SampleStatus.TESTING, SampleStatus.RETURN_REQUIRED],
        TESTING: [SampleStatus.APPROVED, SampleStatus.REJECTED, SampleStatus.RETURN_REQUIRED],
        APPROVED: [],
        REJECTED: [],
        RETURN_REQUIRED: [],
      };
      if (!allowed[current.status].includes(status)) {
        throw new BadRequestException(`Sample cannot transition from ${current.status} to ${status}`);
      }
      const sample = await withOptimisticUpdate(this.prisma, 'sampleRequest', id, expectedVersion, { status });

      await tx.sampleHistory.create({
        data: {
          sampleRequestId: id,
          action: 'STATUS_CHANGED',
          details: { status },
          createdById: userId
        }
      });
      await tx.auditLog.create({
        data: {
          actorUserId: userId,
          companyId,
          action: 'SAMPLE_STATUS_CHANGED',
          entityType: 'SampleRequest',
          entityId: id,
          before: { status: current.status, version: current.version },
          after: { status, version: (sample as any).version },
        },
      });

      return this.findOne(id, companyId);
    });
  }
}
