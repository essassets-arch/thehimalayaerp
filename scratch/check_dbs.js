const { PrismaClient } = require('@prisma/client');

async function check(dbName) {
  const url = `postgresql://himalaya_erp_user:12345678@localhost:5432/${dbName}?schema=public`;
  const p = new PrismaClient({ datasources: { db: { url } } });
  try {
    const octStart = new Date('2026-09-30T18:30:00.000Z');
    const octEnd = new Date('2026-10-31T18:29:59.999Z');
    const woCount = await p.workOrder.count({
      where: {
        OR: [
          { completedAt: { gte: octStart, lte: octEnd } },
          { AND: [{ completedAt: null }, { createdAt: { gte: octStart, lte: octEnd } }] }
        ]
      }
    });
    const totalWo = await p.workOrder.count();
    const repCount = await p.productionDailyReport.count().catch(() => 0);
    console.log(`DB: ${dbName} -> Total WOs: ${totalWo}, Oct WOs: ${woCount}, Daily Reports: ${repCount}`);
  } catch (err) {
    console.log(`DB: ${dbName} -> error: ${err.message}`);
  } finally {
    await p.$disconnect();
  }
}

async function main() {
  await check('himalaya_erp');
  await check('himalaya_erp_dev');
  await check('himalaya_erp_test');
  await check('himalaya_erp_browser_test');
}

main();
