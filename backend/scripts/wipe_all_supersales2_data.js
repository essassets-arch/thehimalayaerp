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
    // 1. Find all supersales2 users
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { email: { equals: 'supersales2@himalayaerp.com', mode: 'insensitive' } },
          { email: { contains: 'supersales2', mode: 'insensitive' } },
          { name: { contains: 'SuperSales 2', mode: 'insensitive' } },
          { name: { contains: 'Super Sales 2', mode: 'insensitive' } },
          { name: { contains: 'SuperSales Executive', mode: 'insensitive' } },
          { name: { contains: 'Super Sales Executive', mode: 'insensitive' } },
          { name: { contains: 'Taher', mode: 'insensitive' } }
        ]
      }
    });

    if (users.length === 0) {
      console.log(`❌ User supersales2@himalayaerp.com not found in ${config.name}.`);
      return;
    }
    const allUserIds = users.map(u => u.id);
    const userIdListStr = allUserIds.map(id => `'${id}'`).join(',');
    console.log(`Resolved User(s): ${users.map(u => `${u.name} (${u.email}, ID: ${u.id})`).join(' | ')}`);

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

    // 2. Identify all Leads related to SuperSales 2
    let leadWhereClauses = [];
    if (leadCols.has('createdById')) leadWhereClauses.push(`"createdById" IN (${userIdListStr})`);
    if (leadCols.has('salesExecutiveId')) leadWhereClauses.push(`"salesExecutiveId" IN (${userIdListStr})`);
    if (leadCols.has('assignedToId')) leadWhereClauses.push(`"assignedToId" IN (${userIdListStr})`);
    if (leadCols.has('salespersonId')) leadWhereClauses.push(`"salespersonId" IN (${userIdListStr})`);
    if (leadCols.has('remarks')) {
      leadWhereClauses.push(`"remarks" ILIKE '%Super Sales 2%'`);
      leadWhereClauses.push(`"remarks" ILIKE '%SuperSales 2%'`);
      leadWhereClauses.push(`"remarks" ILIKE '%Taher%'`);
    }

    let leadIds = [];
    if (leadWhereClauses.length > 0) {
      const leads = await prisma.$queryRawUnsafe(`SELECT id FROM "Lead" WHERE ${leadWhereClauses.join(' OR ')}`);
      leadIds = leads.map(l => l.id);
    }
    const leadIdListStr = leadIds.length > 0 ? leadIds.map(id => `'${id}'`).join(',') : `''`;
    console.log(`Found ${leadIds.length} leads to wipe.`);

    // 3. Identify all Quotations related to SuperSales 2
    let quoteWhereClauses = [];
    if (quoteCols.has('createdById')) quoteWhereClauses.push(`"createdById" IN (${userIdListStr})`);
    if (quoteCols.has('salesExecutiveId')) quoteWhereClauses.push(`"salesExecutiveId" IN (${userIdListStr})`);
    if (quoteCols.has('leadId') && leadIds.length > 0) quoteWhereClauses.push(`("leadId" IS NOT NULL AND "leadId" IN (${leadIdListStr}))`);
    if (quoteCols.has('remarks')) {
      quoteWhereClauses.push(`"remarks" ILIKE '%Super Sales 2%'`);
      quoteWhereClauses.push(`"remarks" ILIKE '%SuperSales 2%'`);
      quoteWhereClauses.push(`"remarks" ILIKE '%Taher%'`);
    }

    let quoteIds = [];
    if (quoteWhereClauses.length > 0) {
      const quotations = await prisma.$queryRawUnsafe(`SELECT id FROM "Quotation" WHERE ${quoteWhereClauses.join(' OR ')}`);
      quoteIds = quotations.map(q => q.id);
    }
    const quoteIdListStr = quoteIds.length > 0 ? quoteIds.map(id => `'${id}'`).join(',') : `''`;
    console.log(`Found ${quoteIds.length} quotations to wipe.`);

    // 4. Identify all Sales Orders related to SuperSales 2
    let orderWhereClauses = [];
    if (orderCols.has('createdById')) orderWhereClauses.push(`"createdById" IN (${userIdListStr})`);
    if (orderCols.has('salesExecutiveId')) orderWhereClauses.push(`"salesExecutiveId" IN (${userIdListStr})`);
    if (orderCols.has('quotationId') && quoteIds.length > 0) orderWhereClauses.push(`("quotationId" IS NOT NULL AND "quotationId" IN (${quoteIdListStr}))`);
    if (orderCols.has('sourceQuotationId') && quoteIds.length > 0) orderWhereClauses.push(`("sourceQuotationId" IS NOT NULL AND "sourceQuotationId" IN (${quoteIdListStr}))`);
    if (orderCols.has('remarks')) {
      orderWhereClauses.push(`"remarks" ILIKE '%Super Sales 2%'`);
      orderWhereClauses.push(`"remarks" ILIKE '%SuperSales 2%'`);
      orderWhereClauses.push(`"remarks" ILIKE '%Taher%'`);
    }

    let orderIds = [];
    if (orderWhereClauses.length > 0) {
      const salesOrders = await prisma.$queryRawUnsafe(`SELECT id FROM "SalesOrder" WHERE ${orderWhereClauses.join(' OR ')}`);
      orderIds = salesOrders.map(o => o.id);
    }
    const orderIdListStr = orderIds.length > 0 ? orderIds.map(id => `'${id}'`).join(',') : `''`;
    console.log(`Found ${orderIds.length} sales orders to wipe.`);

    // 4b. Find SalesOrderItems
    let soItemIds = [];
    if (orderIds.length > 0) {
      try {
        const soItems = await prisma.salesOrderItem.findMany({
          where: { salesOrderId: { in: orderIds } },
          select: { id: true }
        });
        soItemIds = soItems.map(i => i.id);
      } catch (_) {}
    }

    // 5. Identify all Production Plans related to Sales Orders
    let planIds = [];
    if (orderIds.length > 0 || allUserIds.length > 0) {
      try {
        const plans = await prisma.productionPlan.findMany({
          where: {
            OR: [
              ...(orderIds.length ? [{ salesOrderId: { in: orderIds } }] : []),
              { assignedToId: { in: allUserIds } }
            ]
          },
          select: { id: true }
        });
        planIds = plans.map(p => p.id);
      } catch (_) {}
    }

    // 6. Identify all Work Orders related to Production Plans, Sales Order Items, or Sales Orders
    let woIds = [];
    try {
      const wos = await prisma.workOrder.findMany({
        where: {
          OR: [
            ...(planIds.length ? [{ productionPlanId: { in: planIds } }] : []),
            ...(soItemIds.length ? [{ salesOrderItemId: { in: soItemIds } }] : []),
            { createdById: { in: allUserIds } }
          ]
        },
        select: { id: true }
      });
      woIds = wos.map(w => w.id);
    } catch (_) {}

    // 7. Identify Dispatches related to Sales Orders
    let dispIds = [];
    if (orderIds.length > 0 || allUserIds.length > 0) {
      try {
        const disps = await prisma.dispatch.findMany({
          where: {
            OR: [
              ...(orderIds.length ? [{ salesOrderId: { in: orderIds } }] : []),
              { createdById: { in: allUserIds } }
            ]
          },
          select: { id: true }
        });
        dispIds = disps.map(d => d.id);
      } catch (_) {}
    }

    // 7b. Identify Invoices related to Sales Orders or Dispatches
    let invIds = [];
    if (orderIds.length > 0 || dispIds.length > 0 || allUserIds.length > 0) {
      try {
        const invoices = await prisma.salesInvoice.findMany({
          where: {
            OR: [
              ...(orderIds.length ? [{ salesOrderId: { in: orderIds } }] : []),
              ...(dispIds.length ? [{ dispatchId: { in: dispIds } }] : []),
              { createdById: { in: allUserIds } }
            ]
          },
          select: { id: true }
        });
        invIds = invoices.map(i => i.id);
      } catch (_) {}
    }

    // 8. Identify Customers created by SuperSales 2
    let custIds = [];
    try {
      const customers = await prisma.customer.findMany({
        where: { createdById: { in: allUserIds } },
        select: { id: true }
      });
      custIds = customers.map(c => c.id);
    } catch (_) {}

    console.log(`Cascade dependencies: WorkOrders=${woIds.length}, ProductionPlans=${planIds.length}, Dispatches=${dispIds.length}, Invoices=${invIds.length}, CustomersCreated=${custIds.length}`);

    // Helper for safe batch delete
    const safeDel = async (table, col, ids) => {
      if (!ids || ids.length === 0) return;
      try {
        await prisma.$executeRawUnsafe(`DELETE FROM "${table}" WHERE "${col}" IN ('${ids.join("','")}')`);
      } catch (_) {}
    };

    // --- STEP 0: APPROVALS & ATTACHMENTS ---
    const allEntityIds = [...leadIds, ...quoteIds, ...orderIds, ...planIds, ...woIds, ...dispIds, ...invIds];
    if (allEntityIds.length > 0) {
      try {
        await prisma.$executeRawUnsafe(`DELETE FROM "Approval" WHERE "entityId" IN ('${allEntityIds.join("','")}')`);
      } catch (_) {}
      try {
        await prisma.$executeRawUnsafe(`DELETE FROM "Attachment" WHERE "entityId" IN ('${allEntityIds.join("','")}')`);
      } catch (_) {}
    }

    // --- STEP A: DELETE WORK ORDER DEPENDENCIES ---
    if (woIds.length > 0) {
      await safeDel('QCInspection', 'workOrderId', woIds);
      await safeDel('ProductionStatusHistory', 'workOrderId', woIds);
      await safeDel('ProductionShiftEntry', 'workOrderId', woIds);
      await safeDel('ProductionScrapEntry', 'workOrderId', woIds);
      await safeDel('ProductionBatch', 'workOrderId', woIds);
      await safeDel('FinishedGoods', 'workOrderId', woIds);
      await safeDel('WorkOrderItem', 'workOrderId', woIds);

      try {
        const delWo = await prisma.workOrder.deleteMany({ where: { id: { in: woIds } } });
        console.log(`  ✓ Deleted ${delWo.count} work orders & QC records.`);
      } catch (e) {
        console.warn('  ⚠️ WorkOrder delete:', e.message);
      }
    }

    // --- STEP B: DELETE PRODUCTION PLANS ---
    if (planIds.length > 0) {
      await safeDel('ProductionPlanItem', 'productionPlanId', planIds);
      try {
        const delPp = await prisma.productionPlan.deleteMany({ where: { id: { in: planIds } } });
        console.log(`  ✓ Deleted ${delPp.count} production plans.`);
      } catch (e) {
        console.warn('  ⚠️ ProductionPlan delete:', e.message);
      }
    }

    // --- STEP C: DELETE INVOICES & DISPATCHES ---
    if (invIds.length > 0) {
      await safeDel('PaymentAllocation', 'invoiceId', invIds);
      await safeDel('InvoiceItem', 'invoiceId', invIds);
      try {
        const delInv = await prisma.salesInvoice.deleteMany({ where: { id: { in: invIds } } });
        console.log(`  ✓ Deleted ${delInv.count} sales invoices.`);
      } catch (e) {
        console.warn('  ⚠️ SalesInvoice delete:', e.message);
      }
    }

    if (dispIds.length > 0) {
      await safeDel('DispatchItem', 'dispatchId', dispIds);
      try {
        const delDisp = await prisma.dispatch.deleteMany({ where: { id: { in: dispIds } } });
        console.log(`  ✓ Deleted ${delDisp.count} dispatches.`);
      } catch (e) {
        console.warn('  ⚠️ Dispatch delete:', e.message);
      }
    }

    if (orderIds.length > 0) {
      await safeDel('DispatchItem', 'salesOrderItemId', soItemIds);
      await safeDel('Dispatch', 'salesOrderId', orderIds);
      await safeDel('SalesInvoice', 'salesOrderId', orderIds);
    }

    // --- STEP D: DELETE ALL SALES ORDER CHILD TABLES ---
    if (orderIds.length > 0) {
      // 1. Returns & Replacements & Complaints
      let salesReturnIds = [];
      try {
        const sr = await prisma.salesReturn.findMany({ where: { salesOrderId: { in: orderIds } }, select: { id: true } });
        salesReturnIds = sr.map(r => r.id);
      } catch (_) {}

      if (salesReturnIds.length > 0) {
        await safeDel('ReturnGateEntry', 'salesReturnId', salesReturnIds);
        await safeDel('CreditNote', 'salesReturnId', salesReturnIds);
        try {
          const retQcs = await prisma.returnQcInspection.findMany({ where: { salesReturnId: { in: salesReturnIds } }, select: { id: true } });
          const retQcIds = retQcs.map(q => q.id);
          if (retQcIds.length > 0) {
            await safeDel('ReturnQcInspectionItem', 'returnQcInspectionId', retQcIds);
            await safeDel('ReturnQcInspection', 'id', retQcIds);
          }
        } catch (_) {}
        await safeDel('SalesReturnItem', 'salesReturnId', salesReturnIds);
        await safeDel('SalesReturn', 'id', salesReturnIds);
      }

      let repReqIds = [];
      try {
        const rr = await prisma.replacementRequest.findMany({ where: { salesOrderId: { in: orderIds } }, select: { id: true } });
        repReqIds = rr.map(r => r.id);
      } catch (_) {}

      if (repReqIds.length > 0) {
        let repOrderIds = [];
        try {
          const ro = await prisma.replacementOrder.findMany({ where: { replacementRequestId: { in: repReqIds } }, select: { id: true } });
          repOrderIds = ro.map(o => o.id);
        } catch (_) {}
        if (repOrderIds.length > 0) {
          await safeDel('ReplacementOrderHistory', 'replacementOrderId', repOrderIds);
          await safeDel('ReplacementOrderItem', 'replacementOrderId', repOrderIds);
          await safeDel('ReplacementOrder', 'id', repOrderIds);
        }
        await safeDel('ReplacementRequestItem', 'replacementRequestId', repReqIds);
        await safeDel('ReplacementRequest', 'id', repReqIds);
      }

      let complaintIds = [];
      try {
        const cc = await prisma.customerComplaint.findMany({ where: { orderId: { in: orderIds } }, select: { id: true } });
        complaintIds = cc.map(c => c.id);
      } catch (_) {}

      if (complaintIds.length > 0) {
        await safeDel('CustomerComplaintItem', 'complaintId', complaintIds);
        await safeDel('CustomerComplaint', 'id', complaintIds);
      }

      await safeDel('CustomerComplaintItem', 'orderId', orderIds);
      await safeDel('CustomerComplaint', 'orderId', orderIds);
      await safeDel('CustomerPaymentAllocation', 'salesOrderId', orderIds);
      await safeDel('CustomerPayment', 'salesOrderId', orderIds);
      await safeDel('Payment', 'salesOrderId', orderIds);
      await safeDel('OrderAmendment', 'salesOrderId', orderIds);
      await safeDel('SalesOrderAllocation', 'salesOrderId', orderIds);
      await safeDel('SalesOrderCreditReview', 'salesOrderId', orderIds);
      await safeDel('SalesOrderHistory', 'salesOrderId', orderIds);
      await safeDel('FinishedGoods', 'salesOrderId', orderIds);
      await safeDel('SalesOrderItem', 'salesOrderId', orderIds);
      await safeDel('SalesOrderLoss', 'salesOrderId', orderIds);

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
      await safeDel('QuotationRevision', 'quotationId', quoteIds);
      try {
        const delQ = await prisma.quotation.deleteMany({ where: { id: { in: quoteIds } } });
        console.log(`  ✓ Deleted ${delQ.count} quotations.`);
      } catch (e) {
        console.warn('  ⚠️ Quotation delete:', e.message);
      }
    }

    // --- STEP F: DELETE LEADS & LEAD DEPENDENCIES ---
    if (leadIds.length > 0) {
      await safeDel('FollowUp', 'leadId', leadIds);
      await safeDel('LeadActivity', 'leadId', leadIds);
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

    // --- STEP G: DELETE CUSTOMERS CREATED BY SUPERSALES 2 ---
    if (custIds.length > 0) {
      try {
        for (const cid of custIds) {
          const otherOrders = await prisma.salesOrder.count({ where: { customerId: cid } });
          const otherQuotes = await prisma.quotation.count({ where: { customerId: cid } });
          const otherLeads = await prisma.lead.count({ where: { customerId: cid } });
          if (otherOrders === 0 && otherQuotes === 0 && otherLeads === 0) {
            await prisma.customer.delete({ where: { id: cid } });
          }
        }
        console.log(`  ✓ Cleaned up customer records created by SuperSales 2.`);
      } catch (e) {
        console.warn('  ⚠️ Customer cleanup:', e.message);
      }
    }

    // --- STEP H: DELETE USER-LEVEL RESIDUAL DATA ---
    try {
      await prisma.sampleRequest.deleteMany({ where: { createdById: { in: allUserIds } } });
      await prisma.reminder.deleteMany({ where: { userId: { in: allUserIds } } });
      await prisma.notification.deleteMany({ where: { userId: { in: allUserIds } } });
      await prisma.customerComplaint.deleteMany({ where: { createdBy: { in: allUserIds } } });
      await prisma.salesTarget.deleteMany({ where: { salespersonId: { in: allUserIds } } });
      await prisma.deviceSession.deleteMany({ where: { userId: { in: allUserIds } } });
      await prisma.refreshSession.deleteMany({ where: { userId: { in: allUserIds } } });
    } catch (_) {}

    console.log(`\n🎉 [${config.name}] ALL SUPERSALES 2 DATA (LEAD -> QUOTE -> ORDER -> PLANT HEAD -> QC -> DISPATCH) REMOVED!`);
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
    if (process.env.DATABASE_URL.includes('@postgres:')) {
      targetDbs.push({
        name: 'Host Localhost Fallback (from @postgres:)',
        url: process.env.DATABASE_URL.replace('@postgres:', '@localhost:')
      });
      targetDbs.push({
        name: 'Host 127.0.0.1 Fallback (from @postgres:)',
        url: process.env.DATABASE_URL.replace('@postgres:', '@127.0.0.1:')
      });
    }
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
    await wipeSuperSales2FromDb(db);
  }
}

main().catch(console.error);

