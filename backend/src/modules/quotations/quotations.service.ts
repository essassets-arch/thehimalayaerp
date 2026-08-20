import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { WorkflowService } from '../workflow/workflow.service';
import { SequenceService } from '../../common/sequence/sequence.service';
import { Decimal } from '@prisma/client/runtime/library';
import { getQuotationSalesScope, getLeadSalesScope, getSalesScope, canAssignSalesOwner } from '../../common/utils/rbac.util';

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
    const scope = getQuotationSalesScope(userId, role);
    const quotations = await this.prisma.quotation.findMany({
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
        salesExecutive: { select: { id: true, name: true, email: true } },
        lead: { include: { salesExecutive: { select: { id: true, name: true, email: true } } } },
        items: { include: { product: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const customerIds = quotations
      .map((q) => q.customerId)
      .filter((id): id is string => !!id);

    const customers = customerIds.length
      ? await this.prisma.customer.findMany({
          where: { id: { in: customerIds } },
        })
      : [];

    const customerMap = new Map(customers.map((c) => [c.id, c]));

    return quotations.map((q) => ({
      ...q,
      customer: q.customerId ? customerMap.get(q.customerId) || null : null,
    }));
  }

  async getQuotation(
    id: string,
    companyId?: string,
    userId?: string,
    role?: string,
  ) {
    const scope = getQuotationSalesScope(userId, role);
    const quotation = await this.prisma.quotation.findFirst({
      where: {
        id,
        ...scope,
        deletedAt: null,
        ...(companyId ? { companyId } : {}),
      },
      include: {
        workflowState: true,
        salesExecutive: { select: { id: true, name: true, email: true } },
        items: true,
        lead: { include: { salesExecutive: { select: { id: true, name: true, email: true } } } },
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
    let customer: any = null;
    if (quotation.customerId) {
      customer = await this.prisma.customer.findFirst({
        where: { id: quotation.customerId },
      });
    }
    return {
      ...quotation,
      customer,
    };
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

  private validateAndExtractPaymentTerms(
    dto: any,
    userRole?: string,
  ): { paymentTerms?: string; paymentTermDays?: number } {
    let days: number | undefined = undefined;
    if (
      dto.paymentTermDays !== undefined &&
      dto.paymentTermDays !== null &&
      dto.paymentTermDays !== ''
    ) {
      days = Number(dto.paymentTermDays);
    } else if (dto.paymentTerms) {
      const match = String(dto.paymentTerms).match(/^(\d+)\s*Days?$/i);
      if (match) {
        days = parseInt(match[1], 10);
      }
    }

    const normalizedRole = String(userRole || '')
      .toUpperCase()
      .replace(/[\s-]+/g, '_');
    const isSpecialRole = [
      'SUPER_SALES',
      'SUPER_ADMIN',
      'ADMIN',
    ].includes(normalizedRole);
    const maxPaymentTermDays = isSpecialRole ? 90 : 20;

    if (days !== undefined && !isNaN(days)) {
      if (days > maxPaymentTermDays) {
        throw new BadRequestException(
          `Payment terms cannot exceed ${maxPaymentTermDays} days.`,
        );
      }
      const paymentTerms = dto.paymentTerms || `${days} Days`;
      return { paymentTerms, paymentTermDays: days };
    } else if (dto.paymentTerms) {
      return { paymentTerms: String(dto.paymentTerms) };
    }

    return {};
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

    let leadSalesExecutiveId: string | null = null;
    if (dto.leadId) {
      const leadObj = await this.prisma.lead.findFirst({
        where: {
          id: dto.leadId,
          ...(resolvedCompanyId ? { companyId: resolvedCompanyId } : {}),
          ...getLeadSalesScope(userId, role),
        },
        select: { salesExecutiveId: true, assignedToId: true, createdById: true },
      });
      if (!leadObj) {
        throw new NotFoundException('Lead not found');
      }
      leadSalesExecutiveId = leadObj.salesExecutiveId || leadObj.assignedToId || leadObj.createdById;
    }

    const paymentTermInfo = this.validateAndExtractPaymentTerms(dto, role);
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
    const year = new Date().getFullYear();
    const yy = String(year).substring(2);
    const ny = String(year + 1).substring(2);
    const prefix = `HCCL/${yy}${ny}/`;
    const quotationNumber = await this.sequenceService.generateNext(
      'quotation_number',
      prefix,
      4,
    );

    const isManager = canAssignSalesOwner(role);
    const resolvedSalesExecutiveId = isManager
      ? (dto.salesExecutiveId || leadSalesExecutiveId || userId)
      : (leadSalesExecutiveId || userId);

    const quotation = await this.prisma.quotation.create({
      data: {
        quotationNumber,
        companyId: resolvedCompanyId,
        leadId: dto.leadId,
        customerId: dto.customerId,
        salesExecutiveId: resolvedSalesExecutiveId,
        validUntil: dto.validUntil ? new Date(dto.validUntil) : null,
        subtotal: totals.subtotal,
        discount: totals.discount,
        tax: totals.tax,
        total: totals.total,
        expectedTransportationCost: Number(dto.expectedTransportationCost ?? dto.transportCharge ?? 0),
        remarks: dto.remarks,
        paymentTerms: paymentTermInfo.paymentTerms,
        paymentTermDays: paymentTermInfo.paymentTermDays,
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
        salesExecutive: { select: { id: true, name: true, email: true } },
        items: { include: { product: true } },
        lead: true,
      },
    });

    if (dto.leadId) {
      const quotationState = await this.prisma.workflowState.findFirst({
        where: { workflow: { code: 'LEAD' }, code: 'QUOTATION_SENT' },
      });
      if (quotationState) {
        await this.prisma.lead.update({
          where: { id: dto.leadId },
          data: { workflowStateId: quotationState.id },
        }).catch(() => {});
      }
    }

    return quotation;
  }

  async updateQuotation(
    id: string,
    dto: any,
    userId: string,
    companyId?: string,
    role?: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const scope = getSalesScope(userId, role, 'Quotation');
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
      const lockedStates = ['APPROVED', 'QUOTATION_APPROVED', 'CONVERTED', 'CONVERTED_TO_SO', 'REJECTED', 'QUOTATION_REJECTED', 'CANCELLED', 'SUPERSEDED'];
      if (lockedStates.includes(quotation.workflowState?.code || '')) {
        throw new BadRequestException(
          `Quotations in state "${quotation.workflowState?.code || 'unknown'}" are locked and cannot be edited`,
        );
      }
      const paymentTermInfo = this.validateAndExtractPaymentTerms(dto, role);

      const resolvedItems = dto.items
        ? await Promise.all(
            (dto.items || []).map(async (item: any) => {
              let product = await tx.product.findFirst({
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
                product = await tx.product.findFirst({
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
          )
        : null;

      const totals = resolvedItems ? this.calculate(resolvedItems) : null;
      if (dto.items && !totals?.processedItems.length)
        throw new BadRequestException(
          'At least one quotation item is required',
        );
      if (dto.items)
        await tx.quotationItem.deleteMany({ where: { quotationId: id } });
      // 1. If leadId is present or updated, update the associated Lead's name, group, GST details
      const targetLeadId = dto.leadId !== undefined ? dto.leadId : quotation.leadId;
      if (targetLeadId) {
        await tx.lead.update({
          where: { id: targetLeadId },
          data: {
            companyName: dto.customerName !== undefined ? dto.customerName : undefined,
            groupName: dto.groupName !== undefined ? dto.groupName : undefined,
            gstName: dto.gstName !== undefined ? dto.gstName : undefined,
            gstNumber: dto.gstNumber !== undefined ? dto.gstNumber : undefined,
          },
        });
      }

      // 2. If customerId is present or updated, update the associated Customer's name and GST
      const targetCustomerId = dto.customerId !== undefined ? dto.customerId : quotation.customerId;
      if (targetCustomerId) {
        await tx.customer.update({
          where: { id: targetCustomerId },
          data: {
            companyName: dto.customerName !== undefined ? dto.customerName : undefined,
            gstin: dto.gstNumber !== undefined ? dto.gstNumber : undefined,
          },
        });
      }

      return tx.quotation.update({
        where: { id },
        data: {
          leadId: dto.leadId !== undefined ? dto.leadId : undefined,
          customerId: dto.customerId !== undefined ? dto.customerId : undefined,
          validUntil: dto.validUntil ? new Date(dto.validUntil) : undefined,
          remarks: dto.remarks,
          paymentTerms: paymentTermInfo.paymentTerms !== undefined ? paymentTermInfo.paymentTerms : undefined,
          paymentTermDays: paymentTermInfo.paymentTermDays !== undefined ? paymentTermInfo.paymentTermDays : undefined,
          updatedById: userId,
          expectedTransportationCost: dto.expectedTransportationCost !== undefined || dto.transportCharge !== undefined ? Number(dto.expectedTransportationCost ?? dto.transportCharge ?? 0) : undefined,
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
      const scope = getSalesScope(userId, role, 'Quotation');
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

      const scope = getSalesScope(userId, role, 'Quotation');
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
        const cleanGstin = quotation.lead.gstNumber?.trim()
          ? quotation.lead.gstNumber.trim()
          : null;
        const companyId = quotation.companyId || quotation.lead.companyId || undefined;
        const duplicateConditions: any[] = [];
        if (quotation.lead.email) duplicateConditions.push({ email: quotation.lead.email });
        if (quotation.lead.phone) duplicateConditions.push({ phone: quotation.lead.phone });
        if (cleanGstin) duplicateConditions.push({ gstin: cleanGstin });
        if (quotation.lead.companyName) {
          duplicateConditions.push({
            companyName: {
              equals: quotation.lead.companyName,
              mode: 'insensitive' as const,
            },
          });
        }

        const existingCustomer = await tx.customer.findFirst({
          where: {
            companyId,
            deletedAt: null,
            OR: duplicateConditions.length > 0 ? duplicateConditions : undefined,
          },
        });
        if (existingCustomer) {
          customerId = existingCustomer.id;
        } else {
          if (!companyId)
            throw new BadRequestException(
              'Lead company is required for customer creation.',
            );
          const customerCode = await this.sequenceService.generateNextWithTx(
            tx,
            'customer_number',
            'CUST-',
          );
          try {
            const customer = await tx.customer.create({
              data: {
                customerCode,
                companyId,
                companyName: quotation.lead.companyName,
                contactPerson: quotation.lead.contactPerson,
                email: quotation.lead.email,
                phone: quotation.lead.phone,
                gstin: cleanGstin,
                billingAddress: quotation.lead.address || undefined,
                status: 'ACTIVE',
                createdById: userId,
              },
            });
            customerId = customer.id;
          } catch (err: any) {
            if (err.code === 'P2002') {
              const fallbackCustomer = await tx.customer.findFirst({
                where: {
                  companyId,
                  deletedAt: null,
                  OR: [
                    ...(cleanGstin ? [{ gstin: cleanGstin }] : []),
                    { customerCode },
                    {
                      companyName: {
                        equals: quotation.lead.companyName,
                        mode: 'insensitive' as const,
                      },
                    },
                  ],
                },
              });
              if (fallbackCustomer) {
                customerId = fallbackCustomer.id;
              } else {
                throw err;
              }
            } else {
              throw err;
            }
          }
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
      const year = new Date().getFullYear();
      const yy = String(year).substring(2);
      const ny = String(year + 1).substring(2);
      const prefix = `HCCL/${yy}${ny}/`;
      const orderNumber = await this.sequenceService.generateNextWithTx(
        tx,
        'sales_order_number',
        prefix,
        4,
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
          salesExecutiveId: quotation.salesExecutiveId || quotation.createdById || quotation.lead?.salesExecutiveId || quotation.lead?.createdById || userId,
          workflowStateId: soInitialState?.id,
          createdById: userId,
          paymentTermsDays: quotation.paymentTermDays || (quotation.paymentTerms ? parseInt(String(quotation.paymentTerms).match(/\d+/)?.[0] || '0', 10) : undefined) || undefined,
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
