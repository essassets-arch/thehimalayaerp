const { PrismaClient } = require('@prisma/client');
const urls = [
  { name: 'BROWSER_TEST', url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public' },
  { name: 'MAIN_DB', url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp?schema=public' }
];
(async () => {
  for (const { name, url } of urls) {
    const p = new PrismaClient({ datasources: { db: { url } } });
    const seqs = await p.idSequence.findMany();
    console.log(`\n--- ${name} ID SEQUENCES ---`);
    console.log(seqs);
    await p.$disconnect();
  }
})();
