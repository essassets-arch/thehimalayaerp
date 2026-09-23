const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const broadcastCount = await prisma.notification.count({ where: { type: 'BROADCAST' } });
  console.log('Count of BROADCAST:', broadcastCount);

  const allDistinctTypes = await prisma.notification.findMany({
    select: { type: true },
    distinct: ['type']
  });
  console.log('All distinct types in DB:', allDistinctTypes);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
