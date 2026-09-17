const { PrismaClient } = require('@prisma/client');

async function auditIntegrity() {
  const pLocal = new PrismaClient({
    datasources: { db: { url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public' } }
  });
  const pDocker = new PrismaClient({
    datasources: { db: { url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public' } }
  });

  console.log('=== DATABASE INTEGRITY AUDIT ===\n');

  for (const [name, p] of [['Local Test DB (5432)', pLocal], ['Docker DB (5435)', pDocker]]) {
    console.log(`--- Auditing ${name} ---`);
    const usersCount = await p.user.count();
    const activeUsers = await p.user.count({ where: { isActive: true } });
    const rolesCount = await p.role.count();
    const permissionsCount = await p.permission.count();
    const productsCount = await p.product.count();
    const activeProducts = await p.product.count({ where: { isActive: true } });
    const stockHistoryCount = await p.stockHistory.count();
    const productionReportsCount = await p.productionDailyReport.count();
    const workOrdersCount = await p.workOrder.count();
    const dispatchesCount = await p.dispatch.count();
    const quotationsCount = await p.quotation.count();

    console.log(`  Users: ${usersCount} (Active: ${activeUsers})`);
    console.log(`  Roles: ${rolesCount}, Permissions: ${permissionsCount}`);
    console.log(`  Products: ${productsCount} (Active: ${activeProducts})`);
    console.log(`  Stock History Records: ${stockHistoryCount}`);
    console.log(`  Production Reports: ${productionReportsCount}`);
    console.log(`  Work Orders: ${workOrdersCount}`);
    console.log(`  Dispatches: ${dispatchesCount}`);
    console.log(`  Quotations: ${quotationsCount}`);

    // Check FRCCP24x24 HD20
    const frccp = await p.product.findFirst({
      where: {
        OR: [
          { name: 'FRCCP24x24 HD20' },
          { sku: 'FRCCP24X24HD20' }
        ]
      },
      select: { id: true, name: true, sku: true, componentType: true, coversPerSet: true, framesPerSet: true }
    });
    console.log(`  FRCCP24x24 HD20 config:`, frccp);

    // Check missing composition products (products where coversPerSet is null/zero)
    const missingComp = await p.product.count({
      where: {
        OR: [{ coversPerSet: null }, { framesPerSet: null }, { coversPerSet: 0 }, { framesPerSet: 0 }],
        isActive: true
      }
    });
    console.log(`  Active products with unconfigured / missing composition: ${missingComp}`);
    console.log('');
  }

  await pLocal.$disconnect();
  await pDocker.$disconnect();
}

auditIntegrity().catch(console.error);
