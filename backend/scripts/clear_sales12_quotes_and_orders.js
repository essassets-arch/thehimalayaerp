const { PrismaClient } = require('@prisma/client');

const targetDbs = [
  { name: 'Active Browser Test DB', url: process.env.DATABASE_URL || 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public' },
  { name: 'Main Himalaya ERP DB', url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp?schema=public' }
];

async function clearSales12QuotesAndOrders(config) {
  console.log(`\n======================================================================`);
  console.log(`🧹 REMOVING QUOTATIONS & ORDERS FOR SALES 12 (JYOTI) IN: ${config.name}`);
  console.log(`======================================================================`);

  const prisma = new PrismaClient({ datasources: { db: { url: config.url } } });

  try {
    const user = await prisma.user.findFirst({
      where: { email: { equals: 'sales12@himalayaerp.com', mode: 'insensitive' } }
    });

    if (!user) {
      console.log(`⚠️ User sales12@himalayaerp.com not found in ${config.name}.`);
      return;
    }
    const userId = user.id;
    console.log(`Found user: ${user.name} (${user.id})`);

    // 1. Find all Sales Orders for Sales 12
    const orders = await prisma.salesOrder.findMany({
      where: {
        OR: [
          { createdById: userId },
          { salesExecutiveId: userId },
          { remarks: { contains: 'Sales 12', mode: 'insensitive' } }
        ]
      },
      select: { id: true, orderNumber: true }
    });
    const orderIds = orders.map(o => o.id);
    console.log(`Found ${orders.length} Sales Orders to remove:`, orders.map(o => o.orderNumber));

    if (orderIds.length > 0) {
      const soItems = await prisma.salesOrderItem.findMany({
        where: { salesOrderId: { in: orderIds } },
        select: { id: true }
      });
      const soItemIds = soItems.map(i => i.id);

      if (soItemIds.length > 0) {
        try { await prisma.dispatchItem.deleteMany({ where: { salesOrderItemId: { in: soItemIds } } }); } catch (e) {}
        try { await prisma.invoiceItem.deleteMany({ where: { salesOrderItemId: { in: soItemIds } } }); } catch (e) {}
        try { await prisma.workOrder.deleteMany({ where: { salesOrderItemId: { in: soItemIds } } }); } catch (e) {}
        try { await prisma.customerComplaintItem.deleteMany({ where: { salesOrderItemId: { in: soItemIds } } }); } catch (e) {}
        try { await prisma.replacementRequestItem.deleteMany({ where: { salesOrderItemId: { in: soItemIds } } }); } catch (e) {}
      }

      try { await prisma.customerPaymentAllocation.deleteMany({ where: { salesOrderId: { in: orderIds } } }); } catch (e) {}
      try { await prisma.salesOrderAllocation.deleteMany({ where: { salesOrderId: { in: orderIds } } }); } catch (e) {}
      try { await prisma.salesOrderHistory.deleteMany({ where: { salesOrderId: { in: orderIds } } }); } catch (e) {}
      try { await prisma.salesOrderCreditReview.deleteMany({ where: { salesOrderId: { in: orderIds } } }); } catch (e) {}
      try { await prisma.orderAmendment.deleteMany({ where: { salesOrderId: { in: orderIds } } }); } catch (e) {}
      try { await prisma.salesOrderItem.deleteMany({ where: { salesOrderId: { in: orderIds } } }); } catch (e) {}
      const deletedOrders = await prisma.salesOrder.deleteMany({ where: { id: { in: orderIds } } });
      console.log(`✓ Successfully deleted ${deletedOrders.count} Sales Orders.`);
    }

    // 2. Find all Quotations for Sales 12
    const quotes = await prisma.quotation.findMany({
      where: {
        OR: [
          { createdById: userId },
          { salesExecutiveId: userId },
          { remarks: { contains: 'Sales 12', mode: 'insensitive' } }
        ]
      },
      select: { id: true, quotationNumber: true }
    });
    const quoteIds = quotes.map(q => q.id);
    console.log(`Found ${quotes.length} Quotations to remove:`, quotes.map(q => q.quotationNumber));

    if (quoteIds.length > 0) {
      try { await prisma.quotationTerm.deleteMany({ where: { quotationId: { in: quoteIds } } }); } catch (e) {}
      try { await prisma.quotationItem.deleteMany({ where: { quotationId: { in: quoteIds } } }); } catch (e) {}
      const deletedQuotes = await prisma.quotation.deleteMany({ where: { id: { in: quoteIds } } });
      console.log(`✓ Successfully deleted ${deletedQuotes.count} Quotations.`);
    }

    // 3. Reset Leads so they can be converted afresh
    const leadState = await prisma.workflowState.findFirst({
      where: { workflow: { code: 'LEAD' }, isInitial: true }
    }) || await prisma.workflowState.findFirst({
      where: { workflow: { code: 'LEAD' } }
    });

    await prisma.lead.updateMany({
      where: { salesExecutiveId: userId },
      data: {
        convertedCustomerId: null,
        convertedAt: null,
        convertedById: null,
        workflowStateId: leadState ? leadState.id : undefined
      }
    });

    // 4. Verify Leads remain intact
    const remainingLeads = await prisma.lead.findMany({
      where: { salesExecutiveId: userId },
      select: { id: true, leadNumber: true, companyName: true }
    });

    console.log(`\n✅ STATUS FOR JYOTI (${user.email}):`);
    console.log(`   - Quotations: 0 (Removed)`);
    console.log(`   - Sales Orders: 0 (Removed)`);
    console.log(`   - Leads Remaining: ${remainingLeads.length} (Ready for new Quotation / Order creation!)`);
    remainingLeads.forEach(l => console.log(`     • ${l.leadNumber} - ${l.companyName}`));

  } catch (err) {
    console.error(`❌ Error in ${config.name}:`, err.message);
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  for (const db of targetDbs) {
    await clearSales12QuotesAndOrders(db);
  }
}

main().catch(console.error);
