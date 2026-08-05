import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { WorkflowService } from '../workflow/workflow.service';
import { SequenceService } from '../../common/sequence/sequence.service';
import { Decimal } from '@prisma/client/runtime/library';
import { getSalesScope } from '../../common/utils/rbac.util';

@Injectable()
export class QuotationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workflowService: WorkflowService,
    private readonly sequenceService: SequenceService,
  ) {}

  async listQuotations(
    companyId?: string,
    search?: string,
    userId?: string,
    role?: string,
  ) {
    const scope = getSalesScope(userId, role, 'createdById');
    return this.prisma.quotation.findMany({
      where: {
        ...scope,
        deletedAt: null,
        ...(companyId ? { companyId } : {}),
        ...(search
          ? { quotationNumber: { contains: search, mode: 'insensitive' } }
          : {}),
      },
      include: {
        workflowState: true,
        lead: true,
        items: { include: { product: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getQuotation(
    id: string,
    companyId?: string,
    userId?: string,
    role?: string,
  ) {
    const scope = getSalesScope(userId, role, 'createdById');
    const quotation = await this.prisma.quotation.findFirst({
      where: {
        id,
        ...scope,
        deletedAt: null,
        ...(companyId ? { companyId } : {}),
      },
      include: {
        workflowState: true,
        items: true,
        lead: true,
        parentQuotation: true,
        childQuotations: {
          include: { workflowState: true },
          orderBy: { version: 'asc' },
        },
        salesOrder: true,
        sourceSalesOrders: true,
      },
    });
    if (!quotation) throw new NotFoundException('Quotation not found');
    return quotation;
  }

  private calculate(items: any[]) {
    let subtotal = new Decimal(0);
    let discount = new Decimal(0);
    let tax = new Decimal(0);
    const processedItems = (items || []).map((item) => {
      const gross = new Decimal(item.quantity).mul(item.unitPrice);
      const itemDiscount = new Decimal(item.discount || 0);
      const taxable = gross.sub(itemDiscount);
      const itemTax = new Decimal(item.tax || 0);
      const lineTotal = taxable.add(itemTax);
      subtotal = subtotal.add(gross);
      discount = discount.add(itemDiscount);
      tax = tax.add(itemTax);
      return { ...item, lineTotal: lineTotal.toNumber() };
    });
    return {
      processedItems,
      subtotal: subtotal.toNumber(),
      discount: discount.toNumber(),
      tax: tax.toNumber(),
      total: subtotal.sub(discount).add(tax).toNumber(),
    };
  }

  async createQuotation(
    dto: any,
    userId: string,
    companyId?: string,
    role?: string,
  ) {
    const initialState =
      await this.workflowService.getInitialState('QUOTATION');
    const resolvedCompanyId =
      companyId ||
      dto.companyId ||
      (await this.prisma.company.findFirst({ select: { id: true } }))?.id;
    if (!resolvedCompanyId)
      throw new BadRequestException('Company is required');
    if (!dto.leadId && !dto.customerId)
      throw new BadRequestException('Lead or customer is required');
    if (dto.leadId) {
      const samples = await this.prisma.sampleRequest.findMany({
        where: { leadId: dto.leadId, deletedAt: null },
        orderBy: { createdAt: 'desc' },
      });
      if (samples.length && samples[0].status !== 'APPROVED') {
        throw new BadRequestException(
          'The latest required sample must be approved before quotation creation',
        );
      }
    }
    const resolvedItems = await Promise.all(
      (dto.items || []).map(async (item: any) => {
        let product = await this.prisma.product.findFirst({
          where: {
            isActive: true,
            OR: [
              ...(item.productId
                ? [{ id: item.productId }, { publicId: item.productId }]
                : []),
              ...(item.productCode
                ? [{ sku: item.productCode }, { publicId: item.productCode }]
                : []),
              ...(item.productName
                ? [
                    {
                      name: {
                        equals: item.productName,
                        mode: 'insensitive' as const,
                      },
                    },
                  ]
                : []),
            ],
          },
          select: { id: true },
        });

        if (!product) {
          product = await this.prisma.product.findFirst({
            where: { isActive: true },
            select: { id: true },
          });
        }

        if (!product) {
          throw new BadRequestException(
            `Product "${item.productName || item.productCode || item.productId || 'Unknown'}" was not found in the product database.`,
          );
        }
        return { ...item, productId: product.id };
      }),
    );
    const totals = this.calculate(resolvedItems);
    if (!totals.processedItems.length)
      throw new BadRequestException('At least one quotation item is required');
    const quotationNumber = await this.sequenceService.generateNext(
      'quotation_number',
      `QT-${new Date().getFullYear()}-`,
    );

    return this.prisma.quotation.create({
      data: {
        quotationNumber,
        companyId: resolvedCompanyId,
        leadId: dto.leadId,
        customerId: dto.customerId,
        validUntil: dto.validUntil ? new Date(dto.validUntil) : null,
        subtotal: totals.subtotal,
        discount: totals.discount,
        tax: totals.tax,
        total: totals.total,
        remarks: dto.remarks,
        workflowStateId: initialState.id,
        createdById: userId,
        items: {
          create: totals.processedItems.map((item: any) => ({
            productId: item.productId,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discount: item.discount || 0,
            tax: item.tax || 0,
            lineTotal: item.lineTotal,
          })),
        },
      },
      include: {
        workflowState: true,
        items: { include: { product: true } },
        lead: true,
      },
    });
  }

  async updateQuotation(
    id: string,
    dto: any,
    userId: string,
    companyId?: string,
    role?: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const scope = getSalesScope(userId, role, 'createdById');
      const quotation = await tx.quotation.findFirst({
        where: {
          id,
          ...scope,
          deletedAt: null,
          ...(companyId ? { companyId } : {}),
        },
        include: { workflowState: true },
      });
      if (!quotation) throw new NotFoundException('Quotation not found');
      if (!['DRAFT', 'NEW'].includes(quotation.workflowState?.code || '')) {
        throw new BadRequestException('Only DRAFT or NEW quotations can be edited');
      }
      const totals = dto.items ? this.calculate(dto.items) : null;
      if (dto.items && !totals?.processedItems.length)
        throw new BadRequestException(
          'At least one quotation item is required',
        );
      if (dto.items)
        await tx.quotationItem.deleteMany({ where: { quotationId: id } });
      return tx.quotation.update({
        where: { id },
        data: {
          validUntil: dto.validUntil ? new Date(dto.validUntil) : undefined,
          remarks: dto.remarks,
          updatedById: userId,
          ...(totals
            ? {
                subtotal: totals.subtotal,
                discount: totals.discount,
                tax: totals.tax,
                total: totals.total,
                items: {
                  create: totals.processedItems.map((item: any) => ({
                    productId: item.productId,
                    description: item.description,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    discount: item.discount || 0,
                    tax: item.tax || 0,
                    lineTotal: item.lineTotal,
                  })),
                },
              }
            : {}),
        },
        include: { workflowState: true, items: true },
      });
    });
  }

  async processAction(
    id: string,
    actionName: string,
    remarks?: string,
    userId?: string,
    role?: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const quotation = await tx.quotation.findFirst({
        where: { id },
        include: { workflowState: true },
      });
      if (!quotation) throw new NotFoundException('Quotation not found');

      const result = await this.workflowService.processAction(
        {
          entityId: id,
          entityType: 'QUOTATION',
          workflowCode: 'QUOTATION',
          currentStateId: quotation.workflowStateId!,
          actionName,
          userId: userId || 'SYSTEM',
          remarks,
        },
        tx,
      );

      return tx.quotation.update({
        where: { id },
        data: {
          workflowStateId: result.nextStateId,
          ...(actionName === 'APPROVE'
            ? { approvedById: userId || 'SYSTEM', approvedAt: new Date() }
            : {}),
        },
        include: { workflowState: true },
      });
    });
  }

  async duplicateVersion(id: string, userId: string, role?: string) {
    return this.prisma.$transaction(async (tx) => {
      const scope = getSalesScope(userId, role, 'createdById');
      const original = await tx.quotation.findFirst({
        where: { id, ...scope },
        include: { items: true, workflowState: true },
      });

      if (!original) throw new NotFoundException('Quotation not found');

      const supersededState = await tx.workflowState.findFirst({
        where: { workflow: { code: 'QUOTATION' }, code: 'SUPERSEDED' },
      });

      if (supersededState && original.workflowState?.code !== 'SUPERSEDED') {
        // Log history of superseding
        await tx.workflowHistory.create({
          data: {
            entityId: id,
            entityType: 'QUOTATION',
            fromStatus: original.workflowState?.name || 'Unknown',
            toStatus: supersededState.name,
            action: 'DUPLICATE',
            remarks: 'Duplicated to create a new version',
            userId: userId,
          },
        });
        await tx.quotation.update({
          where: { id },
          data: { workflowStateId: supersededState.id },
        });
      }

      const initialState = await tx.workflowState.findFirst({
        where: { workflow: { code: 'QUOTATION' }, isInitial: true },
      });

      const rootId = original.parentQuotationId || original.id;
      const latest = await tx.quotation.findFirst({
        where: { OR: [{ id: rootId }, { parentQuotationId: rootId }] },
        orderBy: { version: 'desc' },
      });
      const newVersion = (latest?.version || original.version) + 1;
      const baseNumber = original.quotationNumber.replace(/-V\d+$/, '');
      const quotationNumber = `${baseNumber}-V${newVersion}`;

      return tx.quotation.create({
        data: {
          quotationNumber,
          version: newVersion,
          parentQuotationId: rootId,
          companyId: original.companyId,
          leadId: original.leadId,
          customerId: original.customerId,
          validUntil: original.validUntil,
          subtotal: original.subtotal,
          discount: original.discount,
          tax: original.tax,
          total: original.total,
          remarks: original.remarks,
          workflowStateId: initialState?.id,
          createdById: userId,
          items: {
            create: original.items.map((item) => ({
              productId: item.productId,
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              discount: item.discount,
              tax: item.tax,
              lineTotal: item.lineTotal,
            })),
          },
        },
        include: { workflowState: true, items: true },
      });
    });
  }

  async convertToSalesOrder(id: string, userId: string, role?: string) {
    return this.prisma.$transaction(async (tx) => {
      // Lock the quotation row to prevent race conditions
      await tx.$queryRawUnsafe(
        'SELECT id FROM "Quotation" WHERE id = $1 FOR UPDATE',
        id,
      );

      const scope = getSalesScope(userId, role, 'createdById');
      const quotation = await tx.quotation.findFirst({
        where: { id, ...scope },
        include: { items: true, workflowState: true, lead: true },
      });

      if (!quotation) throw new NotFoundException('Quotation not found');
      
      const allowedCodes = ['APPROVED', 'SENT', 'NEGOTIATION', 'NEW', 'DRAFT', 'INTERNAL_REVIEW', 'QUOTATION_SENT', 'QUOTATION_APPROVED'];
      if (!allowedCodes.includes(quotation.workflowState?.code || '')) {
        throw new BadRequestException(
          'Only active quotations can be converted to Sales Orders',
        );
      }

      // If not yet in APPROVED state, auto-approve quotation as part of conversion
      if (quotation.workflowState?.code !== 'APPROVED') {
        const approvedState = await tx.workflowState.findFirst({
          where: { workflow: { code: 'QUOTATION' }, code: 'APPROVED' },
        });
        if (approvedState) {
          await tx.quotation.update({
            where: { id },
            data: { workflowStateId: approvedState.id, approvedById: userId, approvedAt: new Date() },
          });
        }
      }
      const rootId = quotation.parentQuotationId || quotation.id;
      const newerVersion = await tx.quotation.findFirst({
        where: {
          OR: [{ id: rootId }, { parentQuotationId: rootId }],
          version: { gt: quotation.version },
        },
      });
      if (newerVersion)
        throw new BadRequestException(
          'Only the latest quotation version can be converted',
        );
      const existingOrder = await tx.salesOrder.findFirst({
        where: {
          OR: [
            { sourceQuotationId: id },
            { quotationId: id }
          ]
        },
      });
      if (existingOrder) {
        throw new BadRequestException(
          'Quotation has already been converted to a Sales Order.',
        );
      }

      let customerId =
        quotation.customerId ||
        quotation.lead?.convertedCustomerId ||
        quotation.lead?.customerId;
      if (!customerId) {
        if (!quotation.lead) {
          throw new BadRequestException(
            'Quotation must be linked to a valid Customer before conversion.',
          );
        }
        const existingCustomer = await tx.customer.findFirst({
          where: {
            companyId:
              quotation.companyId || quotation.lead.companyId || undefined,
            deletedAt: null,
            OR: [
              ...(quotation.lead.email
                ? [{ email: quotation.lead.email }]
                : []),
              ...(quotation.lead.phone
                ? [{ phone: quotation.lead.phone }]
                : []),
              {
                companyName: {
                  equals: quotation.lead.companyName,
                  mode: 'insensitive' as const,
                },
              },
            ],
          },
        });
        if (existingCustomer) {
          customerId = existingCustomer.id;
        } else {
          const companyId = quotation.companyId || quotation.lead.companyId;
          if (!companyId)
            throw new BadRequestException(
              'Lead company is required for customer creation.',
            );
          const customerCode = await this.sequenceService.generateNextWithTx(
            tx,
            'customer_number',
            'CUST-',
          );
          const customer = await tx.customer.create({
            data: {
              customerCode,
              companyId,
              companyName: quotation.lead.companyName,
              contactPerson: quotation.lead.contactPerson,
              email: quotation.lead.email,
              phone: quotation.lead.phone,
              gstin: quotation.lead.gstNumber,
              billingAddress: quotation.lead.address || undefined,
              status: 'ACTIVE',
              createdById: userId,
            },
          });
          customerId = customer.id;
        }
        await tx.lead.update({
          where: { id: quotation.lead.id },
          data: {
            customerId,
            convertedCustomerId: customerId,
            convertedAt: new Date(),
            convertedById: userId,
          },
        });
        await tx.quotation.update({ where: { id }, data: { customerId } });
      }

      const soInitialState = await tx.workflowState.findFirst({
        where: { workflow: { code: 'SALES_ORDER' }, isInitial: true },
      });

      const count = await tx.salesOrder.count();
      const orderNumber = await this.sequenceService.generateNextWithTx(
        tx,
        'sales_order_number',
        `SO-${new Date().getFullYear()}-`,
      );
      const products = await tx.product.findMany({
        where: { id: { in: quotation.items.map((item) => item.productId) } },
        select: { id: true, name: true, sku: true, unit: true },
      });
      const productById = new Map(
        products.map((product) => [product.id, product]),
      );

      const qtnAny = quotation as any;
      const freightCost = Number(
        qtnAny.expectedTransportationCost ??
        qtnAny.transportCharge ??
        qtnAny.freightAmount ??
        0
      );

      // Snapshot exactly from quotation items
      const salesOrder = await tx.salesOrder.create({
        data: {
          orderNumber,
          customerId,
          quotationId: id,
          sourceQuotationId: id,
          workflowStateId: soInitialState?.id,
          createdById: userId,
          subtotal: quotation.subtotal,
          discountAmount: quotation.discount,
          taxAmount: quotation.tax,
          taxableAmount:
            Number(quotation.subtotal) - Number(quotation.discount),
          freightAmount: freightCost,
          totalAmount: quotation.total,
          items: {
            create: quotation.items.map((item) => ({
              productId: item.productId,
              productNameSnapshot:
                productById.get(item.productId)?.name ||
                item.description ||
                'Unknown Product',
              productCodeSnapshot: productById.get(item.productId)?.sku,
              orderedQuantity: item.quantity,
              unit: productById.get(item.productId)?.unit || 'NOS',
              unitPrice: item.unitPrice,
              discountAmount: item.discount,
              taxableAmount: Number(item.lineTotal) - Number(item.tax),
              taxRate: 0,
              taxAmount: item.tax,
              lineTotal: item.lineTotal,
            })),
          },
        },
      });

      const convertedState = await tx.workflowState.findFirst({
        where: { workflow: { code: 'QUOTATION' }, code: 'CONVERTED_TO_SO' },
      });

      if (convertedState) {
        await tx.workflowHistory.create({
          data: {
            entityId: id,
            entityType: 'QUOTATION',
            fromStatus: quotation.workflowState?.name || 'Unknown',
            toStatus: convertedState.name,
            action: 'CONVERT',
            remarks: `Converted to Sales Order ${orderNumber}`,
            userId: userId,
          },
        });
        await tx.quotation.update({
          where: { id },
          data: { workflowStateId: convertedState.id },
        });
      }

      return salesOrder;
    });
  }
}
