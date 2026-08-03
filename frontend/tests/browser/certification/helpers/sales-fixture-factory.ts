import { Prisma, PrismaClient, SalesOrderStatus, SampleStatus, CustomerStatus, LeadSource, InvoiceStatus } from '@prisma/client';

export interface SalesTestContext {
  companyId: string;
  salesExecutiveUserId: string;
  salesExecutiveEmployeeId: string;
  plantHeadUserId: string;
}

export async function createSalesTestContext(prisma: PrismaClient): Promise<SalesTestContext> {
  const company = await prisma.company.findFirst({
    where: { name: { contains: 'Browser Test Company' } }
  });
  if (!company) throw new Error('Browser Test Company not found');

  const salesExec = await prisma.user.findUnique({
    where: { email: 'sales.executive.browser@himalayaerp.test' },
    include: { employee: true }
  });
  if (!salesExec) throw new Error('Sales Exec not found');

  const plantHead = await prisma.user.findUnique({
    where: { email: 'plant.head.browser@himalayaerp.test' }
  });
  if (!plantHead) throw new Error('Plant Head not found');

  return {
    companyId: company.id,
    salesExecutiveUserId: salesExec.id,
    salesExecutiveEmployeeId: salesExec.employee?.id || '',
    plantHeadUserId: plantHead.id
  };
}

export async function createCustomerFixture(prisma: PrismaClient, context: SalesTestContext, suffix: string) {
  return await prisma.customer.create({
    data: {
      customerCode: `CUST-${suffix}`,
      companyId: context.companyId,
      companyName: `Test Customer ${suffix}`,
      status: CustomerStatus.ACTIVE,
      creditStatus: 'GOOD',
      email: `customer${suffix}@example.com`,
      phone: `9876543${suffix.slice(-3)}`,
      version: 1,
    }
  });
}

export async function createProductLinkedLeadFixture(prisma: PrismaClient, context: SalesTestContext, suffix: string) {
  const product = await prisma.product.findFirst({
    where: { companyId: context.companyId, isActive: true }
  });
  if (!product) throw new Error('No active product found for lead fixture');

  const customer = await createCustomerFixture(prisma, context, suffix);

  const lead = await prisma.lead.create({
    data: {
      leadNumber: `LD-${suffix}`,
      companyName: `Lead Company ${suffix}`,
      groupName: `Group ${suffix}`,
      gstNumber: '27AAAAA0000A1Z5',
      contactPerson: `Lead Contact ${suffix}`,
      createdById: context.salesExecutiveUserId,
      assignedToId: context.salesExecutiveUserId,
      companyId: context.companyId,
      customerId: customer.id,
      source: LeadSource.OTHER,
      productInterest: product.name,
      estimatedQuantity: new Prisma.Decimal(100),
      unit: product.unit,
      version: 1
    }
  });

  return { lead, product, customer };
}

export async function createPendingSampleFixture(prisma: PrismaClient, context: SalesTestContext, suffix: string) {
  const { lead, product, customer } = await createProductLinkedLeadFixture(prisma, context, suffix);
  
  const sample = await prisma.sampleRequest.create({
    data: {
      sampleNumber: `SMP-${suffix}`,
      companyId: context.companyId,
      leadId: lead.id,
      customerId: customer.id,
      status: SampleStatus.CREATED,
      requestedDate: new Date(),
    }
  });

  return { sample, lead, product, customer };
}

export async function createDeliveredSampleFixture(prisma: PrismaClient, context: SalesTestContext, suffix: string) {
  const fixture = await createPendingSampleFixture(prisma, context, suffix);
  
  const sample = await prisma.sampleRequest.update({
    where: { id: fixture.sample.id },
    data: {
      status: SampleStatus.DELIVERED,
      dispatchDate: new Date(),
      deliveredAt: new Date(),
    }
  });

  return { ...fixture, sample };
}

export async function createDraftQuotationFixture(prisma: PrismaClient, context: SalesTestContext, suffix: string) {
  const { lead, product, customer } = await createProductLinkedLeadFixture(prisma, context, suffix);

  const quotation = await prisma.quotation.create({
    data: {
      quotationNumber: `QT-${suffix}`,
      companyId: context.companyId,
      leadId: lead.id,
      customerId: customer.id,
      createdById: context.salesExecutiveUserId,
      subtotal: new Prisma.Decimal(product.unitPrice).mul(100),
      discount: new Prisma.Decimal(0),
      tax: new Prisma.Decimal(0),
      total: new Prisma.Decimal(product.unitPrice).mul(100),
      version: 1,
      items: {
        create: {
          productId: product.id,
          quantity: new Prisma.Decimal(100),
          unitPrice: product.unitPrice,
          discount: new Prisma.Decimal(0),
          tax: new Prisma.Decimal(0),
          lineTotal: new Prisma.Decimal(product.unitPrice).mul(100)
        }
      }
    }
  });

  return { quotation, lead, product, customer };
}

export async function createAcceptedQuotationFixture(prisma: PrismaClient, context: SalesTestContext, suffix: string) {
  const fixture = await createDraftQuotationFixture(prisma, context, suffix);
  
  // Update state to accepted if there's a specific workflow state, 
  // but for basic Prisma schema it seems status/workflowState might be needed.
  // Actually Quotation relies on workflowStateId. For tests, just mark approvedById
  const quotation = await prisma.quotation.update({
    where: { id: fixture.quotation.id },
    data: {
      approvedById: context.salesExecutiveUserId,
      approvedAt: new Date()
    }
  });

  return { ...fixture, quotation };
}

export async function createQuotationReadyForConversionFixture(prisma: PrismaClient, context: SalesTestContext, suffix: string) {
  return createAcceptedQuotationFixture(prisma, context, suffix);
}

export async function createSalesOrderReadyForPlantHeadFixture(prisma: PrismaClient, context: SalesTestContext, suffix: string) {
  const { quotation, product, customer } = await createQuotationReadyForConversionFixture(prisma, context, suffix);

  const salesOrder = await prisma.salesOrder.create({
    data: {
      orderNumber: `SO-${suffix}`,
      customerId: customer.id,
      quotationId: quotation.id,
      createdById: context.salesExecutiveUserId,
      orderDate: new Date(),
      subtotal: quotation.subtotal,
      discountAmount: quotation.discount,
      taxableAmount: quotation.subtotal,
      taxAmount: quotation.tax,
      freightAmount: new Prisma.Decimal(0),
      totalAmount: quotation.total,
      currency: 'INR',
      status: SalesOrderStatus.CONFIRMED, // Status ready for plant head handoff
      version: 1,
      items: {
        create: {
          productId: product.id,
          productNameSnapshot: product.name,
          orderedQuantity: new Prisma.Decimal(100),
          unit: product.unit,
          unitPrice: product.unitPrice,
          discountAmount: new Prisma.Decimal(0),
          taxableAmount: quotation.subtotal,
          taxRate: new Prisma.Decimal(0),
          taxAmount: new Prisma.Decimal(0),
          lineTotal: quotation.subtotal
        }
      }
    }
  });

  return { salesOrder, quotation, product, customer };
}

export async function cleanupSalesFixture(prisma: PrismaClient, suffix: string) {
  // We identify our fixtures by suffix
  await prisma.salesOrder.deleteMany({ where: { orderNumber: { endsWith: suffix } } });
  await prisma.quotation.deleteMany({ where: { quotationNumber: { endsWith: suffix } } });
  await prisma.sampleRequest.deleteMany({ where: { sampleNumber: { endsWith: suffix } } });
  await prisma.lead.deleteMany({ where: { leadNumber: { endsWith: suffix } } });
  await prisma.customer.deleteMany({ where: { customerCode: { endsWith: suffix } } });
}
