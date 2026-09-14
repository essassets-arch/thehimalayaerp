const { PrismaClient } = require('@prisma/client');

const TARGET_SALES_MAPPING = [
  { key: 'Sales 1', email: 'sales1@himalayaerp.com', mobile: '9586040153' },
  { key: 'Sales 2', email: 'sales2@himalayaerp.com', mobile: '9998521843' },
  { key: 'Sales 3', email: 'sales3@himalayaerp.com', mobile: '9033516047' },
  { key: 'Sales 4', email: 'sales4@himalayaerp.com', mobile: '8488811682' },
  { key: 'Sales 5', email: 'sales5@himalayaerp.com', mobile: '9033731173' },
  { key: 'Sales 11', email: 'sales11@himalayaerp.com', mobile: '9033516048' },
  { key: 'Sales 12', email: 'sales12@himalayaerp.com', mobile: '8488811630' },
  { key: 'Sales 13', email: 'sales13@himalayaerp.com', mobile: '8488811619' },
  { key: 'Sales 14', email: 'sales14@himalayaerp.com', mobile: '9033516046' },
];

async function inspectDb(label, url) {
  console.log(`\n================ Inspecting ${label} ================`);
  const prisma = new PrismaClient({ datasources: { db: { url } } });
  try {
    const allSalesUsers = await prisma.user.findMany({
      where: {
        OR: [
          { email: { in: TARGET_SALES_MAPPING.map(m => m.email) } },
          { email: { contains: 'sales' } }
        ]
      },
      include: { employee: true }
    });

    console.log(`Found ${allSalesUsers.length} sales users in ${label}:`);
    for (const u of allSalesUsers) {
      console.log(`- ID: ${u.id} | Email: ${u.email} | Name: ${u.name} | Phone: ${u.employee?.phoneNumber} | CompanyPhone: ${u.employee?.companyPhoneNumber}`);
    }
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  await inspectDb('Docker DB (5435)', 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public');
  await inspectDb('Local DB (5432)', 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public');
}

main();
