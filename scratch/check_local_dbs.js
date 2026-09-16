const { PrismaClient } = require('@prisma/client');

async function testLocalDb() {
  const dbs = [
    { name: 'Port 5435 (Docker himalaya_erp)', url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public' },
    { name: 'Port 5432 (Local himalaya_erp_browser_test)', url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public' }
  ];

  for (const db of dbs) {
    console.log(`\nChecking ${db.name}...`);
    try {
      const p = new PrismaClient({ datasources: { db: { url: db.url } } });
      await p.$connect();
      const rmCount = await p.rawMaterial.count();
      const itCount = await p.inventoryTransaction.count();
      const prodRmCount = await p.product.count({ where: { productType: 'RAW_MATERIAL' } });
      console.log(`  RawMaterial count: ${rmCount}`);
      console.log(`  InventoryTransaction count: ${itCount}`);
      console.log(`  Product (RAW_MATERIAL) count: ${prodRmCount}`);
      await p.$disconnect();
    } catch (e) {
      console.log(`  Could not connect: ${e.message}`);
    }
  }
}

testLocalDb().catch(console.error);
