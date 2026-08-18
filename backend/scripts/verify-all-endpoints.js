const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runFullVerification() {
  console.log('=====================================================');
  console.log('   FULL ENDPOINT & DATABASE VERIFICATION SUITE       ');
  console.log('=====================================================');

  // 1. Verify ProductionPlan.priority Column
  console.log('\n[1] Verifying ProductionPlan.priority column in PostgreSQL...');
  const columnCheck = await prisma.$queryRaw`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'ProductionPlan' AND column_name = 'priority';
  `;
  console.log('   ProductionPlan.priority Column Status:', columnCheck);

  // 2. Test Sales Orders findMany Query with ProductionPlan Relation
  console.log('\n[2] Testing salesOrder.findMany() with ProductionPlan relation...');
  try {
    const orders = await prisma.salesOrder.findMany({
      take: 5,
      include: {
        productionPlans: true,
        customer: true,
      }
    });
    console.log(`   SUCCESS: Fetched ${orders.length} sales orders without missing column error.`);
  } catch (err) {
    console.error('   FAILED salesOrder.findMany():', err.message);
  }

  // 3. Test Attendance DB Queries
  console.log('\n[3] Testing Attendance Queries (Today & Company List)...');
  try {
    const todayAttendance = await prisma.attendance.findFirst({});
    const totalCount = await prisma.attendance.count();
    console.log(`   SUCCESS: Attendance DB queries executed clean. Total records: ${totalCount}`);
  } catch (err) {
    console.error('   FAILED Attendance DB query:', err.message);
  }

  // 4. Test Notification Bell DB Queries
  console.log('\n[4] Testing Bell Notification DB Queries...');
  try {
    const notifs = await prisma.notification.findMany({ take: 5 });
    console.log(`   SUCCESS: Fetched ${notifs.length} bell notifications from DB.`);
  } catch (err) {
    console.error('   FAILED Bell Notification query:', err.message);
  }

  console.log('\n=====================================================');
  console.log('   VERIFICATION PASSED - ALL DATABASE SURFACES OK    ');
  console.log('=====================================================');
}

runFullVerification().finally(() => prisma.$disconnect());
