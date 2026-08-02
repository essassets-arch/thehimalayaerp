const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const dispatches = await prisma.dispatch.findMany({
    where: { status: 'IN_TRANSIT' },
    orderBy: { createdAt: 'desc' }
  });
  console.log(`Found ${dispatches.length} IN_TRANSIT dispatches:`);
  dispatches.forEach(d => console.log(d.id, d.status, d.createdById));
}

run().catch(console.error).finally(() => prisma.$disconnect());
