const { PrismaClient } = require('@prisma/client');

async function verifyAll() {
  const dbs = [
    { name: 'Active DB (himalaya_erp_browser_test)', url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public' },
    { name: 'Main DB (himalaya_erp)', url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp?schema=public' },
    { name: 'Docker DB 5435', url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public' }
  ];

  for (const db of dbs) {
    console.log(`\n===============================================================`);
    console.log(`🔍 VERIFYING SALES 1 IN: ${db.name}`);
    console.log(`===============================================================`);
    const prisma = new PrismaClient({ datasources: { db: { url: db.url } } });
    try {
      const user = await prisma.user.findFirst({
        where: { email: { equals: 'sales1@himalayaerp.com', mode: 'insensitive' } }
      });

      if (!user) {
        console.log('User sales1@himalayaerp.com not found!');
        continue;
      }

      const leads = await prisma.lead.findMany({
        where: {
          OR: [
            { salesExecutiveId: user.id },
            { createdById: user.id }
          ]
        },
        include: {
          quotations: {
            include: {
              salesOrder: true,
              items: true
            }
          }
        },
        orderBy: { leadNumber: 'asc' }
      });

      const quotations = await prisma.quotation.findMany({
        where: {
          OR: [
            { salesExecutiveId: user.id },
            { createdById: user.id }
          ]
        },
        include: {
          lead: true,
          salesOrder: true,
          items: true
        },
        orderBy: { quotationNumber: 'asc' }
      });

      const orders = await prisma.salesOrder.findMany({
        where: {
          OR: [
            { salesExecutiveId: user.id },
            { createdById: user.id }
          ]
        },
        include: {
          quotation: true,
          items: true
        },
        orderBy: { orderNumber: 'asc' }
      });

      console.log(`📊 Summary for Sales 1 (${user.name} - ${user.email}):`);
      console.log(`   - Total Leads: ${leads.length}`);
      console.log(`   - Total Quotations: ${quotations.length}`);
      console.log(`   - Total Sales Orders: ${orders.length}`);

      const leadsWithoutQuotes = leads.filter(l => l.quotations.length === 0);
      const quotesWithoutOrders = quotations.filter(q => !q.salesOrder);
      const ordersWithoutQuotes = orders.filter(o => !o.quotation);

      console.log(`   - Leads without Quotation: ${leadsWithoutQuotes.length}`);
      console.log(`   - Quotations without Order: ${quotesWithoutOrders.length}`);
      console.log(`   - Orders without Quotation: ${ordersWithoutQuotes.length}`);

      console.log(`\n📋 First 5 and Last 5 Leads with Quotation & Order Linkage:`);
      const sample = [...leads.slice(0, 5), ...leads.slice(-5)];
      sample.forEach(l => {
        const q = l.quotations[0];
        const o = q?.salesOrder;
        console.log(`   Lead: ${l.leadNumber} (${l.companyName}) -> Quote: ${q?.quotationNumber} (${q?.items?.length} items, ₹${q?.total}) -> Order: ${o?.orderNumber} (Status: ${o?.status}, ₹${o?.totalAmount})`);
      });

    } catch (e) {
      console.error(e.message);
    } finally {
      await prisma.$disconnect();
    }
  }
}

verifyAll();
