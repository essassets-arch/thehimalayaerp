const { PrismaClient } = require('@prisma/client');

async function wipeSuperSales1FromDb(config) {
  console.log(`\n======================================================================`);
  console.log(` 🗑️  COMPREHENSIVE WIPE OF SUPERSALES 1 DATA FROM: ${config.name}`);
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
    // 1. Find supersales1 user
    const user = await prisma.user.findFirst({
      where: {
        email: { equals: 'supersales1@himalayaerp.com', mode: 'insensitive' }
      }
    });

    if (!user) {
      console.log(`❌ User supersales1@himalayaerp.com not found in ${config.name}.`);
      return;
    }
    const userId = user.id;
    console.log(`Resolved User: ${user.name} (${user.email}, ID: ${userId})`);

    // Helper to get columns for a table
    async function getColumns(tableName) {
      try {
        const cols = await prisma.$queryRawUnsafe(`
          SELECT column_name FROM information_schema.columns 
          WHERE table_name = '${tableName}' AND table_schema = 'public'
        `);
        return new Set(cols.map(c => c.column_name));
      } catch (e) {
        return new Set();
      }
    }

    const leadCols = await getColumns('Lead');
    const quoteCols = await getColumns('Quotation');
    const orderCols = await getColumns('SalesOrder');

    // 2. Identify all Leads related to SuperSales 1
    let leadWhereClauses = [];
    if (leadCols.has('createdById')) leadWhereClauses.push(`"createdById" = '${userId}'`);
    if (leadCols.has('salesExecutiveId')) leadWhereClauses.push(`"salesExecutiveId" = '${userId}'`);
    if (leadCols.has('assignedToId')) leadWhereClauses.push(`"assignedToId" = '${userId}'`);
    if (leadCols.has('salespersonId')) leadWhereClauses.push(`"salespersonId" = '${userId}'`);
    if (leadCols.has('remarks')) {
      leadWhereClauses.push(`"remarks" ILIKE '%Super Sales 1%'`);
      leadWhereClauses.push(`"remarks" ILIKE '%SuperSales 1%'`);
      leadWhereClauses.push(`"remarks" ILIKE '%Hussain%'`);
    }

    let leadIds = [];
    if (leadWhereClauses.length > 0) {
      const leads = await prisma.$queryRawUnsafe(`SELECT id FROM "Lead" WHERE ${leadWhereClauses.join(' OR ')}`);
      leadIds = leads.map(l => l.id);
    }
    const leadIdListStr = leadIds.length > 0 ? leadIds.map(id => `'${id}'`).join(',') : `''`;
    console.log(`Found ${leadIds.length} leads to wipe.`);

    // 3. Identify all Quotations related to SuperSales 1
    let quoteWhereClauses = [];
    if (quoteCols.has('createdById')) quoteWhereClauses.push(`"createdById" = '${userId}'`);
    if (quoteCols.has('salesExecutiveId')) quoteWhereClauses.push(`"salesExecutiveId" = '${userId}'`);
    if (quoteCols.has('leadId') && leadIds.length > 0) quoteWhereClauses.push(`("leadId" IS NOT NULL AND "leadId" IN (${leadIdListStr}))`);
    if (quoteCols.has('remarks')) {
      quoteWhereClauses.push(`"remarks" ILIKE '%Super Sales 1%'`);
      quoteWhereClauses.push(`"remarks" ILIKE '%SuperSales 1%'`);
    }

    let quoteIds = [];
    if (quoteWhereClauses.length > 0) {
      const quotations = await prisma.$queryRawUnsafe(`SELECT id FROM "Quotation" WHERE ${quoteWhereClauses.join(' OR ')}`);
      quoteIds = quotations.map(q => q.id);
    }
    const quoteIdListStr = quoteIds.length > 0 ? quoteIds.map(id => `'${id}'`).join(',') : `''`;
    console.log(`Found ${quoteIds.length} quotations to wipe.`);

    // 4. Identify all Sales Orders related to SuperSales 1
    let orderWhereClauses = [];
    if (orderCols.has('createdById')) orderWhereClauses.push(`"createdById" = '${userId}'`);
    if (orderCols.has('salesExecutiveId')) orderWhereClauses.push(`"salesExecutiveId" = '${userId}'`);
    if (orderCols.has('quotationId') && quoteIds.length > 0) orderWhereClauses.push(`("quotationId" IS NOT NULL AND "quotationId" IN (${quoteIdListStr}))`);
    if (orderCols.has('sourceQuotationId') && quoteIds.length > 0) orderWhereClauses.push(`("sourceQuotationId" IS NOT NULL AND "sourceQuotationId" IN (${quoteIdListStr}))`);

    let orderIds = [];
    if (orderWhereClauses.length > 0) {
      const salesOrders = await prisma.$queryRawUnsafe(`SELECT id FROM "SalesOrder" WHERE ${orderWhereClauses.join(' OR ')}`);
      orderIds = salesOrders.map(o => o.id);
    }
    const orderIdListStr = orderIds.length > 0 ? orderIds.map(id => `'${id}'`).join(',') : `''`;
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

    // 8. Identify Customers created by SuperSales 1
    let custIds = [];
    try {
      const customers = await prisma.customer.findMany({
        where: { createdById: userId },
        select: { id: true }
      });
      custIds = customers.map(c => c.id);
    } catch (_) {}

    console.log(`Cascade dependencies: WorkOrders=${woIds.length}, ProductionPlans=${planIds.length}, Dispatches=${dispIds.length}, CustomersCreated=${custIds.length}`);

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
      } catch (e) {
        console.warn('  ⚠️ WorkOrder delete:', e.message);
      }
    }

    // --- STEP B: DELETE PRODUCTION PLANS ---
    if (planIds.length > 0) {
      try {
        await prisma.$executeRawUnsafe(`DELETE FROM "ProductionPlanItem" WHERE "productionPlanId" IN ('${planIds.join("','")}')`);
      } catch (_) {}
      try {
        const delPp = await prisma.productionPlan.deleteMany({ where: { id: { in: planIds } } });
        console.log(`  ✓ Deleted ${delPp.count} production plans.`);
      } catch (e) {
        console.warn('  ⚠️ ProductionPlan delete:', e.message);
      }
    }

    // --- STEP C: DELETE DISPATCHES & INVOICES ---
    if (dispIds.length > 0 || orderIds.length > 0) {
      const dispIdList = dispIds.length > 0 ? dispIds.map(id => `'${id}'`).join(',') : `''`;
      
      // 1. Delete InvoiceItems first
      try {
        if (dispIds.length > 0) {
          await prisma.$executeRawUnsafe(`DELETE FROM "InvoiceItem" WHERE "invoiceId" IN (SELECT id FROM "SalesInvoice" WHERE "dispatchId" IN (${dispIdList}))`);
        }
        if (orderIds.length > 0) {
          await prisma.$executeRawUnsafe(`DELETE FROM "InvoiceItem" WHERE "invoiceId" IN (SELECT id FROM "SalesInvoice" WHERE "salesOrderId" IN (${orderIdListStr}))`);
        }
      } catch (e) {
        console.warn('  ⚠️ InvoiceItem delete:', e.message);
      }

      // 2. Delete SalesInvoices
      try {
        if (dispIds.length > 0) {
          await prisma.$executeRawUnsafe(`DELETE FROM "SalesInvoice" WHERE "dispatchId" IN (${dispIdList})`);
        }
        if (orderIds.length > 0) {
          await prisma.$executeRawUnsafe(`DELETE FROM "SalesInvoice" WHERE "salesOrderId" IN (${orderIdListStr})`);
        }
        console.log(`  ✓ Deleted sales invoices.`);
      } catch (e) {
        console.warn('  ⚠️ SalesInvoice delete:', e.message);
      }

      // 3. Delete DispatchItems
      try {
        if (dispIds.length > 0) {
          await prisma.$executeRawUnsafe(`DELETE FROM "DispatchItem" WHERE "dispatchId" IN (${dispIdList})`);
        }
        if (orderIds.length > 0) {
          await prisma.$executeRawUnsafe(`DELETE FROM "DispatchItem" WHERE "salesOrderItemId" IN (SELECT id FROM "SalesOrderItem" WHERE "salesOrderId" IN (${orderIdListStr}))`);
        }
      } catch (e) {
        console.warn('  ⚠️ DispatchItem delete:', e.message);
      }

      // 4. Delete Dispatches
      try {
        if (dispIds.length > 0) {
          const delDisp = await prisma.dispatch.deleteMany({ where: { id: { in: dispIds } } });
          console.log(`  ✓ Deleted ${delDisp.count} dispatches.`);
        }
        if (orderIds.length > 0) {
          await prisma.$executeRawUnsafe(`DELETE FROM "Dispatch" WHERE "salesOrderId" IN (${orderIdListStr})`);
        }
      } catch (e) {
        console.warn('  ⚠️ Dispatch delete:', e.message);
      }
    }

    // --- STEP D: DELETE ALL SALES ORDER CHILD TABLES ---
    if (orderIds.length > 0) {
      const safeDelSo = async (table, col = 'salesOrderId') => {
        try {
          await prisma.$executeRawUnsafe(`DELETE FROM "${table}" WHERE "${col}" IN ('${orderIds.join("','")}')`);
        } catch (_) {}
      };

      await safeDelSo('CustomerComplaintItem', 'orderId');
      await safeDelSo('CustomerComplaint', 'orderId');
      await safeDelSo('CustomerPaymentAllocation');
      await safeDelSo('CustomerPayment');
      await safeDelSo('Payment');
      await safeDelSo('OrderAmendment');
      await safeDelSo('ReplacementRequestItem', 'orderId');
      await safeDelSo('ReplacementOrder', 'originalSalesOrderId');
      await safeDelSo('ReplacementRequest');
      await safeDelSo('SalesOrderAllocation');
      await safeDelSo('SalesOrderCreditReview');
      await safeDelSo('SalesOrderHistory');
      await safeDelSo('SalesReturnItem', 'salesOrderId');
      await safeDelSo('SalesReturn');
      await safeDelSo('FinishedGoods');
      await safeDelSo('SalesOrderItem');
      await safeDelSo('SalesOrderLoss');

      try {
        const delSo = await prisma.salesOrder.deleteMany({ where: { id: { in: orderIds } } });
        console.log(`  ✓ Deleted ${delSo.count} sales orders.`);
      } catch (e) {
        console.warn('  ⚠️ SalesOrder delete:', e.message);
      }
    }

    // --- STEP E: DELETE QUOTATIONS & ITEMS ---
    if (quoteIds.length > 0) {
      try {
        await prisma.quotationItem.deleteMany({ where: { quotationId: { in: quoteIds } } });
      } catch (_) {}
      try {
        await prisma.quotationTerm.deleteMany({ where: { quotationId: { in: quoteIds } } });
      } catch (_) {}
      try {
        await prisma.$executeRawUnsafe(`DELETE FROM "QuotationRevision" WHERE "quotationId" IN ('${quoteIds.join("','")}')`);
      } catch (_) {}
      try {
        const delQ = await prisma.quotation.deleteMany({ where: { id: { in: quoteIds } } });
        console.log(`  ✓ Deleted ${delQ.count} quotations.`);
      } catch (e) {
        console.warn('  ⚠️ Quotation delete:', e.message);
      }
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
        await prisma.$executeRawUnsafe(`DELETE FROM "SampleHistory" WHERE "sampleRequestId" IN (SELECT id FROM "SampleRequest" WHERE "leadId" IN ('${leadIds.join("','")}'))`);
        await prisma.$executeRawUnsafe(`DELETE FROM "SampleItem" WHERE "sampleRequestId" IN (SELECT id FROM "SampleRequest" WHERE "leadId" IN ('${leadIds.join("','")}'))`);
        await prisma.sampleRequest.deleteMany({ where: { leadId: { in: leadIds } } });
      } catch (_) {}
      try {
        await prisma.reminder.deleteMany({ where: { leadId: { in: leadIds } } });
      } catch (_) {}

      try {
        const delL = await prisma.lead.deleteMany({ where: { id: { in: leadIds } } });
        console.log(`  ✓ Deleted ${delL.count} leads.`);
      } catch (e) {
        console.warn('  ⚠️ Lead delete:', e.message);
      }
    }

    // --- STEP G: DELETE CUSTOMERS CREATED BY SUPERSALES 1 ---
    if (custIds.length > 0) {
      try {
        for (const cid of custIds) {
          // Check if any other order/quote/lead is still using this customer
          const otherOrders = await prisma.salesOrder.count({ where: { customerId: cid } });
          const otherQuotes = await prisma.quotation.count({ where: { customerId: cid } });
          const otherLeads = await prisma.lead.count({ where: { customerId: cid } });
          if (otherOrders === 0 && otherQuotes === 0 && otherLeads === 0) {
            await prisma.customer.delete({ where: { id: cid } });
          }
        }
        console.log(`  ✓ Cleaned up customers created by SuperSales 1.`);
      } catch (e) {
        console.warn('  ⚠️ Customer cleanup:', e.message);
      }
    }

    // --- STEP H: DELETE USER-LEVEL REMAINING DATA ---
    try {
      await prisma.sampleRequest.deleteMany({ where: { createdById: userId } });
      await prisma.reminder.deleteMany({ where: { userId: userId } });
      await prisma.notification.deleteMany({ where: { userId: userId } });
      await prisma.customerComplaint.deleteMany({ where: { createdBy: userId } });
      await prisma.salesTarget.deleteMany({ where: { salespersonId: userId } });
      await prisma.deviceSession.deleteMany({ where: { userId: userId } });
      await prisma.refreshSession.deleteMany({ where: { userId: userId } });
    } catch (_) {}

    console.log(`\n🎉 [${config.name}] ALL SUPERSALES 1 DATA AND ITS COMPLETE PIPELINE HAVE BEEN PERMANENTLY REMOVED!`);
  } catch (err) {
    console.error(`❌ Error wiping ${config.name}:`, err.message);
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  const isDocker = require('fs').existsSync('/.dockerenv') || (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('@postgres:'));
  const targetDbs = [];

  if (process.env.DATABASE_URL) {
    targetDbs.push({ name: 'Configured DATABASE_URL', url: process.env.DATABASE_URL });
  }
  if (process.env.LIVE_DATABASE_URL) {
    targetDbs.push({ name: 'Live Database', url: process.env.LIVE_DATABASE_URL });
  }
  if (process.env.PROD_DATABASE_URL) {
    targetDbs.push({ name: 'Production Database', url: process.env.PROD_DATABASE_URL });
  }

  if (!isDocker) {
    targetDbs.push(
      { name: 'Active DB (himalaya_erp_browser_test)', url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public' },
      { name: 'Local Main DB (himalaya_erp)', url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp?schema=public' },
      { name: 'Local Dev DB (himalaya_erp_dev)', url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_dev?schema=public' },
      { name: 'Local Test DB (himalaya_erp_test)', url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_test?schema=public' },
      { name: 'Docker Postgres 5433', url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5433/himalaya_erp?schema=public' },
      { name: 'Docker Postgres 5435', url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public' }
    );
  }

  const seen = new Set();
  const uniqueDbs = targetDbs.filter(db => {
    if (seen.has(db.url)) return false;
    seen.add(db.url);
    return true;
  });

  for (const db of uniqueDbs) {
    await wipeSuperSales1FromDb(db);
  }
}

main().catch(console.error);
