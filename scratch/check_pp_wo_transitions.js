const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const states = await prisma.workflowState.findMany();
  const stateMap = new Map(states.map(s => [s.id, s]));

  const transitions = await prisma.workflowTransition.findMany({
    where: {
      workflow: { code: 'PRODUCTION_PLAN' }
    }
  });

  console.log('PRODUCTION_PLAN Transitions:');
  for (const t of transitions) {
    const from = stateMap.get(t.fromStateId)?.code || t.fromStateId;
    const to = stateMap.get(t.toStateId)?.code || t.toStateId;
    console.log(`${from} -> (${t.actionName}) -> ${to}`);
  }

  const woTransitions = await prisma.workflowTransition.findMany({
    where: {
      workflow: { code: 'WORK_ORDER' }
    }
  });

  console.log('WORK_ORDER Transitions:');
  for (const t of woTransitions) {
    const from = stateMap.get(t.fromStateId)?.code || t.fromStateId;
    const to = stateMap.get(t.toStateId)?.code || t.toStateId;
    console.log(`${from} -> (${t.actionName}) -> ${to}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
