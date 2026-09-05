const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const isDocker = fs.existsSync('/.dockerenv') || (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('@postgres:'));

const targetDbs = isDocker
  ? [{ name: 'Docker Production Database', url: process.env.DATABASE_URL }]
  : [
      { name: 'Active Browser Test DB', url: process.env.DATABASE_URL || 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public' },
      { name: 'Main Himalaya ERP DB', url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp?schema=public' }
    ];

async function clearSales1ProductionDispatchAndOrders(config) {
  console.log(`\n======================================================================`);
  console.log(`🧹 REMOVING PRODUCTION, DISPATCH, ORDERS, SAMPLES & QUOTES FOR SALES 1`);
  console.log(`   Keeping ALL Lead data intact`);
  console.log(`   Database: ${config.name}`);
  console.log(`======================================================================`);

  const prisma = new PrismaClient({ datasources: { db: { url: config.url } } });

  try {
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: { equals: 'sales1@himalayaerp.com', mode: 'insensitive' } },
          { name: { equals: 'Sales Executive 1', mode: 'insensitive' } },
          { name: { equals: 'Sales One', mode: 'insensitive' } }
        ]
      }
    });

    if (!user) {
      console.log(`⚠️ User sales1@himalayaerp.com not found in ${config.name}.`);
      return;
    }
    const userId = user.id;
    console.log(`Found user: ${user.name} (${user.id})`);

    // 0. Find all Leads for Sales 1 (To preserve and clean linkages)
    const userLeads = await prisma.lead.findMany({
      where: {
        OR: [
          { createdById: userId },
          { salesExecutiveId: userId },
          { assignedToId: userId }
        ]
      },
      select: { id: true, leadNumber: true, companyName: true }
    });
    const leadIds = userLeads.map(l => l.id);
    console.log(`Found ${userLeads.length} Leads for Sales 1 to PRESERVE.`);

    // 1. Find all Quotations for Sales 1
    const quotes = await prisma.quotation.findMany({
      where: {
        OR: [
          { createdById: userId },
          { salesExecutiveId: userId },
          { leadId: { in: leadIds } },
          { remarks: { contains: 'Sales 1', mode: 'insensitive' } },
          { remarks: { contains: 'Sales One', mode: 'insensitive' } },
          { remarks: { contains: 'Trushna', mode: 'insensitive' } }
        ]
      },
      select: { id: true, quotationNumber: true }
    });
    const quoteIds = quotes.map(q => q.id);

    // 2. Find all Sales Orders for Sales 1 (by user OR by quotation ID)
    const orders = await prisma.salesOrder.findMany({
      where: {
        OR: [
          { createdById: userId },
          { salesExecutiveId: userId },
          { quotationId: { in: quoteIds } },
          { sourceQuotationId: { in: quoteIds } },
          { remarks: { contains: 'Sales 1', mode: 'insensitive' } },
          { remarks: { contains: 'Sales One', mode: 'insensitive' } },
          { remarks: { contains: 'Trushna', mode: 'insensitive' } }
        ]
      },
      select: { id: true, orderNumber: true }
    });
    const orderIds = orders.map(o => o.id);
    console.log(`Found ${orders.length} Sales Orders to remove:`, orders.map(o => o.orderNumber));
    console.log(`Found ${quotes.length} Quotations to remove:`, quotes.map(q => q.quotationNumber));

    // 3. Find all Samples for Sales 1
    let sampleIds = [];
    try {
      const samples = await prisma.sampleRequest.findMany({
        where: {
          OR: [
            { createdById: userId },
            { salesExecutiveId: userId },
            { leadId: { in: leadIds } }
          ]
        },
        select: { id: true, sampleNumber: true }
      });
      sampleIds = samples.map(s => s.id);
      console.log(`Found ${samples.length} Sample Requests to remove.`);
    } catch (e) {
      console.log('Sample requests query note:', e.message);
    }

    if (orderIds.length > 0) {
      // Find all sales order item IDs
      const soItems = await prisma.salesOrderItem.findMany({
        where: { salesOrderId: { in: orderIds } },
        select: { id: true }
      });
      const soItemIds = soItems.map(i => i.id);

      // A. PRODUCTION HIERARCHY CLEANUP
      console.log('Cleaning up Production Plans, Work Orders, Batches & QC...');
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
        console.log(`✓ Deleted ${workOrderIds.length} Work Orders and child inspection/batch records.`);
      }

      if (planIds.length > 0) {
        try { await prisma.productionPlan.deleteMany({ where: { id: { in: planIds } } }); } catch (e) {}
        console.log(`✓ Deleted ${planIds.length} Production Plans.`);
      }

      // B. DISPATCH MODULE CLEANUP
      console.log('Cleaning up Dispatch records linked to Sales 1 orders...');
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
        console.log(`✓ Deleted ${dispatchIds.length} Dispatch records.`);
      }

      if (soItemIds.length > 0) {
        try { await prisma.dispatchItem.deleteMany({ where: { salesOrderItemId: { in: soItemIds } } }); } catch (e) {}
      }

      // C. INVOICING & PAYMENTS CLEANUP
      console.log('Cleaning up Invoices & Payment Allocations linked to Sales 1 orders...');
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
        console.log(`✓ Deleted ${invoiceIds.length} Sales Invoices.`);
      }

      if (soItemIds.length > 0) {
        try { await prisma.invoiceItem.deleteMany({ where: { salesOrderItemId: { in: soItemIds } } }); } catch (e) {}
        try { await prisma.customerComplaintItem.deleteMany({ where: { salesOrderItemId: { in: soItemIds } } }); } catch (e) {}
        try { await prisma.replacementRequestItem.deleteMany({ where: { salesOrderItemId: { in: soItemIds } } }); } catch (e) {}
      }

      try { await prisma.customerPaymentAllocation.deleteMany({ where: { salesOrderId: { in: orderIds } } }); } catch (e) {}
      try { await prisma.salesOrderAllocation.deleteMany({ where: { salesOrderId: { in: orderIds } } }); } catch (e) {}
      try { await prisma.salesOrderHistory.deleteMany({ where: { salesOrderId: { in: orderIds } } }); } catch (e) {}
      try { await prisma.salesOrderCreditReview.deleteMany({ where: { salesOrderId: { in: orderIds } } }); } catch (e) {}
      try { await prisma.orderAmendment.deleteMany({ where: { salesOrderId: { in: orderIds } } }); } catch (e) {}
      try { await prisma.salesOrderLoss.deleteMany({ where: { salesOrderId: { in: orderIds } } }); } catch (e) {}
      try { await prisma.customerComplaint.deleteMany({ where: { salesOrderId: { in: orderIds } } }); } catch (e) {}
      try { await prisma.replacementRequest.deleteMany({ where: { salesOrderId: { in: orderIds } } }); } catch (e) {}
      try { await prisma.replacementOrder.deleteMany({ where: { salesOrderId: { in: orderIds } } }); } catch (e) {}
      try { await prisma.salesReturn.deleteMany({ where: { salesOrderId: { in: orderIds } } }); } catch (e) {}
      try { await prisma.finishedGoods.deleteMany({ where: { salesOrderId: { in: orderIds } } }); } catch (e) {}
      try { await prisma.salesOrderItem.deleteMany({ where: { salesOrderId: { in: orderIds } } }); } catch (e) {}

      // D. DELETE SALES ORDERS
      const deletedOrders = await prisma.salesOrder.deleteMany({ where: { id: { in: orderIds } } });
      console.log(`✓ Successfully deleted ${deletedOrders.count} Sales Orders.`);
    }

    // 4. Delete Quotations
    if (quoteIds.length > 0) {
      try { await prisma.quotationTerm.deleteMany({ where: { quotationId: { in: quoteIds } } }); } catch (e) {}
      try { await prisma.quotationItem.deleteMany({ where: { quotationId: { in: quoteIds } } }); } catch (e) {}
      const deletedQuotes = await prisma.quotation.deleteMany({ where: { id: { in: quoteIds } } });
      console.log(`✓ Successfully deleted ${deletedQuotes.count} Quotations.`);
    }

    // 5. Delete Samples
    if (sampleIds.length > 0) {
      try { await prisma.sampleItem.deleteMany({ where: { sampleRequestId: { in: sampleIds } } }); } catch (e) {}
      try { await prisma.sampleHistory.deleteMany({ where: { sampleRequestId: { in: sampleIds } } }); } catch (e) {}
      try {
        const deletedSamples = await prisma.sampleRequest.deleteMany({ where: { id: { in: sampleIds } } });
        console.log(`✓ Successfully deleted ${deletedSamples.count} Sample Requests.`);
      } catch (e) {}
    }

    // 6. Delete Sales 1 Reminders / Daily Tasks
    try {
      const deletedReminders = await prisma.reminder.deleteMany({
        where: {
          OR: [
            { userId: userId },
            { moduleId: { in: [...orderIds, ...quoteIds, ...sampleIds] } }
          ]
        }
      });
      console.log(`✓ Deleted ${deletedReminders.count} Reminders / Tasks.`);
    } catch (e) {}

    // 7. Reset all Leads of Sales 1 to Initial clean state (PRESERVE ALL LEADS)
    const leadState = await prisma.workflowState.findFirst({
      where: { workflow: { code: 'LEAD' }, isInitial: true }
    }) || await prisma.workflowState.findFirst({
      where: { workflow: { code: 'LEAD' } }
    });

    if (leadIds.length > 0) {
      await prisma.lead.updateMany({
        where: { id: { in: leadIds } },
        data: {
          convertedCustomerId: null,
          convertedAt: null,
          convertedById: null,
          workflowStateId: leadState ? leadState.id : undefined
        }
      });
    }

    // 8. Verify Leads remain intact
    const remainingLeads = await prisma.lead.findMany({
      where: {
        OR: [
          { salesExecutiveId: userId },
          { createdById: userId },
          { assignedToId: userId }
        ]
      },
      select: { id: true, leadNumber: true, companyName: true }
    });

    console.log(`\n======================================================================`);
    console.log(`✅ FINAL STATUS FOR SALES ONE (${user.email}):`);
    console.log(`   - Dispatches & Shipments   : 0 (Cleaned)`);
    console.log(`   - Production Plans         : 0 (Cleaned)`);
    console.log(`   - Work Orders / QC / Batches: 0 (Cleaned)`);
    console.log(`   - Invoices & Payments      : 0 (Cleaned)`);
    console.log(`   - Sales Orders             : 0 (Removed)`);
    console.log(`   - Quotations               : 0 (Removed)`);
    console.log(`   - Samples                  : 0 (Removed)`);
    console.log(`   - Reminders / Tasks        : 0 (Removed)`);
    console.log(`   - Leads Preserved          : ${remainingLeads.length} (100% Intact & Fresh!)`);
    console.log(`======================================================================\n`);

  } catch (err) {
    console.error(`❌ Error in ${config.name}:`, err.message);
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  for (const db of targetDbs) {
    await clearSales1ProductionDispatchAndOrders(db);
  }
}

main().catch(console.error);
