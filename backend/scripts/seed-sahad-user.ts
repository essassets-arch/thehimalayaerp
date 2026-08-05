import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Sahad Finance Manager User...');

  const email = 'sahad.accounts@himalayaerp.com';
  const rawPassword = 'Hcpp1@5253';
  const hashedPassword = await bcrypt.hash(rawPassword, 12);

  // Find existing company or fallback
  const company = await prisma.company.findFirst();
  if (!company) {
    throw new Error('No company found in database. Run main seed first.');
  }

  // Find or verify FINANCE_MANAGER role
  let role = await prisma.role.findFirst({
    where: { code: 'FINANCE_MANAGER' },
  });

  if (!role) {
    role = await prisma.role.create({
      data: {
        publicId: 'ROLE-FINANCE-MANAGER',
        code: 'FINANCE_MANAGER',
        name: 'Finance Manager',
      },
    });
  }

  // Create or update user
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      roleId: role.id,
      isActive: true,
    },
    create: {
      publicId: 'USR-SAHAD-FINANCE',
      email,
      password: hashedPassword,
      name: 'Sahad Accounts',
      roleId: role.id,
      companyId: company.id,
      isActive: true,
    },
    include: {
      role: true,
    },
  });

  console.log(`✅ Successfully created/updated Finance Manager user!`);
  console.log(`Email: ${user.email}`);
  console.log(`Role: ${user.role.name} (${user.role.code})`);
  console.log(`Target Dashboard: https://thehimalaya.cloud/finance/dashboard`);
}

main()
  .catch((e) => {
    console.error('Error seeding user:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
