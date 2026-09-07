const { PrismaClient } = require('@prisma/client');
const dbs = [
  { name: 'Active Browser Test DB (5432)', url: process.env.DATABASE_URL || 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public' },
  { name: 'Main DB (5432)', url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp?schema=public' },
  { name: 'Dev DB (5432)', url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_dev?schema=public' },
  { name: 'Test DB (5432)', url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_test?schema=public' }
];

async function check() {
  for (const db of dbs) {
    const prisma = new PrismaClient({ datasources: { db: { url: db.url } } });
    try {
      await prisma.$connect();
      const u = await prisma.user.findFirst({
        where: { email: { equals: 'supersales1@himalayaerp.com', mode: 'insensitive' } }
      });
      console.log(`\n========================================`);
      console.log(`=== DB: ${db.name} ===`);
      if (!u) {
        console.log(`User: NOT FOUND`);
        continue;
      }
      console.log(`User: ${u.name} (id: ${u.id}, email: ${u.email})`);
      const uid = u.id;

      const leads = await prisma.lead.findMany({
        where: { OR: [{ createdById: uid }, { salesExecutiveId: uid }, { assignedToId: uid }] },
        select: { id: true, leadNumber: true }
      });
      const leadIds = leads.map(l => l.id);

      const quotes = await prisma.quotation.findMany({
        where: { OR: [{ createdById: uid }, ...(leadIds.length ? [{ leadId: { in: leadIds } }] : [])] },
        select: { id: true, quotationNumber: true }
      });
      const quoteIds = quotes.map(q => q.id);

      const orders = await prisma.salesOrder.findMany({
        where: { OR: [{ createdById: uid }, ...(quoteIds.length ? [{ quotationId: { in: quoteIds } }, { sourceQuotationId: { in: quoteIds } }] : [])] },
        select: { id: true, orderNumber: true }
      });
      const orderIds = orders.map(o => o.id);

      let plans = [];
      let wos = [];
      let qcs = [];
      let dispatches = [];
      let invoices = [];

      if (orderIds.length > 0) {
        plans = await prisma.productionPlan.findMany({ where: { salesOrderId: { in: orderIds } }, select: { id: true } });
        const planIds = plans.map(p => p.id);

        wos = await prisma.workOrder.findMany({
          where: { OR: [{ createdById: uid }, ...(planIds.length ? [{ productionPlanId: { in: planIds } }] : [])] },
          select: { id: true }
        });
        const woIds = wos.map(w => w.id);

        if (woIds.length > 0) {
          qcs = await prisma.qCInspection.findMany({ where: { workOrderId: { in: woIds } }, select: { id: true } });
        }

        dispatches = await prisma.dispatch.findMany({
          where: { OR: [{ createdById: uid }, { salesOrderId: { in: orderIds } }] },
          select: { id: true, dispatchNo: true }
        });

        invoices = await prisma.salesInvoice.findMany({
          where: { salesOrderId: { in: orderIds } },
          select: { id: true, invoiceNumber: true }
        });
      }

      const customers = await prisma.customer.findMany({
        where: { createdById: uid },
        select: { id: true, companyName: true, customerCode: true }
      });

      console.log(`Counts for supersales1:`);
      console.log(`- Leads: ${leads.length}`);
      console.log(`- Quotations: ${quotes.length}`);
      console.log(`- Sales Orders: ${orders.length}`);
      console.log(`- Production Plans: ${plans.length}`);
      console.log(`- Work Orders: ${wos.length}`);
      console.log(`- QC Inspections: ${qcs.length}`);
      console.log(`- Dispatches: ${dispatches.length}`);
      console.log(`- Invoices: ${invoices.length}`);
      console.log(`- Customers created by supersales1: ${customers.length}`);
      if (customers.length > 0) {
        console.log(`  Sample customers:`, customers.slice(0, 5));
      }
    } catch (e) {
      console.log(`DB ${db.name} Error: ${e.message}`);
    } finally {
      await prisma.$disconnect();
    }
  }
}

check();
