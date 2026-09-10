const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function main() {
  const matches = JSON.parse(fs.readFileSync('scratch/parsed_matches.json', 'utf8'));

  const allProducts = await prisma.product.findMany();
  const dbByName = new Map();
  const dbByCleanName = new Map();

  allProducts.forEach(p => {
    if (p.name) {
      dbByName.set(p.name.trim().toUpperCase(), p);
      dbByCleanName.set(p.name.replace(/[^A-Z0-9]/gi, '').toUpperCase(), p);
    }
  });

  const matched = [];
  matches.forEach(m => {
    const norm = m.trim().toUpperCase();
    const clean = norm.replace(/[^A-Z0-9]/g, '');
    const p = dbByName.get(norm) || dbByCleanName.get(clean);
    if (p) matched.push({ input: m, product: p });
  });

  console.log('Sample matched products:', matched.slice(0, 5).map(x => ({
    input: x.input,
    dbName: x.product.name,
    sku: x.product.sku,
    category: x.product.category,
    productType: x.product.productType,
    brand: x.product.brand,
    dispatchCategory: x.product.dispatchCategory,
    unit: x.product.unit,
    isActive: x.product.isActive
  })));
}

main().catch(console.error).finally(() => prisma.$disconnect());
