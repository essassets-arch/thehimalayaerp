import { PrismaClient } from '@prisma/client';

const dbUrls = [
  "postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5433/himalaya_erp?schema=public",
  process.env.DATABASE_URL || "postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public",
];

const targetEmails = [
  'supersales1@himalayaerp.com',
  'supersales2@himalayaerp.com',
  'sales1@himalayaerp.com',
  'sales2@himalayaerp.com',
  'sales3@himalayaerp.com',
  'sales4@himalayaerp.com',
  'sales5@himalayaerp.com',
  'sales6@himalayaerp.com',
  'sales7@himalayaerp.co',
  'sales7@himalayaerp.com',
];

async function main() {
  for (const url of dbUrls) {
    console.log(`\n=================================================`);
    console.log(` AUDITING ACCOUNTS ON DB: ${url}`);
    console.log(`=================================================`);
    const prisma = new PrismaClient({ datasources: { db: { url } } });

    try {
      const users = await prisma.user.findMany({
        where: {
          email: { in: targetEmails, mode: 'insensitive' },
        },
        include: { role: true, company: true },
      });

      console.log(`Found ${users.length} target sales users in DB:\n`);
      for (const u of users) {
        const leadCount = await prisma.lead.count({
          where: { OR: [{ salesExecutiveId: u.id }, { createdById: u.id }] },
        });
        const quoteCount = await prisma.quotation.count({
          where: { OR: [{ salesExecutiveId: u.id }, { createdById: u.id }] },
        });
        const orderCount = await prisma.salesOrder.count({
          where: { OR: [{ salesExecutiveId: u.id }, { createdById: u.id }] },
        });

        console.log(`Email: ${u.email}`);
        console.log(`  User ID: ${u.id}`);
        console.log(`  Name: ${u.name}`);
        console.log(`  Role Code: ${u.role?.code} (${u.role?.name})`);
        console.log(`  Company: ${u.company?.name || 'None'} (${u.companyId})`);
        console.log(`  Is Active: ${u.isActive}`);
        console.log(`  Leads Owned: ${leadCount}, Quotations: ${quoteCount}, Orders: ${orderCount}`);
        console.log('');
      }

      // Check unowned leads (salesExecutiveId IS NULL)
      const unownedLeads = await prisma.lead.count({
        where: { salesExecutiveId: null },
      });
      console.log(`Unowned Legacy Leads (salesExecutiveId IS NULL): ${unownedLeads}`);

    } catch (e: any) {
      console.error(`Error auditing DB ${url}: ${e.message}`);
    } finally {
      await prisma.$disconnect();
    }
  }
}

main();
