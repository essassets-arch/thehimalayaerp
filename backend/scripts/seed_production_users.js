const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

const targetUsers = [
  { roleName: 'Dispatch Executive', email: 'hussain.lokhandwala@himalayaerp.com', password: 'Himalayacc@2025', roleCode: 'DISPATCH_EXECUTIVE', name: 'Hussain Lokhandwala' },
  { roleName: 'Sales Executive', email: 'trushna.gajjar@himalayaerp.com', password: 'Himalaya@3252', roleCode: 'SALES_EXECUTIVE', name: 'Trushna Gajjar' },
  { roleName: 'Finance Executive', email: 'sahad.accounts@himalayaerp.com', password: 'Hcppl@5253', roleCode: 'FINANCE_MANAGER', name: 'Sahad Accounts' },
  { roleName: 'Dispatch Executive', email: 'sahad.dispatch@himalayaerp.com', password: 'Sahad@5253', roleCode: 'DISPATCH_EXECUTIVE', name: 'Sahad Dispatch' },
  { roleName: 'Finance Executive', email: 'jyoti.pandey@himalayaerp.com', password: 'Jyoti@2258', roleCode: 'FINANCE_EXECUTIVE', name: 'Jyoti Pandey' },
  { roleName: 'Finance Executive', email: 'riya.vaghela@himalayaerp.com', password: 'ARHIMALAYA12', roleCode: 'FINANCE_EXECUTIVE', name: 'Riya Vaghela' },
  { roleName: 'Store Manager', email: 'abbas.baman@himalayaerp.com', password: 'dataAnalyst#2101', roleCode: 'STORE_MANAGER', name: 'Abbas Baman' },
  { roleName: 'Production Planner', email: 'moksha.naik@himalayaerp.com', password: 'Production@hcppl', roleCode: 'PRODUCTION_PLANNER', name: 'Moksha Naik' },
  { roleName: 'Dispatch Executive', email: 'ravikant.tiwari@himalayaerp.com', password: 'Logistics@hcppl', roleCode: 'DISPATCH_EXECUTIVE', name: 'Ravikant Tiwari' },
  { roleName: 'Store Manager', email: 'makhdum@himalayaerp.com', password: 'Store@hcppl', roleCode: 'STORE_MANAGER', name: 'Makhdum' },
  { roleName: 'QC Inspector', email: 'hussain.tinwala@himalayaerp.com', password: 'Rnd@hcppl', roleCode: 'QC_INSPECTOR', name: 'Hussain Tinwala' },
  { roleName: 'Plant Head', email: 'sana.reddy@himalayaerp.com', password: 'Himalaya@1234', roleCode: 'PLANT_HEAD', name: 'Sana Reddy' },
  { roleName: 'Sales Executive', email: 'sales1@himalayaerp.com', password: 'HimalayaSales#1', roleCode: 'SALES_EXECUTIVE', name: 'Sales Executive 1' },
  { roleName: 'Sales Executive', email: 'sales2@himalayaerp.com', password: 'HimalayaSales#2', roleCode: 'SALES_EXECUTIVE', name: 'Sales Executive 2' },
  { roleName: 'Sales Executive', email: 'sales3@himalayaerp.com', password: 'HimalayaSales#3', roleCode: 'SALES_EXECUTIVE', name: 'Sales Executive 3' },
  { roleName: 'Sales Executive', email: 'sales4@himalayaerp.com', password: 'HimalayaSales#4', roleCode: 'SALES_EXECUTIVE', name: 'Sales Executive 4' },
  { roleName: 'Sales Executive', email: 'sales5@himalayaerp.com', password: 'HimalayaSales#5', roleCode: 'SALES_EXECUTIVE', name: 'Sales Executive 5' },
  { roleName: 'Sales Executive', email: 'sales6@himalayaerp.com', password: 'HimalayaSales#6', roleCode: 'SALES_EXECUTIVE', name: 'Sales Executive 6' },
  { roleName: 'Sales Executive', email: 'sales7@himalayaerp.com', password: 'HimalayaSales#7', roleCode: 'SALES_EXECUTIVE', name: 'Sales Executive 7' },
  { roleName: 'Sales Manager', email: 'supersales1@himalayaerp.com', password: 'HimalayaSuperSales#1', roleCode: 'SUPER_SALES', name: 'Super Sales 1' },
  { roleName: 'Sales Manager', email: 'supersales2@himalayaerp.com', password: 'HimalayaSuperSales#2', roleCode: 'SUPER_SALES', name: 'Super Sales 2' },
];

function uid(prefix) {
  const bytes = require('crypto').randomBytes(8).toString('hex');
  return `${prefix}-${bytes}`;
}

async function main() {
  console.log('🚀 Seeding 21 requested user accounts with custom credentials...');

  const company = await prisma.company.findFirst();
  if (!company) {
    throw new Error('No company found in database. Please run primary seed first.');
  }

  const allRoles = await prisma.role.findMany();
  const roleMap = Object.fromEntries(allRoles.map((r) => [r.code, r.id]));

  for (const u of targetUsers) {
    const roleId = roleMap[u.roleCode];
    if (!roleId) {
      console.warn(`⚠️ Role code ${u.roleCode} not found for ${u.email}`);
      continue;
    }

    const hashedPassword = await bcrypt.hash(u.password, 12);

    await prisma.user.upsert({
      where: { email: u.email },
      update: {
        password: hashedPassword,
        roleId,
        name: u.name,
        isActive: true,
        failedLoginAttempts: 0,
        lockedUntil: null,
        deletedAt: null,
      },
      create: {
        publicId: uid('USR'),
        email: u.email,
        password: hashedPassword,
        name: u.name,
        roleId,
        companyId: company.id,
        isActive: true,
      },
    });

    console.log(`✅ Provisioned: ${u.email} (${u.roleName})`);
  }

  console.log('🎉 Successfully seeded all 21 user accounts!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding users:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
