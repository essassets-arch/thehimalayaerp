const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const fgCount = await prisma.finishedGoods.count();
    console.log('FinishedGoods count:', fgCount);
    
    // Using raw query to check NULL workOrderId
    const fgNullWorkOrder = await prisma.$queryRaw`SELECT * FROM "FinishedGoods" WHERE "workOrderId" IS NULL`;
    console.log('FinishedGoods with null workOrderId:', fgNullWorkOrder);
  } catch (err) {
    console.error('Error querying FinishedGoods:', err.message);
  }

  try {
    // Check if DispatchDailyReport exists using raw query
    const dispatchTables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name LIKE '%DispatchDailyReport%'
    `;
    console.log('Dispatch daily report tables in DB:', dispatchTables);

    const rows = await prisma.$queryRaw`SELECT * FROM "DispatchDailyReport" LIMIT 10`;
    console.log('DispatchDailyReport rows:', rows);
  } catch (err) {
    console.error('Error querying DispatchDailyReport:', err.message);
  }

  await prisma.$disconnect();
}

main();
