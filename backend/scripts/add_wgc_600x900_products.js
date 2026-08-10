const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const dbs = [
  { name: 'Primary/Default DB', url: process.env.DATABASE_URL },
  { name: 'Docker DB (Port 5433)', url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5433/himalaya_erp?schema=public' },
  { name: 'Standalone DB (Port 5432)', url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public' },
];

const PRODUCTS_TO_ADD = [
  // Canonical Standard Names
  {
    name: 'HIMALAYA FRP WGC 600X900 ELD',
    sku: 'HIMALAYAFRPWGC600X900ELD',
    brand: 'HIMALAYA',
    category: 'FRP COVERS',
    subCategory: 'With Grate Cover',
    description: 'FRP With Grate Cover 600x900mm - Extra Light Duty',
    unit: 'SET',
    unitPrice: 0,
    productType: 'MANUFACTURING',
    hsnCode: '39259090',
    dispatchCategory: 'D1'
  },
  {
    name: 'HIMALAYA FRP WGC 600X900 LD',
    sku: 'HIMALAYAFRPWGC600X900LD',
    brand: 'HIMALAYA',
    category: 'FRP COVERS',
    subCategory: 'With Grate Cover',
    description: 'FRP With Grate Cover 600x900mm - Light Duty',
    unit: 'SET',
    unitPrice: 0,
    productType: 'MANUFACTURING',
    hsnCode: '39259090',
    dispatchCategory: 'D1'
  },
  {
    name: 'HIMALAYA FRP WGC 600X900 B125',
    sku: 'HIMALAYAFRPWGC600X900B125',
    brand: 'HIMALAYA',
    category: 'FRP COVERS',
    subCategory: 'With Grate Cover',
    description: 'FRP With Grate Cover 600x900mm - B125 Class',
    unit: 'SET',
    unitPrice: 0,
    productType: 'MANUFACTURING',
    hsnCode: '39259090',
    dispatchCategory: 'D1'
  },
  {
    name: 'HIMALAYA FRP WGC 600X900 C250',
    sku: 'HIMALAYAFRPWGC600X900C250',
    brand: 'HIMALAYA',
    category: 'FRP COVERS',
    subCategory: 'With Grate Cover',
    description: 'FRP With Grate Cover 600x900mm - C250 Class',
    unit: 'SET',
    unitPrice: 0,
    productType: 'MANUFACTURING',
    hsnCode: '39259090',
    dispatchCategory: 'D1'
  },
  {
    name: 'HIMALAYA FRP WGC 600X900 D400',
    sku: 'HIMALAYAFRPWGC600X900D400',
    brand: 'HIMALAYA',
    category: 'FRP COVERS',
    subCategory: 'With Grate Cover',
    description: 'FRP With Grate Cover 600x900mm - D400 Class',
    unit: 'SET',
    unitPrice: 0,
    productType: 'MANUFACTURING',
    hsnCode: '39259090',
    dispatchCategory: 'D1'
  },

  // Direct User Specific Formats & Aliases
  {
    name: 'Himalaya wgc eld 600x900',
    sku: 'HIMALAYAWGCELD600X900',
    brand: 'HIMALAYA',
    category: 'FRP COVERS',
    subCategory: 'With Grate Cover ELD',
    description: 'FRP With Grate Cover 600x900mm Extra Light Duty',
    unit: 'SET',
    unitPrice: 0,
    productType: 'MANUFACTURING',
    hsnCode: '39259090',
    dispatchCategory: 'D1'
  },
  {
    name: 'Himalaya wgc ld 600x900',
    sku: 'HIMALAYAWGCLD600X900',
    brand: 'HIMALAYA',
    category: 'FRP COVERS',
    subCategory: 'With Grate Cover LD',
    description: 'FRP With Grate Cover 600x900mm Light Duty',
    unit: 'SET',
    unitPrice: 0,
    productType: 'MANUFACTURING',
    hsnCode: '39259090',
    dispatchCategory: 'D1'
  },
  {
    name: 'Himalaya wgc b125 600x900',
    sku: 'HIMALAYAWGCB125600X900',
    brand: 'HIMALAYA',
    category: 'FRP COVERS',
    subCategory: 'With Grate Cover B125',
    description: 'FRP With Grate Cover 600x900mm B125 Class',
    unit: 'SET',
    unitPrice: 0,
    productType: 'MANUFACTURING',
    hsnCode: '39259090',
    dispatchCategory: 'D1'
  },
  {
    name: 'Himalaya wgc c250 600x900',
    sku: 'HIMALAYAWGCC250600X900',
    brand: 'HIMALAYA',
    category: 'FRP COVERS',
    subCategory: 'With Grate Cover C250',
    description: 'FRP With Grate Cover 600x900mm C250 Class',
    unit: 'SET',
    unitPrice: 0,
    productType: 'MANUFACTURING',
    hsnCode: '39259090',
    dispatchCategory: 'D1'
  },
  {
    name: 'Himalaya wgc d400 600x900',
    sku: 'HIMALAYAWGCD400600X900',
    brand: 'HIMALAYA',
    category: 'FRP COVERS',
    subCategory: 'With Grate Cover D400',
    description: 'FRP With Grate Cover 600x900mm D400 Class',
    unit: 'SET',
    unitPrice: 0,
    productType: 'MANUFACTURING',
    hsnCode: '39259090',
    dispatchCategory: 'D1'
  },
  {
    name: 'FRPWGCELD 600X900',
    sku: 'FRPWGCELD600X900',
    brand: 'HIMALAYA',
    category: 'FRP COVER',
    subCategory: 'With Grate Cover Basic ELD',
    description: 'FRP With Grate Cover Extra Light Duty 600x900',
    unit: 'SET',
    unitPrice: 0,
    productType: 'MANUFACTURING',
    hsnCode: '39259090',
    dispatchCategory: 'D1'
  },
  {
    name: 'FRPWGCLD 600X900',
    sku: 'FRPWGCLD600X900',
    brand: 'HIMALAYA',
    category: 'FRP COVER',
    subCategory: 'With Grate Cover Basic LD',
    description: 'FRP With Grate Cover Light Duty 600x900',
    unit: 'SET',
    unitPrice: 0,
    productType: 'MANUFACTURING',
    hsnCode: '39259090',
    dispatchCategory: 'D1'
  }
];

async function main() {
  const triedUrls = new Set();

  for (const dbInfo of dbs) {
    if (!dbInfo.url || triedUrls.has(dbInfo.url)) continue;
    triedUrls.add(dbInfo.url);

    console.log(`\n===============================================================`);
    console.log(` POPULATING WGC 600X900 PRODUCTS IN DATABASE: ${dbInfo.name}`);
    console.log(`===============================================================\n`);

    const prisma = new PrismaClient({ datasources: { db: { url: dbInfo.url } } });

    try {
      const companies = await prisma.company.findMany();
      if (!companies || companies.length === 0) {
        console.log(`No companies found in database ${dbInfo.name}`);
        await prisma.$disconnect();
        continue;
      }

      console.log(`Found ${companies.length} company/companies.`);

      let createdCount = 0;
      let updatedCount = 0;

      for (const comp of companies) {
        for (const p of PRODUCTS_TO_ADD) {
          const existing = await prisma.product.findFirst({
            where: {
              companyId: comp.id,
              OR: [
                { sku: { equals: p.sku, mode: 'insensitive' } },
                { name: { equals: p.name, mode: 'insensitive' } }
              ]
            }
          });

          if (existing) {
            await prisma.product.update({
              where: { id: existing.id },
              data: {
                name: p.name,
                sku: p.sku,
                category: p.category,
                productType: p.productType,
                brand: p.brand,
                unit: p.unit,
                unitPrice: p.unitPrice,
                isActive: true,
                description: p.description,
                dispatchCategory: p.dispatchCategory,
                hsnCode: p.hsnCode,
              }
            });
            updatedCount++;
            console.log(`  [UPDATED] Company ${comp.name}: Product ${p.name} (ID: ${existing.id})`);
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
            console.log(`  [CREATED] Company ${comp.name}: Product ${created.name} (ID: ${created.id})`);
          }
        }
      }

      console.log(`\nSummary for ${dbInfo.name}: ${createdCount} created, ${updatedCount} updated.`);

    } catch (err) {
      console.error(`Database connection/execution failed for ${dbInfo.name}:`, err.message);
    } finally {
      await prisma.$disconnect();
    }
  }
}

main().catch(console.error);
