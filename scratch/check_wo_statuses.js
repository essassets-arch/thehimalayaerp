const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const statuses = await prisma.workOrder.groupBy({
    by: ['status'],
    _count: true
  });
  console.log('WorkOrder status group:', JSON.stringify(statuses, null, 2));

  const total = await prisma.workOrder.count();
  console.log('Total work orders in DB:', total);

  // Check what statuses exist across ALL work orders without any filters
  const distinctStatuses = await prisma.workOrder.findMany({
    select: { status: true },
    distinct: ['status']
  });
  console.log('Distinct statuses:', distinctStatuses);

  // Check how many have completedAt
  const completedAtCount = await prisma.workOrder.count({
    where: { completedAt: { not: null } }
  });
  console.log('Work orders with completedAt:', completedAtCount);
}

main().catch(console.error).finally(() => prisma.$disconnect());
