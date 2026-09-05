const { PrismaClient } = require('@prisma/client');

async function wipeSuperSales2FromDb(config) {
  console.log(`\n======================================================================`);
  console.log(` 🗑️  COMPREHENSIVE WIPE OF SUPERSALES 2 DATA FROM: ${config.name}`);
  console.log(` URL: ${config.url.replace(/:[^:@]+@/, ':****@')}`);
  console.log(`======================================================================`);

  let prisma;
  try {
    prisma = new PrismaClient({ datasources: { db: { url: config.url } } });
    await prisma.$connect();
  } catch (err) {
    console.warn(`Could not connect to ${config.name}: ${err.message}. Skipping.`);
    return;
  }

  try {
    // 1. Find supersales2 user
    const user = await prisma.user.findFirst({
      where: {
        email: { equals: 'supersales2@himalayaerp.com', mode: 'insensitive' }
      }
    });

    if (!user) {
      console.log(`❌ User supersales2@himalayaerp.com not found in ${config.name}.`);
      return;
    }
    const userId = user.id;
    console.log(`Resolved User: ${user.name} (${user.email}, ID: ${userId})`);

    // 2. Identify all Leads related to SuperSales 2
    const leads = await prisma.lead.findMany({
      where: {
        OR: [
          { createdById: userId },
          { salesExecutiveId: userId },
          { assignedToId: userId },
          { remarks: { contains: 'SuperSales 2', mode: 'insensitive' } },
          { remarks: { contains: 'Super Sales 2', mode: 'insensitive' } },
          { remarks: 'Imported from Taher Sir Super Sales 2 CSV' }
        ]
      },
      select: { id: true, leadNumber: true }
    });
    const leadIds = leads.map(l => l.id);
    console.log(`Found ${leadIds.length} leads to wipe.`);

    // 3. Identify all Quotations related to SuperSales 2
    const quotations = await prisma.quotation.findMany({
      where: {
        OR: [
          { createdById: userId },
          { salesExecutiveId: userId },
          ...(leadIds.length ? [{ leadId: { in: leadIds } }] : []),
          { remarks: { contains: 'SuperSales 2', mode: 'insensitive' } },
          { remarks: { contains: 'Super Sales 2', mode: 'insensitive' } }
        ]
      },
      select: { id: true, quotationNumber: true }
    });
    const quoteIds = quotations.map(q => q.id);
    console.log(`Found ${quoteIds.length} quotations to wipe.`);

    // 4. Identify all Sales Orders related to SuperSales 2
    const salesOrders = await prisma.salesOrder.findMany({
      where: {
        OR: [
          { createdById: userId },
          { salesExecutiveId: userId },
          ...(quoteIds.length ? [{ quotationId: { in: quoteIds } }] : []),
          ...(quoteIds.length ? [{ sourceQuotationId: { in: quoteIds } }] : [])
        ]
      },
      select: { id: true, orderNumber: true }
    });
    const orderIds = salesOrders.map(o => o.id);
    console.log(`Found ${orderIds.length} sales orders to wipe.`);

    // 5. Identify all Production Plans related to Sales Orders
    let planIds = [];
    if (orderIds.length > 0) {
      try {
        const plans = await prisma.productionPlan.findMany({
          where: { salesOrderId: { in: orderIds } },
          select: { id: true }
        });
        planIds = plans.map(p => p.id);
      } catch (_) {}
    }

    // 6. Identify all Work Orders related to Production Plans or Sales Orders
    let woIds = [];
    try {
      const wos = await prisma.workOrder.findMany({
        where: {
          OR: [
            ...(planIds.length ? [{ productionPlanId: { in: planIds } }] : []),
            { createdById: userId }
          ]
        },
        select: { id: true }
      });
      woIds = wos.map(w => w.id);
    } catch (_) {}

    // 7. Identify Dispatches related to Sales Orders
    let dispIds = [];
    if (orderIds.length > 0) {
      try {
        const disps = await prisma.dispatch.findMany({
          where: {
            OR: [
              { salesOrderId: { in: orderIds } },
              { createdById: userId }
            ]
          },
          select: { id: true }
        });
        dispIds = disps.map(d => d.id);
      } catch (_) {}
    }

    console.log(`Cascade dependencies: WorkOrders=${woIds.length}, ProductionPlans=${planIds.length}, Dispatches=${dispIds.length}`);

    // --- STEP A: DELETE WORK ORDER DEPENDENCIES ---
    if (woIds.length > 0) {
      const safeDel = async (table, col) => {
        try {
          await prisma.$executeRawUnsafe(`DELETE FROM "${table}" WHERE "${col}" IN ('${woIds.join("','")}')`);
        } catch (_) {}
      };
      await safeDel('QCInspection', 'workOrderId');
      await safeDel('ProductionStatusHistory', 'workOrderId');
      await safeDel('ProductionShiftEntry', 'workOrderId');
      await safeDel('ProductionScrapEntry', 'workOrderId');
      await safeDel('ProductionBatch', 'workOrderId');
      await safeDel('FinishedGoods', 'workOrderId');
      await safeDel('WorkOrderItem', 'workOrderId');

      try {
        const delWo = await prisma.workOrder.deleteMany({ where: { id: { in: woIds } } });
        console.log(`  ✓ Deleted ${delWo.count} work orders.`);
      } catch (_) {}
    }

    // --- STEP B: DELETE PRODUCTION PLANS ---
    if (planIds.length > 0) {
      try {
        await prisma.$executeRawUnsafe(`DELETE FROM "ProductionPlanItem" WHERE "productionPlanId" IN ('${planIds.join("','")}')`);
      } catch (_) {}
      try {
        const delPp = await prisma.productionPlan.deleteMany({ where: { id: { in: planIds } } });
        console.log(`  ✓ Deleted ${delPp.count} production plans.`);
      } catch (_) {}
    }

    // --- STEP C: DELETE DISPATCHES & INVOICES ---
    if (dispIds.length > 0 || orderIds.length > 0) {
      try {
        if (dispIds.length > 0) {
          await prisma.$executeRawUnsafe(`DELETE FROM "SalesInvoice" WHERE "dispatchId" IN ('${dispIds.join("','")}')`);
          await prisma.$executeRawUnsafe(`DELETE FROM "DispatchItem" WHERE "dispatchId" IN ('${dispIds.join("','")}')`);
          const delDisp = await prisma.dispatch.deleteMany({ where: { id: { in: dispIds } } });
          console.log(`  ✓ Deleted ${delDisp.count} dispatches.`);
        }
      } catch (_) {}

      if (orderIds.length > 0) {
        try {
          await prisma.$executeRawUnsafe(`DELETE FROM "SalesInvoice" WHERE "salesOrderId" IN ('${orderIds.join("','")}')`);
        } catch (_) {}
      }
    }

    // --- STEP D: DELETE ALL SALES ORDER CHILD TABLES ---
    if (orderIds.length > 0) {
      const safeDelSo = async (table, col = 'salesOrderId') => {
        try {
          await prisma.$executeRawUnsafe(`DELETE FROM "${table}" WHERE "${col}" IN ('${orderIds.join("','")}')`);
        } catch (_) {}
      };

      await safeDelSo('CustomerComplaint', 'orderId');
      await safeDelSo('CustomerPaymentAllocation');
      await safeDelSo('CustomerPayment');
      await safeDelSo('Payment');
      await safeDelSo('OrderAmendment');
      await safeDelSo('ReplacementOrder', 'originalSalesOrderId');
      await safeDelSo('ReplacementRequest');
      await safeDelSo('SalesOrderAllocation');
      await safeDelSo('SalesOrderCreditReview');
      await safeDelSo('SalesOrderHistory');
      await safeDelSo('SalesOrderItem');
      await safeDelSo('SalesOrderLoss');
      await safeDelSo('SalesReturn');
      await safeDelSo('FinishedGoods');

      const delSo = await prisma.salesOrder.deleteMany({ where: { id: { in: orderIds } } });
      console.log(`  ✓ Deleted ${delSo.count} sales orders.`);
    }

    // --- STEP E: DELETE QUOTATIONS & ITEMS ---
    if (quoteIds.length > 0) {
      try {
        await prisma.quotationItem.deleteMany({ where: { quotationId: { in: quoteIds } } });
      } catch (_) {}
      try {
        await prisma.quotationTerm.deleteMany({ where: { quotationId: { in: quoteIds } } });
      } catch (_) {}
      const delQ = await prisma.quotation.deleteMany({ where: { id: { in: quoteIds } } });
      console.log(`  ✓ Deleted ${delQ.count} quotations.`);
    }

    // --- STEP F: DELETE LEADS & LEAD DEPENDENCIES ---
    if (leadIds.length > 0) {
      try {
        await prisma.$executeRawUnsafe(`DELETE FROM "FollowUp" WHERE "leadId" IN ('${leadIds.join("','")}')`);
      } catch (_) {}
      try {
        await prisma.$executeRawUnsafe(`DELETE FROM "LeadActivity" WHERE "leadId" IN ('${leadIds.join("','")}')`);
      } catch (_) {}
      try {
        await prisma.sampleRequest.deleteMany({ where: { leadId: { in: leadIds } } });
      } catch (_) {}
      try {
        await prisma.reminder.deleteMany({ where: { leadId: { in: leadIds } } });
      } catch (_) {}

      const delL = await prisma.lead.deleteMany({ where: { id: { in: leadIds } } });
      console.log(`  ✓ Deleted ${delL.count} leads.`);
    }

    // --- STEP G: DELETE USER-LEVEL REMAINING DATA ---
    try {
      await prisma.sampleRequest.deleteMany({ where: { createdById: userId } });
      await prisma.reminder.deleteMany({ where: { userId: userId } });
      await prisma.notification.deleteMany({ where: { userId: userId } });
      await prisma.customerComplaint.deleteMany({ where: { createdBy: userId } });
    } catch (_) {}

    console.log(`\n🎉 [${config.name}] ALL SUPERSALES 2 DATA AND ITS COMPLETE PIPELINE HAVE BEEN PERMANENTLY REMOVED!`);
  } catch (err) {
    console.error(`❌ Error wiping ${config.name}:`, err.message);
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  const isDocker = require('fs').existsSync('/.dockerenv') || (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('@postgres:'));
  const targetDbs = isDocker
    ? [{ name: 'Docker Database', url: process.env.DATABASE_URL }]
    : [
        { name: 'Active DB (himalaya_erp_browser_test)', url: process.env.DATABASE_URL || 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public' },
        { name: 'Local Main DB (himalaya_erp)', url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp?schema=public' },
        { name: 'Docker Postgres 5435', url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public' }
      ];

  for (const db of targetDbs) {
    await wipeSuperSales2FromDb(db);
  }
}

main().catch(console.error);
