const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCompletedMonths() {
  const all = await prisma.workOrder.findMany();
  const months = {};
  for (const w of all) {
    if (w.completedAt) {
      const c = new Date(w.completedAt.getTime() + 5.5 * 3600 * 1000).toISOString().slice(0, 7);
      months[c] = (months[c] || 0) + 1;
    } else {
      months['NO_COMPLETED_AT'] = (months['NO_COMPLETED_AT'] || 0) + 1;
    }
  }
  console.log('All Work Orders by Completed Month:', months);
}

checkCompletedMonths().catch(console.error).finally(() => prisma.$disconnect());
