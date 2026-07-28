import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import {
  generatePublicId,
  withOptimisticUpdate,
} from '../../common/utils/database.util';
import { Prisma } from '@prisma/client';

@Injectable()
export class CustomersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async create(
    createDto: CreateCustomerDto,
    userId: string,
    requestId?: string,
  ) {
    const customer = await this.prisma.$transaction(async (tx) => {
      const publicId = await generatePublicId(tx, 'CUSTOMER', 'CUST');
      return tx.customer.create({
        data: {
          publicId,
          ...createDto,
          createdById: userId,
        },
      });
    });

    await this.auditService.log({
      actorUserId: userId,
      companyId: createDto.companyId,
      branchId: createDto.branchId,
      action: 'CUSTOMER_CREATED',
      entityType: 'Customer',
      entityId: customer.id,
      after: customer,
      requestId,
    });

    return customer;
  }

  async list(
    companyId: string,
    page: number = 1,
    pageSize: number = 25,
    search?: string,
  ) {
    const where: Prisma.CustomerWhereInput = {
      companyId,
      deletedAt: null,
      ...(search
        ? {
            OR: [
              { companyName: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
              { phone: { contains: search, mode: 'insensitive' } },
              { publicId: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.customer.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.customer.count({ where }),
    ]);

    return { items, total };
  }

  async getById(id: string, companyId: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id, companyId },
    });
    if (!customer) throw new NotFoundException('Customer not found');
    return customer;
  }

  async update(
    id: string,
    companyId: string,
    updateDto: UpdateCustomerDto,
    userId: string,
    requestId?: string,
  ) {
    const existing = await this.getById(id, companyId);
    const { expectedVersion, ...data } = updateDto;

    const updated = await withOptimisticUpdate(
      this.prisma,
      'customer',
      id,
      expectedVersion,
      {
        ...data,
        updatedById: userId,
      },
    );

    // Compute diff for audit log
    const diffBefore: any = {};
    const diffAfter: any = {};
    for (const key of Object.keys(data)) {
      if ((existing as any)[key] !== (updated as any)[key]) {
        diffBefore[key] = (existing as any)[key];
        diffAfter[key] = (updated as any)[key];
      }
    }

    if (Object.keys(diffAfter).length > 0) {
      await this.auditService.log({
        actorUserId: userId,
        companyId,
        action: 'CUSTOMER_UPDATED',
        entityType: 'Customer',
        entityId: id,
        before: diffBefore,
        after: diffAfter,
        requestId,
      });
    }

    return updated;
  }

  async deactivate(
    id: string,
    companyId: string,
    expectedVersion: number,
    userId: string,
    requestId?: string,
  ) {
    const existing = await this.getById(id, companyId);
    const updated = await withOptimisticUpdate(
      this.prisma,
      'customer',
      id,
      expectedVersion,
      {
        isActive: false,
        deletedAt: new Date(),
        updatedById: userId,
      },
    );

    await this.auditService.log({
      actorUserId: userId,
      companyId,
      action: 'CUSTOMER_DEACTIVATED',
      entityType: 'Customer',
      entityId: id,
      before: { isActive: true, deletedAt: null },
      after: { isActive: false, deletedAt: (updated as any).deletedAt },
      requestId,
    });

    return updated;
  }

  async restore(
    id: string,
    companyId: string,
    expectedVersion: number,
    userId: string,
    requestId?: string,
  ) {
    const existing = await this.getById(id, companyId); // might need to be careful if we exclude deleted records from normal gets
    // Let's ensure getById allows soft-deleted records to be found.
    // `findFirst` in getById does NOT filter `deletedAt: null`, so it's fine.

    const updated = await withOptimisticUpdate(
      this.prisma,
      'customer',
      id,
      expectedVersion,
      {
        isActive: true,
        deletedAt: null,
        updatedById: userId,
      },
    );

    await this.auditService.log({
      actorUserId: userId,
      companyId,
      action: 'CUSTOMER_RESTORED',
      entityType: 'Customer',
      entityId: id,
      before: { isActive: false, deletedAt: existing.deletedAt },
      after: { isActive: true, deletedAt: null },
      requestId,
    });

    return updated;
  }

  async checkDuplicates(
    companyId: string,
    gstin?: string,
    email?: string,
    phone?: string,
    companyName?: string,
  ) {
    const matches: any[] = [];

    if (!gstin && !email && !phone && !companyName) {
      return { hasExactDuplicate: false, matches };
    }

    const conditions: any[] = [];
    if (gstin) conditions.push({ gstin });
    if (email)
      conditions.push({ email: { equals: email, mode: 'insensitive' } });
    if (phone) conditions.push({ phone });
    if (companyName) {
      // Basic fuzzy check
      conditions.push({
        companyName: { contains: companyName, mode: 'insensitive' },
      });
    }

    const potentials = await this.prisma.customer.findMany({
      where: {
        companyId,
        deletedAt: null,
        OR: conditions,
      },
      select: {
        id: true,
        publicId: true,
        gstin: true,
        email: true,
        phone: true,
        companyName: true,
      },
    });

    for (const p of potentials) {
      const matchedFields: string[] = [];
      let confidence = 'PARTIAL';

      if (gstin && p.gstin === gstin) {
        matchedFields.push('gstin');
        confidence = 'EXACT';
      }
      if (email && p.email?.toLowerCase() === email.toLowerCase()) {
        matchedFields.push('email');
        confidence = 'EXACT';
      }
      if (phone && p.phone === phone) {
        matchedFields.push('phone');
        confidence = 'EXACT';
      }
      if (
        companyName &&
        p.companyName.toLowerCase() === companyName.toLowerCase()
      ) {
        matchedFields.push('companyName');
        confidence = 'EXACT';
      }

      if (matchedFields.length > 0) {
        matches.push({
          customerId: p.publicId,
          matchedFields,
          confidence,
        });
      }
    }

    return {
      hasExactDuplicate: matches.some((m) => m.confidence === 'EXACT'),
      matches,
    };
  }
}
