import { PrismaClient } from '@prisma/client';

const dbUrls = [
  "postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5433/himalaya_erp?schema=public",
  process.env.DATABASE_URL || "postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public",
];

async function inspectDb(url: string) {
  console.log(`\n===================================================================`);
  console.log(` INSPECTING EXISTING RECORD OWNERSHIP ON DB: ${url}`);
  console.log(`===================================================================\n`);

  const prisma = new PrismaClient({ datasources: { db: { url } } });

  try {
    const leads = await prisma.lead.findMany({
      include: {
        salesExecutive: { select: { email: true, name: true } },
      },
    });

    const userMap = new Map((await prisma.user.findMany()).map(u => [u.id, u.email]));

    console.log(`Total Leads in DB: ${leads.length}\n`);

    for (const l of leads) {
      const creatorEmail = userMap.get(l.createdById) || l.createdById;
      console.log(`Lead ID: ${l.id} | Number: ${l.leadNumber} | Company: ${l.companyName}`);
      console.log(`  Created By User: ${creatorEmail}`);
      console.log(`  Sales Executive Owner: ${l.salesExecutive?.email || l.salesExecutiveId || 'NULL'}`);
      console.log('---');
    }

    const nullSalesExecLeads = await prisma.lead.count({ where: { salesExecutiveId: null } });
    console.log(`\nLeads where salesExecutiveId IS NULL: ${nullSalesExecLeads}`);

  } catch (e: any) {
    console.error(`Error inspecting DB ${url}:`, e.message);
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  for (const url of dbUrls) {
    await inspectDb(url);
  }
}

main();
