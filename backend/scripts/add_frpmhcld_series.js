const { PrismaClient } = require('@prisma/client');

const productsToAdd = [
  { name: 'FRPMHCLD 10X10', sku: 'FRPMHCLD10X10', description: 'FRP Manhole Cover Light Duty 10x10' },
  { name: 'FRPMHCLD 12X12', sku: 'FRPMHCLD12X12', description: 'FRP Manhole Cover Light Duty 12x12' },
  { name: 'FRPMHCLD 15X15', sku: 'FRPMHCLD15X15', description: 'FRP Manhole Cover Light Duty 15x15' },
  { name: 'FRPMHCLD 18X18', sku: 'FRPMHCLD18X18', description: 'FRP Manhole Cover Light Duty 18x18' },
  { name: 'FRPMHCLD 18X24', sku: 'FRPMHCLD18X24', description: 'FRP Manhole Cover Light Duty 18x24' },
  { name: 'FRPMHCLD 21X21', sku: 'FRPMHCLD21X21', description: 'FRP Manhole Cover Light Duty 21x21' },
  { name: 'FRPMHCLD 24X24', sku: 'FRPMHCLD24X24', description: 'FRP Manhole Cover Light Duty 24x24' },
  { name: 'FRPMHCLD 28X28', sku: 'FRPMHCLD28X28', description: 'FRP Manhole Cover Light Duty 28x28' },
  { name: 'FRPMHCLD 30X30', sku: 'FRPMHCLD30X30', description: 'FRP Manhole Cover Light Duty 30x30' },
  { name: 'FRPMHCLD 36X36', sku: 'FRPMHCLD36X36', description: 'FRP Manhole Cover Light Duty 36x36' },
];

const dbs = [
  { name: 'Docker DB (Port 5433)', url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5433/himalaya_erp?schema=public' },
  { name: 'Standalone DB (Port 5432)', url: process.env.DATABASE_URL || 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public' },
];

async function main() {
  for (const db of dbs) {
    console.log(`\n===============================================================`);
    console.log(` ADDING FRPMHCLD PRODUCTS TO DATABASE: ${db.name}`);
    console.log(`===============================================================\n`);

    const prisma = new PrismaClient({ datasources: { db: { url: db.url } } });

    try {
      const company = await prisma.company.findFirst();
      const companyId = company ? company.id : 'd039cfa4-e78b-4138-adfc-1b0f14cffa91';

      for (const p of productsToAdd) {
        const existing = await prisma.product.findFirst({
          where: {
            OR: [
              { name: { equals: p.name, mode: 'insensitive' } },
              { sku: { equals: p.sku, mode: 'insensitive' } },
            ],
          },
        });

        if (existing) {
          await prisma.product.update({
            where: { id: existing.id },
            data: {
              name: p.name,
              sku: p.sku,
              brand: 'HIMALAYA',
              category: 'FRP COVER',
              dispatchCategory: 'D1',
              unit: 'SET',
              unitPrice: 0,
              isActive: true,
              description: p.description,
            },
          });
          console.log(`  [UPDATED] ${p.name} (${existing.id})`);
        } else {
          const created = await prisma.product.create({
            data: {
              publicId: `PROD-${p.sku}`,
              sku: p.sku,
              name: p.name,
              brand: 'HIMALAYA',
              category: 'FRP COVER',
              dispatchCategory: 'D1',
              hsnCode: '39259090',
              unit: 'SET',
              unitPrice: 0,
              isActive: true,
              description: p.description,
              companyId: companyId,
            },
          });
          console.log(`  [CREATED] ${p.name} (${created.id})`);
        }
      }

      console.log('\n  [PASS] All 10 FRPMHCLD products seeded/upserted successfully.');

    } catch (e) {
      console.error(`Error populating products in ${db.name}:`, e.message);
    } finally {
      await prisma.$disconnect();
    }
  }
}

main();
