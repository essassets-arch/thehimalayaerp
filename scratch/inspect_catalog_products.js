const { PrismaClient } = require('@prisma/client');

async function inspectDb(name, url) {
  try {
    const p = new PrismaClient({ datasources: { db: { url } } });
    await p.$connect();
    const total = await p.product.count();
    const active = await p.product.count({ where: { isActive: true } });
    const mfg = await p.product.count({ where: { productType: 'MANUFACTURING', isActive: true } });
    const trading = await p.product.count({ where: { productType: 'TRADING', isActive: true } });
    const sample = await p.product.findMany({ where: { isActive: true }, take: 5, select: { id: true, name: true, sku: true, productType: true } });
    console.log(`\n--- ${name} ---`);
    console.log(`Total: ${total}, Active: ${active}, MFG Active: ${mfg}, Trading Active: ${trading}`);
    console.log('Sample items:', sample);
    await p.$disconnect();
  } catch (err) {
    console.error(`Error with ${name}:`, err.message);
  }
}

async function main() {
  await inspectDb('Port 5435', 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public');
  await inspectDb('Port 5432', 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public');
}

main();
