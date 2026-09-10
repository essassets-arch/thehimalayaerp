const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function main() {
  const matches = JSON.parse(fs.readFileSync('scratch/parsed_matches.json', 'utf8'));
  console.log(`Total parsed items from user request: ${matches.length}`);

  const allProducts = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      sku: true,
      category: true,
      productType: true,
      brand: true,
      dispatchCategory: true,
      size: true,
      type: true,
      capacity: true
    }
  });

  console.log(`Total existing products in database: ${allProducts.length}`);

  const dbByName = new Map();
  const dbBySku = new Map();
  const dbByCleanName = new Map();

  allProducts.forEach(p => {
    if (p.name) {
      dbByName.set(p.name.trim().toUpperCase(), p);
      dbByCleanName.set(p.name.replace(/[^A-Z0-9]/gi, '').toUpperCase(), p);
    }
    if (p.sku) {
      dbBySku.set(p.sku.trim().toUpperCase(), p);
    }
  });

  let exactNameMatches = 0;
  let cleanNameMatches = 0;
  let missing = [];

  matches.forEach(m => {
    const norm = m.trim().toUpperCase();
    const clean = norm.replace(/[^A-Z0-9]/g, '');

    if (dbByName.has(norm)) {
      exactNameMatches++;
    } else if (dbByCleanName.has(clean)) {
      cleanNameMatches++;
    } else {
      missing.push({ original: m, norm, clean });
    }
  });

  console.log(`Matches by exact name: ${exactNameMatches}`);
  console.log(`Matches by clean name: ${cleanNameMatches}`);
  console.log(`Missing from DB: ${missing.length}`);

  if (missing.length > 0) {
    console.log('First 10 missing items:', missing.slice(0, 10));
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
