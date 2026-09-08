const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ datasources: { db: { url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public' } } });

async function verify() {
  const readyWos = await prisma.workOrder.count({ where: { productionStatus: 'READY_FOR_DISPATCH', sentToDispatchAt: null } });
  const dispatchedWos = await prisma.workOrder.count({ where: { productionStatus: 'DISPATCHED' } });
  const s1Orders = await prisma.salesOrder.count({ where: { salesExecutive: { email: 'sales1@himalayaerp.com' } } });
  const s2Orders = await prisma.salesOrder.count({ where: { salesExecutive: { email: 'supersales2@himalayaerp.com' } } });
  const fgCount = await prisma.finishedGoods.count({ where: { status: 'AVAILABLE' } });
  const qcPassed = await prisma.qCInspection.count({ where: { status: 'PASSED' } });

  console.log('--- DOCKER DB (PORT 5435) VERIFICATION ---');
  console.log('✔ Sales 1 Orders:', s1Orders);
  console.log('✔ SuperSales 2 Orders (Untouched):', s2Orders);
  console.log('✔ Ready for Dispatch Work Orders (Ready Queue):', readyWos);
  console.log('✔ Dispatched Work Orders (History Queue):', dispatchedWos);
  console.log('✔ QC Passed Inspections:', qcPassed);
  console.log('✔ Available Finished Goods Stock:', fgCount);
}

verify().catch(console.error).finally(() => prisma.$disconnect());
