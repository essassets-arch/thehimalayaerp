const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runTest() {
  console.log('🧪 Testing D1 vs D2 Dispatch Executive Isolation...\n');

  // 1. Fetch D1 and D2 Users
  const d1User = await prisma.user.findFirst({
    where: { email: { equals: 'ravikant.tiwari@himalayaerp.com', mode: 'insensitive' } },
    include: { role: true },
  });

  const d2User = await prisma.user.findFirst({
    where: { email: { equals: 'sahad.dispatch@himalayaerp.com', mode: 'insensitive' } },
    include: { role: true },
  });

  const superAdmin = await prisma.user.findFirst({
    where: { email: { equals: 'super.admin@himalayaerp.com', mode: 'insensitive' } },
    include: { role: true },
  });

  console.log('👤 USERS UNDER TEST:');
  console.log(`  - D1 Executive : ${d1User ? `${d1User.name} (${d1User.email}) -> Category: ${d1User.dispatchCategory}` : 'NOT FOUND'}`);
  console.log(`  - D2 Executive : ${d2User ? `${d2User.name} (${d2User.email}) -> Category: ${d2User.dispatchCategory}` : 'NOT FOUND'}`);
  console.log(`  - Super Admin  : ${superAdmin ? `${superAdmin.name} (${superAdmin.email})` : 'NOT FOUND'}\n`);

  // 2. Query dispatches as D1 User (Ravikant Tiwari)
  const d1Dispatches = await prisma.dispatch.findMany({
    where: { dispatchCategory: d1User.dispatchCategory },
  });
  console.log(`📦 D1 Dispatch Queue Count (Ravikant Tiwari): ${d1Dispatches.length}`);

  // 3. Query dispatches as D2 User (Sahad Mansuri)
  const d2Dispatches = await prisma.dispatch.findMany({
    where: { dispatchCategory: d2User.dispatchCategory },
  });
  console.log(`📦 D2 Dispatch Queue Count (Sahad Mansuri): ${d2Dispatches.length}`);

  // 4. Query total dispatches in system (Super Admin view)
  const totalDispatches = await prisma.dispatch.findMany();
  console.log(`🌐 Total Dispatches in System (Super Admin): ${totalDispatches.length}`);

  // 5. Active User Audit
  const activeDispatchUsers = await prisma.user.findMany({
    where: {
      role: { code: 'DISPATCH_EXECUTIVE' },
      isActive: true,
    },
  });

  console.log('\n========================================');
  console.log(`STATUS AUDIT: ${activeDispatchUsers.length} Active Dispatch Executives found`);
  if (activeDispatchUsers.length === 2) {
    console.log('✅ PASS: Exactly 2 Active Dispatch Executives (D1 & D2) exist!');
  } else {
    console.log(`⚠️ WARNING: Expected 2 active users, found ${activeDispatchUsers.length}`);
  }
  console.log('========================================\n');
}

runTest()
  .catch((e) => {
    console.error('Test Failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
