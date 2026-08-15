const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const SIZES = [
  '300X700',
  '385X700',
  '450X600',
  '600X600',
  '350X1000',
  '450X1000',
  '600X1000',
  '600X720',
  '600X900',
];

const CLASSES = [
  { code: 'ELD', label: 'Extra Light Duty' },
  { code: 'LD', label: 'Light Duty' },
  { code: 'B125', label: 'Medium Duty (B125 Class - 12.5T)' },
  { code: 'C250', label: 'Heavy Duty (C250 Class - 25T)' },
  { code: 'D400', label: 'Extra Heavy Duty (D400 Class - 40T)' },
  { code: 'E600', label: 'Super Heavy Duty (E600 Class - 60T)' },
  { code: 'F900', label: 'Airport Heavy Duty (F900 Class - 90T)' },
];

function generateSku(name) {
  return name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().substring(0, 50);
}

function uid(prefix = 'PROD') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
}

const ONGC_PRODUCTS = [];

for (const size of SIZES) {
  for (const cls of CLASSES) {
    const name = `HIMALAYA FRP ONGC ${size} ${cls.code} SINGLE`;
    const sku = generateSku(name);
    ONGC_PRODUCTS.push({
      name,
      sku,
      brand: 'HIMALAYA',
      category: 'FRP COVERS',
      subCategory: 'ONGC Cover',
      productType: 'MANUFACTURING',
      dispatchCategory: 'D1',
      unit: 'SET',
      unitPrice: 0,
      gstRate: 18,
      hsnCode: '39259090',
      size,
      capacity: cls.code,
      type: 'SINGLE',
      coversPerSet: 1,
      framesPerSet: 1,
      description: `FRP ONGC Cover ${size}mm - ${cls.label} (Single Piece)`,
      isActive: true,
    });
  }
}

const DBS = [
  { name: 'Primary/Default DB', url: process.env.DATABASE_URL },
  { name: 'Docker DB (Port 5433)', url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5433/himalaya_erp?schema=public' },
  { name: 'Standalone DB (Port 5432)', url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public' },
].filter((db, idx, arr) => db.url && arr.findIndex(x => x.url === db.url) === idx);

async function main() {
  console.log('================================================================');
  console.log(` SEEDING ${ONGC_PRODUCTS.length} ONGC PRODUCTS (9 SIZES x 7 CLASSES SINGLE)`);
  console.log('================================================================\n');

  for (const db of DBS) {
    console.log(`Connecting to: ${db.name} ...`);
    let prisma;
    try {
      prisma = new PrismaClient({ datasources: { db: { url: db.url } } });
      const companies = await prisma.company.findMany();
      if (companies.length === 0) {
        console.log(`  [SKIP] No companies found in ${db.name}\n`);
        await prisma.$disconnect();
        continue;
      }

      for (const comp of companies) {
        console.log(`  Processing Company: ${comp.name} (${comp.id})`);
        let created = 0;
        let updated = 0;

        for (const p of ONGC_PRODUCTS) {
          const existing = await prisma.product.findFirst({
            where: {
              companyId: comp.id,
              OR: [
                { sku: p.sku },
                { name: p.name },
                { sku: `HIMALAYAFRPONGC${p.size}${p.capacity}SINGLE` },
                { name: `HIMALAYA FRPONGC ${p.size} ${p.capacity} SINGLE` },
                { name: `ONGC ${p.size} ${p.capacity} SINGLE` },
              ],
            },
          });

          if (!existing) {
            await prisma.product.create({
              data: {
                publicId: uid('PROD'),
                companyId: comp.id,
                name: p.name,
                sku: p.sku,
                brand: p.brand,
                category: p.category,
                productType: p.productType,
                dispatchCategory: p.dispatchCategory,
                unit: p.unit,
                unitPrice: p.unitPrice,
                gstRate: p.gstRate,
                hsnCode: p.hsnCode,
                size: p.size,
                capacity: p.capacity,
                type: p.type,
                coversPerSet: p.coversPerSet,
                framesPerSet: p.framesPerSet,
                description: p.description,
                isActive: true,
              },
            });
            created++;
          } else {
            await prisma.product.update({
              where: { id: existing.id },
              data: {
                name: p.name,
                sku: p.sku,
                brand: p.brand,
                category: p.category,
                productType: p.productType,
                dispatchCategory: p.dispatchCategory,
                unit: p.unit,
                gstRate: p.gstRate,
                hsnCode: p.hsnCode,
                size: p.size,
                capacity: p.capacity,
                type: p.type,
                coversPerSet: p.coversPerSet,
                framesPerSet: p.framesPerSet,
                description: p.description,
                isActive: true,
              },
            });
            updated++;
          }
        }
        console.log(`    ✓ Created: ${created}, Updated: ${updated}`);
      }
      console.log(`  [SUCCESS] Finished ${db.name}\n`);
    } catch (err) {
      console.error(`  [ERROR] Could not process ${db.name}:`, err.message);
    } finally {
      if (prisma) await prisma.$disconnect();
    }
  }
}

main().catch(console.error);
