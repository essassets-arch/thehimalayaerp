const { PrismaClient } = require('@prisma/client');

const dbs = [
  { name: 'Active DB (himalaya_erp_browser_test)', url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public' },
  { name: 'Main DB (himalaya_erp)', url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp?schema=public' },
  { name: 'Docker DB (5435)', url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public' }
];

async function check() {
  for (const db of dbs) {
    console.log(`\n=== ${db.name} ===`);
    const prisma = new PrismaClient({ datasources: { db: { url: db.url } } });
    try {
      const leads = await prisma.lead.findMany({ select: { leadNumber: true }, take: 10 });
      console.log('Sample Lead Numbers:', leads.map(l => l.leadNumber));
      const quotations = await prisma.quotation.findMany({ select: { quotationNumber: true }, take: 10 });
      console.log('Sample Quotation Numbers:', quotations.map(q => q.quotationNumber));
      const orders = await prisma.salesOrder.findMany({ select: { orderNumber: true }, take: 10 });
      console.log('Sample Order Numbers:', orders.map(o => o.orderNumber));

      const ss1 = await prisma.user.findFirst({ where: { email: 'supersales1@himalayaerp.com' } });
      if (ss1) {
        const ss1Quotes = await prisma.quotation.count({ where: { salesExecutiveId: ss1.id } });
        const ss1Orders = await prisma.salesOrder.count({ where: { salesExecutiveId: ss1.id } });
        console.log(`SuperSales 1 Quotations: ${ss1Quotes}, Orders: ${ss1Orders}`);
      }
    } catch (e) {
      console.log('Error:', e.message);
    } finally {
      await prisma.$disconnect();
    }
  }
}

check();
