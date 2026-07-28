import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Roles to seed
  const roles = [
    'SUPER_ADMIN',
    'ADMIN',
    'SALES',
    'SALES_ADMIN',
    'PLANT_HEAD',
    'PRODUCTION',
    'STORE',
    'QC',
    'DISPATCH',
    'FINANCE',
    'FINANCE_EXECUTIVE',
    'HR',
  ];

  for (const roleCode of roles) {
    await prisma.role.upsert({
      where: { code: roleCode },
      update: {},
      create: {
        publicId: `ROLE-${roleCode}`,
        name: roleCode.replace(/_/g, ' '),
        code: roleCode,
      },
    });
  }

  // Base Permissions
  const permissions = [
    'customer.read',
    'customer.create',
    'customer.update',
    'lead.read',
    'lead.create',
    'lead.update',
    // Sales Order permissions
    'sales.orders.read',
    'sales.orders.create',
    'sales.orders.update',
    'sales.orders.confirm',
    'sales.orders.send_to_plant',
    'sales.orders.cancel',
    'sales.credit.override',
  ];

  for (const permCode of permissions) {
    await prisma.permission.upsert({
      where: { code: permCode },
      update: {},
      create: {
        publicId: `PERM-${permCode}`,
        name: permCode,
        code: permCode,
      },
    });
  }

  // Default Company
  const company = await prisma.company.upsert({
    where: { publicId: 'COMP-000001' },
    update: {},
    create: {
      publicId: 'COMP-000001',
      name: 'Himalaya Wellness',
    },
  });

  // Assign all permissions to all roles for the prototype
  const allRoles = await prisma.role.findMany();
  const allPerms = await prisma.permission.findMany();
  
  for (const r of allRoles) {
    for (const p of allPerms) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: r.id,
            permissionId: p.id,
          }
        },
        update: {},
        create: {
          roleId: r.id,
          permissionId: p.id,
        }
      });
    }
  }

  // Users
  const hashedPassword = await bcrypt.hash('admin123', 12);

  for (const role of allRoles) {
    const emailPrefix = role.code.toLowerCase().replace(/_/g, '-');
    const email = `${emailPrefix}@himalayaerp.com`;
    
    await prisma.user.upsert({
      where: { email },
      update: { password: hashedPassword },
      create: {
        publicId: await prisma.$transaction(async (tx) => {
          // Since we might not have the DB utility here easily, just use role-based ID
          return `USER-${role.code}`;
        }),
        email,
        password: hashedPassword,
        name: `${role.name} User`,
        roleId: role.id,
        companyId: company.id,
      },
    });
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
