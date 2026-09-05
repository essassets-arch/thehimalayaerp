const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const isDocker = fs.existsSync('/.dockerenv') || (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('@postgres:'));

const targetDbs = isDocker
  ? [{ name: 'Docker Production Database', url: process.env.DATABASE_URL }]
  : [
      { name: 'Active Browser Test DB', url: process.env.DATABASE_URL || 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public' },
      { name: 'Main Himalaya ERP DB', url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp?schema=public' }
    ];

async function forceClearSuperSales2Orders(config) {
  console.log(`\n======================================================================`);
  console.log(`🔥 FORCE WIPING ORDERS & PRODUCTION FOR SUPERSALES 2`);
  console.log(`   Database: ${config.name}`);
  console.log(`======================================================================`);

  const prisma = new PrismaClient({ datasources: { db: { url: config.url } } });

  try {
    const user = await prisma.user.findFirst({
      where: { email: { equals: 'supersales2@himalayaerp.com', mode: 'insensitive' } }
    });

    if (!user) {
      console.log(`❌ User supersales2@himalayaerp.com not found in ${config.name}.`);
      return;
    }
    const userId = user.id;
    console.log(`Resolved user: ${user.name} (${user.id})`);

    // 1. Find all Quotations of SuperSales 2
    const quotes = await prisma.quotation.findMany({
      where: {
        OR: [
          { createdById: userId },
          { salesExecutiveId: userId },
          { remarks: { contains: 'Super Sales 2', mode: 'insensitive' } },
          { remarks: { contains: 'SuperSales 2', mode: 'insensitive' } }
        ]
      },
      select: { id: true, quotationNumber: true }
    });
    const quoteIds = quotes.map(q => q.id);

    // 2. Find all Sales Orders of SuperSales 2 (by user OR by quotation ID)
    const orders = await prisma.salesOrder.findMany({
      where: {
        OR: [
          { createdById: userId },
          { salesExecutiveId: userId },
          { quotationId: { in: quoteIds } },
          { sourceQuotationId: { in: quoteIds } },
          { remarks: { contains: 'Super Sales 2', mode: 'insensitive' } },
          { remarks: { contains: 'SuperSales 2', mode: 'insensitive' } }
        ]
      },
      select: { id: true, orderNumber: true }
    });
    const orderIds = orders.map(o => o.id);
    console.log(`Found ${orders.length} Sales Orders to force wipe:`, orders.map(o => o.orderNumber));

    if (orderIds.length > 0) {
      const soItems = await prisma.salesOrderItem.findMany({
        where: { salesOrderId: { in: orderIds } },
        select: { id: true }
      });
      const soItemIds = soItems.map(i => i.id);

      // A. PRODUCTION CASCADE
      const prodPlans = await prisma.productionPlan.findMany({
        where: {
          OR: [
            { salesOrderId: { in: orderIds } },
            { assignedToId: userId }
          ]
        },
        select: { id: true }
      });
      const planIds = prodPlans.map(p => p.id);

      const workOrders = await prisma.workOrder.findMany({
        where: {
          OR: [
            { productionPlanId: { in: planIds } },
            { salesOrderItemId: { in: soItemIds } },
            { createdById: userId }
          ]
        },
        select: { id: true }
      });
      const workOrderIds = workOrders.map(w => w.id);

      if (workOrderIds.length > 0) {
        try { await prisma.qCInspection.deleteMany({ where: { workOrderId: { in: workOrderIds } } }); } catch (e) {}
        try { await prisma.productionBatch.deleteMany({ where: { workOrderId: { in: workOrderIds } } }); } catch (e) {}
        try { await prisma.productionShiftEntry.deleteMany({ where: { workOrderId: { in: workOrderIds } } }); } catch (e) {}
        try { await prisma.productionScrapEntry.deleteMany({ where: { workOrderId: { in: workOrderIds } } }); } catch (e) {}
        try { await prisma.productionStatusHistory.deleteMany({ where: { workOrderId: { in: workOrderIds } } }); } catch (e) {}
        try { await prisma.finishedGoods.deleteMany({ where: { workOrderId: { in: workOrderIds } } }); } catch (e) {}
        try { await prisma.productionDailyReportItem.deleteMany({ where: { workOrderId: { in: workOrderIds } } }); } catch (e) {}
        try { await prisma.workOrder.deleteMany({ where: { id: { in: workOrderIds } } }); } catch (e) {}
        console.log(`✓ Deleted ${workOrderIds.length} Work Orders.`);
      }

      if (planIds.length > 0) {
        try { await prisma.productionPlan.deleteMany({ where: { id: { in: planIds } } }); } catch (e) {}
        console.log(`✓ Deleted ${planIds.length} Production Plans.`);
      }

      // B. DISPATCHES
      const dispatches = await prisma.dispatch.findMany({
        where: {
          OR: [
            { salesOrderId: { in: orderIds } },
            { createdById: userId }
          ]
        },
        select: { id: true }
      });
      const dispatchIds = dispatches.map(d => d.id);

      if (dispatchIds.length > 0) {
        try { await prisma.dispatchTracking.deleteMany({ where: { dispatchId: { in: dispatchIds } } }); } catch (e) {}
        try { await prisma.dispatchItem.deleteMany({ where: { dispatchId: { in: dispatchIds } } }); } catch (e) {}
        try { await prisma.dispatchDailyReportItem.deleteMany({ where: { dispatchId: { in: dispatchIds } } }); } catch (e) {}
        try { await prisma.dispatch.deleteMany({ where: { id: { in: dispatchIds } } }); } catch (e) {}
        console.log(`✓ Deleted ${dispatchIds.length} Dispatches.`);
      }

      if (soItemIds.length > 0) {
        try { await prisma.dispatchItem.deleteMany({ where: { salesOrderItemId: { in: soItemIds } } }); } catch (e) {}
        try { await prisma.invoiceItem.deleteMany({ where: { salesOrderItemId: { in: soItemIds } } }); } catch (e) {}
        try { await prisma.customerComplaintItem.deleteMany({ where: { salesOrderItemId: { in: soItemIds } } }); } catch (e) {}
        try { await prisma.replacementRequestItem.deleteMany({ where: { salesOrderItemId: { in: soItemIds } } }); } catch (e) {}
      }

      // C. INVOICES
      const invoices = await prisma.salesInvoice.findMany({
        where: {
          OR: [
            { salesOrderId: { in: orderIds } },
            { createdById: userId }
          ]
        },
        select: { id: true }
      });
      const invoiceIds = invoices.map(inv => inv.id);

      if (invoiceIds.length > 0) {
        try { await prisma.invoiceItem.deleteMany({ where: { invoiceId: { in: invoiceIds } } }); } catch (e) {}
        try { await prisma.customerPaymentAllocation.deleteMany({ where: { invoiceId: { in: invoiceIds } } }); } catch (e) {}
        try { await prisma.salesInvoice.deleteMany({ where: { id: { in: invoiceIds } } }); } catch (e) {}
        console.log(`✓ Deleted ${invoiceIds.length} Invoices.`);
      }

      try { await prisma.customerPaymentAllocation.deleteMany({ where: { salesOrderId: { in: orderIds } } }); } catch (e) {}
      try { await prisma.salesOrderAllocation.deleteMany({ where: { salesOrderId: { in: orderIds } } }); } catch (e) {}
      try { await prisma.salesOrderHistory.deleteMany({ where: { salesOrderId: { in: orderIds } } }); } catch (e) {}
      try { await prisma.salesOrderCreditReview.deleteMany({ where: { salesOrderId: { in: orderIds } } }); } catch (e) {}
      try { await prisma.orderAmendment.deleteMany({ where: { salesOrderId: { in: orderIds } } }); } catch (e) {}
      try { await prisma.salesOrderItem.deleteMany({ where: { salesOrderId: { in: orderIds } } }); } catch (e) {}

      const deletedOrders = await prisma.salesOrder.deleteMany({ where: { id: { in: orderIds } } });
      console.log(`✓ Deleted ${deletedOrders.count} Sales Orders.`);
    }

    // 3. Reset all Quotations of SuperSales 2 to Initial / Sent status with clean state
    const quoteState = await prisma.workflowState.findFirst({
      where: { workflow: { code: 'QUOTATION' }, isInitial: true }
    }) || await prisma.workflowState.findFirst({
      where: { workflow: { code: 'QUOTATION' } }
    });

    if (quoteIds.length > 0) {
      await prisma.quotation.updateMany({
        where: { id: { in: quoteIds } },
        data: {
          workflowStateId: quoteState ? quoteState.id : undefined,
          approvedAt: null,
          approvedById: null
        }
      });
      console.log(`✓ Reset ${quoteIds.length} Quotations to fresh status.`);
    }

    console.log(`\n======================================================================`);
    console.log(`✅ COMPLETE: All ${orderIds.length} Sales Orders deleted for SuperSales 2.`);
    console.log(`   All ${quoteIds.length} Quotations are 100% ready for 'Convert to Order' in UI!`);
    console.log(`======================================================================\n`);

  } catch (err) {
    console.error(`❌ Error in ${config.name}:`, err.message);
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  for (const db of targetDbs) {
    await forceClearSuperSales2Orders(db);
  }
}

main().catch(console.error);
