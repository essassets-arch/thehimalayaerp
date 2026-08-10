const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

const PRODUCTS_TO_ADD = [
  {
    name: 'HIMALAYA FRP MHC 1800X1800 LD',
    sku: 'HIMALAYAFRPMHC1800X1800LD',
    brand: 'HIMALAYA',
    category: 'FRP COVERS',
    subCategory: 'Manhole Cover',
    description: 'FRP Manhole Cover 1800x1800mm - Light Duty',
    unit: 'SET',
    unitPrice: 0,
    productType: 'MANUFACTURING',
    hsnCode: '39259090',
    dispatchCategory: 'D1'
  },
  {
    name: 'HIMALAYA FRP MHC 1800X1800 ELD',
    sku: 'HIMALAYAFRPMHC1800X1800ELD',
    brand: 'HIMALAYA',
    category: 'FRP COVERS',
    subCategory: 'Manhole Cover',
    description: 'FRP Manhole Cover 1800x1800mm - Extra Light Duty',
    unit: 'SET',
    unitPrice: 0,
    productType: 'MANUFACTURING',
    hsnCode: '39259090',
    dispatchCategory: 'D1'
  },
  {
    name: 'HIMALAYA FRP MHC 1800X1800 B125',
    sku: 'HIMALAYAFRPMHC1800X1800B125',
    brand: 'HIMALAYA',
    category: 'FRP COVERS',
    subCategory: 'Manhole Cover',
    description: 'FRP Manhole Cover 1800x1800mm - B125 Class',
    unit: 'SET',
    unitPrice: 0,
    productType: 'MANUFACTURING',
    hsnCode: '39259090',
    dispatchCategory: 'D1'
  },
  {
    name: 'HIMALAYA FRP MHC 1800X1800 C250',
    sku: 'HIMALAYAFRPMHC1800X1800C250',
    brand: 'HIMALAYA',
    category: 'FRP COVERS',
    subCategory: 'Manhole Cover',
    description: 'FRP Manhole Cover 1800x1800mm - C250 Class',
    unit: 'SET',
    unitPrice: 0,
    productType: 'MANUFACTURING',
    hsnCode: '39259090',
    dispatchCategory: 'D1'
  },
  {
    name: 'HIMALAYA FRP MHC 1800X1800 D400',
    sku: 'HIMALAYAFRPMHC1800X1800D400',
    brand: 'HIMALAYA',
    category: 'FRP COVERS',
    subCategory: 'Manhole Cover',
    description: 'FRP Manhole Cover 1800x1800mm - D400 Class',
    unit: 'SET',
    unitPrice: 0,
    productType: 'MANUFACTURING',
    hsnCode: '39259090',
    dispatchCategory: 'D1'
  },
  {
    name: 'FRPMHCLD 1800X1800',
    sku: 'FRPMHCLD1800X1800',
    brand: 'HIMALAYA',
    category: 'FRP COVER',
    subCategory: 'Manhole Cover Basic LD',
    description: 'FRP Manhole Cover Light Duty 1800x1800',
    unit: 'SET',
    unitPrice: 0,
    productType: 'MANUFACTURING',
    hsnCode: '39259090',
    dispatchCategory: 'D1'
  },
  {
    name: 'FRPMHCELD 1800X1800',
    sku: 'FRPMHCELD1800X1800',
    brand: 'HIMALAYA',
    category: 'FRP COVER',
    subCategory: 'Manhole Cover Basic ELD',
    description: 'FRP Manhole Cover Extra Light Duty 1800x1800',
    unit: 'SET',
    unitPrice: 0,
    productType: 'MANUFACTURING',
    hsnCode: '39259090',
    dispatchCategory: 'D1'
  }
];

async function run() {
  const companies = await prisma.company.findMany();
  console.log(`Found ${companies.length} companies.`);

  let createdCount = 0;
  let skippedCount = 0;

  for (const comp of companies) {
    for (const p of PRODUCTS_TO_ADD) {
      const existing = await prisma.product.findFirst({
        where: {
          companyId: comp.id,
          OR: [
            { sku: p.sku },
            { name: p.name }
          ]
        }
      });

      if (existing) {
        skippedCount++;
        console.log(`[SKIP] Company ${comp.name}: Product ${p.name} already exists (ID: ${existing.id})`);
      } else {
        const randomId = crypto.randomBytes(5).toString('hex');
        const created = await prisma.product.create({
          data: {
            publicId: `PRD-${randomId}`,
            companyId: comp.id,
            name: p.name,
            sku: p.sku,
            description: p.description,
            category: p.category,
            productType: p.productType,
            brand: p.brand,
            dispatchCategory: p.dispatchCategory,
            hsnCode: p.hsnCode,
            unit: p.unit,
            unitPrice: p.unitPrice,
            minimumStock: 0,
            isActive: true,
          }
        });
        createdCount++;
        console.log(`[CREATED] Company ${comp.name}: Created Product ${created.name} (ID: ${created.id})`);
      }
    }
  }

  console.log(`\nSummary: ${createdCount} created, ${skippedCount} skipped.`);
}

run()
  .catch(err => {
    console.error('Error adding products:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
