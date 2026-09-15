import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateSampleDto } from './dto/create-sample.dto';
import { UpdateSampleDto } from './dto/update-sample.dto';
import {
  generatePublicId,
  withOptimisticUpdate,
} from '../../common/utils/database.util';
import { SequenceService } from '../../common/sequence/sequence.service';
import { SampleStatus } from '@prisma/client';
import {
  getSampleSalesScope,
  getLeadSalesScope,
  isSalespersonScopedRole,
  canAssignSalesOwner,
} from '../../common/utils/rbac.util';

@Injectable()
export class SamplesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sequenceService: SequenceService,
  ) {}

  async create(
    createSampleDto: CreateSampleDto,
    userId: string = 'system',
    role?: string,
  ) {
    const companyId =
      createSampleDto.companyId || 'd039cfa4-e78b-4138-adfc-1b0f14cffa91';

    return this.prisma.$transaction(async (tx) => {
      let validLeadId: string | null = null;
      let validCustomerId: string | null = null;
      let leadSalesExecutiveId: string | null = null;
      let leadProjectName: string | null = null;

      if (createSampleDto.leadId) {
        const leadStr = String(createSampleDto.leadId);
        const leadObj = await tx.lead.findFirst({
          where: {
            OR: [
              { id: leadStr },
              { leadNumber: leadStr },
              { companyName: leadStr },
            ],
            companyId,
          },
          select: {
            id: true,
            salesExecutiveId: true,
            assignedToId: true,
            createdById: true,
            customerId: true,
            projectName: true,
          },
        });
        if (leadObj) {
          validLeadId = leadObj.id;
          leadSalesExecutiveId = leadObj.salesExecutiveId || leadObj.assignedToId || leadObj.createdById;
          leadProjectName = leadObj.projectName || null;
          if (!validCustomerId && leadObj.customerId) {
            validCustomerId = leadObj.customerId;
          }
        } else {
          const anyLead = await tx.lead.findFirst({
            where: { id: leadStr },
            select: { id: true, salesExecutiveId: true, assignedToId: true, createdById: true, customerId: true, projectName: true },
          });
          if (anyLead) {
            validLeadId = anyLead.id;
            leadSalesExecutiveId = anyLead.salesExecutiveId || anyLead.assignedToId || anyLead.createdById;
            leadProjectName = anyLead.projectName || null;
            if (!validCustomerId && anyLead.customerId) {
              validCustomerId = anyLead.customerId;
            }
          }
        }
        if (isSalespersonScopedRole(role)) {
          if (leadSalesExecutiveId && leadSalesExecutiveId !== userId) {
            throw new NotFoundException('Lead not found or access denied');
          }
        }
      }

      if (!validLeadId && createSampleDto.customerId) {
        const custStr = String(createSampleDto.customerId);
        const custObj = await tx.customer.findFirst({
          where: {
            OR: [
              { id: custStr },
              { customerCode: custStr },
              { companyName: custStr },
            ],
            companyId,
          },
          select: { id: true },
        });
        if (custObj) {
          validCustomerId = custObj.id;
        } else {
          const anyCust = await tx.customer.findFirst({
            where: { id: custStr },
            select: { id: true },
          });
          if (anyCust) validCustomerId = anyCust.id;
        }
      }

      if (!validLeadId && !validCustomerId) {
        const defaultLead = await tx.lead.findFirst({
          where: { companyId },
          select: { id: true, salesExecutiveId: true, assignedToId: true, createdById: true, projectName: true },
        });
        if (defaultLead) {
          validLeadId = defaultLead.id;
          leadSalesExecutiveId = defaultLead.salesExecutiveId || defaultLead.assignedToId || defaultLead.createdById;
          leadProjectName = defaultLead.projectName || null;
        }
      }

      const sampleNumber = await this.sequenceService.generateNextWithTx(
        tx,
        'SAMPLE',
        `SMP-${new Date().getFullYear()}-`,
      );

      const isManager = canAssignSalesOwner(role);
      const salesExecutiveId = isManager
        ? (createSampleDto as any).salesExecutiveId ||
          leadSalesExecutiveId ||
          userId
        : leadSalesExecutiveId || userId;

      // Safely resolve valid product foreign keys for items
      const resolvedItems = await Promise.all(
        (createSampleDto.items || []).map(async (item) => {
          let validProductId: string | null = null;
          let validProductName = item.specifications || 'Sample Product';

          if (item.productId) {
            const found = await tx.product.findFirst({
              where: {
                OR: [
                  { id: item.productId },
                  { publicId: item.productId },
                  { sku: item.productId },
                  { name: item.productId },
                ],
                companyId,
              },
              select: { id: true, name: true },
            });
            if (found) {
              validProductId = found.id;
              validProductName = found.name;
            }
          }

          if (!validProductId) {
            const anyProduct = await tx.product.findFirst({
              where: { companyId, isActive: true },
              select: { id: true, name: true },
            });
            if (anyProduct) {
              validProductId = anyProduct.id;
              validProductName = anyProduct.name;
            }
          }

          if (!validProductId) {
            const newProd = await tx.product.create({
              data: {
                companyId,
                publicId: `PRD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                name: item.specifications || 'Sample Product',
                sku: `SMP-${Date.now().toString().slice(-6)}`,
                unit: 'PCS',
                unitPrice: 0,
              },
              select: { id: true, name: true },
            });
            validProductId = newProd.id;
            validProductName = newProd.name;
          }

          return {
            productId: validProductId,
            quantity: Number(item.quantity) || 1,
            specifications: item.specifications || validProductName || 'Sample Item',
          };
        }),
      );

      const transportCost =
        createSampleDto.transportCost != null && createSampleDto.transportCost !== ''
          ? Number(createSampleDto.transportCost)
          : createSampleDto.transportationCost != null && createSampleDto.transportationCost !== ''
          ? Number(createSampleDto.transportationCost)
          : null;

      const sample = await tx.sampleRequest.create({
        data: {
          sampleNumber,
          companyId,
          projectName: createSampleDto.projectName || leadProjectName || null,
          leadId: validLeadId,
          customerId: validCustomerId,
          salesExecutiveId,
          transportCost,
          expectedDeliveryDate:
            createSampleDto.expectedDeliveryDate &&
            !isNaN(new Date(createSampleDto.expectedDeliveryDate).getTime())
              ? new Date(createSampleDto.expectedDeliveryDate)
              : null,
          testingDeadline:
            createSampleDto.testingDeadline &&
            !isNaN(new Date(createSampleDto.testingDeadline).getTime())
              ? new Date(createSampleDto.testingDeadline)
              : null,
          returnDeadline:
            createSampleDto.returnDeadline &&
            !isNaN(new Date(createSampleDto.returnDeadline).getTime())
              ? new Date(createSampleDto.returnDeadline)
              : null,
          status: createSampleDto.status || SampleStatus.CREATED,
          createdById: userId,
          items: {
            create: resolvedItems,
          },
        },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  sku: true,
                  category: true,
                  productType: true,
                  dispatchCategory: true,
                  size: true,
                  capacity: true,
                  unit: true,
                  unitPrice: true,
                },
              },
            },
          },
          salesExecutive: { select: { id: true, name: true, email: true } },
          lead: {
            select: {
              id: true,
              companyName: true,
              projectName: true,
              leadNumber: true,
              contactPerson: true,
              phone: true,
              email: true,
              address: true,
              detailedItems: true,
              remarks: true,
              salesExecutive: { select: { id: true, name: true, email: true } },
            },
          },
          customer: {
            select: {
              id: true,
              companyName: true,
              customerCode: true,
              contactPerson: true,
              phone: true,
              email: true,
              shippingAddress: true,
              billingAddress: true,
            },
          },
        },
      });

      await tx.sampleHistory.create({
        data: {
          sampleRequestId: sample.id,
          action: 'CREATED',
          details: { message: 'Sample request created' },
          createdById: userId,
        },
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
    const scope = getSampleSalesScope(userId, role);
    const samples = await this.prisma.sampleRequest.findMany({
      where: { companyId, deletedAt: null, ...scope },
      include: {
        salesExecutive: { select: { id: true, name: true, email: true } },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                category: true,
                productType: true,
                dispatchCategory: true,
                size: true,
                capacity: true,
                unit: true,
                unitPrice: true,
              },
            },
          },
        },
        lead: {
          select: {
            id: true,
            companyName: true,
            projectName: true,
            leadNumber: true,
            contactPerson: true,
            phone: true,
            email: true,
            address: true,
            detailedItems: true,
            remarks: true,
            salesExecutiveId: true,
            assignedToId: true,
            createdById: true,
            customerId: true,
            salesExecutive: { select: { id: true, name: true, email: true } },
          },
        },
        customer: {
          select: {
            id: true,
            companyName: true,
            customerCode: true,
            contactPerson: true,
            phone: true,
            email: true,
            shippingAddress: true,
            billingAddress: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Batch resolve any unassigned / missing salesExecutive names
    const missingUserIds = new Set<string>();
    for (const s of samples) {
      if (!s.salesExecutive && s.salesExecutiveId) missingUserIds.add(s.salesExecutiveId);
      if (s.lead && !s.lead.salesExecutive && s.lead.salesExecutiveId) missingUserIds.add(s.lead.salesExecutiveId);
      if (s.lead?.assignedToId) missingUserIds.add(s.lead.assignedToId);
      if (s.lead?.createdById) missingUserIds.add(s.lead.createdById);
      if (s.createdById) missingUserIds.add(s.createdById);
    }

    if (missingUserIds.size > 0) {
      const users = await this.prisma.user.findMany({
        where: { id: { in: Array.from(missingUserIds) } },
        select: { id: true, name: true, email: true },
      });
      const userMap = new Map(users.map((u) => [u.id, u]));

      for (const s of samples) {
        if (!s.salesExecutive) {
          const matchedUser =
            (s.salesExecutiveId && userMap.get(s.salesExecutiveId)) ||
            (s.lead?.salesExecutiveId && userMap.get(s.lead.salesExecutiveId)) ||
            (s.lead?.assignedToId && userMap.get(s.lead.assignedToId)) ||
            (s.lead?.createdById && userMap.get(s.lead.createdById)) ||
            (s.createdById && userMap.get(s.createdById));
          if (matchedUser) {
            (s as any).salesExecutive = matchedUser;
          }
        }
      }
    }

    // Batch resolve any unassigned / missing customer records
    const missingCustomerIds = new Set<string>();
    for (const s of samples) {
      if (!s.customer) {
        if (s.customerId) missingCustomerIds.add(s.customerId);
        else if (s.lead?.customerId) missingCustomerIds.add(s.lead.customerId);
      }
    }

    if (missingCustomerIds.size > 0) {
      const customers = await this.prisma.customer.findMany({
        where: { id: { in: Array.from(missingCustomerIds) } },
        select: {
          id: true,
          companyName: true,
          customerCode: true,
          contactPerson: true,
          phone: true,
          email: true,
          shippingAddress: true,
          billingAddress: true,
        },
      });
      const custMap = new Map(customers.map((c) => [c.id, c]));
      for (const s of samples) {
        if (!s.customer) {
          const matchedCust =
            (s.customerId && custMap.get(s.customerId)) ||
            (s.lead?.customerId && custMap.get(s.lead.customerId));
          if (matchedCust) {
            (s as any).customer = matchedCust;
          }
        }
      }
    }

    return samples;
  }

  async findOne(id: string, companyId: string, userId?: string, role?: string) {
    const cleanId = id.replace(/^req-/, '');
    const scope = getSampleSalesScope(userId, role);
    let sample = await this.prisma.sampleRequest.findFirst({
      where: {
        OR: [
          { id: cleanId },
          { sampleNumber: cleanId },
          { id: id },
          { sampleNumber: id },
        ],
        companyId,
        deletedAt: null,
        ...scope,
      },
      include: {
        salesExecutive: { select: { id: true, name: true, email: true } },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                category: true,
                productType: true,
                dispatchCategory: true,
                size: true,
                capacity: true,
                unit: true,
                unitPrice: true,
              },
            },
          },
        },
        lead: {
          select: {
            id: true,
            companyName: true,
            projectName: true,
            leadNumber: true,
            contactPerson: true,
            phone: true,
            email: true,
            address: true,
            detailedItems: true,
            remarks: true,
            salesExecutiveId: true,
            assignedToId: true,
            createdById: true,
            customerId: true,
            salesExecutive: { select: { id: true, name: true, email: true } },
          },
        },
        customer: {
          select: {
            id: true,
            companyName: true,
            customerCode: true,
            contactPerson: true,
            phone: true,
            email: true,
            shippingAddress: true,
            billingAddress: true,
          },
        },
        histories: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!sample) {
      sample = await this.prisma.sampleRequest.findFirst({
        where: {
          OR: [
            { id: cleanId },
            { sampleNumber: cleanId },
            { id: id },
            { sampleNumber: id },
          ],
        },
        include: {
          salesExecutive: { select: { id: true, name: true, email: true } },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  sku: true,
                  category: true,
                  productType: true,
                  dispatchCategory: true,
                  size: true,
                  capacity: true,
                  unit: true,
                  unitPrice: true,
                },
              },
            },
          },
          lead: {
            select: {
              id: true,
              companyName: true,
              projectName: true,
              leadNumber: true,
              contactPerson: true,
              phone: true,
              email: true,
              address: true,
              detailedItems: true,
              remarks: true,
              salesExecutiveId: true,
              assignedToId: true,
              createdById: true,
              customerId: true,
              salesExecutive: { select: { id: true, name: true, email: true } },
            },
          },
          customer: {
            select: {
              id: true,
              companyName: true,
              customerCode: true,
              contactPerson: true,
              phone: true,
              email: true,
              shippingAddress: true,
              billingAddress: true,
            },
          },
          histories: {
            orderBy: { createdAt: 'desc' },
          },
        },
      });
    }

    if (!sample) {
      throw new NotFoundException(`Sample request ${id} not found`);
    }

    if (!sample.salesExecutive) {
      const candidateIds = [
        sample.salesExecutiveId,
        sample.lead?.salesExecutiveId,
        sample.lead?.assignedToId,
        sample.lead?.createdById,
        sample.createdById,
      ].filter(Boolean) as string[];

      if (candidateIds.length > 0) {
        const users = await this.prisma.user.findMany({
          where: { id: { in: candidateIds } },
          select: { id: true, name: true, email: true },
        });
        const userMap = new Map(users.map((u) => [u.id, u]));
        const matchedUser = candidateIds.map((cid) => userMap.get(cid)).find(Boolean);
        if (matchedUser) {
          (sample as any).salesExecutive = matchedUser;
        }
      }
    }

    if (!sample.customer) {
      const targetCustId = sample.customerId || sample.lead?.customerId;
      if (targetCustId) {
        const cust = await this.prisma.customer.findFirst({
          where: { id: targetCustId },
          select: {
            id: true,
            companyName: true,
            customerCode: true,
            contactPerson: true,
            phone: true,
            email: true,
            shippingAddress: true,
            billingAddress: true,
          },
        });
        if (cust) {
          (sample as any).customer = cust;
        }
      }
    }

    return sample;
  }

  async update(
    id: string,
    companyId: string,
    updateDto: UpdateSampleDto,
    userId: string = 'system',
    role?: string,
  ) {
    const {
      expectedVersion,
      items,
      dispatchDetails,
      deliveryState,
      retrievalStatus,
      returnRequestedDate,
      ...updateData
    } = updateDto;

    // ensure it exists and resolve its true database UUID
    const existing = await this.findOne(id, companyId, userId, role);
    const targetId = existing.id;

    const prismaUpdateData: any = { ...updateData };

    if (updateData.projectName) {
      prismaUpdateData.projectName = updateData.projectName;
    } else if (dispatchDetails?.projectName) {
      prismaUpdateData.projectName = dispatchDetails.projectName;
    }

    if (updateData.status) {
      const st = String(updateData.status).toUpperCase();
      if (st === 'DELIVERED' || st === 'COMPLETED') {
        prismaUpdateData.status = SampleStatus.DELIVERED;
        if (!prismaUpdateData.deliveredAt) prismaUpdateData.deliveredAt = new Date();
      } else if (st === 'DISPATCHED' || st === 'IN_TRANSIT') {
        prismaUpdateData.status = SampleStatus.DISPATCHED;
        if (!prismaUpdateData.dispatchDate) prismaUpdateData.dispatchDate = new Date();
      } else if (st === 'RETURN_IN_TRANSIT') {
        prismaUpdateData.status = SampleStatus.RETURN_IN_TRANSIT;
      } else if (st === 'RETURNED') {
        prismaUpdateData.status = SampleStatus.RETURNED;
        if (!prismaUpdateData.returnedAt) prismaUpdateData.returnedAt = new Date();
      } else if (Object.values(SampleStatus).includes(st as SampleStatus)) {
        prismaUpdateData.status = st as SampleStatus;
      }
    }

    if (updateData.deliveredAt) {
      const dt = new Date(updateData.deliveredAt);
      if (!isNaN(dt.getTime())) {
        prismaUpdateData.deliveredAt = dt;
      }
    }
    if (updateData.returnedAt) {
      const dt = new Date(updateData.returnedAt);
      if (!isNaN(dt.getTime())) {
        prismaUpdateData.returnedAt = dt;
      }
    }
    if (updateData.dispatchDate) {
      const dt = new Date(updateData.dispatchDate);
      if (!isNaN(dt.getTime())) {
        prismaUpdateData.dispatchDate = dt;
      }
    }

    if (dispatchDetails) {
      if (dispatchDetails.vehicleNo)
        prismaUpdateData.vehicleNo = dispatchDetails.vehicleNo;
      if (dispatchDetails.driverName)
        prismaUpdateData.driverName = dispatchDetails.driverName;
      if (dispatchDetails.driverPhone)
        prismaUpdateData.driverPhone = dispatchDetails.driverPhone;
      if (dispatchDetails.lrNo) prismaUpdateData.lrNo = dispatchDetails.lrNo;
      if (dispatchDetails.transport)
        prismaUpdateData.transportMode = dispatchDetails.transport;
      if (dispatchDetails.cost)
        prismaUpdateData.transportCost = dispatchDetails.cost;
      if (dispatchDetails.dispatchDate) {
        const dt = new Date(dispatchDetails.dispatchDate);
        if (!isNaN(dt.getTime())) prismaUpdateData.dispatchDate = dt;
      } else if (!prismaUpdateData.dispatchDate) {
        prismaUpdateData.dispatchDate = new Date();
      }
    }
    if (returnRequestedDate) {
      const dt = new Date(returnRequestedDate);
      if (!isNaN(dt.getTime())) prismaUpdateData.returnRequestedAt = dt;
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Optimistic update for the parent fields
      const updatedSample = await withOptimisticUpdate(
        this.prisma,
        'sampleRequest',
        targetId,
        expectedVersion,
        prismaUpdateData,
      );

      // 2. If items were passed, we recreate them or update them. For simplicity in this migration phase, we'll delete and recreate.
      if (items && items.length > 0) {
        await tx.sampleItem.deleteMany({ where: { sampleRequestId: id } });
        await tx.sampleItem.createMany({
          data: items.map((item) => ({
            sampleRequestId: id,
            productId: item.productId,
            quantity: item.quantity,
            specifications: item.specifications,
          })),
        });
      }

      await tx.sampleHistory.create({
        data: {
          sampleRequestId: id,
          action: 'UPDATED',
          details: { ...prismaUpdateData, dispatchDetails, deliveryState },
          createdById: userId,
        },
      });

      return this.findOne(id, companyId);
    });
  }

  async updateStatus(
    id: string,
    companyId: string,
    status: SampleStatus,
    expectedVersion: number,
    userId: string = 'system',
  ) {
    return this.prisma.$transaction(async (tx) => {
      const current = await tx.sampleRequest.findFirst({
        where: { id, companyId, deletedAt: null },
      });
      if (!current)
        throw new NotFoundException(`Sample request ${id} not found`);
      const allowed: Record<SampleStatus, SampleStatus[]> = {
        CREATED: [SampleStatus.PENDING_DISPATCH],
        PENDING_DISPATCH: [SampleStatus.DISPATCHED],
        DISPATCHED: [SampleStatus.DELIVERED],
        DELIVERED: [SampleStatus.TESTING, SampleStatus.RETURN_REQUIRED],
        TESTING: [
          SampleStatus.APPROVED,
          SampleStatus.REJECTED,
          SampleStatus.RETURN_REQUIRED,
        ],
        APPROVED: [],
        REJECTED: [],
        RETURN_REQUIRED: [SampleStatus.RETURN_REQUESTED],
        RETURN_REQUESTED: [SampleStatus.RETURN_IN_TRANSIT],
        RETURN_IN_TRANSIT: [SampleStatus.RETURNED],
        RETURNED: [SampleStatus.COMPLETED],
        COMPLETED: [],
      };
      if (!allowed[current.status].includes(status)) {
        throw new BadRequestException(
          `Sample cannot transition from ${current.status} to ${status}`,
        );
      }
      const sample = await withOptimisticUpdate(
        this.prisma,
        'sampleRequest',
        id,
        expectedVersion,
        { status },
      );

      await tx.sampleHistory.create({
        data: {
          sampleRequestId: id,
          action: 'STATUS_CHANGED',
          details: { status },
          createdById: userId,
        },
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
