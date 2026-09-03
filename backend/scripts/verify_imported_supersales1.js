const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const isDocker = fs.existsSync('/.dockerenv') || (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('@postgres:'));

const databases = isDocker
  ? [{ name: 'Docker Production Database', url: process.env.DATABASE_URL }]
  : [
      { name: 'Active DB (himalaya_erp_browser_test)', url: process.env.DATABASE_URL || 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public' },
      { name: 'Main DB (himalaya_erp)', url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp?schema=public' },
      { name: 'Docker DB 5435', url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public' }
    ];

async function verify() {
  for (const db of databases) {
    console.log(`\n============================================================`);
    console.log(` VERIFYING: ${db.name}`);
    console.log(`============================================================`);

    const prisma = new PrismaClient({ datasources: { db: { url: db.url } } });

    try {
      const user = await prisma.user.findFirst({
        where: { email: { equals: 'supersales1@himalayaerp.com', mode: 'insensitive' } },
        include: { role: true, company: true }
      });

      if (!user) {
        console.log(`❌ User supersales1@himalayaerp.com not found.`);
        continue;
      }

      console.log(`User: ${user.name} (${user.email})`);

      const leads = await prisma.lead.findMany({
        where: { OR: [{ salesExecutiveId: user.id }, { createdById: user.id }, { assignedToId: user.id }] },
        orderBy: { leadNumber: 'asc' }
      });

      const quotations = await prisma.quotation.findMany({
        where: { OR: [{ salesExecutiveId: user.id }, { createdById: user.id }] },
        orderBy: { quotationNumber: 'asc' }
      });

      const orders = await prisma.salesOrder.findMany({
        where: { OR: [{ salesExecutiveId: user.id }, { createdById: user.id }] },
        orderBy: { orderNumber: 'asc' }
      });

      console.log(`\n📊 SUMMARY:`);
      console.log(`- Leads:        ${leads.length}  (First: ${leads[0]?.leadNumber} | Last: ${leads[leads.length - 1]?.leadNumber})`);
      console.log(`- Quotations:   ${quotations.length}  (First: ${quotations[0]?.quotationNumber} | Last: ${quotations[quotations.length - 1]?.quotationNumber})`);
      console.log(`- Sales Orders: ${orders.length}  (First: ${orders[0]?.orderNumber} | Last: ${orders[orders.length - 1]?.orderNumber})`);

      // Sample first and last
      console.log(`\n🔍 Pipeline Sample (First record):`);
      console.log(`  Lead:        ${leads[0]?.leadNumber} - ${leads[0]?.projectName}`);
      console.log(`  Quotation:   ${quotations[0]?.quotationNumber} - Total: ₹${quotations[0]?.total}`);
      console.log(`  Sales Order: ${orders[0]?.orderNumber} - Total: ₹${orders[0]?.totalAmount}`);

      console.log(`\n🔍 Pipeline Sample (144th record):`);
      console.log(`  Lead:        ${leads[leads.length - 1]?.leadNumber} - ${leads[leads.length - 1]?.projectName}`);
      console.log(`  Quotation:   ${quotations[quotations.length - 1]?.quotationNumber} - Total: ₹${quotations[quotations.length - 1]?.total}`);
      console.log(`  Sales Order: ${orders[orders.length - 1]?.orderNumber} - Total: ₹${orders[orders.length - 1]?.totalAmount}`);

    } catch (e) {
      console.error(`Verification error in ${db.name}:`, e.message);
    } finally {
      await prisma.$disconnect();
    }
  }
}

verify();
