const { execSync } = require('child_process');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  console.log('===============================================================');
  console.log('       RESETTING AND RE-SYNCING ALL SALES IMPORT SEQUENCES     ');
  console.log('===============================================================');

  // Find all sales users
  const ss1 = await prisma.user.findFirst({ where: { email: { equals: 'supersales1@himalayaerp.com', mode: 'insensitive' } } });
  const ss2 = await prisma.user.findFirst({ where: { email: { equals: 'supersales2@himalayaerp.com', mode: 'insensitive' } } });
  const s2 = await prisma.user.findFirst({ where: { email: { equals: 'sales2@himalayaerp.com', mode: 'insensitive' } } });
  const s4 = await prisma.user.findFirst({ where: { email: { equals: 'sales4@himalayaerp.com', mode: 'insensitive' } } });
  const s1 = await prisma.user.findFirst({ where: { email: { equals: 'sales1@himalayaerp.com', mode: 'insensitive' } } });
  const s6 = await prisma.user.findFirst({ where: { email: { equals: 'sales6@himalayaerp.com', mode: 'insensitive' } } });
  const s11 = await prisma.user.findFirst({ where: { email: { equals: 'sales11@himalayaerp.com', mode: 'insensitive' } } });
  const s13 = await prisma.user.findFirst({ where: { email: { equals: 'sales13@himalayaerp.com', mode: 'insensitive' } } });

  // Delete imported leads for SS2, S2, S4, S1, S6, S11, S13 to reset sequence cleanly
  const userIdsToDelete = [ss2?.id, s2?.id, s4?.id, s1?.id, s6?.id, s11?.id, s13?.id].filter(Boolean);
  await prisma.lead.deleteMany({
    where: {
      OR: [
        { createdById: { in: userIdsToDelete } },
        { salesExecutiveId: { in: userIdsToDelete } }
      ]
    }
  });

  // Reset sequence key to 159 (after SuperSales 1)
  await prisma.idSequence.upsert({
    where: { key: 'lead_number_2627' },
    update: { nextValue: 159 },
    create: { key: 'lead_number_2627', nextValue: 159 }
  });
  await prisma.idSequence.upsert({
    where: { key: 'lead_number' },
    update: { nextValue: 159 },
    create: { key: 'lead_number', nextValue: 159 }
  });

  console.log('Reset sequence to 159.');

  // Now run SS2, S2, S4, S1, S6, S11, S13 in strict sequence
  const scripts = [
    'import_supersales2_runner.js',
    'import_sales2_runner.js',
    'import_sales4_runner.js',
    'import_sales1_runner.js',
    'import_sales6_runner.js',
    'import_sales11_runner.js',
    'import_sales13_runner.js'
  ];

  for (const s of scripts) {
    const scriptPath = path.join(__dirname, s);
    console.log(`\n▶️ Executing: ${s}...`);
    execSync(`node "${scriptPath}"`, { stdio: 'inherit' });
  }

  console.log('\n===============================================================');
  console.log('       ALL SALES IMPORTS COMPLETED WITH PERFECT SEQUENCING!    ');
  console.log('===============================================================');
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
