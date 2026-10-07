const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAllMonths() {
  const all = await prisma.workOrder.findMany();
  const months = {};
  for (const w of all) {
    const c = new Date(w.createdAt.getTime() + 5.5 * 3600 * 1000).toISOString().slice(0, 7);
    months[c] = (months[c] || 0) + 1;
  }
  console.log('All Work Orders by Created Month:', months);
}

checkAllMonths().catch(console.error).finally(() => prisma.$disconnect());
