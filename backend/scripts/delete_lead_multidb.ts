import { PrismaClient } from '@prisma/client';

const dbUrls = [
  process.env.DATABASE_URL || "postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public",
  "postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5433/himalaya_erp?schema=public",
  "postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp?schema=public",
];

async function checkDb(url: string) {
  console.log(`\n--- Checking DB: ${url} ---`);
  const client = new PrismaClient({ datasources: { db: { url } } });
  try {
    const leads = await client.lead.findMany({
      where: {
        OR: [
          { id: { contains: 'd20de0f0', mode: 'insensitive' } },
          { companyName: { contains: 'AXZSD', mode: 'insensitive' } },
          { email: { contains: 'essassets@gmail.com', mode: 'insensitive' } },
          { phone: { contains: '7857854855' } },
        ],
      },
    });

    console.log(`Found ${leads.length} matching leads in ${url}:`, leads);

    for (const lead of leads) {
      console.log(`Deleting lead ${lead.id} (${lead.companyName})...`);
      await client.leadActivity.deleteMany({ where: { leadId: lead.id } });
      await client.sampleRequest.deleteMany({ where: { leadId: lead.id } });
      await client.quotation.deleteMany({ where: { leadId: lead.id } });
      await client.lead.delete({ where: { id: lead.id } });
      console.log(`[DELETED] Lead ${lead.id} successfully removed!`);
    }
  } catch (e: any) {
    console.log(`Error checking ${url}: ${e.message}`);
  } finally {
    await client.$disconnect();
  }
}

async function main() {
  for (const url of dbUrls) {
    await checkDb(url);
  }
}

main();
