const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const permissionCodes = [
  'production.workorder.read',
  'sales.orders.read',
  'dispatch.create',
  'dispatch.read',
  'dispatch.update',
];

async function main() {
  const role = await prisma.role.findUnique({
    where: { code: 'DISPATCH_EXECUTIVE' },
  });
  if (!role) {
    throw new Error('DISPATCH_EXECUTIVE role not found');
  }

  const permissions = await prisma.permission.findMany({
    where: { code: { in: permissionCodes } },
  });
  const foundCodes = new Set(permissions.map((permission) => permission.code));
  const missingCodes = permissionCodes.filter((code) => !foundCodes.has(code));
  if (missingCodes.length > 0) {
    throw new Error(`Missing permission definitions: ${missingCodes.join(', ')}`);
  }

  for (const permission of permissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: role.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: role.id,
        permissionId: permission.id,
      },
    });
  }

  console.log(`Granted ${permissions.length} permissions to DISPATCH_EXECUTIVE`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
