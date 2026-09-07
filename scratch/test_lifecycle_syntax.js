const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ datasources: { db: { url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public' } } });

(async () => {
  const user = await prisma.user.findFirst({ where: { email: 'supersales1@himalayaerp.com' } });
  const company = await prisma.company.findFirst();
  const customer = await prisma.customer.findFirst({ where: { companyId: company.id } });
  const prod = await prisma.product.findFirst();

  console.log({ user: user.id, company: company.id, customer: customer.id, prod: prod.id });

  const lead = await prisma.lead.create({
    data: {
      leadNumber: 'TEST-LEAD-0001',
      companyName: 'Test Co',
      contactPerson: 'Tester',
      source: 'OTHER',
      unit: 'PCS',
      customerId: customer.id,
      salesExecutive: { connect: { id: user.id } },
      createdById: user.id,
      assignedToId: user.id,
      Company: { connect: { id: company.id } }
    }
  });
  console.log('Lead created:', lead.id);

  const quote = await prisma.quotation.create({
    data: {
      quotationNumber: 'TEST-QU-0001',
      lead: { connect: { id: lead.id } },
      customerId: customer.id,
      salesExecutive: { connect: { id: user.id } },
      createdById: user.id,
      companyId: company.id,
      subtotal: 1000,
      tax: 180,
      discount: 0,
      total: 1180
    }
  });
  console.log('Quote created:', quote.id);

  const quoteItem = await prisma.quotationItem.create({
    data: {
      quotation: { connect: { id: quote.id } },
      product: { connect: { id: prod.id } },
      quantity: 1,
      unitPrice: 1000,
      tax: 180,
      discount: 0,
      lineTotal: 1180,
      description: 'Test prod'
    }
  });
  console.log('QuoteItem created:', quoteItem.id);

  const so = await prisma.salesOrder.create({
    data: {
      orderNumber: 'TEST-SO-0001',
      sourceQuotation: { connect: { id: quote.id } },
      customer: { connect: { id: customer.id } },
      status: 'CONFIRMED',
      salesExecutive: { connect: { id: user.id } },
      createdById: user.id,
      subtotal: 1000,
      taxableAmount: 1000,
      taxAmount: 180,
      discountAmount: 0,
      totalAmount: 1180
    }
  });
  console.log('SalesOrder created:', so.id);

  const soi = await prisma.salesOrderItem.create({
    data: {
      salesOrder: { connect: { id: so.id } },
      product: { connect: { id: prod.id } },
      productNameSnapshot: prod.name,
      productCodeSnapshot: prod.sku,
      orderedQuantity: 1,
      unit: 'NOS',
      unitPrice: 1000,
      discountAmount: 0,
      taxableAmount: 1000,
      taxRate: 18,
      taxAmount: 180,
      lineTotal: 1180
    }
  });
  console.log('SalesOrderItem created:', soi.id);

  const pp = await prisma.productionPlan.create({
    data: {
      planNumber: 'TEST-PP-0001',
      salesOrder: { connect: { id: so.id } },
      status: 'COMPLETED',
      priority: 'NORMAL'
    }
  });
  console.log('ProductionPlan created:', pp.id);

  const wo = await prisma.workOrder.create({
    data: {
      workOrderNumber: 'TEST-WO-0001',
      productionPlan: { connect: { id: pp.id } },
      salesOrderItem: { connect: { id: soi.id } },
      quantity: 1,
      status: 'COMPLETED',
      productionStatus: 'READY_FOR_DISPATCH',
      qcResult: 'PASS'
    }
  });
  console.log('WorkOrder created:', wo.id);

  const qc = await prisma.qCInspection.create({
    data: {
      workOrder: { connect: { id: wo.id } },
      status: 'PASSED',
      approvedQuantity: 1,
      rejectedQuantity: 0,
      remarks: 'QC Passed'
    }
  });
  console.log('QCInspection created:', qc.id);

  const batch = await prisma.productionBatch.create({
    data: {
      batchNumber: 'TEST-BATCH-0001',
      workOrder: { connect: { id: wo.id } },
      quantity: 1
    }
  });
  console.log('ProductionBatch created:', batch.id);

  const fg = await prisma.finishedGoods.create({
    data: {
      workOrder: { connect: { id: wo.id } },
      salesOrder: { connect: { id: so.id } },
      product: { connect: { id: prod.id } },
      quantity: 1,
      availableQuantity: 1,
      reservedQuantity: 0,
      unit: 'NOS',
      status: 'READY_FOR_DISPATCH'
    }
  });
  console.log('FinishedGoods created:', fg.id);

  // Clean up test data
  await prisma.finishedGoods.delete({ where: { id: fg.id } });
  await prisma.qCInspection.delete({ where: { id: qc.id } });
  await prisma.productionBatch.delete({ where: { id: batch.id } });
  await prisma.workOrder.delete({ where: { id: wo.id } });
  await prisma.productionPlan.delete({ where: { id: pp.id } });
  await prisma.salesOrderItem.delete({ where: { id: soi.id } });
  await prisma.salesOrder.delete({ where: { id: so.id } });
  await prisma.quotationItem.delete({ where: { id: quoteItem.id } });
  await prisma.quotation.delete({ where: { id: quote.id } });
  await prisma.lead.delete({ where: { id: lead.id } });
  console.log('Cleaned up test records!');

  await prisma.$disconnect();
})();
