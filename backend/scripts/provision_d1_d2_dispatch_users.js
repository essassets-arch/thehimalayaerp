const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function provisionDispatchUsers() {
  console.log('🚀 Provisioning D1 and D2 Dispatch Users...');

  // 1. Configure Ravikant Tiwari as Dispatch 1 (D1)
  const d1User = await prisma.user.findFirst({
    where: { email: { equals: 'ravikant.tiwari@himalayaerp.com', mode: 'insensitive' } },
  });

  if (d1User) {
    await prisma.user.update({
      where: { id: d1User.id },
      data: { dispatchCategory: 'D1', isActive: true },
    });
    console.log('  ✓ Configured Ravikant Tiwari (ravikant.tiwari@himalayaerp.com) -> Dispatch 1 (D1)');
  } else {
    console.error('  ❌ Ravikant Tiwari user account not found!');
  }

  // 2. Configure Sahad Mansuri as Dispatch 2 (D2)
  const d2User = await prisma.user.findFirst({
    where: { email: { equals: 'sahad.dispatch@himalayaerp.com', mode: 'insensitive' } },
  });

  if (d2User) {
    await prisma.user.update({
      where: { id: d2User.id },
      data: { dispatchCategory: 'D2', isActive: true },
    });
    console.log('  ✓ Configured Sahad Mansuri (sahad.dispatch@himalayaerp.com) -> Dispatch 2 (D2)');
  } else {
    console.error('  ❌ Sahad Mansuri user account not found!');
  }

  // 3. Deactivate surplus dispatch users
  const dispatchExecRole = await prisma.role.findFirst({
    where: { code: 'DISPATCH_EXECUTIVE' },
  });

  if (dispatchExecRole) {
    const surplusUsers = await prisma.user.updateMany({
      where: {
        roleId: dispatchExecRole.id,
        email: {
          notIn: [
            'ravikant.tiwari@himalayaerp.com',
            'sahad.dispatch@himalayaerp.com',
          ],
          mode: 'insensitive',
        },
      },
      data: { isActive: false },
    });
    console.log(`  ✓ Deactivated ${surplusUsers.count} surplus dispatch executive accounts.`);
  }

  // 4. Backfill existing Dispatch records with dispatchCategory based on products
  const dispatches = await prisma.dispatch.findMany({
    include: {
      items: {
        include: {
          salesOrderItem: {
            include: {
              product: true,
            },
          },
        },
      },
    },
  });

  let backfilledCount = 0;
  for (const d of dispatches) {
    const firstProduct = d.items?.[0]?.salesOrderItem?.product;
    const cat = firstProduct?.dispatchCategory || 'D1';
    if (!d.dispatchCategory || d.dispatchCategory !== cat) {
      await prisma.dispatch.update({
        where: { id: d.id },
        data: { dispatchCategory: cat },
      });
      backfilledCount++;
    }
  }

  console.log(`  ✓ Backfilled ${backfilledCount} dispatch records with D1/D2 category.`);

  // 5. Verification listing
  const activeDispatchUsers = await prisma.user.findMany({
    where: {
      role: { code: 'DISPATCH_EXECUTIVE' },
      isActive: true,
    },
    include: { role: true },
  });

  console.log('\n========================================');
  console.log('ACTIVE DISPATCH EXECUTIVES IN SYSTEM:');
  activeDispatchUsers.forEach((u) => {
    console.log(`  - ${u.name} (${u.email}) -> Role: ${u.role.name}, DispatchCategory: ${u.dispatchCategory}`);
  });
  console.log('========================================\n');
}

provisionDispatchUsers()
  .catch((e) => {
    console.error('Error provisioning dispatch users:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
