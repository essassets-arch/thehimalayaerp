const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const states = await prisma.workflowState.findMany({ include: { workflow: true } });
  const byWf = {};
  states.forEach(s => {
    const code = s.workflow?.code || 'UNKNOWN';
    if (!byWf[code]) byWf[code] = [];
    byWf[code].push({ name: s.name, code: s.code, id: s.id, isInitial: s.isInitial });
  });
  console.log('Workflows in DB:', Object.keys(byWf));
  console.log(JSON.stringify(byWf, null, 2));
}

check().finally(() => prisma.$disconnect());
