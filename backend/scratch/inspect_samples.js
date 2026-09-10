const { PrismaClient } = require('@prisma/client');

const dbs = [
  'himalaya_erp_dev',
  'himalaya_erp',
  'himalaya_erp_test',
  'himalaya_erp_browser_test',
  'prototype_next_browser_test'
];

async function main() {
  for (const db of dbs) {
    const url = `postgresql://himalaya_erp_user:12345678@localhost:5432/${db}?schema=public`;
    const prisma = new PrismaClient({ datasources: { db: { url } } });
    try {
      const sampleCount = await prisma.sampleRequest.count();
      const lead = await prisma.lead.findFirst({ where: { leadNumber: 'LEAD/2627/0190' } });
      console.log(`DB ${db}: samples=${sampleCount}, hasLead0190=${Boolean(lead)}`);
      if (sampleCount > 0) {
        const samples = await prisma.sampleRequest.findMany({ take: 3, include: { items: true } });
        console.log(`  Sample examples in ${db}:`, samples.map(s => ({ id: s.id, num: s.sampleNumber, items: s.items.length })));
      }
    } catch (e) {
      console.log(`DB ${db} error:`, e.message);
    } finally {
      await prisma.$disconnect();
    }
  }
}

main().catch(console.error);
