const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const leads = await prisma.lead.findMany({ select: { leadNumber: true } });
  console.log('Total leads found:', leads.length);
  console.log('Sample leads:', leads.slice(0, 5));
  let maxNum = 0;
  leads.forEach(l => {
    if (l.leadNumber && l.leadNumber.startsWith('LEAD-2026-')) {
      const numPart = parseInt(l.leadNumber.replace('LEAD-2026-', ''), 10);
      if (!isNaN(numPart) && numPart > maxNum) {
        maxNum = numPart;
      }
    }
  });
  console.log('Computed maxNum:', maxNum);
}
run().catch(console.error).finally(() => prisma.$disconnect());
