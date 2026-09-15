import {
  Injectable,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import {
  generatePublicId,
  withOptimisticUpdate,
} from '../../common/utils/database.util';
import { Prisma } from '@prisma/client';
import { getSalesScope, isSalespersonScopedRole } from '../../common/utils/rbac.util';

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
    // Duplicate prevention logic
    const { gstin, email, phone, companyName, companyId } = createDto;

    const checks: Prisma.CustomerWhereInput[] = [];
    if (gstin) checks.push({ gstin });
    if (email) checks.push({ email });
    if (phone) checks.push({ phone });
    if (companyName) checks.push({ companyName });

    if (checks.length > 0) {
      const existing = await this.prisma.customer.findFirst({
        where: {
          companyId,
          OR: checks,
          deletedAt: null,
        },
      });

      if (existing) {
        throw new ConflictException({
          code: 'CUSTOMER_ALREADY_EXISTS',
          message: 'A customer with matching details already exists.',
          details: {
            customerId: existing.id,
            customerCode: existing.customerCode,
          },
        });
      }
    }

    const customer = await this.prisma.$transaction(async (tx) => {
      const customerCode = await generatePublicId(tx, 'CUSTOMER', 'CUST');
      return tx.customer.create({
        data: {
          ...createDto,
          customerCode,
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

  private async buildSalespersonCustomerScope(
    userId?: string,
    role?: string,
    companyId?: string,
  ): Promise<Prisma.CustomerWhereInput | null> {
    if (!isSalespersonScopedRole(role)) return null;
    if (!userId) {
      throw new UnauthorizedException('User ID required for sales scoping');
    }

    // Collect all customer IDs and matching company names associated with this sales user across:
    // 1. Leads (salesExecutiveId, assignedToId, createdById)
    // 2. Quotations (salesExecutiveId, createdById, lead.salesExecutiveId, lead.assignedToId)
    // 3. SampleRequests (salesExecutiveId, createdById, lead.salesExecutiveId, lead.assignedToId)
    // 4. SalesOrders (salesExecutiveId, createdById, quotation.salesExecutiveId)
    const [leads, quotations, samples, orders] = await Promise.all([
      this.prisma.lead.findMany({
        where: {
          companyId,
          OR: [
            { salesExecutiveId: userId },
            { assignedToId: userId },
            { createdById: userId },
          ],
          deletedAt: null,
        },
        select: {
          customerId: true,
          convertedCustomerId: true,
          companyName: true,
        },
      }),
      this.prisma.quotation.findMany({
        where: {
          OR: [
            { salesExecutiveId: userId },
            { createdById: userId },
            { lead: { salesExecutiveId: userId } },
            { lead: { assignedToId: userId } },
          ],
          deletedAt: null,
        },
        select: {
          customerId: true,
        },
      }),
      this.prisma.sampleRequest.findMany({
        where: {
          OR: [
            { salesExecutiveId: userId },
            { createdById: userId },
            { lead: { salesExecutiveId: userId } },
            { lead: { assignedToId: userId } },
          ],
          deletedAt: null,
        },
        select: {
          customerId: true,
        },
      }),
      this.prisma.salesOrder.findMany({
        where: {
          OR: [
            { salesExecutiveId: userId },
            { createdById: userId },
            { quotation: { salesExecutiveId: userId } },
          ],
          deletedAt: null,
        },
        select: {
          customerId: true,
        },
      }),
    ]);

    const directCustomerIds = new Set<string>();
    const matchingCompanyNames: string[] = [];

    for (const l of leads) {
      if (l.customerId) directCustomerIds.add(l.customerId);
      if (l.convertedCustomerId) directCustomerIds.add(l.convertedCustomerId);
      if (l.companyName && l.companyName.trim()) {
        matchingCompanyNames.push(l.companyName.trim());
      }
    }

    for (const q of quotations) {
      if (q.customerId) directCustomerIds.add(q.customerId);
    }

    for (const s of samples) {
      if (s.customerId) directCustomerIds.add(s.customerId);
    }

    for (const o of orders) {
      if (o.customerId) directCustomerIds.add(o.customerId);
    }

    const orBranches: Prisma.CustomerWhereInput[] = [
      { createdById: userId },
      {
        salesOrders: {
          some: {
            OR: [
              { salesExecutiveId: userId },
              { createdById: userId },
              { quotation: { salesExecutiveId: userId } },
              { quotation: { createdById: userId } },
            ],
          },
        },
      },
      {
        sampleRequests: {
          some: {
            OR: [
              { salesExecutiveId: userId },
              { createdById: userId },
              { lead: { salesExecutiveId: userId } },
              { lead: { assignedToId: userId } },
            ],
          },
        },
      },
    ];

    if (directCustomerIds.size > 0) {
      orBranches.push({ id: { in: Array.from(directCustomerIds) } });
    }

    if (matchingCompanyNames.length > 0) {
      orBranches.push({ companyName: { in: matchingCompanyNames, mode: 'insensitive' } });
    }

    return { OR: orBranches };
  }

  async list(
    companyId: string,
    page: number = 1,
    pageSize: number = 1000,
    search?: string,
    userId?: string,
    role?: string,
  ) {
    const scope = await this.buildSalespersonCustomerScope(userId, role, companyId);
    const searchConditions: Prisma.CustomerWhereInput[] = search
      ? [
          { companyName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
          { customerCode: { contains: search, mode: 'insensitive' } },
        ]
      : [];

    const andConditions: Prisma.CustomerWhereInput[] = [
      { companyId },
      { deletedAt: null },
    ];

    if (scope && Object.keys(scope).length > 0) {
      andConditions.push(scope);
    }

    if (searchConditions.length > 0) {
      andConditions.push({ OR: searchConditions });
    }

    const where: Prisma.CustomerWhereInput = {
      AND: andConditions,
    };

    const takeLimit = pageSize > 0 ? pageSize : 1000;
    const skipCount = pageSize > 0 && page > 0 ? (page - 1) * pageSize : 0;

    const [items, total] = await Promise.all([
      this.prisma.customer.findMany({
        where,
        skip: skipCount,
        take: takeLimit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.customer.count({ where }),
    ]);

    return { items, total };
  }

  async getById(id: string, companyId: string, userId?: string, role?: string) {
    const scope = await this.buildSalespersonCustomerScope(userId, role, companyId);
    const andConditions: Prisma.CustomerWhereInput[] = [
      { id },
      { companyId },
      { deletedAt: null },
    ];
    if (scope && Object.keys(scope).length > 0) {
      andConditions.push(scope);
    }
    const customer = await this.prisma.customer.findFirst({
      where: { AND: andConditions },
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
    role?: string,
  ) {
    const existing = await this.getById(id, companyId, userId, role);
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
    role?: string,
  ) {
    const existing = await this.getById(id, companyId, userId, role);
    const updated = await withOptimisticUpdate(
      this.prisma,
      'customer',
      id,
      expectedVersion,
      {
        status: 'INACTIVE',
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
      before: { status: 'ACTIVE', deletedAt: null },
      after: { status: 'INACTIVE', deletedAt: (updated as any).deletedAt },
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
    role?: string,
  ) {
    const existing = await this.getById(id, companyId, userId, role); // might need to be careful if we exclude deleted records from normal gets
    // Let's ensure getById allows soft-deleted records to be found.
    // `findFirst` in getById does NOT filter `deletedAt: null`, so it's fine.

    const updated = await withOptimisticUpdate(
      this.prisma,
      'customer',
      id,
      expectedVersion,
      {
        status: 'ACTIVE',
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
      before: { status: 'INACTIVE', deletedAt: (existing as any).deletedAt },
      after: { status: 'ACTIVE', deletedAt: null },
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
        customerCode: true,
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
          customerId: p.customerCode,
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
