const { PrismaClient } = require('@prisma/client');

const EXPECTED_MAPPING = [
  { name: 'Sales 1', email: 'sales1@himalayaerp.com', expectedPhone: '9586040153' },
  { name: 'Sales 2', email: 'sales2@himalayaerp.com', expectedPhone: '9998521843' },
  { name: 'Sales 3', email: 'sales3@himalayaerp.com', expectedPhone: '9033516047' },
  { name: 'Sales 4', email: 'sales4@himalayaerp.com', expectedPhone: '8488811682' },
  { name: 'Sales 5', email: 'sales5@himalayaerp.com', expectedPhone: '9033731173' },
  { name: 'Sales 11', email: 'sales11@himalayaerp.com', expectedPhone: '9033516048' },
  { name: 'Sales 12', email: 'sales12@himalayaerp.com', expectedPhone: '8488811630' },
  { name: 'Sales 13', email: 'sales13@himalayaerp.com', expectedPhone: '8488811619' },
  { name: 'Sales 14', email: 'sales14@himalayaerp.com', expectedPhone: '9033516046' },
];

async function main() {
  const prisma = new PrismaClient({
    datasources: {
      db: { url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public' }
    }
  });

  try {
    console.log('--- Checking Sales Users and Quotations in Docker DB ---');
    for (const m of EXPECTED_MAPPING) {
      const user = await prisma.user.findFirst({
        where: { email: m.email },
        include: { employee: true }
      });
      if (!user) {
        console.log(`[MISSING USER] ${m.name} (${m.email}) not found!`);
        continue;
      }
      console.log(`User: ${m.name} | ID: ${user.id} | Email: ${user.email} | Phone: ${user.employee?.phoneNumber} (Expected: ${m.expectedPhone})`);

      // Find quotations owned or associated
      const quotes = await prisma.quotation.findMany({
        where: {
          OR: [
            { salesExecutiveId: user.id },
            { createdById: user.id },
            { lead: { salesExecutiveId: user.id } }
          ]
        },
        select: {
          id: true,
          quotationNumber: true,
          salesExecutiveId: true,
          createdById: true,
          lead: { select: { salesExecutiveId: true } }
        },
        take: 3
      });

      console.log(`  -> Found ${quotes.length} quotation(s):`, quotes.map(q => q.quotationNumber));
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
