const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const dispatches = await prisma.dispatch.findMany({
    where: { status: 'IN_TRANSIT' },
    include: { salesOrder: true }
  });
  
  for (const d of dispatches) {
    const creator = await prisma.user.findUnique({ where: { id: d.createdById || undefined }, include: { role: true }});
    const soCreator = await prisma.user.findUnique({ where: { id: d.salesOrder.createdById || undefined }, include: { role: true }});
    
    console.log(`Dispatch: ${d.id}`);
    console.log(`  Created By: ${d.createdById} (${creator?.role?.code})`);
    console.log(`  SalesOrder Created By: ${d.salesOrder.createdById} (${soCreator?.role?.code})`);
  }
}

run().catch(console.error).finally(() => prisma.$disconnect());
