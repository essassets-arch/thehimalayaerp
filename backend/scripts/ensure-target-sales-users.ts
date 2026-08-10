import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const TARGET_USERS_DEF = [
  { email: 'supersales1@himalayaerp.com', pass: 'HimalayaSuperSales#1', name: 'Super Sales 1', roleCode: 'SUPER_SALES' },
  { email: 'supersales2@himalayaerp.com', pass: 'HimalayaSuperSales#2', name: 'Super Sales 2', roleCode: 'SUPER_SALES' },
  { email: 'sales1@himalayaerp.com', pass: 'HimalayaSales#1', name: 'Sales Executive 1', roleCode: 'SALES_EXECUTIVE' },
  { email: 'sales2@himalayaerp.com', pass: 'HimalayaSales#2', name: 'Sales Executive 2', roleCode: 'SALES_EXECUTIVE' },
  { email: 'sales3@himalayaerp.com', pass: 'HimalayaSales#3', name: 'Sales Executive 3', roleCode: 'SALES_EXECUTIVE' },
  { email: 'sales4@himalayaerp.com', pass: 'HimalayaSales#4', name: 'Sales Executive 4', roleCode: 'SALES_EXECUTIVE' },
  { email: 'sales5@himalayaerp.com', pass: 'HimalayaSales#5', name: 'Sales Executive 5', roleCode: 'SALES_EXECUTIVE' },
  { email: 'sales6@himalayaerp.com', pass: 'HimalayaSales#6', name: 'Sales Executive 6', roleCode: 'SALES_EXECUTIVE' },
  { email: 'sales7@himalayaerp.com', pass: 'HimalayaSales#7', name: 'Sales Executive 7', roleCode: 'SALES_EXECUTIVE' },
];

async function main() {
  console.log('Ensuring 9 target Sales / SuperSales accounts exist in DB...');

  let company = await prisma.company.findFirst();
  if (!company) {
    company = await prisma.company.create({
      data: {
        publicId: 'COMP-HIMALAYA-MAIN',
        name: 'Himalaya ERP Company',
      },
    });
  }

  for (const uDef of TARGET_USERS_DEF) {
    let role = await prisma.role.findUnique({ where: { code: uDef.roleCode } });
    if (!role) {
      role = await prisma.role.create({
        data: {
          publicId: `ROLE-${uDef.roleCode}`,
          code: uDef.roleCode,
          name: uDef.roleCode === 'SUPER_SALES' ? 'SuperSales' : 'Sales Executive',
        },
      });
    }

    const passwordHash = await bcrypt.hash(uDef.pass, 10);

    const user = await prisma.user.upsert({
      where: { email: uDef.email },
      update: {
        name: uDef.name,
        password: passwordHash,
        roleId: role.id,
        companyId: company.id,
        isActive: true,
      },
      create: {
        publicId: `USER-${uDef.email.split('@')[0]}-${Date.now()}`,
        email: uDef.email,
        name: uDef.name,
        password: passwordHash,
        roleId: role.id,
        companyId: company.id,
        isActive: true,
      },
    });

    console.log(`✓ Provisioned: ${user.email} (${uDef.roleCode}) -> ID: ${user.id}`);
  }

  console.log('Target account provisioning completed successfully.');
}

main()
  .catch(err => {
    console.error('Provisioning failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
