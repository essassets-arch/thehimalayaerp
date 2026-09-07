const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prismaTest = new PrismaClient({ datasources: { db: { url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public' } } });
const prismaMain = new PrismaClient({ datasources: { db: { url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp?schema=public' } } });

(async () => {
  const testProds = await prismaTest.product.findMany();
  const mainProds = await prismaMain.product.findMany();
  console.log('Test DB prods count:', testProds.length);
  console.log('Main DB prods count:', mainProds.length);

  const mainProdSkus = new Set(mainProds.map(p => p.sku));
  const mainProdNames = new Set(mainProds.map(p => p.name));

  // Find products in test DB that are NOT in main DB
  const missingInMain = testProds.filter(p => !mainProdSkus.has(p.sku));
  console.log('Missing in main DB count:', missingInMain.length);
  console.log('First 20 missing:', missingInMain.slice(0, 20).map(p => ({ sku: p.sku, name: p.name, category: p.category })));

  await prismaTest.$disconnect();
  await prismaMain.$disconnect();
})();
