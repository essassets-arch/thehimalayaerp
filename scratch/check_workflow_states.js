const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const states = await prisma.workflowState.findMany({
    include: { workflow: true }
  });
  console.log(`Total workflow states: ${states.length}`);
  states.forEach(s => {
    console.log(`[${s.workflow?.code}] ${s.name} (${s.code || s.id})`);
  });
  await prisma.$disconnect();
}
run().catch(console.error);
