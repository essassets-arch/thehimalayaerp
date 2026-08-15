const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const leadCount = await prisma.lead.count();
  console.log('Lead count:', leadCount);
  if (leadCount > 0) {
    const leads = await prisma.lead.findMany({ take: 2, include: { workflowState: true } });
    console.log(JSON.stringify(leads, null, 2));
  }
}
run().catch(console.error).finally(() => prisma.$disconnect());
