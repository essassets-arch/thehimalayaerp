const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const all = await prisma.workOrder.findMany({
    select: { id: true, workOrderNumber: true, status: true, productionStatus: true, createdAt: true }
  });
  console.log('Total work orders:', all.length);
  const counts = {};
  for (const w of all) {
    const parts = w.workOrderNumber.split('-');
    const prefix = parts.slice(0, 3).join('-');
    counts[prefix] = (counts[prefix] || 0) + 1;
  }
  console.log('Prefix counts:', counts);
  const statusCounts = {};
  for (const w of all) {
    statusCounts[w.status] = (statusCounts[w.status] || 0) + 1;
  }
  console.log('Status counts:', statusCounts);
}
main().finally(() => prisma.$disconnect());
