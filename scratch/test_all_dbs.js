const { PrismaClient } = require('@prisma/client');

const testUrls = [
  { name: 'Current Docker DB (5435)', url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public' },
  { name: 'Port 5433 DB', url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5433/himalaya_erp?schema=public' },
  { name: 'Port 5432 DB', url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public' },
];

async function main() {
  for (const db of testUrls) {
    console.log(`Testing ${db.name}...`);
    try {
      const p = new PrismaClient({ datasources: { db: { url: db.url } } });
      const count = await p.company.count();
      console.log(`  -> SUCCESS! Found ${count} companies.`);
      await p.$disconnect();
    } catch (e) {
      console.log(`  -> FAILED/NOT REACHABLE: ${e.message.split('\n')[0]}`);
    }
  }
}

main().catch(console.error);
