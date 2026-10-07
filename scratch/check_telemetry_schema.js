const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- CHECKING TELEMETRY MODELS & DATA ---');
  
  // 1. Machines
  const machines = await prisma.machine.findMany();
  console.log(`Machines in DB: ${machines.length}`);
  for (const m of machines) {
    console.log(`Machine: id=${m.id}, code=${m.machineId}, name=${m.machineName}, type=${m.machineType}, location=${m.location}`);
  }

  // 2. Work Order production statuses
  const statusGroups = await prisma.workOrder.groupBy({
    by: ['status'],
    _count: true
  });
  console.log('Work Order Statuses:', statusGroups);

  // 3. Are there active / in-progress work orders right now?
  const running = await prisma.workOrder.count({ where: { status: { in: ['IN_PRODUCTION', 'RUNNING', 'IN_PROGRESS'] } } });
  const paused = await prisma.workOrder.count({ where: { status: { in: ['PAUSED', 'ON_HOLD'] } } });
  const completed = await prisma.workOrder.count({ where: { status: 'COMPLETED' } });
  const readyForDispatch = await prisma.workOrder.count({ where: { status: 'READY_FOR_DISPATCH' } });
  const qcPending = await prisma.workOrder.count({ where: { qcResult: { in: ['PENDING', null] } } });

  console.log({ running, paused, completed, readyForDispatch, qcPending });

  // 4. Check if there are IoT telemetry or event tables
  const models = ['machineTelemetry', 'floorTelemetry', 'productionLog', 'downtimeLog', 'shiftLog'];
  for (const m of models) {
    if (prisma[m]) {
      const c = await prisma[m].count().catch(() => 'error');
      console.log(`Model ${m}: ${c}`);
    } else {
      console.log(`Model ${m}: NOT IN PRISMA`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
